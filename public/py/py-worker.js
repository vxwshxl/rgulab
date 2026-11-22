/* Module worker that hosts Pyodide so long runs never freeze the page.
   (Pyodide 314+ only supports module workers.) */
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs";
import "./runner.js";

const INDEX_URL = "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/";

let runner = null;
let booting = null;
let runId = null;

function post(msg) {
  self.postMessage({ ...msg, runId });
}

async function fetchBytes(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

async function boot() {
  const preambleSrc = await (await fetch("./preamble.py")).text();
  runner = self.createDsRunner({
    loadPyodide: (opts) => loadPyodide(opts),
    indexURL: INDEX_URL,
    preambleSrc,
    fetchBytes,
    onEvent: (e) => post(e),
  });
  await runner.init();
  // Sample datasets: copy them into the working folder so read_csv('titanic.csv') works.
  try {
    const list = await (await fetch("/datasets/index.json")).json();
    const files = [];
    for (const name of list) files.push({ name, bytes: await fetchBytes(`/datasets/${name}`) });
    runner.writeFiles(files);
  } catch (e) {
    post({ type: "stderr", data: `(sample datasets not loaded: ${e})\n` });
  }
  post({ type: "files", data: runner.listFiles() });
}

self.onmessage = async (ev) => {
  const msg = ev.data;
  try {
    if (!booting) booting = boot();
    await booting;
    if (msg.type === "init") return;
    if (msg.type === "run") {
      runId = msg.runId;
      const res = await runner.run(msg.code, msg.stdin);
      post({ type: "done", data: res });
      post({ type: "files", data: res.files });
    } else if (msg.type === "upload") {
      runner.writeFiles(msg.files);
      post({ type: "files", data: runner.listFiles() });
    } else if (msg.type === "download") {
      const bytes = runner.readFile(msg.name);
      self.postMessage({ type: "file", name: msg.name, bytes }, [bytes.buffer]);
    }
  } catch (e) {
    post({ type: "fatal", data: String(e && e.message ? e.message : e) });
  }
};
