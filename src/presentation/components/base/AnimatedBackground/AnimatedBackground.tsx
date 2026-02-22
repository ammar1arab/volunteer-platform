"use client";

import { useEffect, useRef, useCallback } from "react";
import styles from "./AnimatedBackground.module.scss";

type Particle = {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  pulsePhase: number;
  layer: number;
  vibration: number;
  vibrationDecay: number;
};

type ClickRipple = {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  green: boolean;
};

const PARTICLE_LAYERS = [
  { count: 40, speed: 0.12, color: [76, 175, 80],   radius: [1.2, 2.0] },
  { count: 35, speed: 0.20, color: [56, 142, 60],   radius: [0.9, 1.5] },
  { count: 30, speed: 0.28, color: [104, 159, 56],  radius: [0.6, 1.2] },
];

const MAX_DISTANCE  = 160;
const MOUSE_RADIUS  = 200;

const AnimatedBackground = () => {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef    = useRef({ x: 0, y: 0, active: false });
  const frameRef    = useRef<number>(0);
  const timeRef     = useRef(0);
  const ripplesRef  = useRef<ClickRipple[]>([]);

  const initParticles = useCallback((W: number, H: number) => {
    const list: Particle[] = [];
    PARTICLE_LAYERS.forEach((layer, li) => {
      for (let i = 0; i < layer.count; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        list.push({
          x, y, ox: x, oy: y,
          vx: (Math.random() - 0.5) * layer.speed,
          vy: (Math.random() - 0.5) * layer.speed,
          radius: Math.random() * (layer.radius[1] - layer.radius[0]) + layer.radius[0],
          opacity: Math.random() * 0.4 + 0.3,
          pulsePhase: Math.random() * Math.PI * 2,
          layer: li,
          vibration: 0,
          vibrationDecay: 0.92 + Math.random() * 0.05,
        });
      }
    });
    particlesRef.current = list;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const W = window.innerWidth;
      const H = window.innerHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.scale(dpr, dpr);
      initParticles(W, H);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const onMouseLeave = () => { mouseRef.current.active = false; };

    const onClick = (e: MouseEvent) => {
      const cx = e.clientX;
      const cy = e.clientY;

      ripplesRef.current.push({
        x: cx, y: cy,
        age: 0, maxAge: 55,
        green: Math.random() > 0.5,
      });
      if (ripplesRef.current.length > 8) ripplesRef.current.shift();

      particlesRef.current.forEach((p) => {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 280 && d > 0.1) {
          const strength = Math.pow(1 - d / 280, 2) * 1.8;
          p.vibration = strength;
          p.vx += (dx / d) * strength * 0.18;
          p.vy += (dy / d) * strength * 0.18;
        }
      });
    };

    window.addEventListener("resize",     resize);
    window.addEventListener("mousemove",  onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("click",      onClick);
    resize();

    const animate = () => {
      timeRef.current += 0.014;
      const t = timeRef.current;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, W, H);

      const particles = particlesRef.current;

      particles.forEach((p) => {
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < MOUSE_RADIUS && d > 0.1) {
            const wave = Math.sin(t * 6 + d * 0.04) * 0.022 * (1 - d / MOUSE_RADIUS);
            p.vx += (dx / d) * wave;
            p.vy += (dy / d) * wave;
          }
        }

        p.vx += (p.ox - p.x) * 0.0012;
        p.vy += (p.oy - p.y) * 0.0012;

        p.x  += p.vx;
        p.y  += p.vy;
        p.vx *= 0.978;
        p.vy *= 0.978;

        p.vibration *= p.vibrationDecay;

        const pad = 60;
        if (p.x < -pad) p.x = W + pad;
        else if (p.x > W + pad) p.x = -pad;
        if (p.y < -pad) p.y = H + pad;
        else if (p.y > H + pad) p.y = -pad;
      });

      for (let li = PARTICLE_LAYERS.length - 1; li >= 0; li--) {
        const layer = PARTICLE_LAYERS[li];
        const [r, g, b] = layer.color;
        const lp = particles.filter((p) => p.layer === li);

        for (let i = 0; i < lp.length; i++) {
          for (let j = i + 1; j < lp.length; j++) {
            const a = lp[i];
            const bP = lp[j];
            const dx = a.x - bP.x;
            const dy = a.y - bP.y;
            const d  = Math.sqrt(dx * dx + dy * dy);
            if (d >= MAX_DISTANCE) continue;

            const proximity = 1 - d / MAX_DISTANCE;
            const baseAlpha = proximity * proximity * 0.22 * ((a.opacity + bP.opacity) / 2);
            const vibAmp    = (a.vibration + bP.vibration) * 0.5;

            const midX = (a.x + bP.x) / 2;
            const midY = (a.y + bP.y) / 2;
            const waveOffset = Math.sin(t * 3.5 + i * 0.5 + j * 0.3) * (vibAmp * 18 + (mouse.active ? 5 : 1.5));
            const cpX = midX + (dy / d) * waveOffset;
            const cpY = midY - (dx / d) * waveOffset;

            const grad = ctx.createLinearGradient(a.x, a.y, bP.x, bP.y);
            grad.addColorStop(0,   `rgba(${r},${g},${b},${baseAlpha})`);
            grad.addColorStop(0.5, `rgba(${r},${g},${b},${baseAlpha * (1 + vibAmp * 0.8)})`);
            grad.addColorStop(1,   `rgba(${r},${g},${b},${baseAlpha})`);

            ctx.strokeStyle = grad;
            ctx.lineWidth   = (0.4 + li * 0.25) * (1 + vibAmp * 0.5);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.quadraticCurveTo(cpX, cpY, bP.x, bP.y);
            ctx.stroke();

            if (vibAmp > 0.3 && d < MAX_DISTANCE * 0.6) {
              const echo = Math.sin(t * 5 + i * 0.8 + j * 0.6) * vibAmp * 10;
              ctx.strokeStyle = `rgba(${r},${g},${b},${baseAlpha * 0.3})`;
              ctx.lineWidth   = 0.3;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.quadraticCurveTo(midX - (dy / d) * echo, midY + (dx / d) * echo, bP.x, bP.y);
              ctx.stroke();
            }
          }
        }
      }

      particles.forEach((p) => {
        const layer = PARTICLE_LAYERS[p.layer];
        const [r, g, b] = layer.color;
        const pulse = Math.sin(t * 2 + p.pulsePhase) * 0.15 + 0.85;
        const vib   = 1 + p.vibration * 0.6;
        const cr    = p.radius * pulse * vib;
        const ca    = Math.min(1, p.opacity * pulse * (1 + p.vibration * 0.4));

        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, cr * 3.5);
        grd.addColorStop(0, `rgba(${r},${g},${b},${ca * 0.45})`);
        grd.addColorStop(0.5, `rgba(${r},${g},${b},${ca * 0.12})`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, cr * 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${r},${g},${b},${ca})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, cr, 0, Math.PI * 2);
        ctx.fill();
      });

      ripplesRef.current = ripplesRef.current.filter((rp) => {
        rp.age++;
        if (rp.age >= rp.maxAge) return false;
        const prog  = rp.age / rp.maxAge;
        const alpha = (1 - prog) * 0.5;
        const radius = prog * 120;
        const [r, g, b] = rp.green ? [22, 163, 74] : [239, 68, 68];

        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth   = 1.2 * (1 - prog);
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.35})`;
        ctx.lineWidth   = 0.6;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, radius * 0.55, 0, Math.PI * 2);
        ctx.stroke();

        return true;
      });

      if (mouse.active) {
        const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_RADIUS);
        grd.addColorStop(0,   "rgba(76,175,80,0.06)");
        grd.addColorStop(0.5, "rgba(76,175,80,0.02)");
        grd.addColorStop(1,   "rgba(76,175,80,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize",     resize);
      window.removeEventListener("mousemove",  onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("click",      onClick);
      cancelAnimationFrame(frameRef.current);
    };
  }, [initParticles]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
};

export default AnimatedBackground;