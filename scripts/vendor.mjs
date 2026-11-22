// Bundles the browser runtimes into public/vendor as self-contained ES modules:
//   public/vendor/just-bash.js  (bash interpreter; node:* builtins stubbed out)
//   public/vendor/wasi-shim.js  (WASI implementation used to run compiled C)
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "public", "vendor");
fs.rmSync(out, { recursive: true, force: true });

const STUB = `const na = (n) => () => { throw new Error(n + " is not available in the browser"); };
export const constants = {};
export const gunzipSync = na("gunzip"), gzipSync = na("gzip"), open = na("fs.open"), existsSync = () => false;
export const randomBytes = (n) => crypto.getRandomValues(new Uint8Array(n));
export class Worker { constructor() { throw new Error("worker_threads is not available"); } }
export const sep = "/";
export const dirname = (p) => p.replace(/\\/[^/]*$/, "") || "/";
export const join = (...p) => p.join("/").replace(/\\/+/g, "/");
export const fileURLToPath = (u) => String(u).replace(/^file:\\/\\//, "");
export class AsyncLocalStorage { run(_s, fn, ...a) { return fn(...a); } getStore() { return undefined; } }
export const Buffer = undefined;
export default {};
`;

const stubNode = {
  name: "stub-node",
  setup(b) {
    b.onResolve({ filter: /^node:/ }, (a) => ({ path: a.path, namespace: "stub" }));
    b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: STUB, loader: "js" }));
  },
};

const common = { bundle: true, format: "esm", platform: "browser", target: "es2022", minify: true, legalComments: "none", logLevel: "warning" };
await build({ ...common, entryPoints: [path.join(root, "node_modules/just-bash/dist/bundle/browser.js")], outfile: path.join(out, "just-bash.js"), plugins: [stubNode] });
await build({ ...common, entryPoints: [path.join(root, "node_modules/@bjorn3/browser_wasi_shim/dist/index.js")], outfile: path.join(out, "wasi-shim.js") });
for (const f of fs.readdirSync(out)) console.log(`vendored ${f} (${(fs.statSync(path.join(out, f)).size / 1024).toFixed(0)} KB)`);
