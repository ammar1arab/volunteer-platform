"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";

export type BotPose =
  | "idle"
  | "run"
  | "invite"
  | "cheer"
  | "think"
  | "thinking"
  | "search"
  | "rest"
  | "torch"
  | "wave"
  | "greeting"
  | "success";

type Phase =
  | "idle"
  | "move"
  | "jump"
  | "peek"
  | "tour"
  | "sit"
  | "vanish"
  | "parade"
  | "cheer"
  | "greet"
  | "sleep"
  | "think"
  | "poke"
  | "shy";

type Leg = "out" | "wait" | "back" | "hide" | "enter";

const HOME = 0;
const WALK = 108;
const DASH = 280;
const JUMP_TIME = 0.72;
const JUMP_HEIGHT = 46;
const POKE_TIME = 0.72;
const NEAR = 132;
const SLEEP_AFTER = 32;
const MAX_DT = 1 / 30;
const PAD = 14;

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const finite = (value: number, fallback: number) => (Number.isFinite(value) ? value : fallback);

export function botSize() {
  if (typeof window === "undefined") return 64;
  return Math.round(clamp(window.innerWidth * 0.14, 52, 72));
}

function bounds() {
  const size = botSize();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxX = Math.max(56, vw - size - PAD * 2);
  const minY = -Math.max(72, vh - size - PAD * 2);
  return {
    size,
    maxX,
    minY,
    peekX: -(size * 0.62),
    peekRight: maxX + size * 0.62,
    dropY: size + 36,
    topX: maxX,
    topY: minY,
    midX: maxX * 0.45,
    sitX: maxX * 0.72,
    sitY: minY * 0.12
  };
}

export function useBotDirector(enabled: boolean, thinking: boolean) {
  const reduced = Boolean(useReducedMotion());
  const live = enabled && !reduced;

  const x = useMotionValue(HOME);
  const y = useMotionValue(HOME);
  const tilt = useMotionValue(0);
  const facing = useMotionValue(1);
  const stretchX = useMotionValue(1);
  const stretchY = useMotionValue(1);
  const spin = useMotionValue(0);
  const fade = useMotionValue(1);

  const [pose, setPose] = useState<BotPose>("idle");
  const [asleep, setAsleep] = useState(false);
  const [docked, setDocked] = useState(true);

  const store = useRef({
    phase: "idle" as Phase,
    timer: rand(1.6, 3.4),
    age: 0,
    targetX: HOME,
    targetY: HOME,
    speed: WALK,
    jumpT: 0,
    jumpBase: 0,
    hops: 0,
    bob: 0,
    calm: 0,
    leg: "out" as Leg,
    pointerX: Number.NEGATIVE_INFINITY,
    pointerY: Number.NEGATIVE_INFINITY,
    thinking: false,
    docked: true,
    pokeFlipped: false,
    onPoke: null as (() => void) | null
  });

  const setMood = useCallback((nextPose: BotPose, sleeping = false) => {
    setPose(nextPose);
    setAsleep(sleeping);
  }, []);

  const rest = useCallback(
    (nextPose: BotPose, delay: number, phase: Phase = "idle") => {
      const next = store.current;
      const ground = finite(next.jumpBase, HOME);
      next.phase = phase;
      next.age = 0;
      next.jumpT = 0;
      next.hops = 0;
      next.timer = delay;
      next.speed = WALK;
      next.leg = "out";
      next.jumpBase = ground;
      y.set(ground);
      tilt.set(0);
      stretchX.set(1);
      stretchY.set(1);
      spin.set(0);
      fade.set(1);
      if (phase === "idle" || phase === "greet" || phase === "sleep" || phase === "think") facing.set(1);
      setMood(nextPose, phase === "sleep");
    },
    [facing, fade, setMood, spin, stretchX, stretchY, tilt, y]
  );

  const goHome = useCallback(() => {
    const next = store.current;
    x.set(HOME);
    y.set(HOME);
    next.targetX = HOME;
    next.targetY = HOME;
    next.jumpBase = HOME;
    next.onPoke = null;
    fade.set(1);
    spin.set(0);
    rest("idle", rand(1.8, 3.6));
  }, [fade, rest, spin, x, y]);

  const poke = useCallback(
    (done?: () => void) => {
      const next = store.current;
      if (!live) {
        done?.();
        return;
      }
      if (next.phase === "poke") return;
      next.phase = "poke";
      next.age = 0;
      next.timer = POKE_TIME;
      next.onPoke = done ?? null;
      next.pokeFlipped = false;
      next.docked = false;
      next.jumpBase = finite(y.get(), HOME);
      next.thinking = false;
      setDocked(false);
      fade.set(1);
      spin.set(0);
      setMood("cheer");
    },
    [fade, live, setMood, spin, y]
  );

  useEffect(() => {
    const track = (event: PointerEvent) => {
      store.current.pointerX = event.clientX;
      store.current.pointerY = event.clientY;
    };
    const forget = () => {
      store.current.pointerX = Number.NEGATIVE_INFINITY;
      store.current.pointerY = Number.NEGATIVE_INFINITY;
    };
    window.addEventListener("pointermove", track, { passive: true });
    window.addEventListener("blur", forget);
    return () => {
      window.removeEventListener("pointermove", track);
      window.removeEventListener("blur", forget);
    };
  }, []);

  useAnimationFrame((_, deltaMs) => {
    if (!live || document.visibilityState === "hidden") return;

    const next = store.current;
    const dt = Math.min(deltaMs / 1000, MAX_DT);
    next.age += dt;
    next.bob += dt;
    const box = bounds();
    const size = box.size;
    const hereX = finite(x.get(), HOME);
    const hereY = finite(y.get(), HOME);

    if (next.phase !== "poke") {
      if (thinking && !next.thinking) {
        next.thinking = true;
        next.phase = "think";
        next.age = 0;
        next.jumpBase = finite(next.jumpBase, HOME);
        fade.set(1);
        spin.set(0);
        setMood(Math.random() < 0.5 ? "think" : "thinking");
      } else if (!thinking && next.thinking) {
        next.thinking = false;
        next.phase = "cheer";
        next.age = 0;
        next.timer = 1.8;
        next.jumpBase = finite(next.jumpBase, HOME);
        setMood(Math.random() < 0.28 ? "torch" : Math.random() < 0.5 ? "cheer" : "success");
      } else {
        next.thinking = thinking;
      }
    }

    const centreX = PAD + hereX + size / 2;
    const centreY = window.innerHeight - PAD - size / 2 + hereY;
    const near =
      Number.isFinite(next.pointerX) &&
      Math.hypot(next.pointerX - centreX, next.pointerY - centreY) < NEAR;

    if (near && next.phase === "sleep") rest("wave", 1.25, "greet");
    if (near) next.calm = 0;
    else if (next.phase === "idle") next.calm += dt;

    const longTrip =
      next.phase === "tour" ||
      next.phase === "move" ||
      next.phase === "peek" ||
      next.phase === "shy" ||
      next.phase === "vanish" ||
      next.phase === "parade" ||
      next.phase === "sit";
    if (next.age > (longTrip ? 22 : 12) && !["idle", "sleep", "think", "poke"].includes(next.phase)) {
      goHome();
      return;
    }

    const lean = near ? clamp((next.pointerX - centreX) / 28, -8, 8) : 0;

    const arrive = () => {
      const dx = next.targetX - hereX;
      const dy = next.targetY - hereY;
      const dist = Math.hypot(dx, dy);
      const step = next.speed * dt;
      if (dist <= step + 1.6) {
        x.set(next.targetX);
        y.set(next.targetY);
        next.jumpBase = next.targetY;
        tilt.set(0);
        stretchX.set(1);
        stretchY.set(1);
        return true;
      }
      facing.set(dx < -1 ? -1 : 1);
      const nx = hereX + (dx / dist) * step;
      const ny = hereY + (dy / dist) * step;
      x.set(nx);
      y.set(ny);
      next.jumpBase = ny;
      tilt.set(dx < 0 ? -11 : 11);
      stretchY.set(1.05 + Math.abs(Math.sin(next.bob * 11)) * 0.04);
      stretchX.set(0.95);
      return false;
    };

    const startMove = (tx: number, ty: number, speed: number, nextPose: BotPose, phase: Phase) => {
      next.targetX = tx;
      next.targetY = ty;
      next.speed = speed;
      next.phase = phase;
      next.age = 0;
      next.leg = "out";
      next.jumpBase = hereY;
      fade.set(1);
      spin.set(0);
      setMood(nextPose);
    };

    switch (next.phase) {
      case "idle": {
        const ground = Math.abs(hereX) < 28 && Math.abs(next.jumpBase) < 28 ? HOME : next.jumpBase;
        next.jumpBase = ground;
        y.set(ground + Math.sin(next.bob * 2.05) * 3);
        tilt.set(Math.sin(next.bob * 0.75) * 2.2 + lean);
        stretchY.set(1 + Math.sin(next.bob * 2.05) * 0.022);
        stretchX.set(1 - Math.sin(next.bob * 2.05) * 0.018);
        if (next.calm > SLEEP_AFTER) {
          rest("rest", 0, "sleep");
          break;
        }
        if (near && Math.random() < 0.01) {
          startMove(box.peekX, HOME, DASH, "run", "shy");
          break;
        }
        if (near) break;
        next.timer -= dt;
        if (next.timer > 0) break;
        const roll = Math.random();
        if (roll < 0.16) startMove(rand(10, box.maxX * 0.7), HOME, WALK, "run", "move");
        else if (roll < 0.28) {
          next.phase = "jump";
          next.age = 0;
          next.jumpT = 0;
          next.jumpBase = ground;
          next.hops = Math.random() < 0.45 ? 2 : 1;
          setMood(next.hops > 1 ? "success" : "idle");
        } else if (roll < 0.38) rest(Math.random() < 0.5 ? "wave" : "greeting", 1.5, "greet");
        else if (roll < 0.48) startMove(box.peekX, HOME, DASH, "run", "peek");
        else if (roll < 0.58) startMove(box.topX, box.topY, DASH, "run", "tour");
        else if (roll < 0.68) startMove(box.sitX, box.sitY, WALK, "run", "sit");
        else if (roll < 0.8) {
          const left = Math.random() < 0.5;
          startMove(left ? box.peekX - 24 : box.peekRight, HOME, DASH, "run", "vanish");
        } else if (roll < 0.9) startMove(box.maxX, HOME, WALK, "torch", "parade");
        else rest(Math.random() < 0.5 ? "invite" : "cheer", rand(1.6, 3.2));
        break;
      }
      case "move": {
        if (!arrive()) break;
        rest(Math.random() < 0.4 ? "wave" : "idle", rand(1.6, 3.8));
        break;
      }
      case "jump": {
        next.jumpT += dt;
        const t = next.jumpT / JUMP_TIME;
        if (t < 0.16) {
          y.set(next.jumpBase + 4);
          stretchY.set(0.78);
          stretchX.set(1.2);
        } else if (t < 0.84) {
          const u = (t - 0.16) / 0.68;
          const arc = Math.sin(Math.PI * u);
          y.set(next.jumpBase - JUMP_HEIGHT * arc);
          stretchY.set(1.16 - arc * 0.18);
          stretchX.set(0.88 + arc * 0.14);
          tilt.set(arc * 10);
          spin.set(next.hops > 1 ? arc * 18 : 0);
        } else if (t < 1) {
          y.set(next.jumpBase + 2);
          stretchY.set(0.86);
          stretchX.set(1.12);
          tilt.set(0);
          spin.set(0);
        } else if (next.hops > 1) {
          next.hops -= 1;
          next.jumpT = 0;
          setMood("cheer");
        } else {
          y.set(next.jumpBase);
          rest("idle", rand(1.6, 3.4));
        }
        break;
      }
      case "peek":
      case "tour":
      case "shy": {
        if (next.leg === "wait") {
          next.timer -= dt;
          y.set(next.jumpBase + Math.sin(next.bob * 2.6) * 2.2);
          tilt.set(Math.sin(next.bob * 3.2) * 5);
          if (next.timer <= 0) {
            next.leg = "back";
            next.targetX = HOME;
            next.targetY = HOME;
            next.speed = DASH;
            setMood("run");
          }
          break;
        }
        if (!arrive()) break;
        if (next.leg === "out") {
          next.leg = "wait";
          next.timer = next.phase === "tour" ? 1.4 : 1.05;
          next.jumpBase = next.targetY;
          facing.set(next.phase === "tour" ? -1 : 1);
          setMood(next.phase === "tour" ? "search" : next.phase === "shy" ? "wave" : "greeting");
        } else {
          rest(next.phase === "shy" ? "invite" : "wave", 1.6, "greet");
        }
        break;
      }
      case "sit": {
        if (next.leg === "wait") {
          next.timer -= dt;
          y.set(next.jumpBase + Math.sin(next.bob * 0.9) * 1.4);
          tilt.set(Math.sin(next.bob * 0.7) * 2);
          if (next.timer <= 0) {
            next.leg = "back";
            next.targetX = HOME;
            next.targetY = HOME;
            next.speed = WALK;
            setMood("run");
          }
          break;
        }
        if (!arrive()) break;
        if (next.leg === "out") {
          next.leg = "wait";
          next.timer = rand(2.4, 4.2);
          next.jumpBase = next.targetY;
          setMood("rest");
        } else {
          rest("idle", rand(1.8, 3.2));
        }
        break;
      }
      case "parade": {
        if (next.leg === "wait") {
          next.timer -= dt;
          y.set(next.jumpBase - Math.abs(Math.sin(next.bob * 6)) * 6);
          tilt.set(Math.sin(next.bob * 8) * 6);
          if (next.timer <= 0) {
            next.leg = "back";
            next.targetX = HOME;
            next.targetY = HOME;
            setMood("run");
          }
          break;
        }
        if (!arrive()) break;
        if (next.leg === "out") {
          next.leg = "wait";
          next.timer = 1.1;
          next.jumpBase = next.targetY;
          setMood("torch");
        } else {
          rest("cheer", 1.4, "greet");
        }
        break;
      }
      case "vanish": {
        if (next.leg === "hide") {
          next.timer -= dt;
          fade.set(0);
          if (next.timer <= 0) {
            const enterLeft = Math.random() < 0.5;
            x.set(enterLeft ? box.peekX - 20 : box.peekRight);
            y.set(Math.random() < 0.35 ? box.topY * 0.35 : HOME);
            next.targetX = enterLeft ? rand(12, box.midX) : rand(box.midX, box.maxX * 0.9);
            next.targetY = HOME;
            next.leg = "enter";
            next.speed = DASH;
            fade.set(1);
            facing.set(enterLeft ? 1 : -1);
            setMood("wave");
          }
          break;
        }
        if (!arrive()) break;
        if (next.leg === "out") {
          next.leg = "hide";
          next.timer = rand(0.55, 1.15);
          fade.set(0);
        } else {
          rest(Math.random() < 0.5 ? "greeting" : "invite", 1.7, "greet");
        }
        break;
      }
      case "cheer": {
        next.timer -= dt;
        const hop = Math.abs(Math.sin(next.age * 7.4));
        y.set(next.jumpBase - hop * 16);
        tilt.set(Math.sin(next.age * 14) * 8);
        stretchY.set(1 + hop * 0.08);
        stretchX.set(1 - hop * 0.05);
        if (next.timer <= 0) rest("idle", 1.4);
        break;
      }
      case "greet": {
        next.timer -= dt;
        y.set(next.jumpBase + Math.sin(next.age * 5) * -5);
        tilt.set(Math.sin(next.age * 6) * 5 + lean * 0.35);
        if (next.timer <= 0) rest("idle", rand(1.8, 3.8));
        break;
      }
      case "think": {
        y.set(next.jumpBase + Math.sin(next.bob * 1.5) * 2);
        tilt.set(Math.sin(next.bob * 0.9) * 3);
        break;
      }
      case "sleep": {
        y.set(next.jumpBase + Math.sin(next.bob * 0.8) * 1.5);
        tilt.set(-6 + Math.sin(next.bob * 0.8) * 1.2);
        stretchY.set(0.97);
        stretchX.set(1.02);
        break;
      }
      case "poke": {
        next.timer -= dt;
        const u = 1 - Math.max(0, next.timer) / POKE_TIME;
        y.set(next.jumpBase - Math.sin(Math.PI * u) * 34);
        spin.set(u * 360);
        tilt.set(Math.sin(u * Math.PI * 2) * 12);
        stretchY.set(1 + Math.sin(Math.PI * u) * 0.1);
        if (!next.pokeFlipped && u > 0.48) {
          next.pokeFlipped = true;
          setMood("invite");
        }
        if (next.timer <= 0) {
          const done = next.onPoke;
          next.onPoke = null;
          spin.set(0);
          rest("idle", 0.2);
          done?.();
        }
        break;
      }
    }

    const parked =
      Math.abs(finite(x.get(), HOME)) < 22 &&
      Math.abs(finite(y.get(), HOME)) < 30 &&
      (next.phase === "idle" || next.phase === "greet" || next.phase === "sleep" || next.phase === "think");
    if (next.docked !== parked) {
      next.docked = parked;
      setDocked(parked);
    }
  });

  return { x, y, tilt, facing, stretchX, stretchY, spin, fade, pose, asleep, docked, reduced, poke };
}
