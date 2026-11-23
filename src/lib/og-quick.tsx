import { getLab, type LabId } from "@/data/labs";
import { ogImage } from "./og";

/** OG banner for a lab's code + viva page. */
export function quickOg(labId: LabId) {
  const lab = getLab(labId)!;
  const n = lab.programs.filter((p) => p.record).length;
  const accent = labId === "os" ? "purple" : labId === "daa" ? "orange" : "green";
  const lang = labId === "ds" ? "Python" : labId === "os" ? "shell script and C" : "C";
  return ogImage({
    eyebrow: `${lab.name} · exam day`,
    title: `All ${n} ${lab.short} lab codes + viva answers.`,
    subtitle:
      labId === "daa"
        ? "Algorithm, C program, output and time/space complexity for every record program, plus P vs NP theory and viva answers."
        : `Copy-paste ${lang} for every record program, with ${labId === "os" ? "the algorithm, output" : "output, graphs"} and line-by-line, ${labId === "ds" ? "module" : "command"} and concept viva answers.`,
    chips: [
      { label: "Copy code", hue: accent },
      { label: "Viva Q&A", hue: labId === "os" ? "green" : "purple" },
      { label: "Line by line", hue: labId === "daa" ? "green" : "orange" },
    ],
    accent,
  });
}
