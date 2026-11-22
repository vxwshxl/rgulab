// Turns plain program output into data for the OS / DAA result cards.

export type SchedRow = { name: string; burst: number; wait: number; tat: number; priority?: number };
export type Schedule = { rows: SchedRow[]; avgWait?: number; avgTat?: number };

export function parseSchedule(out: string): Schedule | null {
  const lines = out.split("\n");
  const h = lines.findIndex((l) => /Burst Time/i.test(l) && /Waiting/i.test(l));
  if (h < 0) return null;
  const cols = lines[h]!.split(/\t+/).map((c) => c.trim().toLowerCase());
  const col = (re: RegExp) => cols.findIndex((c) => re.test(c));
  const ib = col(/burst/), iw = col(/waiting/), it = col(/turnaround/), ip = col(/priority/);
  const rows: SchedRow[] = [];
  for (const l of lines.slice(h + 1)) {
    if (!/^P\d+/.test(l.trim())) {
      if (rows.length) break;
      continue;
    }
    const cells = l.trim().split(/\t+|\s{2,}/);
    rows.push({
      name: cells[0]!,
      burst: Number(cells[ib]),
      wait: Number(cells[iw]),
      tat: Number(cells[it]),
      priority: ip >= 0 ? Number(cells[ip]) : undefined,
    });
  }
  if (!rows.length || rows.some((r) => Number.isNaN(r.burst) || Number.isNaN(r.wait))) return null;
  const avg = (re: RegExp) => {
    const m = out.match(re);
    return m ? Number(m[1]) : undefined;
  };
  return { rows, avgWait: avg(/Average Waiting Time\s*=\s*([\d.]+)/i), avgTat: avg(/Average Turnaround Time\s*=\s*([\d.]+)/i) };
}

export type Metrics = { comparisons?: number; seconds?: number; time?: string; space?: string };

export function parseMetrics(out: string): Metrics | null {
  const m: Metrics = {};
  const c = out.match(/Number of comparisons\s*:\s*(\d+)/i);
  const s = out.match(/Time taken\s*:\s*([\d.e-]+)/i);
  const t = out.match(/Time complexity\s*:\s*(.+)/i);
  const sp = out.match(/Space complexity\s*:\s*(.+)/i);
  if (c) m.comparisons = Number(c[1]);
  if (s) m.seconds = Number(s[1]);
  if (t) m.time = t[1]!.trim();
  if (sp) m.space = sp[1]!.trim();
  return Object.keys(m).length ? m : null;
}

const nums = (s: string) => (s.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);

export type ArrayViz = { before: number[]; after?: number[]; found?: number; key?: number };

export function parseArrays(stdin: string, out: string): ArrayViz | null {
  const lines = stdin.split("\n").map((l) => l.trim()).filter(Boolean);
  const before = lines.map(nums).find((a) => a.length >= 3);
  if (!before) return null;
  const sortedLine = out.split("\n").find((l) => /sort/i.test(l) && nums(l).length >= 3);
  const found = out.match(/is found at position\s*(\d+)/i);
  const key = found ? nums(lines[lines.length - 1] ?? "")[0] : undefined;
  if (!sortedLine && !found) return null;
  return { before: before.slice(0, 40), after: sortedLine ? nums(sortedLine.split(":").slice(1).join(":") || sortedLine).slice(0, 40) : undefined, found: found ? Number(found[1]) - 1 : undefined, key };
}
