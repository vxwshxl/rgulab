import { Mascot } from "./mascot";
import { cn } from "@/lib/utils";

/** rguLAB wordmark: "rgu" quiet, "LAB" loud. */
export function Logo({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <Mascot className={compact ? "size-8" : "size-10"} />
      <span className={cn("font-extrabold tracking-tight", compact ? "text-lg" : "text-2xl")}>
        <span className="text-secondary-fg">rgu</span>
        <span className="text-primary">LAB</span>
      </span>
    </span>
  );
}
