"use client";

import { create } from "zustand";

export type NativeEvent = { type: "stdout" | "stderr" | "stdin" | "compile"; data: string };
export type NativeResult = { code: number; ms: number; note: string; compileError?: boolean; killed?: boolean };

type State = { status: "idle" | "busy"; message: string; progress: number | null };
export const useNative = create<State>(() => ({ status: "idle", message: "", progress: null }));

let worker: Worker | null = null;
let seq = 0;
let current: { id: number; onEvent: (e: NativeEvent) => void; resolve: (r: NativeResult) => void; t0: number } | null = null;
let watchdog: ReturnType<typeof setTimeout> | null = null;
const SILENCE_MS = 12_000;

function kick(compiling: boolean) {
  if (watchdog) clearTimeout(watchdog);
  // Downloading the compiler can take a while on slow Wi-Fi, so it gets a long leash.
  watchdog = setTimeout(() => stop("■ Stopped: no response for 12 s (an endless loop, or waiting for input?)"), compiling ? 180_000 : SILENCE_MS);
}

function ensure() {
  if (worker) return worker;
  worker = new Worker("/rt/native-worker.js", { type: "module" });
  worker.onmessage = (ev: MessageEvent) => {
    const msg = ev.data as { type: string; data: unknown; runId: number };
    if (!current || msg.runId !== current.id) return;
    if (msg.type === "status") {
      const text = String(msg.data);
      useNative.setState({ message: text });
      kick(/compiler|Compiling/.test(text));
    } else if (msg.type === "progress") {
      useNative.setState({ progress: Number(msg.data) });
      kick(true);
    } else if (msg.type === "done") {
      if (watchdog) clearTimeout(watchdog);
      current.resolve(msg.data as NativeResult);
      current = null;
      useNative.setState({ status: "idle", message: "", progress: null });
    } else {
      current.onEvent(msg as unknown as NativeEvent);
    }
  };
  worker.onerror = (e) => {
    if (current) {
      current.onEvent({ type: "stderr", data: `${e.message || "The runtime crashed."}\n` });
      current.resolve({ code: -1, ms: Date.now() - current.t0, note: "" });
      current = null;
    }
    worker = null;
    useNative.setState({ status: "idle", message: "", progress: null });
  };
  return worker;
}

export function runNative(
  opts: { lang: "bash" | "c"; code: string; stdin: string; wasmUrl?: string | null; fileName?: string },
  onEvent: (e: NativeEvent) => void,
): Promise<NativeResult> {
  if (current) return Promise.resolve({ code: -1, ms: 0, note: "Already running" });
  const w = ensure();
  const id = ++seq;
  return new Promise((resolve) => {
    current = { id, onEvent, resolve, t0: Date.now() };
    useNative.setState({ status: "busy", message: "Starting…", progress: null });
    kick(false);
    w.postMessage({ type: "run", runId: id, ...opts });
  });
}

/** Kill the worker (stops endless loops). The next run starts a fresh one. */
export function stop(reason = "■ Stopped.") {
  if (watchdog) clearTimeout(watchdog);
  worker?.terminate();
  worker = null;
  if (current) {
    current.onEvent({ type: "stderr", data: `\n${reason}\n` });
    current.resolve({ code: -1, ms: Date.now() - current.t0, note: "", killed: true });
    current = null;
  }
  useNative.setState({ status: "idle", message: "", progress: null });
}
