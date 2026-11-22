import { getLab, type Lab, type Lang, type Program } from "@/data/labs";
import { explainHeader, explainImport, explainOrder, explainToken } from "./explain";
import { sample, shuffle } from "./utils";

export type Exercise =
  | { kind: "intro"; key: string }
  | { kind: "mcq"; key: string; tag: "import" | "concept"; prompt: string; code?: string; options: string[]; answer: string; why?: string; whyNot?: Record<string, string> }
  | { kind: "blank"; key: string; prompt: string; context: string[]; before: string; after: string; answer: string; bank: string[] | null; why: string }
  | { kind: "order"; key: string; prompt: string; lines: string[]; start: string[]; why: string };

/* ---------- statement splitting ---------- */

/** Python: split into logical statements, keeping multi-line brackets together. */
export function statements(code: string): string[] {
  const units: string[] = [];
  let buf: string[] = [];
  let depth = 0;
  for (const line of code.split("\n")) {
    if (!buf.length && (!line.trim() || line.trim().startsWith("#"))) continue;
    buf.push(line);
    const stripped = line.replace(/(["'])(?:\\.|(?!\1).)*\1/g, "").replace(/#.*$/, "");
    for (const ch of stripped) {
      if ("([{".includes(ch)) depth++;
      else if (")]}".includes(ch)) depth--;
    }
    if (depth <= 0 && !line.trimEnd().endsWith("\\")) {
      units.push(buf.join("\n"));
      buf = [];
      depth = 0;
    }
  }
  if (buf.length) units.push(buf.join("\n"));
  return units;
}

const isComment = (line: string, lang: Lang) => {
  const t = line.trim();
  return lang === "c" ? t.startsWith("//") || t.startsWith("/*") || t.startsWith("*") : t.startsWith("#") && !t.startsWith("#!") && !t.startsWith("#include") && !t.startsWith("#define");
};
const isSetup = (line: string, lang: Lang) =>
  lang === "python" ? /^\s*(from|import)\s/.test(line) : lang === "c" ? /^\s*#\s*(include|define)/.test(line) : /^#!/.test(line.trim());

/** Lines a learner can reorder: C/bash use real lines; braces and blanks are skipped. */
function orderUnits(p: Program): string[] {
  if (p.lang === "python") return statements(p.code).filter((u) => !/^(from|import)\s/.test(u));
  return p.code
    .split("\n")
    .filter((l) => l.trim() && !isComment(l, p.lang) && !isSetup(l, p.lang) && !/^[{}();]+$/.test(l.trim()) && l.trim() !== "do" && l.trim() !== "then");
}

/* ---------- vocabulary per lab ---------- */

const C_KEYWORDS = new Set(["for", "while", "if", "else", "return", "break", "continue", "sizeof", "struct", "void", "switch", "case", "default", "do"]);
const C_STOP = new Set(["main", "include", "stdio", "stdlib", "time", "string", "math", "define", "int", "char", "void", "float", "double", "long", "unsigned", "const", "static"]);
const BASH_WORDS = new Set(["echo", "read", "then", "else", "elif", "fi", "do", "done", "while", "for", "case", "esac", "local", "bc", "scale", "until", "exit", "return", "printf", "break", "continue", "in", "true", "let", "expr", "function", "mkdir", "grep", "sed", "cat", "ls", "cd", "cal", "rm", "pwd"]);
const BASH_OPS = ["-eq", "-ne", "-gt", "-lt", "-ge", "-le", "-z", "-n", "-f", "-d"];
const PY_STOP = new Set([
  "df", "X", "y", "X_train", "X_test", "y_train", "y_test", "y_pred", "y_prob", "model", "m", "name", "names", "i", "t", "p",
  "fig", "ax", "data", "print", "range", "len", "list", "dict", "max", "min", "sorted", "enumerate", "items", "str", "int",
  "float", "True", "False", "None", "for", "in", "if", "else", "import", "from", "as", "def", "return", "lambda", "and", "or",
  "not", "kernel", "labels", "test", "cv", "sim", "user", "similar", "recs", "scores", "query", "docs", "tokens", "filtered",
  "stemmed", "text", "node", "comm", "communities", "A", "B", "C", "U", "S", "Vt", "Z", "G", "s", "w", "start", "iris", "wine",
  "movies", "ratings", "tfidf", "vectorizer", "svd", "pca", "knn", "dt", "rf", "nb", "svm", "kmeans", "multi", "mean", "scaler",
  "plt", "pd", "np", "sns", "nx", "px", "stats", "time", "nltk", "X_pca", "X_reduced", "Salary", "Age", "Name", "Experience",
  "Bonus", "target", "frame", "rowvar", "index", "columns", "values", "k", "a", "self",
]);

type Vocab = { kindOf: (tok: string, line: string) => string; pool: Map<string, Set<string>>; tokens: (line: string) => string[] };

const stripStrings = (line: string) => line.replace(/(["'])(?:\\.|(?!\1).)*\1/g, (s) => " ".repeat(s.length));

function buildVocab(lab: Lab): Vocab {
  const pool = new Map<string, Set<string>>();
  const add = (k: string, t: string) => {
    if (!pool.has(k)) pool.set(k, new Set());
    pool.get(k)!.add(t);
  };

  if (lab.lang === "python") {
    const kindOf = (tok: string, line: string) =>
      /^[A-Z]/.test(tok) ? "class" : new RegExp(`\\b${tok}=(?!=)`).test(line) ? "kwarg" : tok.endsWith("_") ? "attr" : "func";
    for (const p of lab.programs) {
      for (const line of p.code.split("\n")) {
        const im = line.match(/^from\s+[\w.]+\s+import\s+(.+)$/);
        if (im) {
          for (const n of im[1]!.split(",")) {
            const t = n.trim().split(/\s+as\s+/)[0]!;
            add(/^[A-Z]/.test(t) ? "class" : "func", t);
          }
        }
        if (isSetup(line, "python") || line.trim().startsWith("#")) continue;
        for (const mm of line.matchAll(/\.([A-Za-z_]\w*)/g)) if (!PY_STOP.has(mm[1]!)) add(kindOf(mm[1]!, line), mm[1]!);
        for (const mm of line.matchAll(/\b([a-z_]\w*)=(?!=)/g)) if (!PY_STOP.has(mm[1]!)) add("kwarg", mm[1]!);
      }
    }
    const tokens = (line: string) => {
      const out = new Set<string>();
      for (const mm of stripStrings(line).matchAll(/\b[A-Za-z_]\w*\b/g)) {
        const t = mm[0];
        if (PY_STOP.has(t) || t.length < 3) continue;
        if (pool.get(kindOf(t, line))?.has(t)) out.add(t);
      }
      return [...out];
    };
    return { kindOf, pool, tokens };
  }

  if (lab.lang === "c") {
    const kindOf = (tok: string, line: string) =>
      C_KEYWORDS.has(tok) ? "keyword" : new RegExp(`\\b${tok}\\s*\\(`).test(line) ? "call" : /^[A-Z_]+$/.test(tok) ? "const" : "var";
    const tokens = (line: string) => {
      if (isSetup(line, "c")) return [];
      const out = new Set<string>();
      for (const mm of stripStrings(line).matchAll(/\b[A-Za-z_]\w*\b/g)) {
        const t = mm[0];
        if (C_STOP.has(t) || t.length < 3) continue;
        out.add(t);
      }
      return [...out];
    };
    for (const p of lab.programs) for (const line of p.code.split("\n")) if (!isComment(line, "c")) for (const t of tokens(line)) add(kindOf(t, line), t);
    return { kindOf, pool, tokens };
  }

  // bash
  const kindOf = (tok: string) => (tok.startsWith("-") ? "op" : BASH_WORDS.has(tok) ? "word" : "var");
  const tokens = (line: string) => {
    const out = new Set<string>();
    const clean = stripStrings(line);
    for (const op of BASH_OPS) if (new RegExp(`(^|\\s)${op}(\\s|$)`).test(clean)) out.add(op);
    for (const mm of clean.matchAll(/(?<![\w$-])[a-z_]\w*\b/g)) if (BASH_WORDS.has(mm[0]) && mm[0].length >= 2) out.add(mm[0]);
    return [...out];
  };
  for (const op of BASH_OPS) add("op", op);
  for (const w of BASH_WORDS) add("word", w);
  return { kindOf: (t) => kindOf(t), pool, tokens };
}

const vocabCache = new Map<string, Vocab>();
function vocabFor(lab: Lab) {
  if (!vocabCache.has(lab.id)) vocabCache.set(lab.id, buildVocab(lab));
  return vocabCache.get(lab.id)!;
}

function distractors(v: Vocab, answer: string, line: string, own: Program, n = 3): string[] {
  const k = v.kindOf(answer, line);
  const pool = [...(v.pool.get(k) ?? [])].filter((t) => t !== answer && !line.split(/[^\w-]+/).includes(t));
  const ownToks = new Set(own.code.match(/-?\b[A-Za-z_]\w*\b/g) ?? []);
  const preferred = pool.filter((t) => ownToks.has(t));
  const rest = pool.filter((t) => !ownToks.has(t));
  return [...new Set([...sample(preferred, Math.min(2, preferred.length)), ...sample(rest, n)])].slice(0, n);
}

/* ---------- builders ---------- */

const HEADERS: [RegExp, string][] = [
  [/\b(printf|scanf|sprintf|puts|getchar)\s*\(/, "stdio.h"],
  [/\b(clock|CLOCKS_PER_SEC|clock_t)\b/, "time.h"],
  [/\b(malloc|free|qsort|abs|exit|rand)\s*\(/, "stdlib.h"],
  [/\b(strlen|strcpy|strcmp|strcat|memset)\s*\(/, "string.h"],
  [/\b(sqrt|pow|fabs|ceil|floor)\s*\(/, "math.h"],
];
const ALL_HEADERS = ["stdio.h", "time.h", "stdlib.h", "string.h", "math.h", "limits.h", "conio.h", "ctype.h"];

function setupMcqs(p: Program, n: number): Exercise[] {
  if (p.lang === "c") {
    const included = new Set([...p.code.matchAll(/#include\s*<([\w.]+)>/g)].map((m) => m[1]!));
    const qs = HEADERS.flatMap(([re, h]) => {
      const m = p.code.match(re);
      return m && included.has(h) ? [{ h, fn: m[1] ?? m[0] }] : [];
    });
    return sample(qs, n).map(({ h, fn }) => ({
      kind: "mcq" as const,
      key: `inc-${p.id}-${h}`,
      tag: "import" as const,
      prompt: `Which header gives you ${fn}?`,
      code: `#include <____>`,
      options: shuffle([h, ...sample(ALL_HEADERS.filter((x) => x !== h), 3)]),
      answer: h,
      why: explainHeader(h, fn),
    }));
  }
  if (p.lang !== "python") return [];
  const lab = getLab(p.lab)!;
  const modules = [...new Set(lab.programs.flatMap((q) => [...q.code.matchAll(/^from\s+([\w.]+)\s+import\s+(.+)$/gm)].map((m) => m[1]!)))];
  const ex: Exercise[] = [];
  const froms = [...p.code.matchAll(/^from\s+([\w.]+)\s+import\s+(.+)$/gm)].flatMap((m) =>
    m[2]!.split(",").map((nm) => ({ module: m[1]!, name: nm.trim().split(/\s+as\s+/)[0]!, line: m[0] })),
  );
  for (const { module, name, line } of sample(froms, n)) {
    const top = module.split(".")[0];
    const fam = modules.filter((x) => x !== module && x.split(".")[0] === top);
    const other = modules.filter((x) => x !== module && x.split(".")[0] !== top);
    ex.push({
      kind: "mcq",
      key: `imp-${p.id}-${name}`,
      tag: "import",
      prompt: "Complete the import",
      code: `from ____ import ${name}`,
      options: shuffle([module, ...[...sample(fam, 2), ...sample(other, 3)].slice(0, 3)]),
      answer: module,
      why: `${line}\n${explainImport(module, name)}`,
    });
  }
  const plain = [...p.code.matchAll(/^import\s+([\w.]+)\s+as\s+(\w+)\s*$/gm)];
  for (const m of sample(plain, Math.max(0, n - ex.length))) {
    const wrong = ["matplotlib", "pyplot", "seaborn.pyplot", "matplotlib.plot", "pandas.plot", "plotly"].filter((w) => w !== m[1]);
    ex.push({ kind: "mcq", key: `imp-${p.id}-${m[2]}`, tag: "import", prompt: `How do you import ${m[2]}?`, code: `import ____ as ${m[2]}`, options: shuffle([m[1]!, ...sample(wrong, 3)]), answer: m[1]!, why: `${m[0]}\n${explainImport(m[1]!, m[2]!, true)}` });
  }
  return ex;
}

function blankExercises(p: Program, n: number, typed: boolean, avoid = new Set<string>()): Exercise[] {
  const v = vocabFor(getLab(p.lab)!);
  const lines = p.code.split("\n");
  const cands: { idx: number; tok: string }[] = [];
  lines.forEach((line, idx) => {
    if (!line.trim() || isComment(line, p.lang) || isSetup(line, p.lang)) return;
    for (const tok of v.tokens(line)) if (!avoid.has(tok)) cands.push({ idx, tok });
  });
  const chosen: { idx: number; tok: string }[] = [];
  const usedLines = new Set<number>();
  const usedToks = new Set<string>();
  for (const c of shuffle(cands)) {
    if (chosen.length >= n) break;
    if (usedLines.has(c.idx) || usedToks.has(c.tok)) continue;
    chosen.push(c);
    usedLines.add(c.idx);
    usedToks.add(c.tok);
  }
  return chosen.flatMap(({ idx, tok }) => {
    const line = lines[idx]!;
    const re = tok.startsWith("-") ? new RegExp(`(?<=^|\\s)${tok}(?=\\s|$)`) : new RegExp(`\\b${tok}\\b`);
    const pos = stripStrings(line).search(re);
    if (pos < 0) return [];
    const bank = typed ? null : shuffle([tok, ...distractors(v, tok, line, p)]);
    if (bank && bank.length < 3) return [];
    const prev = lines.slice(Math.max(0, idx - 2), idx).filter((l) => l.trim() && !isSetup(l, p.lang));
    return [
      {
        kind: "blank" as const,
        key: `blank-${p.id}-${idx}-${tok}`,
        prompt: typed ? "Type the missing word" : "Fill in the blank",
        context: prev,
        before: line.slice(0, pos),
        after: line.slice(pos + tok.length),
        answer: tok,
        bank,
        why: explainToken(tok, line, p.lang, p.code),
      },
    ];
  });
}

function orderExercise(p: Program, max: number): Exercise | null {
  const units = orderUnits(p);
  if (units.length < 3) return null;
  const len = Math.min(max, units.length);
  for (let attempt = 0; attempt < 6; attempt++) {
    const start = Math.floor(Math.random() * (units.length - len + 1));
    const lines = units.slice(start, start + len);
    if (new Set(lines.map((l) => l.trim())).size < lines.length) continue;
    let mixed = shuffle(lines);
    for (let t = 0; t < 5 && mixed.every((l, i) => l === lines[i]); t++) mixed = shuffle(lines);
    return { kind: "order", key: `order-${p.id}-${start}`, prompt: "Put the lines in the right order", lines, start: mixed, why: explainOrder(lines, p.lang, p.steps) };
  }
  return null;
}

function conceptMcqs(p: Program, n: number): Exercise[] {
  return sample(p.mcq, n).map((q, i) => ({
    kind: "mcq" as const,
    key: `mcq-${p.id}-${i}-${q.q.slice(0, 12)}`,
    tag: "concept" as const,
    prompt: q.q,
    options: shuffle([q.correct, ...q.wrong]),
    answer: q.correct,
    why: q.why,
  }));
}

export type LessonMode = "learn" | "recall";

export function buildLesson(p: Program, mode: LessonMode): Exercise[] {
  if (mode === "learn") {
    const blanks = blankExercises(p, p.lang === "python" ? 2 : 3, false);
    const avoid = new Set(blanks.map((b) => (b.kind === "blank" ? b.answer : "")));
    const middle = shuffle<Exercise>([...setupMcqs(p, 2), ...blanks, ...conceptMcqs(p, Math.min(3, p.mcq.length))]);
    const order = orderExercise(p, 5);
    const typed = blankExercises(p, 1, true, avoid);
    return [{ kind: "intro", key: `intro-${p.id}` }, ...middle, ...(order ? [order] : []), ...typed];
  }
  const typed = blankExercises(p, 4, true);
  const order = orderExercise(p, 8);
  return [...shuffle<Exercise>([...setupMcqs(p, 3), ...typed.slice(0, 2), ...conceptMcqs(p, p.mcq.length)]), ...(order ? [order] : []), ...typed.slice(2)];
}

/** Mixed review across several programs of one lab. */
export function buildReview(ps: Program[]): Exercise[] {
  return shuffle(
    ps.flatMap((p) => [...conceptMcqs(p, 1), ...blankExercises(p, 1, Math.random() < 0.4), ...(Math.random() < 0.5 ? setupMcqs(p, 1) : [])]),
  ).slice(0, 12);
}

/** Subject-viva quiz: each question's answer against three other answers from the same lab. */
export function buildVivaQuiz(lab: Lab, n = 10): Exercise[] {
  return sample(lab.viva, n).map((v, i) => {
    const others = sample(lab.viva.filter((o) => o.q !== v.q && o.a !== v.a), 3);
    return {
      kind: "mcq" as const,
      key: `viva-${i}-${v.q.slice(0, 10)}`,
      tag: "concept" as const,
      prompt: v.q,
      options: shuffle([v.a, ...others.map((o) => o.a)]),
      answer: v.a,
      why: `Topic: ${v.topic}. The other options are real answers too, but to different questions: ${others.map((o) => `“${o.q}”`).join(", ")}.`,
      whyNot: Object.fromEntries(others.map((o) => [o.a, `That option answers a different question: “${o.q}”`])),
    };
  });
}

export function importMap(lab: Lab): { module: string; names: string[] }[] {
  const map = new Map<string, Set<string>>();
  for (const p of lab.programs) {
    for (const m of p.code.matchAll(/^from\s+([\w.]+)\s+import\s+(.+)$/gm)) {
      if (!map.has(m[1]!)) map.set(m[1]!, new Set());
      for (const n of m[2]!.split(",")) map.get(m[1]!)!.add(n.trim().split(/\s+as\s+/)[0]!);
    }
    for (const m of p.code.matchAll(/^import\s+([\w.]+)(?:\s+as\s+(\w+))?\s*$/gm)) {
      const key = `import ${m[1]}${m[2] ? ` as ${m[2]}` : ""}`;
      if (!map.has(key)) map.set(key, new Set());
    }
  }
  return [...map.entries()].map(([module, s]) => ({ module, names: [...s].sort() })).sort((a, b) => a.module.localeCompare(b.module));
}
