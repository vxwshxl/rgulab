// Builds src/data/labs/<lab>.gen.json from content/<lab>/ and precompiles C programs to
// public/wasm/<lab>/<id>.wasm. For C and bash programs it rebuilds the sample stdin from the
// recorded "Output" transcript and verifies it by actually running the program.
//
//   node scripts/build-labs.mjs            # all labs
//   node scripts/build-labs.mjs os daa     # some labs
//   SYNC=1 node scripts/build-labs.mjs     # first copy fresh sources from ~/Programs
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = path.resolve(import.meta.dirname, "..");
const CONTENT = path.join(root, "content");
const OUT_DATA = path.join(root, "src", "data", "labs");
const OUT_WASM = path.join(root, "public", "wasm");
const OUT_IMG = path.join(root, "public", "graphs");
const only = process.argv.slice(2);
fs.mkdirSync(OUT_DATA, { recursive: true });

if (process.env.SYNC) {
  const home = process.env.HOME;
  const copy = (from, to, filter) => {
    if (!fs.existsSync(from)) return;
    fs.mkdirSync(to, { recursive: true });
    for (const f of fs.readdirSync(from)) if (filter(f)) fs.copyFileSync(path.join(from, f), path.join(to, f));
  };
  copy(`${home}/Programs/OS LAB`, `${CONTENT}/os`, (f) => /^\d\d_.*\.(sh|c)$/.test(f));
  copy(`${home}/Programs/DAA LAB`, `${CONTENT}/daa`, (f) => /^\d\d_.*\.c$/.test(f));
  const ds = `${home}/Programs/DS LAB`;
  for (const base of [ds, `${ds}/others`]) {
    if (!fs.existsSync(base)) continue;
    for (const d of fs.readdirSync(base)) if (/^\d\d$/.test(d)) copy(`${base}/${d}`, `${CONTENT}/ds/${d}`, (f) => /\.(py|png)$/.test(f));
  }
  console.log("synced sources from ~/Programs");
}

/* ---------------------------------------------------------------- DS (Python) */
function buildDs() {
  fs.mkdirSync(OUT_IMG, { recursive: true });
  const programs = [];
  for (const id of fs.readdirSync(`${CONTENT}/ds`).filter((d) => /^\d\d$/.test(d)).sort()) {
    const dir = `${CONTENT}/ds/${id}`;
    const src = fs.readFileSync(`${dir}/${id}.py`, "utf8").replace(/\r\n/g, "\n");
    const [codePart, outPart = ""] = src.split(/\n# Output:\n?/);
    const lines = codePart.trimEnd().split("\n");
    const aim = lines[0].replace(/^#\s*\d+\.\s*/, "").trim();
    const code = lines.slice(1).join("\n").replace(/^\n+/, "") + "\n";
    const output = outPart.split("\n").map((l) => l.replace(/^# ?/, "")).join("\n").trimEnd();
    const images = fs.readdirSync(dir).filter((f) => f.endsWith(".png")).sort().map((f) => {
      fs.copyFileSync(`${dir}/${f}`, `${OUT_IMG}/${f}`);
      return `/graphs/${f}`;
    });
    programs.push({ id, aim, code, lang: "python", samples: [{ stdin: "", output, verified: true }], images });
  }
  return programs;
}

/* ---------------------------------------------------------------- parsing C / bash */
function parseC(src) {
  src = src.replace(/\r\n/g, "\n");
  const first = src.split("\n")[0];
  const aim = first.replace(/^\/\/\s*\d+\.\s*/, "").trim();
  let body = src.split("\n").slice(1).join("\n");
  let algorithm = "";
  const alg = body.match(/\/\*\s*\n?(Algorithm[\s\S]*?)\*\//);
  if (alg) {
    algorithm = alg[1].trim();
    body = body.replace(alg[0], "");
  }
  const outputs = [];
  // DAA style: // Output: / // Output 1: blocks of // lines
  const parts = body.split(/\n\/\/ ?Output(?: \d+)?:\s*\n/);
  if (parts.length > 1) {
    body = parts[0];
    for (const p of parts.slice(1)) outputs.push(p.split("\n").filter((l) => l.startsWith("//")).map((l) => l.replace(/^\/\/ ?/, "")).join("\n").trimEnd());
  }
  // OS style: /* ---- Output ---- ... */
  const block = body.match(/\/\*\s*-+\s*Output\s*-+\s*\n([\s\S]*?)\*\//);
  if (block) {
    body = body.replace(block[0], "");
    const lines = block[1].replace(/\s+$/, "").split("\n");
    const ind = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
    outputs.push(lines.map((l) => l.slice(ind)).join("\n").trimEnd());
  }
  return { aim, algorithm, code: body.replace(/^\n+/, "").trimEnd() + "\n", outputs };
}

function parseSh(src) {
  src = src.replace(/\r\n/g, "\n");
  const first = src.split("\n")[0];
  const aim = first.replace(/^#\s*\d+\.\s*/, "").trim();
  const [codePart, outPart = ""] = src.split("\n").slice(1).join("\n").split(/\n# -+ ?Output ?-+\s*\n/);
  const output = outPart.split("\n").filter((l) => l.startsWith("#")).map((l) => l.replace(/^# ?/, "")).join("\n").trimEnd();
  return { aim, algorithm: "", code: codePart.replace(/^\n+/, "").trimEnd() + "\n", outputs: output ? [output] : [] };
}

/* ---------------------------------------------------------------- running */
const { runWasm, IO_SHIM, CLANG_ARGS } = await import(path.join(root, "public/rt/c-runner.js"));
const { runBash } = await import(path.join(root, "public/rt/bash-runner.js"));
let clang = null;

async function compile(code) {
  clang ??= (await import("@yowasp/clang")).runClang;
  let err = "";
  try {
    const out = await clang(CLANG_ARGS, { "main.c": code, "rgulab_io.c": IO_SHIM }, { stderr: (b) => b && (err += new TextDecoder().decode(b)) });
    return { wasm: out["main.wasm"], err };
  } catch (e) {
    return { wasm: null, err: err || String(e) };
  }
}

async function transcript(run, stdinLines) {
  let t = "";
  await run(stdinLines.join("\n"), (e) => (t += e.data));
  return t;
}

const expandTabs = (line) => {
  let out = "";
  for (const ch of line) out += ch === "\t" ? " ".repeat(8 - (out.length % 8)) : ch;
  return out;
};
const norm = (s) =>
  s
    .split("\n")
    .map(expandTabs)
    .filter((l) => l.trim())
    .join("\n")
    .replace(/Time taken:\s*[\d.e-]+/g, "Time taken:#")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n+$/, "");

function commonPrefix(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

/** Rebuild stdin from a recorded transcript by running, diffing, and feeding the next input. */
async function rebuildStdin(run, recorded) {
  const want = norm(recorded).split("\n");
  const inputs = [];
  for (let iter = 0; iter < 60; iter++) {
    const got = norm(await transcript(run, inputs)).split("\n");
    let k = 0;
    while (k < want.length && k < got.length && want[k] === got[k]) k++;
    if (k >= want.length && got.length === want.length) return { stdin: inputs.join("\n"), verified: true };
    if (k >= want.length) return { stdin: inputs.join("\n"), verified: false };
    const target = want[k];
    const p = commonPrefix(got[k] ?? "", target);
    const next = target.slice(p).trimStart();
    if (!next && iter > 0) return { stdin: inputs.join("\n"), verified: false };
    inputs.push(next);
  }
  return { stdin: inputs.join("\n"), verified: false };
}

async function buildCLike(lab, files) {
  const programs = [];
  const wasmDir = path.join(OUT_WASM, lab);
  fs.mkdirSync(wasmDir, { recursive: true });
  for (const file of files) {
    const id = file.slice(0, 2);
    const src = fs.readFileSync(path.join(CONTENT, lab, file), "utf8");
    const isC = file.endsWith(".c");
    const p = isC ? parseC(src) : parseSh(src);
    let run;
    let wasmPath = null;
    if (isC) {
      const hash = crypto.createHash("sha1").update(p.code + CLANG_ARGS.join(" ")).digest("hex").slice(0, 10);
      wasmPath = `/wasm/${lab}/${id}-${hash}.wasm`;
      const disk = path.join(root, "public", wasmPath);
      if (!fs.existsSync(disk)) {
        for (const old of fs.readdirSync(wasmDir).filter((f) => f.startsWith(`${id}-`))) fs.rmSync(path.join(wasmDir, old));
        const { wasm, err } = await compile(p.code);
        if (!wasm) {
          console.log(`  ✗ ${lab}/${file} failed to compile:\n${err}`);
          continue;
        }
        fs.writeFileSync(disk, wasm);
      }
      const mod = await WebAssembly.compile(fs.readFileSync(disk));
      run = (stdin, emit) => runWasm(mod, stdin, emit);
    } else {
      run = (stdin, emit) => runBash(p.code, stdin, emit, { maxLoop: 500 });
    }
    const samples = [];
    const readsInput = /\bscanf\s*\(|\bgets\s*\(|getchar\s*\(|^\s*read\s/m.test(p.code);
    for (const rec of p.outputs.length ? p.outputs : [""]) {
      const { stdin, verified } = readsInput
        ? await rebuildStdin(run, rec)
        : { stdin: "", verified: norm(await transcript(run, [])) === norm(rec) };
      samples.push({ stdin, output: rec, verified });
    }
    const ok = samples.every((s) => s.verified);
    console.log(`  ${ok ? "✓" : "~"} ${lab}/${file}${ok ? "" : "  (sample run differs from the recorded output)"}`);
    programs.push({ id, file, aim: p.aim, algorithm: p.algorithm, code: p.code, lang: isC ? "c" : "bash", wasm: wasmPath, samples, images: [] });
  }
  return programs;
}

const labs = { ds: async () => buildDs(), os: () => buildCLike("os", fs.readdirSync(`${CONTENT}/os`).filter((f) => /^\d\d_/.test(f)).sort()), daa: () => buildCLike("daa", fs.readdirSync(`${CONTENT}/daa`).filter((f) => /^\d\d_.*\.c$/.test(f)).sort()) };

for (const [lab, build] of Object.entries(labs)) {
  if (only.length && !only.includes(lab)) continue;
  console.log(`${lab}:`);
  const programs = await build();
  fs.writeFileSync(path.join(OUT_DATA, `${lab}.gen.json`), JSON.stringify(programs, null, 1));
  console.log(`  wrote ${programs.length} programs`);
}
