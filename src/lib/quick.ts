// Shared logic for the /quick pages and their PDF downloads.
import { getLab, type LabId, type Program } from "@/data/labs";
import { groups as dsGroups } from "@/data/quick-ds";

export type QuickGroup = { id: string; title: string; ids: string[] };

/** Record programs grouped as on the page: DS by topic, OS/DAA by unit. */
export function quickGroups(labId: LabId): QuickGroup[] {
  const lab = getLab(labId)!;
  if (labId === "ds") return dsGroups.map((g) => ({ id: g.id, title: g.title, ids: g.programs.map((x) => x.id) }));
  return lab.units.map((u) => ({ id: u.id, title: u.title, ids: u.ids.filter((id) => lab.byId.get(id)?.record) })).filter((g) => g.ids.length);
}

/** Record programs in number order. */
export function quickPrograms(labId: LabId): Program[] {
  const lab = getLab(labId)!;
  return quickGroups(labId)
    .flatMap((g) => g.ids)
    .sort()
    .map((id) => lab.byId.get(id)!);
}

/** Exam-copy algorithm: DAA has its own Algorithm block; OS/DS steps become Start → steps → Stop. */
export function algorithmOf(p: Program): string {
  if (p.algorithm?.trim()) return p.algorithm.trim();
  if (!p.steps?.length) return "";
  const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
  return ["1. Start", ...p.steps.map((x, i) => `${i + 2}. ${cap(x)}`), `${p.steps.length + 2}. Stop`].join("\n");
}

/** The time/space complexity lines the program prints (what goes in the exam copy). */
export function printedComplexity(code: string): { time?: string; space?: string } {
  const grab = (k: string) => code.match(new RegExp(`${k} complexity:([^"]*)"`, "i"))?.[1]?.replace(/\\n/g, "").trim();
  return { time: grab("Time"), space: grab("Space") };
}

export const pdfHref = (lab: string) => `/pdf/${lab}`;
