"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Highlight, type HLang } from "@/lib/highlight";
import { cn } from "@/lib/utils";

export function CodeBlock({ code, className, copy = true, numbers = false, lang = "python" }: { code: string; className?: string; copy?: boolean; numbers?: boolean; lang?: HLang }) {
  const [done, setDone] = useState(false);
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <div className={cn("code-surface relative", className)}>
      {copy && (
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setDone(true);
            setTimeout(() => setDone(false), 1500);
          }}
          className="absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-lg border-2 border-border bg-elevated text-secondary-fg hover:text-foreground"
          aria-label="Copy code"
        >
          {done ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
        </button>
      )}
      <pre className="overflow-x-auto p-4 pr-14">
        {numbers ? (
          <code className="grid grid-cols-[auto_1fr] gap-x-4">
            {lines.map((l, i) => (
              <span key={i} className="contents">
                <span className="select-none text-right text-(--ds-fg-muted)">{i + 1}</span>
                <span>
                  <Highlight code={l || " "} lang={lang} />
                </span>
              </span>
            ))}
          </code>
        ) : (
          <code>
            <Highlight code={code.replace(/\n$/, "")} lang={lang} />
          </code>
        )}
      </pre>
    </div>
  );
}

export function OutputBlock({ text, className }: { text: string; className?: string }) {
  return (
    <pre className={cn("code-surface overflow-x-auto whitespace-pre p-4 text-[12.5px] [tab-size:8]", className)}>
      {text || "(no printed output)"}
    </pre>
  );
}
