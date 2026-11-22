// Open Graph banner shared by the site and each lab. ImageResponse can't read CSS
// variables, so the hex values below mirror the tokens in src/styles/tokens.css.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const HUE: Record<string, [string, string]> = {
  green: ["#2E8500", "#1F5C00"],
  purple: ["#8A4FCB", "#5F3290"],
  orange: ["#AD5A00", "#763D00"],
};

const MASCOT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110"><line x1="50" y1="14" x2="50" y2="26" stroke="#055550" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="11" r="6" fill="#FFC800"/><rect x="14" y="24" width="72" height="62" rx="24" fill="#0A7F78"/><rect x="14" y="78" width="72" height="8" rx="4" fill="#055550"/><rect x="22" y="34" width="56" height="42" rx="16" fill="#F4FFFD"/><path d="M32 54 Q38 46 44 54" stroke="#10302D" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M56 54 Q62 46 68 54" stroke="#10302D" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M38 64 Q50 76 62 64" stroke="#10302D" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="30" y="92" width="8" height="12" rx="3" fill="#2E8500"/><rect x="46" y="88" width="8" height="16" rx="3" fill="#0A78B5"/><rect x="62" y="95" width="8" height="9" rx="3" fill="#AD5A00"/></svg>`;
export const MASCOT_URI = `data:image/svg+xml;base64,${Buffer.from(MASCOT).toString("base64")}`;

type Chip = { label: string; hue: keyof typeof HUE };

async function fonts() {
  const dir = path.join(process.cwd(), "src/assets/fonts");
  const [bold, semi] = await Promise.all([readFile(path.join(dir, "Nunito-800.ttf")), readFile(path.join(dir, "Nunito-600.ttf"))]);
  return [
    { name: "Nunito", data: bold, weight: 800 as const, style: "normal" as const },
    { name: "Nunito", data: semi, weight: 600 as const, style: "normal" as const },
  ];
}

export async function ogImage(opts: { eyebrow: string; title: string; subtitle: string; chips: Chip[]; accent?: keyof typeof HUE }) {
  const [accent] = HUE[opts.accent ?? "green"]!;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0A0A0A", color: "#EDEDED", padding: 64, fontFamily: "Nunito", fontWeight: 600 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MASCOT_URI} width={64} height={70} alt="" />
          <div style={{ display: "flex", fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>
            <span style={{ color: "#A1A1A1" }}>rgu</span>
            <span style={{ color: "#58CC02" }}>LAB</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", fontSize: 22, color: "#A1A1A1", border: "2px solid #333", borderRadius: 999, padding: "8px 20px" }}>
            {opts.eyebrow}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 56, flex: 1 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3, maxWidth: 1000 }}>{opts.title}</div>
          <div style={{ fontSize: 30, color: "#A1A1A1", marginTop: 24, maxWidth: 940, lineHeight: 1.3 }}>{opts.subtitle}</div>
        </div>
        <div style={{ display: "flex", gap: 18, alignItems: "flex-end" }}>
          {opts.chips.map((c) => {
            const [bg, ledge] = HUE[c.hue]!;
            return (
              <div key={c.label} style={{ display: "flex", background: bg, color: "white", fontSize: 28, fontWeight: 800, padding: "16px 30px", borderRadius: 22, boxShadow: `0 6px 0 ${ledge}` }}>
                {c.label}
              </div>
            );
          })}
          <div style={{ marginLeft: "auto", display: "flex", height: 12, width: 220, borderRadius: 999, background: accent }} />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}
