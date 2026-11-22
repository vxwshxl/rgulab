"use client";

import { Check, Copy, Keyboard, Loader2, Play, RotateCcw, Square, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CodeEditor, type EditorHandle } from "./code-editor";
import { ArrayCard, GanttCard, MetricsCard } from "./insight-cards";
import type { RunSummary } from "./simulator";
import { Button } from "./ui/button";
import type { Lab, Program } from "@/data/labs";
import { parseArrays, parseMetrics, parseSchedule } from "@/lib/insights";
import { runNative, stop, useNative, type NativeEvent, type NativeResult } from "@/lib/native";
import { cn } from "@/lib/utils";

type Props = {
  lab: Lab;
  program?: Program;
  initialCode: string;
  fileName: string;
  storageKey?: string;
  restoreDraft?: boolean;
  onRun?: (r: RunSummary) => void;
  onCodeChange?: (code: string) => void;
  toolbarExtra?: React.ReactNode;
  className?: string;
  placeholder?: string;
  initialStdin?: string;
};

type Run = { n: number; chunks: NativeEvent[]; res?: NativeResult; stdin: string; compiled: boolean };

export function NativeSimulator({ lab, program, initialCode, fileName, storageKey, restoreDraft = true, onRun, onCodeChange, toolbarExtra, className, placeholder, initialStdin }: Props) {
  const realLang = (program?.lang ?? (lab.id === "daa" ? "c" : "bash")) as "c" | "bash";
  const [code, setCode] = useState(() => {
    if (typeof window === "undefined" || !storageKey || !restoreDraft) return initialCode;
    try {
      return localStorage.getItem(storageKey) ?? initialCode;
    } catch {
      return initialCode;
    }
  });
  const [stdin, setStdin] = useState(initialStdin ?? program?.samples[0]?.stdin ?? "");
  const [runs, setRuns] = useState<Run[]>([]);
  const [copied, setCopied] = useState(false);
  const { status, message, progress } = useNative();
  const editor = useRef<EditorHandle>(null);
  const termEnd = useRef<HTMLDivElement>(null);
  const busy = status === "busy";

  const lastInitial = useRef(initialCode);
  useEffect(() => {
    if (lastInitial.current === initialCode) return;
    lastInitial.current = initialCode;
    setCode(initialCode);
    setStdin(initialStdin ?? program?.samples[0]?.stdin ?? "");
  }, [initialCode, initialStdin, program]);

  useEffect(() => {
    onCodeChange?.(code);
    if (!storageKey) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, code);
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [code, storageKey, onCodeChange]);

  useEffect(() => {
    termEnd.current?.scrollIntoView({ block: "end" });
  }, [runs]);

  const usesPrebuilt = realLang === "c" && !!program?.wasm && code === program.code;

  const run = useCallback(async () => {
    if (useNative.getState().status === "busy") return;
    const n = runs.length + 1;
    setRuns((r) => [...r.slice(-9), { n, chunks: [], stdin, compiled: realLang === "c" && !usesPrebuilt }]);
    const out: string[] = [];
    const res = await runNative({ lang: realLang, code, stdin, wasmUrl: usesPrebuilt ? program!.wasm : null, fileName }, (ev) => {
      if (ev.type !== "compile") out.push(ev.data);
      setRuns((all) => {
        const copy = [...all];
        const last = copy[copy.length - 1];
        if (!last) return all;
        const chunks = [...last.chunks];
        const prev = chunks[chunks.length - 1];
        if (prev && prev.type === ev.type && ev.type !== "stdin") chunks[chunks.length - 1] = { ...prev, data: prev.data + ev.data };
        else chunks.push(ev);
        copy[copy.length - 1] = { ...last, chunks };
        return copy;
      });
    });
    setRuns((all) => {
      const copy = [...all];
      const last = copy[copy.length - 1];
      if (last) copy[copy.length - 1] = { ...last, res };
      return copy;
    });
    onRun?.({ ok: res.code === 0, text: out.join(""), images: 0 });
  }, [runs.length, stdin, realLang, usesPrebuilt, code, program, fileName, onRun]);

  const last = runs[runs.length - 1];
  const stdout = useMemo(() => (last?.res ? last.chunks.filter((c) => c.type === "stdout").map((c) => c.data).join("") : ""), [last]);
  const schedule = useMemo(() => (stdout ? parseSchedule(stdout) : null), [stdout]);
  const metrics = useMemo(() => (stdout && realLang === "c" && lab.id === "daa" ? parseMetrics(stdout) : null), [stdout, realLang, lab.id]);
  const arrays = useMemo(() => (stdout && lab.id === "daa" ? parseArrays(last!.stdin, stdout) : null), [stdout, lab.id, last]);
  const cmd = realLang === "c" ? `gcc ${fileName} -o prog && ./prog` : `bash ${fileName}`;

  const errorLine = (text: string) => {
    const m = [...text.matchAll(/(?:main\.c|[\w.&-]+\.c):(\d+):\d+: error/g)];
    return m.length ? Number(m[0]![1]) : null;
  };

  return (
    <div className={cn("grid min-h-0 gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]", className)}>
      <section className="card flex min-h-[420px] flex-col overflow-hidden" aria-label="Editor">
        <div className="flex flex-wrap items-center gap-2 border-b-2 border-border px-3 py-2">
          <span className="rounded-lg bg-muted px-3 py-1.5 font-mono text-xs font-bold">{fileName}</span>
          {realLang === "c" && (
            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-extrabold", usesPrebuilt ? "bg-success-subtle text-success" : "bg-accent-subtle text-primary")}>
              {usesPrebuilt ? "precompiled · instant" : "edited · compiles in browser"}
            </span>
          )}
          {toolbarExtra}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="flex size-10 items-center justify-center rounded-xl text-secondary-fg hover:bg-muted"
              aria-label="Copy code"
            >
              {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
            </button>
            {initialCode.trim() && (
              <button onClick={() => setCode(initialCode)} className="flex size-10 items-center justify-center rounded-xl text-secondary-fg hover:bg-muted" aria-label="Reset to the original code" title="Reset code">
                <RotateCcw className="size-4" />
              </button>
            )}
            {busy ? (
              <Button variant="danger" size="sm" onClick={() => stop()}>
                <Square className="size-4" fill="currentColor" /> Stop
              </Button>
            ) : (
              <Button size="sm" onClick={run} title="Run (F5 or ⌘/Ctrl + Enter)">
                <Play className="size-4" fill="currentColor" /> Run
              </Button>
            )}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <CodeEditor ref={editor} value={code} onChange={setCode} onRun={run} placeholder={placeholder} minHeight="100%" language={realLang} />
        </div>
      </section>

      <div className="flex min-h-0 flex-col gap-3">
        <section className="card p-3" aria-label="Keyboard input">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <label htmlFor={`stdin-${fileName}`} className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-secondary-fg">
              <Keyboard className="size-4" /> Keyboard input
            </label>
            <div className="ml-auto flex gap-1">
              {program?.samples.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setStdin(s.stdin)}
                  className={cn("h-8 rounded-lg px-2.5 text-xs font-bold text-secondary-fg hover:bg-muted", stdin === s.stdin && "bg-accent-subtle text-primary")}
                >
                  Sample{program.samples.length > 1 ? ` ${i + 1}` : ""}
                </button>
              ))}
              <button onClick={() => setStdin("")} className="h-8 rounded-lg px-2.5 text-xs font-bold text-secondary-fg hover:bg-muted">
                Clear
              </button>
            </div>
          </div>
          <textarea
            id={`stdin-${fileName}`}
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            rows={Math.min(6, Math.max(2, stdin.split("\n").length))}
            spellCheck={false}
            placeholder="What you would type when the program asks. One line per Enter."
            className="w-full resize-y rounded-lg border-2 border-border bg-elevated px-3 py-2 font-mono text-[13px] leading-5"
          />
          <p className="mt-1 text-xs text-secondary-fg">Typed up front. The terminal shows each line in green at the moment the program reads it.</p>
        </section>

        <section className="flex min-h-[300px] flex-1 flex-col overflow-hidden rounded-2xl border-2 border-border bg-term-bg shadow-e2" aria-label="Terminal">
          <div className="flex items-center gap-2 bg-term-bar px-3 py-2">
            <span className="size-3 rounded-full bg-[#FF5F57]" />
            <span className="size-3 rounded-full bg-[#FEBC2E]" />
            <span className="size-3 rounded-full bg-[#28C840]" />
            <span className="mx-auto font-mono text-xs font-bold text-term-dim">student@rgulab: ~</span>
            {busy && (
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-term-yellow">
                <Loader2 className="size-3 animate-spin" /> {message}
                {progress !== null && ` ${Math.round(progress * 100)}%`}
              </span>
            )}
            <button onClick={() => setRuns([])} className="flex size-8 items-center justify-center rounded-md text-term-dim hover:bg-white/10" aria-label="Clear terminal">
              <Trash2 className="size-3.5" />
            </button>
          </div>
          {busy && progress !== null && (
            <div className="h-1 bg-term-bar">
              <div className="h-full origin-left bg-term-green transition-transform" style={{ transform: `scaleX(${progress})` }} />
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-auto px-4 py-3 font-mono text-[12.5px] leading-5 text-term-fg" role="log" aria-live="polite">
            {!runs.length && (
              <p className="text-term-dim">
                <span className="text-term-green">student@rgulab</span>:<span className="text-term-blue">~</span>$ <span className="animate-pulse">▍</span>
                <span className="mt-2 block font-sans text-xs">Press Run (F5 or ⌘/Ctrl + Enter). The keyboard input above is fed to the program.</span>
              </p>
            )}
            {runs.map((r) => {
              const compileText = r.chunks.filter((c) => c.type === "compile").map((c) => c.data).join("");
              const line = r.res?.compileError ? errorLine(compileText) : null;
              return (
                <div key={r.n} className="mb-4">
                  <div>
                    <span className="text-term-green">student@rgulab</span>:<span className="text-term-blue">~</span>$ {cmd}
                  </div>
                  {r.chunks.map((c, i) => (
                    <span
                      key={i}
                      className={cn(
                        "whitespace-pre-wrap break-words",
                        c.type === "stdin" && "font-bold text-term-green",
                        c.type === "stderr" && "text-term-red",
                        c.type === "compile" && (r.res?.compileError ? "block text-term-red" : "block text-term-yellow"),
                      )}
                      style={{ tabSize: 8 }}
                    >
                      {c.data}
                    </span>
                  ))}
                  {r.res ? (
                    <div className="mt-1 font-sans text-xs font-bold">
                      {r.res.note && <p className="text-term-yellow">{r.res.note}</p>}
                      <p className={r.res.code === 0 ? "text-term-dim" : "text-term-red"}>
                        [exit {r.res.code}] {(r.res.ms / 1000).toFixed(3)}s{r.compiled && !r.res.compileError ? " · compiled in browser" : ""}
                        {line && (
                          <button onClick={() => editor.current?.goToLine(line)} className="ml-2 underline">
                            go to line {line}
                          </button>
                        )}
                      </p>
                    </div>
                  ) : (
                    <span className="animate-pulse">▍</span>
                  )}
                </div>
              );
            })}
            <div ref={termEnd} />
          </div>
        </section>

        {schedule && <GanttCard s={schedule} />}
        {metrics && <MetricsCard m={metrics} expected={program?.complexity} />}
        {arrays && <ArrayCard a={arrays} />}
      </div>
    </div>
  );
}
