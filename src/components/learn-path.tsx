"use client";

import { BookOpen, Check, Crown, Dumbbell, Lock, Star, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Mascot } from "./mascot";
import { useMounted } from "./shell";
import { ButtonLink } from "./ui/button";
import { getLab, type LabId, type Unit } from "@/data/labs";
import { useProgress } from "@/lib/store";
import { cn, hueVars } from "@/lib/utils";
import { Tooltip } from "./ui/tooltip";

const ZIG = [0, 48, 80, 48, 0, -48, -80, -48];

function Ring({ level }: { level: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" className="pointer-events-none absolute -inset-2.5 size-[calc(100%+20px)] -rotate-90" aria-hidden>
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--ds-border)" strokeWidth="6" />
      {level > 0 && <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke={level >= 3 ? "var(--ds-gold)" : "var(--u)"}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${(c * Math.min(level, 3)) / 3} ${c}`}
      />}
    </svg>
  );
}

function PathNode({ lab, id, idx, isNext, open, onToggle }: { lab: LabId; id: string; idx: number; unit: Unit; isNext: boolean; open: boolean; onToggle: () => void }) {
  const p = getLab(lab)!.byId.get(id)!;
  const mounted = useMounted();
  const level = useProgress((s) => s.crowns[p.key] ?? 0);
  const lvl = mounted ? level : 0;
  const gold = lvl >= 3;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as globalThis.Node)) onToggle();
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onToggle();
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open, onToggle]);

  return (
    // The zig-zag transform makes each node its own stacking context, so raise the open one above its siblings.
    <div ref={ref} className={cn("relative flex flex-col items-center", open ? "z-30" : isNext && "z-10")} style={{ transform: `translateX(${ZIG[idx % ZIG.length]}px)` }}>
      {isNext && !open && (
        <div className="absolute -top-12 z-10 animate-float rounded-xl border-2 border-border bg-elevated px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-(--u) shadow-e1">
          Start
          <span className="absolute -bottom-[7px] left-1/2 size-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-border bg-elevated" />
        </div>
      )}
      <div className="relative">
        <Ring level={lvl} />
        <button
          onClick={onToggle}
          aria-expanded={open}
          aria-label={`Program ${id}: ${p.title}${lvl ? `, level ${lvl} of 3` : ""}`}
          className={cn(
            "ledge relative flex size-[72px] flex-col items-center justify-center rounded-full text-white",
            gold ? "bg-gold text-gold-fg [--ledge:var(--ds-gold-ledge)]" : "bg-(--u)",
          )}
          style={{ boxShadow: "0 6px 0 var(--ledge)" }}
        >
          {gold ? <Crown className="size-7" fill="currentColor" /> : lvl > 0 ? <Check className="size-7" strokeWidth={3.5} /> : <Star className="size-7" fill="currentColor" />}
          <span className="text-[11px] font-extrabold leading-none">{id}</span>
        </button>
        {lvl > 0 && !gold && (
          <span className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full border-2 border-background bg-gold px-1.5 text-[11px] font-extrabold text-gold-fg">
            <Crown className="size-3" fill="currentColor" />
            {lvl}
          </span>
        )}
      </div>
      <p className="mt-3 max-w-36 text-center text-xs font-bold leading-tight text-secondary-fg">{p.title}</p>

      {open && (
        <div className="absolute top-[118px] z-20 w-72 animate-pop rounded-2xl bg-(--u) p-4 text-white shadow-e3" role="dialog" aria-label={p.title}>
          <span className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rotate-45 bg-(--u)" />
          <p className="text-[11px] font-extrabold uppercase tracking-widest opacity-90">
            Program {id} {p.record ? "· Record" : "· Bonus"}
          </p>
          <p className="mt-1 text-lg font-extrabold leading-snug">{p.title}</p>
          <p className="mt-1 text-sm leading-snug opacity-95">{p.aim}</p>
          <div className="mt-3 flex flex-col gap-2">
            <Link
              href={`/${lab}/lesson/${id}`}
              className="ledge flex h-12 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-extrabold uppercase tracking-wide text-(--u) [--ledge:rgb(0_0_0/0.2)]"
            >
              {lvl ? "Practise again" : "Start"} <span className="flex items-center gap-0.5"><Zap className="size-4" fill="currentColor" />+10</span>
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/${lab}/program/${id}`}
                className="flex h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-white/50 text-xs font-extrabold uppercase tracking-wide hover:bg-white/10"
              >
                <BookOpen className="size-4" /> Study
              </Link>
              {lvl >= 1 ? (
                <Link
                  href={`/${lab}/lesson/${id}?mode=recall`}
                  className="flex h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-white/50 text-xs font-extrabold uppercase tracking-wide hover:bg-white/10"
                >
                  <Dumbbell className="size-4" /> Recall
                </Link>
              ) : (
                <Tooltip label="Finish the lesson first" className="w-full">
                  <span tabIndex={0} className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border-2 border-white/25 text-xs font-extrabold uppercase tracking-wide opacity-70">
                    <Lock className="size-4" /> Recall
                  </span>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function LearnPath({ lab: labId }: { lab: LabId }) {
  const lab = getLab(labId)!;
  const units = lab.units;
  const [open, setOpen] = useState<string | null>(null);
  const mounted = useMounted();
  const crowns = useProgress((s) => s.crowns);
  const next = mounted ? lab.order.find((id) => !crowns[`${labId}:${id}`]) : lab.order[0];
  let unitNo = 0;

  return (
    <div className="flex flex-col gap-10 pb-16">
      {units.map((u) => {
        if (!u.bonus) unitNo++;
        return (
          <section key={u.id} style={hueVars(u.hue)} aria-labelledby={`unit-${u.id}`}>
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-(--u) px-5 py-4 text-white" style={{ boxShadow: "0 4px 0 var(--ledge)" }}>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest opacity-90">{u.bonus ? "Bonus" : `Unit ${unitNo}`}</p>
                <h2 id={`unit-${u.id}`} className="text-xl font-extrabold">
                  {u.title}
                </h2>
                <p className="text-sm opacity-95">{u.blurb}</p>
              </div>
              <Link
                href={`/${labId}/program/${u.ids[0]}`}
                className="flex h-11 shrink-0 items-center gap-2 rounded-xl border-2 border-white/40 px-3 text-xs font-extrabold uppercase tracking-wide hover:bg-white/10"
              >
                <BookOpen className="size-5" />
                <span className="hidden sm:inline">Guide</span>
              </Link>
            </div>
            <div className="relative mt-16 flex flex-col items-center gap-9">
              {u.ids.map((id, i) => (
                <PathNode key={id} lab={labId} id={id} idx={i} unit={u} isNext={id === next} open={open === id} onToggle={() => setOpen((o) => (o === id ? null : id))} />
              ))}
              {u.ids.length >= 3 && (
                <Mascot
                  mood={u.bonus ? "think" : "happy"}
                  className={cn("pointer-events-none absolute top-8 hidden size-28 sm:block", unitNo % 2 ? "right-0" : "left-0")}
                />
              )}
            </div>
          </section>
        );
      })}
      <div className="card flex flex-col items-center gap-3 p-6 text-center">
        <Mascot mood="cheer" />
        <p className="text-lg font-extrabold">That&apos;s the whole syllabus</p>
        <p className="text-sm text-secondary-fg">Ready for a mock? Exam mode draws a random program and starts a timer.</p>
        <ButtonLink href={`/${labId}/exam`}>Start a mock exam</ButtonLink>
      </div>
    </div>
  );
}
