"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

/** Custom accordion item (replaces native <details>). */
export function Disclosure({ summary, children, className, defaultOpen = false, hint = "Show" }: { summary: React.ReactNode; children: React.ReactNode; className?: string; defaultOpen?: boolean; hint?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={cn("card overflow-hidden", className)}>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} className="flex w-full items-start justify-between gap-3 p-4 text-left font-bold">
        <span className="min-w-0 flex-1">{summary}</span>
        <span className="mt-0.5 flex shrink-0 items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-primary">
          {!open && hint}
          <ChevronDown className={cn("size-4 transition-transform duration-150", open && "rotate-180")} />
        </span>
      </button>
      {open && (
        <div id={id} className="animate-rise px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}
