// Runs a C program compiled to wasm32-wasi. stdin is handed over one line per read, and
// each line is echoed into the output stream, so the transcript reads like a terminal.
import { WASI, WASIProcExit, Fd, ConsoleStdout, PreopenDirectory, wasi } from "../vendor/wasi-shim.js";

const enc = new TextEncoder();
const dec = new TextDecoder();

class OutputLimit extends Error {}

class LineStdin extends Fd {
  constructor(lines, onLine) {
    super();
    this.lines = lines;
    this.onLine = onLine;
    this.pending = new Uint8Array(0);
  }
  fd_fdstat_get() {
    return { ret: 0, fdstat: new wasi.Fdstat(wasi.FILETYPE_CHARACTER_DEVICE, 0) };
  }
  fd_read(size) {
    if (!this.pending.length) {
      if (!this.lines.length) return { ret: 0, data: new Uint8Array(0) };
      const line = this.lines.shift();
      this.onLine(line);
      this.pending = enc.encode(line + "\n");
    }
    const chunk = this.pending.slice(0, size);
    this.pending = this.pending.slice(chunk.length);
    return { ret: 0, data: chunk };
  }
}

/** Source added to every build: unbuffered stdout so prompts appear before input is read. */
export const IO_SHIM = `#include <stdio.h>
__attribute__((constructor)) static void rgulab_unbuffered(void) { setvbuf(stdout, NULL, _IONBF, 0); }
`;

export const CLANG_ARGS = ["clang", "-O2", "-D_WASI_EMULATED_PROCESS_CLOCKS", "main.c", "rgulab_io.c", "-lwasi-emulated-process-clocks", "-lm", "-Wl,-z,stack-size=8388608", "-o", "main.wasm"];

/**
 * @param {BufferSource | WebAssembly.Module} wasmBytes
 * @param {string} stdin
 * @param {(e: {type: "stdout"|"stderr"|"stdin", data: string}) => void} emit
 */
export async function runWasm(wasmBytes, stdin, emit, { maxOutput = 200_000 } = {}) {
  const lines = stdin === "" ? [] : stdin.replace(/\n$/, "").split("\n");
  let written = 0;
  const writer = (type) =>
    new ConsoleStdout((buf) => {
      written += buf.byteLength;
      emit({ type, data: dec.decode(buf, { stream: true }) });
      if (written > maxOutput) throw new OutputLimit();
    });
  const stdinFd = new LineStdin(lines, (line) => emit({ type: "stdin", data: line + "\n" }));
  const w = new WASI(["main"], [], [stdinFd, writer("stdout"), writer("stderr"), new PreopenDirectory(".", new Map())]);
  const mod = wasmBytes instanceof WebAssembly.Module ? wasmBytes : await WebAssembly.compile(wasmBytes);
  const inst = await WebAssembly.instantiate(mod, {
    wasi_snapshot_preview1: w.wasiImport,
  });
  const t0 = performance.now();
  let code = 0;
  let note = "";
  try {
    code = w.start(inst);
  } catch (e) {
    if (e instanceof WASIProcExit) code = e.code;
    else if (e instanceof OutputLimit) {
      code = -1;
      note = "Stopped: the program printed too much (an endless loop waiting for input?). Add more lines to the input box.";
    } else {
      code = -1;
      note = `Runtime error: ${e && e.message ? e.message : e}`;
    }
  }
  return { code, ms: performance.now() - t0, note, inputLeft: lines.length };
}
