// Module worker for the OS (bash) and DAA (C) labs.
// - bash runs in just-bash.
// - C runs from a precompiled .wasm when the code is unchanged; edited code is compiled
//   in the browser with clang-for-WebAssembly (downloaded once, then cached by the browser).
import { runBash } from "./bash-runner.js";
import { CLANG_ARGS, IO_SHIM, runWasm } from "./c-runner.js";

const CLANG_URL = "https://cdn.jsdelivr.net/npm/@yowasp/clang@22.0.0-git20695-13/gen/bundle.js";
let runClang = null;
const modules = new Map();

async function hash(text) {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function compile(code, post) {
  const key = await hash(code);
  if (modules.has(key)) return { mod: modules.get(key), warnings: "" };
  if (!runClang) {
    post({ type: "status", data: "Downloading the C compiler (once, about 100 MB)…" });
    runClang = (await import(CLANG_URL)).runClang;
  }
  post({ type: "status", data: "Compiling with clang…" });
  let err = "";
  const dec = new TextDecoder();
  try {
    const out = await runClang(CLANG_ARGS, { "main.c": code, "rgulab_io.c": IO_SHIM }, {
      stderr: (b) => b && (err += dec.decode(b)),
      fetchProgress: ({ totalLength, doneLength }) => post({ type: "progress", data: totalLength ? doneLength / totalLength : 0 }),
    });
    const mod = await WebAssembly.compile(out["main.wasm"]);
    modules.set(key, mod);
    return { mod, warnings: err };
  } catch {
    return { mod: null, warnings: err || "Compilation failed." };
  }
}

self.onmessage = async ({ data: m }) => {
  const post = (e) => self.postMessage({ ...e, runId: m.runId });
  if (m.type !== "run") return;
  try {
    let res;
    if (m.lang === "bash") {
      post({ type: "status", data: "Running…" });
      res = await runBash(m.code, m.stdin, post);
    } else {
      let mod = null;
      if (m.wasmUrl) {
        mod = modules.get(m.wasmUrl);
        if (!mod) {
          post({ type: "status", data: "Loading program…" });
          mod = await WebAssembly.compileStreaming(fetch(m.wasmUrl));
          modules.set(m.wasmUrl, mod);
        }
      } else {
        const c = await compile(m.code, post);
        if (c.warnings) post({ type: "compile", data: c.warnings.replace(/main\.c/g, m.fileName || "main.c") });
        mod = c.mod;
      }
      if (!mod) {
        post({ type: "done", data: { code: 1, ms: 0, note: "Fix the compile errors above, then run again.", compileError: true } });
        return;
      }
      post({ type: "status", data: "Running…" });
      res = await runWasm(mod, m.stdin, post);
    }
    post({ type: "done", data: res });
  } catch (e) {
    post({ type: "stderr", data: String(e && e.message ? e.message : e) + "\n" });
    post({ type: "done", data: { code: -1, ms: 0, note: "" } });
  }
};
