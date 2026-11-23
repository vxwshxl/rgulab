"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Labelled copy-to-clipboard button with a brief "Copied" confirmation. */
export function CopyButton({ text, label = "Copy code", className, primary }: { text: string; label?: string; className?: string; primary?: boolean }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // Clipboard blocked (e.g. insecure context): fall back to a hidden textarea.
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.cssText = "position:fixed;opacity:0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
        }
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className={cn(
        "ledge inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border-2 px-3 text-xs font-extrabold uppercase tracking-wide",
        primary ? "border-transparent bg-primary text-primary-foreground [--ledge:var(--ds-accent-ledge)]" : "border-border bg-elevated text-primary [--ledge:var(--ds-border)]",
        done && "border-success text-success",
        done && primary && "bg-success text-white",
        className,
      )}
      aria-live="polite"
    >
      {done ? <Check className="size-4" strokeWidth={3} /> : <Copy className="size-4" />}
      {done ? "Copied!" : label}
    </button>
  );
}
