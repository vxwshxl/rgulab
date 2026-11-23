import { ogImage } from "@/lib/og";

export function GET() {
  return ogImage({
    eyebrow: "DS Lab · exam day",
    title: "All 29 DS lab codes + viva answers.",
    subtitle: "Copy-paste ready Python for every record program, with module, line-by-line and concept viva questions answered.",
    chips: [
      { label: "Copy code", hue: "green" },
      { label: "Viva Q&A", hue: "purple" },
      { label: "Line by line", hue: "orange" },
    ],
    accent: "green",
  });
}
