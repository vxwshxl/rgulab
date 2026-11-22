"use client";

import { ChevronDown, Eye, EyeOff, Shuffle } from "lucide-react";
import { useMemo, useState } from "react";
import { ButtonLink } from "./ui/button";
import { getLab, type LabId } from "@/data/labs";
import { cn, shuffle } from "@/lib/utils";

export function VivaBank({ lab }: { lab: LabId }) {
  const L = getLab(lab)!;
  const topics = useMemo(() => ["All", ...new Set(L.viva.map((v) => v.topic))], [L]);
  const [topic, setTopic] = useState("All");
  const [reveal, setReveal] = useState(false);
  const [order, setOrder] = useState<number[] | null>(null);
  const [open, setOpen] = useState<Set<number>>(new Set());

  const items = useMemo(() => {
    const idx = L.viva.map((_, i) => i).filter((i) => topic === "All" || L.viva[i]!.topic === topic);
    return order ? order.filter((i) => idx.includes(i)) : idx;
  }, [L, topic, order]);

  const programQs = L.programs.reduce((n, p) => n + p.mcq.length, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
      <p className="text-xs font-extrabold uppercase tracking-widest text-secondary-fg">{L.subject}</p>
      <h1 className="text-3xl font-extrabold">Viva prep</h1>
      <p className="mt-2 text-secondary-fg">
        {L.viva.length} subject questions at UG 3rd-year level, plus {programQs} program-specific ones on each program page. Say the answer out loud before you reveal it.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <ButtonLink href={`/${lab}/lesson/viva`} size="lg">
          Viva quiz (10 questions)
        </ButtonLink>
        <ButtonLink href={`/${lab}/lesson/review`} variant="secondary" size="lg">
          Program questions review
        </ButtonLink>
      </div>

      <div className="sticky top-[108px] z-10 -mx-4 mt-8 flex flex-wrap items-center gap-2 bg-background/95 px-4 py-3 backdrop-blur lg:top-0">
        <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto" role="tablist" aria-label="Topics">
          {topics.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={topic === t}
              onClick={() => setTopic(t)}
              className={cn("h-9 shrink-0 rounded-full border-2 border-border px-3 text-xs font-extrabold", topic === t && "border-(--ds-accent) bg-accent-subtle text-primary")}
            >
              {t}
            </button>
          ))}
        </div>
        <button onClick={() => setOrder(shuffle(L.viva.map((_, i) => i)))} className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-secondary-fg hover:bg-muted">
          <Shuffle className="size-4" /> Shuffle
        </button>
        <button onClick={() => setReveal((r) => !r)} aria-pressed={reveal} className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-secondary-fg hover:bg-muted">
          {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />} {reveal ? "Hide all" : "Show all"}
        </button>
      </div>

      <ol className="mt-2 flex flex-col gap-3">
        {items.map((i, n) => {
          const v = L.viva[i]!;
          const isOpen = reveal || open.has(i);
          return (
            <li key={i} className="card overflow-hidden">
              <button
                onClick={() =>
                  setOpen((s) => {
                    const c = new Set(s);
                    if (c.has(i)) c.delete(i);
                    else c.add(i);
                    return c;
                  })
                }
                aria-expanded={isOpen}
                className="flex w-full items-start gap-3 p-4 text-left"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-subtle text-xs font-extrabold text-primary">{n + 1}</span>
                <span className="flex-1">
                  <span className="block font-bold leading-snug">{v.q}</span>
                  <span className="text-xs font-bold text-secondary-fg">{v.topic}</span>
                </span>
                <ChevronDown className={cn("mt-1 size-5 shrink-0 text-secondary-fg transition-transform", isOpen && "rotate-180")} />
              </button>
              {isOpen && <p className="animate-rise border-t-2 border-border bg-subtle px-4 py-3 pl-14 text-[15px] leading-relaxed">{v.a}</p>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
