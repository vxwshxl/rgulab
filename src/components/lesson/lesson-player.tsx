"use client";

import { Check, Clock, Heart, Target, X, Zap } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mascot } from "../mascot";
import { Button, ButtonLink } from "../ui/button";
import { BlankView, IntroView, McqView, OrderView, type Answer } from "./views";
import { getLab, getProgram, type LabId } from "@/data/labs";
import { buildLesson, buildReview, buildVivaQuiz, type Exercise } from "@/lib/exercises";
import { playSound } from "@/lib/sound";
import { STORE_KEY, useProgress } from "@/lib/store";
import { cn, formatClock, shuffle } from "@/lib/utils";

export type Mode = "learn" | "recall" | "review" | "viva";
const HEARTS = 5;

function isCorrect(ex: Exercise, a: Answer): boolean {
  if (ex.kind === "intro") return true;
  if (ex.kind === "mcq") return a === ex.answer;
  if (ex.kind === "blank") return typeof a === "string" && a.trim() === ex.answer;
  if (ex.kind === "order") return Array.isArray(a) && a.length === ex.lines.length && a.every((idx, i) => ex.start[idx] === ex.lines[i]);
  return false;
}

function hasAnswer(ex: Exercise, a: Answer) {
  if (ex.kind === "intro") return true;
  if (ex.kind === "order") return Array.isArray(a) && a.length === ex.lines.length;
  return typeof a === "string" && a.trim().length > 0;
}

function storedCrowns(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}")?.state?.crowns ?? {};
  } catch {
    return {};
  }
}

function buildQueue(lab: LabId, programId: string, mode: Mode): Exercise[] {
  const L = getLab(lab)!;
  if (mode === "viva") return buildVivaQuiz(L, 10);
  if (mode === "review") {
    const crowns = storedCrowns();
    const pool = L.programs.filter((p) => p.record);
    const weakest = shuffle(pool).sort((a, b) => (crowns[a.key] ?? 0) - (crowns[b.key] ?? 0));
    return buildReview(weakest.slice(0, 6));
  }
  return buildLesson(getProgram(lab, programId)!, mode);
}

export function LessonPlayer({ lab, programId, mode }: { lab: LabId; programId: string; mode: Mode }) {
  const program = getProgram(lab, programId);
  const special = mode === "review" || mode === "viva";
  // This component only renders on the client (see lesson-client.tsx), so random queues are safe here.
  const [queue, setQueue] = useState<Exercise[] | null>(() => buildQueue(lab, programId, mode));
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<Answer>(null);
  const [phase, setPhase] = useState<"answer" | "right" | "wrong">("answer");
  const [hearts, setHearts] = useState(HEARTS);
  const [stats, setStats] = useState({ scored: 0, firstTry: 0, mistakes: 0 });
  const [done, setDone] = useState<null | "win" | "lose">(null);
  const [elapsed, setElapsed] = useState(0);
  const retried = useRef(new Set<string>());
  const [t0, setT0] = useState(() => Date.now());
  const finishLesson = useProgress((s) => s.finishLesson);
  const earnXp = useProgress((s) => s.earnXp);
  const rewarded = useRef(false);

  const start = useCallback(() => {
    setQueue(buildQueue(lab, programId, mode));
    setI(0);
    setAnswer(null);
    setPhase("answer");
    setHearts(HEARTS);
    setStats({ scored: 0, firstTry: 0, mistakes: 0 });
    setDone(null);
    retried.current = new Set();
    rewarded.current = false;
    setT0(Date.now());
  }, [lab, programId, mode]);

  const ex = queue?.[i];
  const xpEarned = (mode === "recall" ? 15 : 10) + (stats.mistakes === 0 ? 5 : 0);

  const check = useCallback(() => {
    if (!ex || phase !== "answer") return;
    if (ex.kind === "intro") {
      setI((n) => n + 1);
      return;
    }
    if (!hasAnswer(ex, answer)) return;
    const ok = isCorrect(ex, answer);
    const isRetry = ex.key.endsWith("#retry");
    playSound(ok ? "correct" : "wrong");
    setPhase(ok ? "right" : "wrong");
    setStats((s) => ({
      scored: s.scored + (isRetry ? 0 : 1),
      firstTry: s.firstTry + (ok && !isRetry ? 1 : 0),
      mistakes: s.mistakes + (ok ? 0 : 1),
    }));
    if (!ok) {
      setHearts((h) => h - 1);
      if (!retried.current.has(ex.key) && !isRetry) {
        retried.current.add(ex.key);
        setQueue((q) => (q ? [...q, { ...ex, key: `${ex.key}#retry` }] : q));
      }
    }
  }, [ex, phase, answer]);

  const skip = useCallback(() => {
    if (!ex || ex.kind === "intro" || phase !== "answer") return;
    playSound("wrong");
    setPhase("wrong");
    setStats((s) => ({ ...s, scored: s.scored + 1, mistakes: s.mistakes + 1 }));
    setHearts((h) => h - 1);
    if (!retried.current.has(ex.key) && !ex.key.endsWith("#retry")) {
      retried.current.add(ex.key);
      setQueue((q) => (q ? [...q, { ...ex, key: `${ex.key}#retry` }] : q));
    }
  }, [ex, phase]);

  const next = useCallback(() => {
    if (!queue) return;
    if (hearts <= 0) {
      setDone("lose");
      return;
    }
    if (i + 1 >= queue.length) {
      setElapsed(Date.now() - t0);
      setDone("win");
      return;
    }
    setI((n) => n + 1);
    setAnswer(null);
    setPhase("answer");
  }, [queue, i, hearts, t0]);

  // Reward once on a win.
  useEffect(() => {
    if (done !== "win" || rewarded.current) return;
    rewarded.current = true;
    if (special || !program) earnXp(xpEarned);
    else finishLesson(program.key, { xp: xpEarned, level: mode === "learn" ? 1 : 2 });
    playSound("complete");
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      import("canvas-confetti").then(({ default: confetti }) => {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      });
    }
  }, [done, mode, special, program, xpEarned, earnXp, finishLesson]);

  // Keyboard: Enter checks / continues, 1–4 picks an option.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done) return;
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (phase === "answer") check();
        else next();
      } else if (ex?.kind === "mcq" && phase === "answer" && /^[1-9]$/.test(e.key) && !(e.target instanceof HTMLInputElement)) {
        const opt = ex.options[Number(e.key) - 1];
        if (opt) {
          setAnswer(opt);
          playSound("tap");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, check, next, ex, done]);

  const reviewProgram = useMemo(() => {
    if (mode !== "review" || !ex) return null;
    return getProgram(lab, ex.key.split("-")[1] ?? "");
  }, [mode, ex, lab]);

  if (!queue) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Mascot mood="think" className="animate-float" />
      </div>
    );
  }

  if (done === "lose") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <Mascot mood="sad" className="size-32" />
        <h1 className="text-2xl font-extrabold">Out of hearts</h1>
        <p className="text-secondary-fg">Mistakes are how it sticks. Look at the code once more, then go again.</p>
        <div className="mt-2 flex w-full flex-col gap-3">
          <Button size="lg" onClick={start}>
            Try again
          </Button>
          {program && (
            <ButtonLink href={`/${lab}/program/${program.id}`} variant="secondary" size="lg">
              Study program {program.id}
            </ButtonLink>
          )}
        </div>
      </div>
    );
  }

  if (done === "win") {
    const acc = stats.scored ? Math.round((stats.firstTry / stats.scored) * 100) : 100;
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-6 px-6 text-center">
        <Mascot mood="cheer" className="size-36 animate-pop" />
        <div>
          <h1 className="text-3xl font-extrabold text-xp">{mode === "review" ? "Review complete!" : mode === "viva" ? "Viva round done!" : "Lesson complete!"}</h1>
          {program && !special && <p className="mt-1 text-secondary-fg">Program {program.id} · {program.title}</p>}
        </div>
        <div className="grid w-full grid-cols-3 gap-3">
          {[
            { label: "Total XP", value: `+${xpEarned}`, icon: Zap, color: "var(--ds-xp)" },
            { label: acc === 100 ? "Perfect" : "Accuracy", value: `${acc}%`, icon: Target, color: "var(--ds-hue-green)" },
            { label: "Time", value: formatClock(elapsed), icon: Clock, color: "var(--ds-hue-blue)" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="animate-rise overflow-hidden rounded-2xl border-2" style={{ borderColor: color, background: color }}>
              <p className="py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">{label}</p>
              <p className="flex items-center justify-center gap-1.5 rounded-t-xl bg-elevated py-3 text-xl font-extrabold" style={{ color }}>
                <Icon className="size-5" /> {value}
              </p>
            </div>
          ))}
        </div>
        <div className="flex w-full flex-col gap-3">
          <ButtonLink href={mode === "viva" ? `/${lab}/viva` : `/${lab}`} size="lg">
            Continue
          </ButtonLink>
          {mode === "viva" && (
            <Button variant="secondary" size="lg" onClick={start}>
              Another viva round
            </Button>
          )}
          {program && mode === "learn" && (
            <ButtonLink href={`/${lab}/lesson/${program.id}?mode=recall`} variant="secondary" size="lg">
              Harder: recall mode
            </ButtonLink>
          )}
          {program && (
            <ButtonLink href={`/${lab}/simulator?p=${program.id}`} variant="secondary" size="lg">
              Run it in the simulator
            </ButtonLink>
          )}
        </div>
      </div>
    );
  }

  const hl = (reviewProgram ?? program)?.lang ?? getLab(lab)!.lang;
  const progress = (i + (phase !== "answer" ? 1 : 0)) / queue.length;
  const canCheck = ex ? hasAnswer(ex, answer) : false;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-4xl items-center gap-4 px-4 pt-6 sm:px-6">
        <Link href={program ? `/${lab}/program/${program.id}` : mode === "viva" ? `/${lab}/viva` : `/${lab}`} aria-label="Quit lesson" className="flex size-11 items-center justify-center rounded-xl text-secondary-fg hover:bg-muted">
          <X className="size-7" />
        </Link>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Lesson progress">
          <div className="relative h-full origin-left rounded-full bg-primary transition-transform duration-300 ease-soft" style={{ transform: `scaleX(${Math.max(progress, 0.02)})` }}>
            <span className="absolute inset-x-3 top-1 h-1 rounded-full bg-white/30" />
          </div>
        </div>
        <span className={cn("flex items-center gap-1.5 text-lg font-extrabold text-heart", phase === "wrong" && "animate-shake")} aria-label={`${hearts} hearts left`}>
          <Heart className="size-6" fill="currentColor" /> {hearts}
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-48 pt-8 sm:px-6">
        {mode === "recall" && i === 0 && phase === "answer" && (
          <p className="mb-4 w-fit rounded-full bg-accent-subtle px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary">Recall mode · type it, no word bank</p>
        )}
        {reviewProgram && (
          <p className="mb-3 w-fit rounded-full bg-muted px-3 py-1 text-xs font-extrabold text-secondary-fg">
            Program {reviewProgram.id} · {reviewProgram.title}
          </p>
        )}
        {ex && (
          <div key={ex.key} className="animate-rise">
            {ex.kind === "intro" && program && <IntroView program={program} />}
            {ex.kind === "mcq" && <McqView ex={ex} answer={answer} setAnswer={setAnswer} phase={phase} lang={hl} long={mode === "viva"} />}
            {ex.kind === "blank" && <BlankView ex={ex} answer={answer} setAnswer={setAnswer} phase={phase} lang={hl} />}
            {ex.kind === "order" && <OrderView ex={ex} answer={answer} setAnswer={setAnswer} phase={phase} lang={hl} />}
          </div>
        )}
      </main>

      <footer
        className={cn(
          "fixed inset-x-0 bottom-0 z-20 border-t-2 border-border bg-background",
          phase === "right" && "border-transparent bg-success-subtle",
          phase === "wrong" && "border-transparent bg-danger-subtle",
        )}
      >
        <div className="mx-auto flex min-h-32 max-w-4xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          {phase === "answer" ? (
            <>
              {ex?.kind !== "intro" ? (
                <Button variant="secondary" size="lg" onClick={skip} className="hidden sm:inline-flex">
                  Skip
                </Button>
              ) : (
                <span />
              )}
              <Button size="lg" onClick={check} disabled={!canCheck} className="w-full sm:w-44">
                {ex?.kind === "intro" ? "Continue" : "Check"}
              </Button>
            </>
          ) : (
            <>
              <Feedback ex={ex!} ok={phase === "right"} />
              <Button variant={phase === "right" ? "primary" : "danger"} size="lg" onClick={next} className="w-full shrink-0 sm:w-44" autoFocus>
                {phase === "right" ? "Continue" : "Got it"}
              </Button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}

function Feedback({ ex, ok }: { ex: Exercise; ok: boolean }) {
  const [praise] = useState(() => ["Nicely done!", "Great job!", "Correct!", "You got it!", "Spot on!"][Math.floor(Math.random() * 5)]);
  const answerText =
    ex.kind === "mcq" ? ex.answer : ex.kind === "blank" ? `${ex.before.trimStart()}${ex.answer}${ex.after}` : ex.kind === "order" ? ex.lines.join("\n") : "";
  return (
    <div className={cn("flex min-w-0 gap-4", ok ? "text-success" : "text-danger")} role="status">
      <span className={cn("hidden size-14 shrink-0 place-items-center rounded-full bg-elevated sm:grid")}>
        {ok ? <Check className="size-8" strokeWidth={3.5} /> : <X className="size-8" strokeWidth={3.5} />}
      </span>
      <div className="min-w-0">
        <p className="text-xl font-extrabold">{ok ? praise : "Correct answer:"}</p>
        {!ok && (
          <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap break-words font-mono text-sm font-bold">{answerText}</pre>
        )}
        {ex.kind === "mcq" && ex.why && (
          <p className={cn("mt-1 text-sm", ex.tag === "import" && "font-mono")}>{ex.why}</p>
        )}
      </div>
    </div>
  );
}
