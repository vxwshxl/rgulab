import { getLab, LAB_IDS } from "@/data/labs";
import { ogImage } from "@/lib/og";

export function generateStaticParams() {
  return LAB_IDS.map((lab) => ({ lab }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ lab: string }> }) {
  const { lab } = await params;
  const L = getLab(lab) ?? getLab("ds")!;
  const hue = L.hue === "purple" ? "purple" : L.hue === "orange" ? "orange" : "green";
  return ogImage({
    eyebrow: L.subject,
    title: `${L.name}: ${L.programs.length} programs, mastered.`,
    subtitle: `${L.tagline}. Lessons, mock exams and ${L.viva.length}+ viva questions with answers.`,
    chips: [
      { label: "Lessons", hue },
      { label: "Simulator", hue },
      { label: "Exam mode", hue },
      { label: "Viva prep", hue },
    ],
    accent: hue,
  });
}
