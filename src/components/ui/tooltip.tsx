import { cn } from "@/lib/utils";

/** Custom tooltip (replaces the native title attribute). Shows on hover and keyboard focus. */
export function Tooltip({ label, children, side = "top", className }: { label: string; children: React.ReactNode; side?: "top" | "bottom"; className?: string }) {
  return (
    <span className={cn("group/tt relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 w-max max-w-56 -translate-x-1/2 rounded-lg bg-foreground px-2.5 py-1.5 text-center text-xs font-bold normal-case tracking-normal text-background opacity-0 shadow-e2 transition-opacity duration-150 group-hover/tt:opacity-100 group-has-[:focus-visible]/tt:opacity-100",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
        )}
      >
        {label}
      </span>
    </span>
  );
}
