import daaRaw from "./daa.gen.json";
import dsRaw from "./ds.gen.json";
import osRaw from "./os.gen.json";
import { daaNotes } from "./daa-notes";
import { dsNotes } from "./ds-notes";
import { osNotes } from "./os-notes";
import type { Note, VivaQ } from "./types";
import { daaViva, dsViva, osViva } from "./viva";

export type { Mcq, Note, VivaQ } from "./types";

export type LabId = "ds" | "os" | "daa";
export type Lang = "python" | "bash" | "c";
export type Hue = "green" | "blue" | "purple" | "orange" | "pink" | "teal" | "red" | "yellow";
export type Sample = { stdin: string; output: string; verified: boolean };

type RawProgram = {
  id: string;
  file?: string;
  aim: string;
  algorithm?: string;
  code: string;
  lang: Lang;
  wasm?: string | null;
  samples: Sample[];
  images: string[];
};

export type Complexity = { best: string; avg: string; worst: string; paradigm: string };

export type Program = Omit<RawProgram, "algorithm"> &
  Note & {
    lab: LabId;
    key: string;
    unit: string;
    record: boolean;
    algorithm: string;
    fileName: string;
    complexity?: Complexity;
  };

export type Unit = { id: string; title: string; blurb: string; hue: Hue; ids: string[]; bonus?: boolean };

export type Lab = {
  id: LabId;
  short: string;
  name: string;
  subject: string;
  tagline: string;
  hue: Hue;
  lang: Lang;
  runtime: string;
  units: Unit[];
  programs: Program[];
  byId: Map<string, Program>;
  order: string[];
  viva: VivaQ[];
  recordCount: number;
};

/** Pull the numbered steps out of a DAA "Algorithm:" block. */
function stepsFromAlgorithm(alg: string): string[] {
  const steps = alg
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^\d+\.\s/.test(l))
    .map((l) => l.replace(/^\d+\.\s*/, ""))
    .filter((l) => !/^(start|stop)$/i.test(l));
  return steps.slice(0, 8);
}

function makeLab(
  base: Omit<Lab, "programs" | "byId" | "order" | "recordCount">,
  raw: RawProgram[],
  notes: Record<string, Partial<Note> & { title: string; mcq: Note["mcq"] } & Partial<Complexity>>,
  isRecord: (id: string) => boolean,
): Lab {
  const unitOf = new Map(base.units.flatMap((u) => u.ids.map((id) => [id, u.id] as const)));
  const ext = base.lang === "python" ? "py" : base.lang === "bash" ? "sh" : "c";
  const programs: Program[] = raw.map((p) => {
    const n = notes[p.id];
    if (!n) throw new Error(`Missing notes for ${base.id}/${p.id}`);
    const algorithm = p.algorithm ?? "";
    const { best, avg, worst, paradigm, ...note } = n;
    return {
      ...p,
      ...note,
      steps: note.steps?.length ? note.steps : stepsFromAlgorithm(algorithm),
      lab: base.id,
      key: `${base.id}:${p.id}`,
      unit: unitOf.get(p.id) ?? base.units[0]!.id,
      record: isRecord(p.id),
      algorithm,
      lang: p.lang,
      fileName: p.file ?? `${p.id}.${ext}`,
      complexity: best && avg && worst && paradigm ? { best, avg, worst, paradigm } : undefined,
    };
  });
  const order = base.units.flatMap((u) => u.ids);
  return { ...base, programs, byId: new Map(programs.map((p) => [p.id, p])), order, recordCount: programs.filter((p) => p.record).length };
}

const DS_RECORD = new Set([...Array.from({ length: 25 }, (_, i) => String(i + 1).padStart(2, "0")), "37", "38", "39", "40"]);

export const labs: Lab[] = [
  makeLab(
    {
      id: "ds",
      short: "DS",
      name: "DS Lab",
      subject: "Introduction to Data Science",
      tagline: "Pandas, statistics, ML models and plots, run in real Python",
      hue: "green",
      lang: "python",
      runtime: "Python 3.14 · Pyodide",
      viva: dsViva,
      units: [
        { id: "basics", title: "Data basics", blurb: "Load, clean, summarise", hue: "green", ids: ["01", "02", "03", "08"] },
        { id: "stats", title: "Statistics", blurb: "Distributions, tests, intervals", hue: "blue", ids: ["04", "05", "06", "07"] },
        { id: "viz", title: "Visualisation", blurb: "Matplotlib, Seaborn, Plotly", hue: "purple", ids: ["09", "10", "37", "38"] },
        { id: "reg", title: "Regression", blurb: "Linear, multiple, Ridge & Lasso", hue: "orange", ids: ["11", "12", "13"] },
        { id: "eval", title: "Model evaluation", blurb: "Splits, CV and metrics", hue: "pink", ids: ["14", "15"] },
        { id: "clf", title: "Classification", blurb: "kNN to Random Forest", hue: "teal", ids: ["16", "17", "18", "19", "20", "21", "22"] },
        { id: "clu", title: "Clustering", blurb: "K-Means, hierarchical, compare", hue: "red", ids: ["23", "24", "25"] },
        { id: "eda", title: "EDA & full pipeline", blurb: "The capstone programs", hue: "yellow", ids: ["39", "40"] },
        { id: "rec", title: "Recommenders & reduction", blurb: "Bonus: CF, TF-IDF, SVD, PCA", hue: "blue", ids: ["26", "27", "28", "29", "30"], bonus: true },
        { id: "text", title: "Text mining", blurb: "Bonus: tokenise, TF-IDF, cosine", hue: "purple", ids: ["31", "32", "33"], bonus: true },
        { id: "graph", title: "Graphs", blurb: "Bonus: NetworkX", hue: "green", ids: ["34", "35", "36"], bonus: true },
      ],
    },
    dsRaw as RawProgram[],
    dsNotes,
    (id) => DS_RECORD.has(id),
  ),
  makeLab(
    {
      id: "os",
      short: "OS",
      name: "OS Lab",
      subject: "Operating Systems",
      tagline: "Shell scripts in a live terminal, CPU scheduling, Banker's and memory fits",
      hue: "purple",
      lang: "bash",
      runtime: "bash · just-bash",
      viva: osViva,
      units: [
        { id: "first", title: "First scripts", blurb: "echo, read, arithmetic, bc", hue: "purple", ids: ["01", "02", "09", "14", "23", "19"] },
        { id: "cond", title: "Decisions", blurb: "if, elif, case", hue: "blue", ids: ["03", "17", "20", "29", "18"] },
        { id: "loops", title: "Loops & numbers", blurb: "while, for, digits", hue: "teal", ids: ["04", "05", "06", "11", "07", "08", "10", "12", "13", "21"] },
        { id: "fun", title: "Functions & patterns", blurb: "local, nested loops", hue: "orange", ids: ["22", "24", "25", "28"] },
        { id: "arr", title: "Arrays", blurb: "arr[i], ${arr[@]}", hue: "pink", ids: ["26", "27"] },
        { id: "sched", title: "CPU scheduling", blurb: "FCFS, priority, Round Robin", hue: "red", ids: ["15", "16", "31"] },
        { id: "mem", title: "Deadlock & memory", blurb: "Banker's, First / Best / Worst Fit", hue: "yellow", ids: ["32", "33"] },
        { id: "linux", title: "Linux commands", blurb: "mkdir, grep, sed, cal…", hue: "green", ids: ["30"] },
      ],
    },
    osRaw as RawProgram[],
    osNotes,
    () => true,
  ),
  makeLab(
    {
      id: "daa",
      short: "DAA",
      name: "DAA Lab",
      subject: "Design & Analysis of Algorithms",
      tagline: "Real C compiled to WebAssembly, with comparisons and timing",
      hue: "orange",
      lang: "c",
      runtime: "C · clang → WebAssembly",
      viva: daaViva,
      units: [
        { id: "search", title: "Searching", blurb: "Linear and binary", hue: "orange", ids: ["01", "02"] },
        { id: "sort", title: "Sorting", blurb: "O(n²) to O(n log n)", hue: "blue", ids: ["03", "04", "05", "06", "07", "08", "09"] },
        { id: "dp", title: "Dynamic programming", blurb: "Fibonacci, MCM, knapsack, LCS, TSP", hue: "purple", ids: ["10", "11", "12", "13", "14", "19"] },
        { id: "greedy", title: "Greedy", blurb: "Fractional knapsack, jobs, Huffman", hue: "teal", ids: ["15", "16", "17"] },
        { id: "bt", title: "Backtracking & B&B", blurb: "N-Queen, job assignment", hue: "pink", ids: ["18", "22"] },
        { id: "graphs", title: "Graphs", blurb: "BFS, DFS, shortest paths, MSTs", hue: "red", ids: ["20", "21", "23", "24", "25", "26", "27"] },
      ],
    },
    daaRaw as RawProgram[],
    daaNotes,
    () => true,
  ),
];

export const labById = new Map(labs.map((l) => [l.id, l]));
export const LAB_IDS = labs.map((l) => l.id);

export function getLab(id: string): Lab | undefined {
  return labById.get(id as LabId);
}

export function getProgram(lab: string, id: string): Program | undefined {
  return labById.get(lab as LabId)?.byId.get(id);
}
