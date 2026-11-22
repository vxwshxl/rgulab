"use client";

import { useProgress } from "./store";

let ctx: AudioContext | null = null;

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.08) {
  if (!ctx) ctx = new AudioContext();
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function playSound(kind: "correct" | "wrong" | "complete" | "tap") {
  if (typeof window === "undefined" || !useProgress.getState().sound) return;
  try {
    if (kind === "correct") {
      tone(784, 0, 0.12, "triangle");
      tone(1175, 0.09, 0.22, "triangle");
    } else if (kind === "wrong") {
      tone(220, 0, 0.18, "square", 0.04);
      tone(185, 0.12, 0.26, "square", 0.04);
    } else if (kind === "complete") {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.3, "triangle"));
    } else {
      tone(660, 0, 0.05, "sine", 0.03);
    }
  } catch {
    /* audio blocked: ignore */
  }
}
