"use client";

import { ArrowRight, ChartScatter, Cpu, Crown, SquareTerminal } from "lucide-react";
import Link from "next/link";
import { useMounted } from "./shell";
import { labs } from "@/data/labs";
import { useProgress } from "@/lib/store";

const ICON = { ds: ChartScatter, os: SquareTerminal, daa: Cpu };
const PREVIEW = {
  ds: ["plt.show()", "→ graph in the Plots pane"],
  os: ["$ gcc 15_fcfs.c && ./a.out", "→ Gantt chart card"],
  daa: ["$ ./08_quick", "→ comparisons + array bars"],
};

export function LabCards() {
  const crowns = useProgress((s) => s.crowns);
  const mounted = useMounted();
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {labs.map((l) => {
        const Icon = ICON[l.id];
        const done = mounted ? l.programs.filter((p) => (crowns[p.key] ?? 0) >= 1).length : 0;
        const pct = Math.round((done / l.programs.length) * 100);
        return (
          <Link
            key={l.id}
            href={`/${l.id}`}
            className="group flex flex-col overflow-hidden rounded-3xl border-2 border-border bg-elevated transition-transform duration-200 ease-quick hover:-translate-y-1"
            style={{ boxShadow: `0 6px 0 var(--ds-hue-${l.hue}-ledge)` }}
          >
            <div className="flex flex-col gap-4 p-6 text-white" style={{ background: `var(--ds-hue-${l.hue})` }}>
              <div className="flex items-center justify-between">
                <span className="grid size-14 place-items-center rounded-2xl bg-white/20">
                  <Icon className="size-8" />
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">{l.programs.length} programs</span>
              </div>
              <div>
                <h2 className="text-3xl font-extrabold">{l.name}</h2>
                <p className="text-sm font-bold opacity-95">{l.subject}</p>
              </div>
              <div className="rounded-xl bg-black/25 px-3 py-2 font-mono text-xs leading-5">
                <p>{PREVIEW[l.id][0]}</p>
                <p className="opacity-80">{PREVIEW[l.id][1]}</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-6">
              <p className="text-sm text-secondary-fg">{l.tagline}</p>
              <div className="mt-auto">
                <div className="mb-1.5 flex items-center justify-between text-xs font-extrabold">
                  <span className="flex items-center gap-1 text-gold-ledge dark:text-gold">
                    <Crown className="size-4" fill="currentColor" /> {done}/{l.programs.length} practised
                  </span>
                  <span className="text-secondary-fg">{l.runtime}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div className="h-full origin-left rounded-full" style={{ transform: `scaleX(${pct / 100})`, background: `var(--ds-hue-${l.hue})` }} />
                </div>
              </div>
              <span className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide" style={{ color: `var(--ds-hue-${l.hue})` }}>
                Open {l.short} lab <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
