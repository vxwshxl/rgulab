import { cn } from "@/lib/utils";

type Props = {
  label: string;
  children: React.ReactNode;
  side?: "top" | "bottom";
  /** Which edge of the trigger the bubble lines up with; use "end" near the right edge of the screen. */
  align?: "center" | "start" | "end";
  className?: string;
};

/**
 * Custom tooltip (replaces the native title attribute). Shows on hover and keyboard focus.
 * It stays display:none until shown, so an off-screen bubble never widens the page.
 */
export function Tooltip({ label, children, side = "top", align = "center", className }: Props) {
  return (
    <span className={cn("group/tt relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 hidden w-max max-w-56 animate-pop rounded-lg bg-foreground px-2.5 py-1.5 text-center text-xs font-bold normal-case tracking-normal text-background shadow-e2 group-hover/tt:block group-has-[:focus-visible]/tt:block",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
          align === "center" && "left-1/2 -translate-x-1/2",
          align === "start" && "left-0",
          align === "end" && "right-0",
        )}
      >
        {label}
      </span>
    </span>
  );
}
