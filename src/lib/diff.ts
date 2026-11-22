import type { Lang } from "@/data/labs";

export type DiffLine = { text: string; kind: "same" | "mine" | "ref" };

const normalize = (line: string) => line.trim().replace(/\s+/g, " ").replace(/\s*([=(),:+\-*/<>[\]{};])\s*/g, "$1");

function meaningful(code: string, lang: Lang) {
  return code
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .filter((l) => {
      const t = l.trim();
      if (!t || /^[{}]$/.test(t)) return false;
      if (lang === "c") return !t.startsWith("//") && !t.startsWith("/*") && !t.startsWith("*");
      return !t.startsWith("#");
    });
}

/** Line diff by longest common subsequence on whitespace-insensitive lines. */
export function diffCode(mine: string, ref: string, lang: Lang): { lines: DiffLine[]; similarity: number } {
  const a = meaningful(mine, lang);
  const b = meaningful(ref, lang);
  const na = a.map(normalize);
  const nb = b.map(normalize);
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--) dp[i]![j] = na[i] === nb[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
  const lines: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (na[i] === nb[j]) {
      lines.push({ text: b[j]!, kind: "same" });
      i++;
      j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) lines.push({ text: a[i++]!, kind: "mine" });
    else lines.push({ text: b[j++]!, kind: "ref" });
  }
  while (i < a.length) lines.push({ text: a[i++]!, kind: "mine" });
  while (j < b.length) lines.push({ text: b[j++]!, kind: "ref" });
  const total = a.length + b.length;
  return { lines, similarity: total ? Math.round(((2 * dp[0]![0]!) / total) * 100) : 0 };
}

/** Compare printed outputs, ignoring timing lines, whitespace and float noise past 4 decimals. */
export function outputsMatch(got: string, want: string): boolean {
  const n = (s: string) =>
    s
      .replace(/Time taken:\s*[\d.e-]+/g, "")
      .replace(/(\d+\.\d{4})\d+/g, "$1")
      .split("\n")
      .map((l) => l.trim().replace(/\s+/g, " "))
      .filter(Boolean)
      .join("\n");
  return n(got) === n(want);
}
