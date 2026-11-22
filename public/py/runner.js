/* Pyodide runner shared by the browser worker (py-worker.js) and the Node test
 * script. Plain JS on purpose: it is loaded with importScripts() in the worker. */
(function (root) {
  const MICROPIP = {
    seaborn: /^\s*(import|from)\s+seaborn\b/m,
    plotly: /^\s*(import|from)\s+plotly\b/m,
    openpyxl: /to_excel|read_excel|openpyxl|ExcelWriter/,
  };
  const NLTK_DATA = [
    ["tokenizers", "punkt_tab"],
    ["corpora", "stopwords"],
    ["corpora", "wordnet"],
  ];
  const NLTK_BASE = "https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages";

  function createDsRunner(opts) {
    const { loadPyodide, indexURL, preambleSrc, fetchBytes, onEvent } = opts;
    let py = null;
    const installed = new Set();
    let nltkReady = false;
    let stdinLines = [];
    let muted = false;
    const decoder = new TextDecoder();

    function stream(type) {
      return {
        write(buf) {
          if (muted) return buf.length;
          onEvent({ type, data: decoder.decode(buf) });
          return buf.length;
        },
      };
    }

    async function init() {
      onEvent({ type: "status", data: "Loading Python…" });
      py = await loadPyodide({ indexURL });
      py.registerJsModule("dslab_bridge", {
        emit: (kind, data) => onEvent({ type: kind, data }),
      });
      onEvent({ type: "status", data: "Loading numpy, pandas, matplotlib…" });
      await py.loadPackage(["micropip", "numpy", "pandas", "matplotlib"], {
        messageCallback: () => {},
      });
      py.setStdout(stream("stdout"));
      py.setStderr(stream("stderr"));
      py.setStdin({
        stdin: () => {
          if (!stdinLines.length) return undefined;
          const line = stdinLines.shift();
          onEvent({ type: "stdin", data: line + "\n" });
          return line;
        },
      });
      await py.runPythonAsync(preambleSrc);
      py.FS.mkdirTree("/home/pyodide");
      py.FS.chdir("/home/pyodide");
      onEvent({ type: "status", data: "ready" });
    }

    async function ensurePackages(code) {
      onEvent({ type: "status", data: "Checking imports…" });
      muted = true;
      try {
        await installFor(code);
      } finally {
        muted = false;
      }
    }

    async function installFor(code) {
      await py.loadPackagesFromImports(code, { messageCallback: () => {} });
      const wanted = Object.keys(MICROPIP).filter(
        (p) => MICROPIP[p].test(code) && !installed.has(p),
      );
      if (wanted.length) {
        onEvent({ type: "status", data: `Installing ${wanted.join(", ")}…` });
        const micropip = py.pyimport("micropip");
        await micropip.install(wanted);
        micropip.destroy?.();
        wanted.forEach((p) => installed.add(p));
      }
      if (/plotly/.test(code)) py.runPython("_patch_plotly()");
      if (/^\s*(import|from)\s+nltk\b/m.test(code)) {
        if (!nltkReady) {
          onEvent({ type: "status", data: "Fetching NLTK data…" });
          for (const [cat, name] of NLTK_DATA) {
            try {
              const bytes = await fetchBytes(`${NLTK_BASE}/${cat}/${name}.zip`);
              const dir = `/home/pyodide/nltk_data/${cat}`;
              py.FS.mkdirTree(dir);
              py.FS.writeFile(`${dir}/${name}.zip`, bytes);
              py.runPython(
                `import zipfile; zipfile.ZipFile("${dir}/${name}.zip").extractall("${dir}")`,
              );
            } catch (e) {
              onEvent({ type: "stderr", data: `(could not fetch nltk ${name}: ${e})\n` });
            }
          }
          nltkReady = true;
        }
        py.runPython("_patch_nltk()");
      }
    }

    function writeFiles(files) {
      for (const f of files || []) {
        py.FS.writeFile(`/home/pyodide/${f.name}`, f.bytes);
      }
    }

    function listFiles() {
      return py.FS.readdir("/home/pyodide").filter(
        (n) => n !== "." && n !== ".." && n !== "nltk_data" && !n.startsWith("."),
      );
    }

    function readFile(name) {
      return py.FS.readFile(`/home/pyodide/${name}`);
    }

    async function run(code, stdin) {
      const t0 = Date.now();
      stdinLines = (stdin || "").split("\n");
      if (stdinLines.length === 1 && stdinLines[0] === "") stdinLines = [];
      let ok = false;
      try {
        await ensurePackages(code);
        onEvent({ type: "status", data: "Running…" });
        const fn = py.globals.get("_run_user_code");
        ok = fn(code).valueOf();
        fn.destroy();
      } catch (e) {
        onEvent({ type: "stderr", data: String(e && e.message ? e.message : e) + "\n" });
      }
      onEvent({ type: "status", data: "ready" });
      return { ok, ms: Date.now() - t0, files: listFiles() };
    }

    return { init, run, writeFiles, listFiles, readFile };
  }

  root.createDsRunner = createDsRunner;
  if (typeof module !== "undefined") module.exports = { createDsRunner };
})(typeof self !== "undefined" ? self : globalThis);
