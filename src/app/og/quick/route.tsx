import { ogImage } from "@/lib/og";

export function GET() {
  return ogImage({
    eyebrow: "DS Lab · exam day",
    title: "All 29 DS lab codes + viva answers.",
    subtitle: "Copy-paste Python for every record program, with output, graphs and module, line-by-line and concept viva answers.",
    chips: [
      { label: "Copy code", hue: "green" },
      { label: "Viva Q&A", hue: "purple" },
      { label: "Line by line", hue: "orange" },
    ],
    accent: "green",
  });
}
