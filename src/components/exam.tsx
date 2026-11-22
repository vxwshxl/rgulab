"use client";

import { Check, Clock, Dices, Eye, Flag, History, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CodeBlock, OutputBlock } from "./code-block";
import { Mascot } from "./mascot";
import { NativeSimulator } from "./native-sim";
import { useMounted } from "./shell";
import { Simulator, type RunSummary } from "./simulator";
import { Button } from "./ui/button";
import { getLab, type LabId, type Program } from "@/data/labs";
import { diffCode, outputsMatch } from "@/lib/diff";
import { playSound } from "@/lib/sound";
import { useProgress } from "@/lib/store";
import { cn, formatClock, pick } from "@/lib/utils";

type Phase = "setup" | "drawing" | "writing" | "review";

function starter(p: Program) {
  if (p.lang === "python") return `# Q${p.id}. ${p.aim}\n\n`;
  if (p.lang === "bash") return `# Q${p.id}. ${p.aim}\n\n#!/bin/bash\n\n`;
  return `// Q${p.id}. ${p.aim}\n\n#include <stdio.h>\n\nint main() {\n    \n    return 0;\n}\n`;
}

function setupLines(p: Program) {
  const re = p.lang === "python" ? /^\s*(from|import)\s.*$/gm : p.lang === "c" ? /^\s*#\s*(include|define).*$/gm : /^\s*read\s.*$/gm;
  return [...p.code.matchAll(re)].map((m) => m[0].trim());
}

export function Exam({ lab, preset }: { lab: LabId; preset?: string }) {
  const L = getLab(lab)!;
  const [pool, setPool] = useState<"record" | "all">("record");
  const [minutes, setMinutes] = useState(30);
  const [phase, setPhase] = useState<Phase>("setup");
  const [program, setProgram] = useState<Program | null>(preset ? (L.byId.get(preset) ?? null) : null);
  const [rolling, setRolling] = useState("??");
  const [code, setCode] = useState("");
  const [lastRun, setLastRun] = useState<RunSummary | null>(null);
  const [hints, setHints] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [endedAt, setEndedAt] = useState(0);
  const logExam = useProgress((s) => s.logExam);
  const exams = useProgress((s) => s.exams);
  const mounted = useMounted();
  const graded = useRef(false);

  const candidates = useMemo(() => L.programs.filter((p) => pool === "all" || p.record), [L, pool]);

  useEffect(() => {
    if (phase !== "writing") return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [phase]);

  const begin = (p: Program) => {
    setProgram(p);
    setCode(starter(p));
    setLastRun(null);
    setHints(0);
    setShowHint(false);
    graded.current = false;
    setStartedAt(Date.now());
    setNow(Date.now());
    setPhase("writing");
  };

  const draw = () => {
    setPhase("drawing");
    const finalP = pick(candidates)!;
    let n = 0;
    const iv = setInterval(() => {
      setRolling(pick(candidates)!.id);
      playSound("tap");
      if (++n > 16) {
        clearInterval(iv);
        setRolling(finalP.id);
        setTimeout(() => begin(finalP), 450);
      }
    }, 70);
  };

  const submit = () => {
    setEndedAt(Date.now());
    setPhase("review");
  };

  const result = useMemo(() => (program && phase === "review" ? diffCode(code, program.code, program.lang) : null), [program, phase, code]);
  const expected = program?.samples[0]?.output ?? "";
  const outputOk = lastRun && expected ? outputsMatch(lastRun.text, expected) : null;

  const grade = (verdict: "pass" | "retry") => {
    if (!program || graded.current) return;
    graded.current = true;
    logExam({ id: program.key, at: Date.now(), ms: endedAt - startedAt, similarity: result?.similarity ?? 0, verdict, hints });
    playSound(verdict === "pass" ? "complete" : "tap");
    setPhase("setup");
    setProgram(null);
  };

  const left = minutes ? minutes * 60_000 - (now - startedAt) : null;
  const history = mounted ? exams.filter((e) => e.id.startsWith(`${lab}:`)).slice(0, 8) : [];

  if (phase === "setup" || phase === "drawing") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="card flex flex-col items-center gap-5 p-8 text-center">
          <Mascot mood={phase === "drawing" ? "think" : "happy"} className={cn("size-28", phase === "drawing" && "animate-float")} />
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-secondary-fg">{L.name} · mock exam</p>
            <h1 className="mt-1 text-3xl font-extrabold">{program && phase === "setup" ? `Program ${program.id}` : "Draw your question"}</h1>
            <p className="mt-2 text-secondary-fg">
              {program && phase === "setup" ? program.aim : "Like the real lab: you get a random program and write it from memory, with no notes. Run it, then compare with the answer."}
            </p>
          </div>

          {phase === "drawing" ? (
            <div className="grid size-32 place-items-center rounded-3xl bg-primary font-mono text-5xl font-extrabold text-primary-foreground shadow-e3" aria-live="polite">
              {rolling}
            </div>
          ) : (
            <>
              {!program && (
                <fieldset className="grid w-full gap-2 sm:grid-cols-2">
                  <legend className="sr-only">Question pool</legend>
                  {(
                    [
                      ["record", `Record programs (${L.recordCount})`],
                      ["all", `All programs (${L.programs.length})`],
                    ] as const
                  ).map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setPool(v)}
                      aria-pressed={pool === v}
                      className={cn("h-12 rounded-xl border-2 border-border text-sm font-bold", pool === v && "border-(--ds-accent) bg-accent-subtle text-primary")}
                    >
                      {label}
                    </button>
                  ))}
                </fieldset>
              )}
              <label className="flex items-center gap-3 text-sm font-bold">
                <Clock className="size-4 text-secondary-fg" /> Time limit
                <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="h-11 rounded-xl border-2 border-border bg-elevated px-3 font-bold">
                  {[15, 20, 30, 45, 60, 0].map((m) => (
                    <option key={m} value={m}>
                      {m ? `${m} min` : "No limit"}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                {program ? (
                  <>
                    <Button size="lg" onClick={() => begin(program)}>
                      <Flag className="size-5" /> Start
                    </Button>
                    <Button size="lg" variant="secondary" onClick={() => setProgram(null)}>
                      <Dices className="size-5" /> Random instead
                    </Button>
                  </>
                ) : (
                  <Button size="lg" onClick={draw}>
                    <Dices className="size-5" /> Draw my question
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        {history.length > 0 && (
          <section className="mt-8" aria-labelledby="history">
            <h2 id="history" className="mb-3 flex items-center gap-2 text-lg font-extrabold">
              <History className="size-5" /> Recent attempts
            </h2>
            <ul className="card divide-y-2 divide-border">
              {history.map((h) => {
                const p = L.byId.get(h.id.split(":")[1] ?? "");
                return (
                  <li key={h.at} className="flex items-center gap-3 px-4 py-3 text-sm">
                    <span className={cn("grid size-8 place-items-center rounded-full", h.verdict === "pass" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger")}>
                      {h.verdict === "pass" ? <Check className="size-4" /> : <RotateCcw className="size-4" />}
                    </span>
                    <Link href={`/${lab}/program/${p?.id}`} className="min-w-0 flex-1 truncate font-bold hover:underline">
                      {p?.id} · {p?.title}
                    </Link>
                    <span className="tabular-nums text-secondary-fg">{h.similarity}% match</span>
                    <span className="tabular-nums text-secondary-fg">{formatClock(h.ms)}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    );
  }

  if (!program) return null;

  return (
    <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:py-6">
      <div className="card flex flex-wrap items-center gap-4 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-widest text-primary">
            {L.short} · Q{program.id} {phase === "review" && "· Review"}
          </p>
          <p className="mt-0.5 font-bold leading-snug">{program.aim}</p>
          {program.lang === "python" && <p className="mt-1 text-xs text-secondary-fg">If a dataset like iris/titanic is provided use it, otherwise create a small DataFrame yourself.</p>}
          {program.lang !== "python" && program.samples[0]?.stdin && (
            <p className="mt-1 text-xs text-secondary-fg">
              Test input: <code className="font-mono">{program.samples[0].stdin.split("\n").join(" ⏎ ")}</code>
            </p>
          )}
        </div>
        {phase === "writing" ? (
          <>
            <span
              className={cn("flex items-center gap-2 rounded-xl px-3 py-2 font-mono text-lg font-bold tabular-nums", left !== null && left < 5 * 60_000 ? "bg-danger-subtle text-danger" : "bg-muted")}
              aria-live="off"
            >
              <Clock className="size-5" />
              {left === null ? formatClock(now - startedAt) : left > 0 ? formatClock(left) : "Time's up"}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (!showHint) setHints((h) => h + 1);
                setShowHint((s) => !s);
              }}
            >
              <Eye className="size-4" /> {showHint ? "Hide hint" : "Hint"}
            </Button>
            <Button size="sm" onClick={submit}>
              <Flag className="size-4" /> Submit
            </Button>
          </>
        ) : (
          <span className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 font-mono font-bold">
            <Clock className="size-4" /> {formatClock(endedAt - startedAt)}
          </span>
        )}
      </div>

      {phase === "writing" && showHint && (
        <div className="animate-pop rounded-2xl border-2 border-(--ds-warning) bg-[color-mix(in_srgb,var(--ds-warning)_10%,transparent)] p-4 text-sm">
          <p className="mb-2 font-extrabold">Hint: the recipe</p>
          <ol className="list-decimal space-y-1 pl-5 font-mono text-[13px]">
            {program.steps.slice(0, 6).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          {setupLines(program).length > 0 && <pre className="mt-3 whitespace-pre-wrap font-mono text-[12.5px] text-secondary-fg">{setupLines(program).join("\n")}</pre>}
        </div>
      )}

      {phase === "writing" ? (
        program.lang === "python" ? (
          <Simulator initialCode={starter(program)} fileName={`q${program.id}.py`} onRun={setLastRun} onCodeChange={setCode} className="lg:h-[calc(100dvh-210px)]" placeholder="Write the program from memory…" />
        ) : (
          <NativeSimulator
            lab={L}
            program={program}
            initialCode={starter(program)}
            fileName={program.fileName}
            onRun={setLastRun}
            onCodeChange={setCode}
            placeholder="Write the program from memory…"
          />
        )
      ) : (
        result && (
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <section className="card flex flex-col gap-4 p-5" aria-label="Score">
              <div className="flex items-center gap-4">
                <div
                  className="grid size-24 shrink-0 place-items-center rounded-full font-extrabold"
                  style={{ background: `conic-gradient(var(--ds-accent) ${result.similarity * 3.6}deg, var(--ds-bg-muted) 0)` }}
                >
                  <span className="grid size-18 place-items-center rounded-full bg-elevated text-2xl">{result.similarity}%</span>
                </div>
                <div>
                  <p className="text-lg font-extrabold">Code match</p>
                  <p className="text-sm text-secondary-fg">Lines that match the reference, ignoring spaces and comments. Different but correct code is fine too.</p>
                  {outputOk !== null && (
                    <p className={cn("mt-2 text-sm font-extrabold", outputOk ? "text-success" : "text-danger")}>
                      {outputOk ? "✓ Your last run printed the expected output" : "✗ Your last run's output differs from the expected output"}
                    </p>
                  )}
                  {!lastRun && <p className="mt-2 text-sm font-bold text-secondary-fg">You didn&apos;t run it. In the real exam, always run once.</p>}
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border-2 border-border">
                <p className="flex gap-4 border-b-2 border-border bg-muted px-3 py-1.5 text-xs font-extrabold">
                  <span className="text-success">■ both</span>
                  <span className="text-danger">■ only yours</span>
                  <span className="text-(--ds-hue-blue)">■ missing (reference)</span>
                </p>
                <pre className="max-h-[480px] overflow-auto p-3 font-mono text-[12.5px] leading-5">
                  {result.lines.map((l, i) => (
                    <div
                      key={i}
                      className={cn(
                        "px-2",
                        l.kind === "same" && "text-success",
                        l.kind === "mine" && "bg-danger-subtle text-danger line-through decoration-1",
                        l.kind === "ref" && "bg-[color-mix(in_srgb,var(--ds-hue-blue)_12%,transparent)] text-(--ds-hue-blue)",
                      )}
                    >
                      {l.kind === "same" ? "  " : l.kind === "mine" ? "- " : "+ "}
                      {l.text}
                    </div>
                  ))}
                </pre>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="flex-1" onClick={() => grade("pass")}>
                  <Check className="size-5" /> I nailed it
                </Button>
                <Button size="lg" variant="secondary" className="flex-1" onClick={() => grade("retry")}>
                  <X className="size-5" /> Needs practice
                </Button>
              </div>
            </section>
            <section className="flex flex-col gap-4" aria-label="Reference answer">
              <div>
                <h2 className="mb-2 text-lg font-extrabold">Reference answer</h2>
                <CodeBlock code={program.code} numbers lang={program.lang} />
              </div>
              <div>
                <h2 className="mb-2 text-lg font-extrabold">Expected output</h2>
                <OutputBlock text={expected} />
              </div>
              {lastRun && (
                <div>
                  <h2 className="mb-2 text-lg font-extrabold">Your last output</h2>
                  <OutputBlock text={lastRun.text} />
                </div>
              )}
            </section>
          </div>
        )
      )}
    </div>
  );
}
