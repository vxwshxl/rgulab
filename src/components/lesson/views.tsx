"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { CodeBlock, OutputBlock } from "../code-block";
import { Mascot } from "../mascot";
import type { Program } from "@/data/labs";
import type { Exercise } from "@/lib/exercises";
import { Highlight, type HLang } from "@/lib/highlight";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

export type Answer = string | number[] | null;
type Phase = "answer" | "right" | "wrong";
type ViewProps<K extends Exercise["kind"]> = {
  ex: Extract<Exercise, { kind: K }>;
  answer: Answer;
  setAnswer: (a: Answer) => void;
  phase: Phase;
  lang?: HLang;
};

const SELECTED = "border-(--ds-hue-blue) bg-[color-mix(in_srgb,var(--ds-hue-blue)_10%,var(--ds-bg-elevated))] text-(--ds-hue-blue) [--ledge:var(--ds-hue-blue)]";
const RIGHT = "border-success bg-success-subtle text-success [--ledge:var(--ds-success)]";
const WRONG = "border-danger bg-danger-subtle text-danger [--ledge:var(--ds-danger)]";

function Prompt({ children, mood = "happy" }: { children: React.ReactNode; mood?: "happy" | "think" }) {
  return (
    <div className="mb-6 flex items-end gap-3">
      <Mascot mood={mood} className="hidden size-16 shrink-0 sm:block" />
      <h1 className="text-2xl font-extrabold leading-tight sm:text-[26px]">{children}</h1>
    </div>
  );
}

export function IntroView({ program }: { program: Program }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 flex w-fit items-center gap-1.5 rounded-full bg-accent-subtle px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary">
          <Sparkles className="size-3.5" /> New program · {program.id}
        </p>
        <h1 className="text-3xl font-extrabold leading-tight">{program.title}</h1>
        <p className="mt-2 text-secondary-fg">{program.aim}</p>
      </div>
      <div className="card p-5">
        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-secondary-fg">The recipe</h2>
        <ol className="flex flex-col gap-3">
          {program.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground">{i + 1}</span>
              <span className="pt-0.5 font-mono text-[13px] leading-6">{s}</span>
            </li>
          ))}
        </ol>
      </div>
      {program.complexity && (
        <div className="flex flex-wrap gap-2 text-xs font-extrabold">
          <span className="rounded-full bg-muted px-3 py-1">{program.complexity.paradigm}</span>
          <span className="rounded-full bg-success-subtle px-3 py-1 text-success">best {program.complexity.best}</span>
          <span className="rounded-full bg-accent-subtle px-3 py-1 text-primary">avg {program.complexity.avg}</span>
          <span className="rounded-full bg-danger-subtle px-3 py-1 text-danger">worst {program.complexity.worst}</span>
        </div>
      )}
      <CodeBlock code={program.code} numbers lang={program.lang} />
      {(program.samples[0]?.output || program.images.length > 0) && (
        <details className="card group p-4">
          <summary className="cursor-pointer text-sm font-extrabold uppercase tracking-wider text-secondary-fg">Expected output</summary>
          <div className="mt-3 flex flex-col gap-3">
            {program.samples[0]?.stdin && (
              <p className="text-sm">
                <span className="font-bold">Input typed: </span>
                <code className="font-mono text-[13px]">{program.samples[0].stdin.split("\n").join("  ⏎  ")}</code>
              </p>
            )}
            {program.samples[0]?.output && <OutputBlock text={program.samples[0].output} />}
            {program.images.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt={`Graph from program ${program.id}`} className="rounded-xl border-2 border-border bg-white" />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function CodeWithSlot({ code, slot, lang }: { code: string; slot: React.ReactNode; lang?: HLang }) {
  const [before, after = ""] = code.split("____");
  return (
    <div className="code-surface mb-6 overflow-x-auto p-4 text-sm">
      <pre className="whitespace-pre">
        <Highlight code={before ?? ""} lang={lang} />
        {slot}
        <Highlight code={after} lang={lang} />
      </pre>
    </div>
  );
}

export function McqView({ ex, answer, setAnswer, phase, lang, long }: ViewProps<"mcq"> & { long?: boolean }) {
  const mono = ex.tag === "import";
  return (
    <div>
      <Prompt mood={ex.tag === "concept" ? "think" : "happy"}>{ex.prompt}</Prompt>
      {ex.code && (
        <CodeWithSlot
          lang={lang}
          code={ex.code}
          slot={
            <span className={cn("mx-0.5 inline-block min-w-24 rounded-md border-b-2 border-dashed border-(--ds-hue-blue) px-1 text-center", answer && "border-solid text-(--ds-hue-blue)")}>
              {typeof answer === "string" ? answer : " "}
            </span>
          }
        />
      )}
      <div className="grid gap-3" role="radiogroup" aria-label="Options">
        {ex.options.map((opt, idx) => {
          const sel = answer === opt;
          const state = phase === "answer" ? (sel ? SELECTED : "") : opt === ex.answer ? RIGHT : sel ? WRONG : "opacity-60";
          return (
            <button
              key={opt}
              role="radio"
              aria-checked={sel}
              disabled={phase !== "answer"}
              onClick={() => {
                setAnswer(opt);
                playSound("tap");
              }}
              className={cn(
                "ledge flex min-h-14 items-center gap-3 rounded-2xl border-2 border-border bg-elevated px-4 py-3 text-left text-[15px] font-bold [--ledge:var(--ds-border)] disabled:opacity-100",
                mono && "font-mono text-sm",
                long && "text-sm font-medium leading-snug",
                state,
              )}
            >
              <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg border-2 border-border font-sans text-xs font-extrabold text-secondary-fg", sel && phase === "answer" && "border-current text-current")}>
                {idx + 1}
              </span>
              <span className="min-w-0 break-words">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BlankView({ ex, answer, setAnswer, phase, lang }: ViewProps<"blank">) {
  const input = useRef<HTMLInputElement>(null);
  const typed = ex.bank === null;
  const val = typeof answer === "string" ? answer : "";
  useEffect(() => {
    if (typed) input.current?.focus();
  }, [typed, ex.key]);
  const tone = phase === "right" ? "border-success text-success" : phase === "wrong" ? "border-danger text-danger" : "border-(--ds-hue-blue) text-(--ds-hue-blue)";

  return (
    <div>
      <Prompt>{ex.prompt}</Prompt>
      <div className="code-surface mb-8 overflow-x-auto p-4 text-sm">
        {ex.context.map((l, i) => (
          <pre key={i} className="whitespace-pre opacity-55">
            <Highlight code={l} lang={lang} />
          </pre>
        ))}
        <pre className="whitespace-pre">
          <Highlight code={ex.before} lang={lang} />
          {typed ? (
            <input
              ref={input}
              value={val}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={phase !== "answer"}
              aria-label="Missing word"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className={cn("mx-0.5 rounded-md border-2 bg-elevated px-1.5 py-0.5 font-mono text-sm font-bold outline-none", tone)}
              style={{ width: `${Math.max(ex.answer.length, 6) + 3}ch` }}
            />
          ) : (
            <button
              onClick={() => phase === "answer" && setAnswer(null)}
              aria-label={val ? `Remove ${val}` : "Empty blank"}
              className={cn("mx-0.5 inline-block rounded-md border-b-2 border-dashed px-1 font-bold", val ? cn("border-solid", tone) : "border-(--ds-fg-muted)")}
              style={{ minWidth: `${Math.max(ex.answer.length, 6) + 2}ch` }}
            >
              {val || " "}
            </button>
          )}
          <Highlight code={ex.after} lang={lang} />
        </pre>
      </div>
      {ex.bank && (
        <div className="flex flex-wrap justify-center gap-3" aria-label="Word bank">
          {ex.bank.map((w) => {
            const used = val === w;
            return (
              <button
                key={w}
                disabled={phase !== "answer" || used}
                onClick={() => {
                  setAnswer(w);
                  playSound("tap");
                }}
                className={cn(
                  "ledge h-12 rounded-xl border-2 border-border bg-elevated px-4 font-mono text-sm font-bold [--ledge:var(--ds-border)]",
                  used && "bg-muted text-transparent [box-shadow:none] disabled:opacity-100",
                )}
              >
                {w}
              </button>
            );
          })}
        </div>
      )}
      {typed && phase === "answer" && <p className="text-center text-sm text-secondary-fg">Case matters, just like in Python. Press Enter to check.</p>}
    </div>
  );
}

export function OrderView({ ex, answer, setAnswer, phase, lang }: ViewProps<"order">) {
  const picked = Array.isArray(answer) ? answer : [];
  const remaining = ex.start.map((_, i) => i).filter((i) => !picked.includes(i));
  const chip = "ledge w-full rounded-xl border-2 border-border bg-elevated px-3 py-2 text-left font-mono text-[12.5px] leading-5 [--ledge:var(--ds-border)]";

  return (
    <div>
      <Prompt>{ex.prompt}</Prompt>
      <div
        className={cn(
          "mb-6 flex min-h-40 flex-col gap-2 rounded-2xl border-2 border-dashed p-3",
          phase === "right" ? "border-success bg-success-subtle" : phase === "wrong" ? "border-danger bg-danger-subtle" : "border-border-strong",
        )}
        aria-label="Your order"
      >
        {!picked.length && <p className="m-auto text-sm text-secondary-fg">Tap the lines below in the order they run</p>}
        {picked.map((idx, pos) => (
          <button
            key={idx}
            disabled={phase !== "answer"}
            onClick={() => setAnswer(picked.filter((p) => p !== idx))}
            className={cn(chip, "flex gap-3 disabled:opacity-100")}
          >
            <span className="font-sans text-xs font-extrabold text-secondary-fg">{pos + 1}</span>
            <pre className="min-w-0 overflow-x-auto whitespace-pre">
              <Highlight code={ex.start[idx]!} lang={lang} />
            </pre>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2" aria-label="Lines to place">
        {remaining.map((idx) => (
          <button
            key={idx}
            disabled={phase !== "answer"}
            onClick={() => {
              setAnswer([...picked, idx]);
              playSound("tap");
            }}
            className={chip}
          >
            <pre className="overflow-x-auto whitespace-pre">
              <Highlight code={ex.start[idx]!} lang={lang} />
            </pre>
          </button>
        ))}
      </div>
    </div>
  );
}
