"use client";

import { Check, Pause, Play, RotateCcw, Timer } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "./ui/button";
import { schedule } from "@/data/quick-ds";
import { cn } from "@/lib/utils";

/* ---------- tiny localStorage store ---------- */

type State = { done: string[]; startedAt: number | null; banked: number };
const KEY = "rgulab-quick";
const EMPTY: State = { done: [], startedAt: null, banked: 0 };
const listeners = new Set<() => void>();
let cache: State | null = null;

function read(): State {
  if (cache) return cache;
  try {
    cache = { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    cache = EMPTY;
  }
  return cache!;
}
function write(next: State) {
  cache = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
const useQuick = () => useSyncExternalStore(subscribe, read, () => EMPTY);

export function toggleDone(id: string) {
  const s = read();
  write({ ...s, done: s.done.includes(id) ? s.done.filter((d) => d !== id) : [...s.done, id] });
}

/* ---------- UI ---------- */

/** Start/end minute of each section, computed once. */
const SLOTS = schedule.map((x, i) => {
  const from = schedule.slice(0, i).reduce((a, y) => a + y.minutes, 0);
  return { ...x, from, to: from + x.minutes };
});
const TOTAL = SLOTS[SLOTS.length - 1]!.to * 60_000;
const fmt = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

function useNow(running: boolean) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!running) return;
    const tick = () => setNow(Date.now());
    const t = setInterval(tick, 1000);
    const first = setTimeout(tick, 0);
    return () => {
      clearInterval(t);
      clearTimeout(first);
    };
  }, [running]);
  return now;
}

/** Sticky 90-minute timer that tells you which section you should be on. */
export function QuickTimer() {
  const s = useQuick();
  const running = s.startedAt !== null;
  const now = useNow(running);
  const elapsed = s.banked + (running && now ? Math.max(0, now - s.startedAt!) : 0);
  const left = TOTAL - elapsed;

  const current = SLOTS.find((x) => x.to * 60_000 > elapsed) ?? SLOTS[SLOTS.length - 1]!;
  const doneCount = schedule.filter((x) => s.done.includes(x.href)).length;

  return (
    <div className="sticky top-0 z-30 -mx-4 border-b-2 border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className={cn("flex items-center gap-2 font-mono text-2xl font-extrabold tabular-nums", left <= 0 ? "text-danger" : "text-primary")} aria-live="off">
          <Timer className="size-6" />
          {left <= 0 ? "Time's up" : fmt(left)}
        </span>
        <div className="flex gap-2">
          {running ? (
            <Button size="sm" variant="secondary" onClick={() => write({ ...s, startedAt: null, banked: elapsed })}>
              <Pause className="size-4" /> Pause
            </Button>
          ) : (
            <Button size="sm" onClick={() => write({ ...s, startedAt: Date.now() })}>
              <Play className="size-4" fill="currentColor" /> {s.banked ? "Resume" : "Start 90 min"}
            </Button>
          )}
          {(s.banked > 0 || running || s.done.length > 0) && (
            <Button size="sm" variant="ghost" onClick={() => write(EMPTY)} aria-label="Reset timer and ticks">
              <RotateCcw className="size-4" />
            </Button>
          )}
        </div>
        <a href={current.href} className="min-w-0 flex-1 truncate text-sm font-bold text-secondary-fg hover:text-foreground">
          {running || s.banked ? (
            <>
              Now: <span className="text-foreground">{current.label}</span>
            </>
          ) : (
            "Press start and follow the sections in order."
          )}
        </a>
        <span className="text-sm font-extrabold text-secondary-fg">
          {doneCount}/{schedule.length} done
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${(doneCount / schedule.length) * 100}%` }} />
      </div>
    </div>
  );
}

/** The plan as a clickable checklist. */
export function QuickPlan() {
  const s = useQuick();
  return (
    <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {SLOTS.map((x) => {
        const done = s.done.includes(x.href);
        return (
          <li key={x.href} className={cn("card flex items-center gap-3 p-3", done && "border-success bg-success-subtle")}>
            <button
              type="button"
              onClick={() => toggleDone(x.href)}
              aria-pressed={done}
              aria-label={`Mark "${x.label}" ${done ? "not done" : "done"}`}
              className={cn("grid size-8 shrink-0 place-items-center rounded-lg border-2", done ? "border-success bg-success text-white" : "border-border-strong")}
            >
              {done && <Check className="size-5" strokeWidth={3.5} />}
            </button>
            <a href={x.href} className="min-w-0 flex-1">
              <span className="block truncate font-bold">{x.label}</span>
              <span className="text-xs font-bold text-secondary-fg">
                min {x.from}–{x.to} · {x.minutes} min
              </span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/** "Done, next section" button at the end of each section. */
export function DoneButton({ id, next }: { id: string; next?: string }) {
  const s = useQuick();
  const done = s.done.includes(id);
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <Button variant={done ? "secondary" : "primary"} onClick={() => toggleDone(id)}>
        <Check className="size-4" strokeWidth={3} /> {done ? "Done ✓" : "Mark section done"}
      </Button>
      {next && (
        <a href={next} className="text-sm font-extrabold uppercase tracking-wide text-primary hover:underline">
          Next section ↓
        </a>
      )}
    </div>
  );
}
