"use client";

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

const getCtx = () => {
  if (typeof window === "undefined") return null;
  try {
    const AC = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
    }
    return ctx;
  } catch {
    return null;
  }
};

const ensure = async () => {
  const audio = getCtx();
  if (!audio || !master) return null;
  if (audio.state === "suspended") {
    try {
      await audio.resume();
    } catch {
      return null;
    }
  }
  return audio.state === "running" ? audio : null;
};

const tone = (
  audio: AudioContext,
  gainMaster: GainNode,
  freq: number,
  at: number,
  dur: number,
  vol: number
) => {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(vol, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(gain);
  gain.connect(gainMaster);
  osc.start(at);
  osc.stop(at + dur + 0.04);
};

const play = (factory: (audio: AudioContext, gainMaster: GainNode, t: number) => void) => {
  void ensure().then((audio) => {
    if (!audio || !master) return;
    factory(audio, master, audio.currentTime + 0.02);
  });
};

/** Soft chime when a guest is admitted / enters media. */
export const playMeetingAdmitSound = () => {
  play((audio, gainMaster, t) => {
    tone(audio, gainMaster, 784, t, 0.28, 0.28);
    tone(audio, gainMaster, 988, t + 0.12, 0.36, 0.22);
  });
};

/** Soft low tone when a guest is denied. */
export const playMeetingDenySound = () => {
  play((audio, gainMaster, t) => {
    tone(audio, gainMaster, 392, t, 0.35, 0.22);
  });
};

/** Subtle ping when someone joins the waiting list (host). */
export const playMeetingWaitingSound = () => {
  play((audio, gainMaster, t) => {
    tone(audio, gainMaster, 660, t, 0.22, 0.18);
  });
};
