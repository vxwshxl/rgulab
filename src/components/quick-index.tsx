"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";

export type IndexItem = { id: string; title: string; group: string; text: string };

/** Searchable program index for /quick: number + title rows, Enter jumps to the first match. */
export function QuickIndex({ items, allCode }: { items: IndexItem[]; allCode: string }) {
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const hits = useMemo(
    () =>
      items.filter((it) => {
        const hay = `${it.id} ${Number(it.id)} ${it.title} ${it.group} ${it.text}`.toLowerCase();
        return terms.every((t) => hay.includes(t));
      }),
    [items, terms],
  );

  const go = (id: string) => {
    document.getElementById(`p${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#p${id}`);
  };

  // "/" focuses the search from anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        input.current?.focus();
        input.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <nav id="find" aria-label="Find a program" className="card scroll-mt-4 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-xl border-2 border-border bg-background px-3 focus-within:border-(--ds-accent)">
            <Search className="size-5 shrink-0 text-secondary-fg" />
            <input
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && hits[0]) {
                  e.preventDefault();
                  go(hits[0].id);
                } else if (e.key === "Escape") setQ("");
              }}
              placeholder="Search: 16, kNN, heatmap, ttest, PCA…"
              aria-label="Search programs"
              className="h-full min-w-0 flex-1 bg-transparent text-base font-bold outline-none placeholder:font-medium placeholder:text-secondary-fg"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="grid size-8 place-items-center rounded-lg text-secondary-fg hover:bg-muted">
                <X className="size-4" />
              </button>
            )}
          </label>
          <CopyButton text={allCode} label="Copy all 29" className="h-12" />
        </div>

        <ul className="mt-3 grid max-h-[22rem] grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {hits.map((it, i) => (
            <li key={it.id}>
              <a
                href={`#p${it.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  go(it.id);
                }}
                className={cn("flex min-h-11 items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-accent-subtle", i === 0 && terms.length > 0 && "bg-accent-subtle")}
              >
                <span className="grid h-8 min-w-10 shrink-0 place-items-center rounded-md bg-muted font-mono text-sm font-extrabold text-primary">{it.id}</span>
                <span className="min-w-0 flex-1 truncate font-bold">{it.title}</span>
              </a>
            </li>
          ))}
          {hits.length === 0 && <li className="px-2 py-4 text-sm text-secondary-fg">No program matches “{q}”.</li>}
          {terms.length === 0 && (
            <li>
              <a href="#viva" className="flex min-h-11 items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-accent-subtle">
                <span className="grid h-8 min-w-10 shrink-0 place-items-center rounded-md bg-muted text-sm font-extrabold text-primary">Q&amp;A</span>
                <span className="font-bold">Subject viva</span>
              </a>
            </li>
          )}
        </ul>
      </nav>

      <a
        href="#find"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("find")?.scrollIntoView({ behavior: "smooth", block: "start" });
          setTimeout(() => input.current?.focus({ preventScroll: true }), 350);
        }}
        className="ledge fixed bottom-5 right-5 z-40 flex h-12 items-center gap-2 rounded-2xl bg-primary px-4 text-sm font-extrabold uppercase tracking-wide text-primary-foreground [--ledge:var(--ds-accent-ledge)]"
      >
        <Search className="size-5" /> Find
      </a>
    </>
  );
}
