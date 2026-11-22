// Runs a bash script with just-bash. A few rewrites make lab scripts behave like a terminal:
// every `read` echoes what it consumed (marked with \x1e so the UI can colour it), and
// bc / cal are provided as custom commands.
import { Bash, defineCommand } from "../vendor/just-bash.js";

export const ECHO_MARK = "\u001e";

/* ---------- bc: enough of POSIX bc for "scale=2; 3.14 * r * r" ---------- */
function bcEval(src) {
  let scale = 0;
  const out = [];
  for (const stmt of src.split(/[;\n]/).map((s) => s.trim()).filter(Boolean)) {
    const m = stmt.match(/^scale\s*=\s*(\d+)$/);
    if (m) {
      scale = Number(m[1]);
      continue;
    }
    const toks = stmt.match(/\d*\.\d+|\d+|[-+*/%^()]/g) || [];
    let i = 0;
    const dp = (s) => (s.includes(".") ? s.split(".")[1].length : 0);
    const num = () => {
      const t = toks[i++];
      if (t === "(") {
        const v = expr();
        i++;
        return v;
      }
      if (t === "-") {
        const v = num();
        return { v: -v.v, s: v.s };
      }
      return { v: Number(t), s: dp(t) };
    };
    const pow = () => {
      let a = num();
      while (toks[i] === "^") {
        i++;
        const b = num();
        a = { v: a.v ** b.v, s: Math.min(a.s * b.v, Math.max(scale, a.s)) };
      }
      return a;
    };
    const term = () => {
      let a = pow();
      while (toks[i] === "*" || toks[i] === "/" || toks[i] === "%") {
        const op = toks[i++];
        const b = pow();
        if (op === "*") a = { v: a.v * b.v, s: Math.min(a.s + b.s, Math.max(scale, a.s, b.s)) };
        else if (op === "/") a = { v: a.v / b.v, s: scale };
        else a = { v: a.v % b.v, s: Math.max(a.s, b.s) };
        const f = 10 ** a.s;
        a.v = Math.trunc(a.v * f + (a.v >= 0 ? 1e-9 : -1e-9)) / f;
      }
      return a;
    };
    const expr = () => {
      let a = term();
      while (toks[i] === "+" || toks[i] === "-") {
        const op = toks[i++];
        const b = term();
        a = { v: op === "+" ? a.v + b.v : a.v - b.v, s: Math.max(a.s, b.s) };
      }
      return a;
    };
    const r = expr();
    let text = r.v.toFixed(r.s);
    if (text.startsWith("0.")) text = text.slice(1);
    else if (text.startsWith("-0.")) text = "-" + text.slice(2);
    out.push(text);
  }
  return out.join("\n");
}

const bc = defineCommand("bc", async (args, ctx) => {
  const src = ctx.stdin || args.filter((a) => !a.startsWith("-")).join(" ");
  try {
    return { stdout: bcEval(src) + "\n", stderr: "", exitCode: 0 };
  } catch (e) {
    return { stdout: "", stderr: `bc: ${e.message}\n`, exitCode: 1 };
  }
});

/* ---------- cal: month calendar like util-linux ---------- */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const cal = defineCommand("cal", async (args) => {
  const now = new Date();
  const month = args[0] ? Number(args[0]) - 1 : now.getMonth();
  const year = args[1] ? Number(args[1]) : now.getFullYear();
  const title = `${MONTHS[month]} ${year}`;
  const lines = [title.padStart(Math.floor((20 + title.length) / 2)).padEnd(20), "Su Mo Tu We Th Fr Sa"];
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  let row = "   ".repeat(first);
  for (let d = 1; d <= days; d++) {
    row += String(d).padStart(2) + ((first + d) % 7 === 0 ? "" : " ");
    if ((first + d) % 7 === 0) {
      lines.push(row.trimEnd());
      row = "";
    }
  }
  if (row) lines.push(row.trimEnd());
  return { stdout: lines.join("\n") + "\n", stderr: "", exitCode: 0 };
});

/** Rewrite `read` lines so the consumed input is echoed, as a terminal would show it. */
export function instrument(script) {
  return script
    .split("\n")
    .map((line) => {
      const m = line.match(/^(\s*)read\s+((?:-[a-z]+\s+)*)(.+?)\s*$/);
      if (!m || /[;&|]/.test(m[3])) return line;
      const [, ind, flags, rest] = m;
      const arr = rest.match(/^(\w+)\[(.+)\]$/);
      if (arr) {
        return `${ind}read ${flags}__rgv && ${arr[1]}[${arr[2]}]=$__rgv && printf '${ECHO_MARK}%s\\n' "$__rgv"`;
      }
      const vars = rest.split(/\s+/).filter((v) => /^\w+$/.test(v));
      if (!vars.length) return line;
      const shown = vars.map((v) => `$${v}`).join(" ");
      return `${ind}read ${flags}${vars.join(" ")} && printf '${ECHO_MARK}%s\\n' "${shown}"`;
    })
    .join("\n");
}

const HOME = "/home/student";

export async function runBash(script, stdin, emit, { maxLoop = 20000 } = {}) {
  const bash = new Bash({
    cwd: HOME,
    files: { [`${HOME}/.keep`]: "", "/tmp/.keep": "" },
    env: { HOME, USER: "student", PS1: "$ " },
    customCommands: [bc, cal],
    executionLimits: { maxLoopIterations: maxLoop, maxCommandCount: 200000 },
  });
  const t0 = performance.now();
  let res;
  try {
    res = await bash.exec(instrument(script), { stdin: stdin ? stdin.replace(/\n?$/, "\n") : "", rawScript: true });
  } catch (e) {
    emit({ type: "stderr", data: String(e && e.message ? e.message : e) + "\n" });
    return { code: -1, ms: performance.now() - t0, note: "" };
  }
  for (const line of res.stdout.split(/(?<=\n)/)) {
    if (line.startsWith(ECHO_MARK)) emit({ type: "stdin", data: line.slice(1) });
    else if (line) emit({ type: "stdout", data: line });
  }
  if (res.stderr) emit({ type: "stderr", data: res.stderr });
  const looped = /iteration|limit/i.test(res.stderr || "");
  return {
    code: res.exitCode,
    ms: performance.now() - t0,
    note: looped ? "Stopped: the loop ran too long. Menu scripts need a final 'exit' choice in the input box." : "",
  };
}
