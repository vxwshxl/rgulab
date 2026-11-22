import { ogImage, OG_SIZE } from "@/lib/og";

export const alt = "rguLAB: Duolingo-style lab exam trainer for DS, OS and DAA";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    eyebrow: "Lab exam trainer",
    title: "Ace every lab exam, one streak at a time.",
    subtitle: "Lessons, live Python, bash and C simulators, mock exams and viva prep. Free, in your browser.",
    chips: [
      { label: "DS Lab", hue: "green" },
      { label: "OS Lab", hue: "purple" },
      { label: "DAA Lab", hue: "orange" },
    ],
  });
}
