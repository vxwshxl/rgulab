"use client";

import { create } from "zustand";

export type PyEvent =
  | { type: "stdout" | "stderr" | "stdin"; data: string }
  | { type: "image"; data: string }
  | { type: "html"; data: string };

type RunResult = { ok: boolean; ms: number; killed?: boolean };

type PyState = {
  status: "idle" | "booting" | "ready" | "running" | "error";
  message: string;
  files: string[];
  bootStarted: number | null;
};

export const usePy = create<PyState>(() => ({ status: "idle", message: "", files: [], bootStarted: null }));

let worker: Worker | null = null;
let runSeq = 0;
let current: { id: number; onEvent: (e: PyEvent) => void; resolve: (r: RunResult) => void; t0: number } | null = null;

function handle(ev: MessageEvent) {
  const msg = ev.data as { type: string; data?: unknown; runId?: number; name?: string; bytes?: Uint8Array };
  switch (msg.type) {
    case "status": {
      const text = String(msg.data);
      if (text === "ready") {
        usePy.setState((s) => ({ status: current ? "running" : "ready", message: s.status === "booting" ? "Python is ready" : "" }));
      } else {
        usePy.setState((s) => ({ message: text, status: s.status === "idle" ? "booting" : s.status }));
      }
      break;
    }
    case "files":
      usePy.setState({ files: (msg.data as string[]) ?? [] });
      break;
    case "done":
      if (current && msg.runId === current.id) {
        const r = msg.data as RunResult;
        current.resolve(r);
        current = null;
        usePy.setState({ status: "ready", message: "" });
      }
      break;
    case "fatal":
      usePy.setState({ status: "error", message: String(msg.data) });
      if (current) {
        current.onEvent({ type: "stderr", data: `${msg.data}\n` });
        current.resolve({ ok: false, ms: Date.now() - current.t0 });
        current = null;
      }
      break;
    case "file": {
      if (!msg.bytes || !msg.name) break;
      const url = URL.createObjectURL(new Blob([msg.bytes as BlobPart]));
      const a = document.createElement("a");
      a.href = url;
      a.download = msg.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      break;
    }
    default:
      if (current && msg.runId === current.id) current.onEvent(msg as PyEvent);
  }
}

export function bootPython() {
  if (worker) return;
  worker = new Worker("/py/py-worker.js", { type: "module" });
  worker.onmessage = handle;
  worker.onerror = (e) => usePy.setState({ status: "error", message: e.message || "The Python worker crashed" });
  usePy.setState({ status: "booting", message: "Starting Python…", bootStarted: Date.now() });
  worker.postMessage({ type: "init" });
}

export function runPython(code: string, stdin: string, onEvent: (e: PyEvent) => void): Promise<RunResult> {
  bootPython();
  if (current) return Promise.resolve({ ok: false, ms: 0 });
  const id = ++runSeq;
  return new Promise((resolve) => {
    current = { id, onEvent, resolve, t0: Date.now() };
    usePy.setState((s) => ({ status: s.status === "booting" ? "booting" : "running" }));
    worker!.postMessage({ type: "run", runId: id, code, stdin });
  });
}

export async function uploadFiles(list: FileList | File[]) {
  bootPython();
  const files = await Promise.all(
    [...list].map(async (f) => ({ name: f.name, bytes: new Uint8Array(await f.arrayBuffer()) })),
  );
  worker!.postMessage({ type: "upload", files });
}

export function downloadFile(name: string) {
  worker?.postMessage({ type: "download", name });
}

/** Kill the worker (stops infinite loops), then boot a fresh one. */
export function restartPython() {
  worker?.terminate();
  worker = null;
  if (current) {
    current.onEvent({ type: "stderr", data: "\n■ Stopped. Restarting Python…\n" });
    current.resolve({ ok: false, ms: Date.now() - current.t0, killed: true });
    current = null;
  }
  usePy.setState({ status: "idle", files: [] });
  bootPython();
}
