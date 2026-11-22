"use client";

import { BarChart3, Clock, Gauge, HardDrive, Hash } from "lucide-react";
import type { ArrayViz, Metrics, Schedule } from "@/lib/insights";
import { cn } from "@/lib/utils";

const PROC_HUES = ["blue", "purple", "teal", "orange", "pink", "green", "red", "yellow"];

export function GanttCard({ s }: { s: Schedule }) {
  const end = Math.max(...s.rows.map((r) => r.wait + r.burst));
  return (
    <div className="card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-secondary-fg">
        <BarChart3 className="size-4" /> Gantt chart
      </h3>
      <div className="flex h-14 overflow-hidden rounded-xl border-2 border-border" role="img" aria-label={s.rows.map((r) => `${r.name} from ${r.wait} to ${r.wait + r.burst}`).join(", ")}>
        {s.rows.map((r, i) => (
          <div
            key={r.name}
            className="flex min-w-0 flex-col items-center justify-center border-r-2 border-background text-white last:border-r-0"
            style={{ width: `${(r.burst / end) * 100}%`, background: `var(--ds-hue-${PROC_HUES[i % PROC_HUES.length]})` }}
          >
            <span className="truncate text-sm font-extrabold">{r.name}</span>
            {r.priority !== undefined && <span className="text-[10px] font-bold opacity-90">pri {r.priority}</span>}
          </div>
        ))}
      </div>
      <div className="relative mt-1 h-5 font-mono text-[11px] text-secondary-fg">
        {[0, ...s.rows.map((r) => r.wait + r.burst)].map((t, i) => (
          <span key={i} className="absolute -translate-x-1/2" style={{ left: `${(t / end) * 100}%` }}>
            {t}
          </span>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Tile icon={Clock} label="Avg waiting" value={s.avgWait?.toFixed(2) ?? "–"} hue="blue" />
        <Tile icon={Gauge} label="Avg turnaround" value={s.avgTat?.toFixed(2) ?? "–"} hue="purple" />
      </div>
      <p className="mt-2 text-xs text-secondary-fg">WT = sum of the bursts before each process · TAT = WT + BT</p>
    </div>
  );
}

function Tile({ icon: Icon, label, value, hue }: { icon: typeof Clock; label: string; value: string; hue: string }) {
  return (
    <div className="rounded-xl border-2 p-3" style={{ borderColor: `var(--ds-hue-${hue})` }}>
      <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider" style={{ color: `var(--ds-hue-${hue})` }}>
        <Icon className="size-3.5" /> {label}
      </p>
      <p className="mt-1 break-words font-mono text-lg font-bold">{value}</p>
    </div>
  );
}

export function MetricsCard({ m, expected }: { m: Metrics; expected?: { best: string; avg: string; worst: string; paradigm: string } }) {
  return (
    <div className="card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-secondary-fg">
        <Gauge className="size-4" /> Run analysis
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {m.comparisons !== undefined && <Tile icon={Hash} label="Comparisons" value={String(m.comparisons)} hue="orange" />}
        {m.seconds !== undefined && <Tile icon={Clock} label="clock() time" value={`${m.seconds.toFixed(6)} s`} hue="blue" />}
        {m.time && <Tile icon={Gauge} label="Time complexity" value={m.time} hue="purple" />}
        {m.space && <Tile icon={HardDrive} label="Space" value={m.space} hue="teal" />}
      </div>
      {expected && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-muted px-2.5 py-1">{expected.paradigm}</span>
          <span className="rounded-full bg-success-subtle px-2.5 py-1 text-success">best {expected.best}</span>
          <span className="rounded-full bg-accent-subtle px-2.5 py-1 text-primary">avg {expected.avg}</span>
          <span className="rounded-full bg-danger-subtle px-2.5 py-1 text-danger">worst {expected.worst}</span>
        </div>
      )}
    </div>
  );
}

function Bars({ values, highlight, label }: { values: number[]; highlight?: number; label: string }) {
  const max = Math.max(...values.map(Math.abs), 1);
  return (
    <div>
      <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-secondary-fg">{label}</p>
      <div className="flex h-28 items-end gap-1" role="img" aria-label={`${label}: ${values.join(", ")}`}>
        {values.map((v, i) => (
          <div key={i} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
            <span className="font-mono text-[10px] font-bold text-secondary-fg">{v}</span>
            <div
              className={cn("w-full rounded-t-md", i === highlight ? "bg-gold" : "bg-primary")}
              style={{ height: `${Math.max(6, (Math.abs(v) / max) * 80)}px` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArrayCard({ a }: { a: ArrayViz }) {
  return (
    <div className="card flex flex-col gap-4 p-4">
      <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-secondary-fg">
        <BarChart3 className="size-4" /> Array
      </h3>
      <Bars values={a.before} highlight={a.found} label={a.found !== undefined ? `Input · key ${a.key ?? ""} found at index ${a.found}` : "Input"} />
      {a.after && <Bars values={a.after} label="Sorted output" />}
    </div>
  );
}
