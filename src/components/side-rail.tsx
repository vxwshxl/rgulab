"use client";

import { Crown, GraduationCap, Target, Terminal } from "lucide-react";
import Link from "next/link";
import { Mascot } from "./mascot";
import { Stats, useMounted } from "./shell";
import { ButtonLink } from "./ui/button";
import { getLab, type LabId } from "@/data/labs";
import { useProgress, useTodayXp } from "@/lib/store";

export function DailyGoal() {
  const xp = useTodayXp();
  const goal = useProgress((s) => s.goal);
  const setGoal = useProgress((s) => s.setGoal);
  const mounted = useMounted();
  const pct = mounted ? Math.min(100, Math.round((xp / goal) * 100)) : 0;
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-extrabold">
          <Target className="size-5 text-streak" /> Daily goal
        </h3>
        <select
          value={goal}
          onChange={(e) => setGoal(Number(e.target.value))}
          aria-label="Daily XP goal"
          className="h-9 rounded-lg border-2 border-border bg-elevated px-2 text-xs font-bold"
        >
          {[30, 50, 100, 200].map((g) => (
            <option key={g} value={g}>
              {g} XP
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Daily goal progress">
          <div className="h-full rounded-full bg-xp transition-transform duration-300" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-sm font-extrabold tabular-nums text-secondary-fg">
          {mounted ? xp : 0}/{goal}
        </span>
      </div>
    </div>
  );
}

export function MasteryCard({ lab }: { lab: LabId }) {
  const L = getLab(lab)!;
  const record = L.programs.filter((p) => p.record);
  const crowns = useProgress((s) => s.crowns);
  const mounted = useMounted();
  const done = mounted ? record.filter((p) => (crowns[p.key] ?? 0) >= 1).length : 0;
  const mastered = mounted ? record.filter((p) => (crowns[p.key] ?? 0) >= 3).length : 0;
  return (
    <div className="card p-5">
      <h3 className="mb-1 flex items-center gap-2 text-base font-extrabold">
        <Crown className="size-5 text-gold-ledge dark:text-gold" fill="currentColor" /> {L.short} record programs
      </h3>
      <p className="mb-3 text-sm text-secondary-fg">
        {done}/{record.length} practised · {mastered} written from memory
      </p>
      <div className="grid grid-cols-10 gap-1" aria-hidden>
        {record.map((p) => {
          const l = mounted ? (crowns[p.key] ?? 0) : 0;
          return (
            <Link
              key={p.id}
              href={`/${lab}/program/${p.id}`}
              title={`${p.id} · ${p.title}`}
              tabIndex={-1}
              className={
                "grid aspect-square place-items-center rounded-md text-[10px] font-extrabold " +
                (l >= 3 ? "bg-gold text-gold-fg" : l >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-secondary-fg")
              }
            >
              {p.id}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function ExamCard({ lab }: { lab: LabId }) {
  const L = getLab(lab)!;
  return (
    <div className="card flex gap-4 p-5">
      <Mascot mood="think" className="size-16 shrink-0" />
      <div>
        <h3 className="flex items-center gap-2 text-base font-extrabold">
          <GraduationCap className="size-5 text-primary" /> {L.short} lab exam
        </h3>
        <p className="mb-3 mt-1 text-sm text-secondary-fg">
          Get a random program, write it from memory, run it, then compare with the answer.
        </p>
        <ButtonLink href={`/${lab}/exam`} size="sm">
          Mock exam
        </ButtonLink>
      </div>
    </div>
  );
}

export function SimulatorCard({ lab }: { lab: LabId }) {
  const L = getLab(lab)!;
  return (
    <Link href={`/${lab}/simulator`} className="card flex items-center gap-4 p-5 hover:bg-muted">
      <span className="grid size-12 place-items-center rounded-xl bg-accent-subtle text-primary">
        <Terminal className="size-6" />
      </span>
      <span>
        <span className="block text-base font-extrabold">{L.short} simulator</span>
        <span className="text-sm text-secondary-fg">{L.runtime}, running in your browser</span>
      </span>
    </Link>
  );
}

export function SideRail({ lab }: { lab: LabId }) {
  return (
    <aside className="flex flex-col gap-4">
      <Stats lab={lab} className="hidden justify-end px-2 py-2 lg:flex" />
      <DailyGoal />
      <ExamCard lab={lab} />
      <MasteryCard lab={lab} />
      <SimulatorCard lab={lab} />
    </aside>
  );
}
