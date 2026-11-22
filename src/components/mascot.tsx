import { cn } from "@/lib/utils";

type Mood = "happy" | "think" | "cheer" | "sad";

/** "Pip": the app's own little data robot. */
export function Mascot({ mood = "happy", className }: { mood?: Mood; className?: string }) {
  const mouth =
    mood === "sad" ? "M40 70 Q50 63 60 70" : mood === "think" ? "M42 68 L58 68" : "M38 64 Q50 76 62 64";
  return (
    <svg viewBox="0 0 100 110" className={cn("size-24", className)} aria-hidden>
      <line x1="50" y1="14" x2="50" y2="26" stroke="var(--ds-hue-teal-ledge)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="11" r="6" fill="var(--ds-gold)" />
      <rect x="14" y="24" width="72" height="62" rx="24" fill="var(--ds-hue-teal)" />
      <rect x="14" y="78" width="72" height="8" rx="4" fill="var(--ds-hue-teal-ledge)" />
      <rect x="22" y="34" width="56" height="42" rx="16" fill="#F4FFFD" />
      <circle cx="38" cy="52" r={mood === "cheer" ? 0 : 6} fill="#10302D" />
      <circle cx="62" cy="52" r={mood === "cheer" ? 0 : 6} fill="#10302D" />
      {mood === "cheer" && (
        <>
          <path d="M32 54 Q38 46 44 54" stroke="#10302D" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M56 54 Q62 46 68 54" stroke="#10302D" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      )}
      <circle cx="40" cy="50" r={mood === "cheer" ? 0 : 2} fill="#fff" />
      <circle cx="64" cy="50" r={mood === "cheer" ? 0 : 2} fill="#fff" />
      <path d={mouth} stroke="#10302D" strokeWidth="4" fill="none" strokeLinecap="round" />
      <rect x="30" y="92" width="8" height="12" rx="3" fill="var(--ds-hue-green)" />
      <rect x="46" y="88" width="8" height="16" rx="3" fill="var(--ds-hue-blue)" />
      <rect x="62" y="95" width="8" height="9" rx="3" fill="var(--ds-hue-orange)" />
    </svg>
  );
}
