"use client";

import {
  Check,
  Copy,
  Download,
  FileSpreadsheet,
  ImageIcon,
  Keyboard,
  Loader2,
  Play,
  RotateCcw,
  Square,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CodeEditor, type EditorHandle } from "./code-editor";
import { Button } from "./ui/button";
import { bootPython, downloadFile, restartPython, runPython, uploadFiles, usePy, type PyEvent } from "@/lib/python";
import { cn } from "@/lib/utils";
import { Tooltip } from "./ui/tooltip";

type RunLog = { n: number; chunks: PyEvent[]; ok?: boolean; ms?: number };

export type RunSummary = { ok: boolean; text: string; images: number };

type Props = {
  initialCode: string;
  storageKey?: string;
  /** Restore the saved draft on mount (default true when storageKey is set). */
  restoreDraft?: boolean;
  fileName?: string;
  onRun?: (r: RunSummary) => void;
  toolbarExtra?: React.ReactNode;
  className?: string;
  placeholder?: string;
  /** Called whenever the code changes (exam mode reads it). */
  onCodeChange?: (code: string) => void;
};

function StatusPill() {
  const { status, message } = usePy();
  const map = {
    idle: { dot: "bg-locked-fg", text: "Python sleeping" },
    booting: { dot: "", text: message || "Starting Python…" },
    ready: { dot: "bg-success", text: "Python 3.14 ready" },
    running: { dot: "", text: message && message !== "Python is ready" ? message : "Running…" },
    error: { dot: "bg-danger", text: message || "Python error" },
  } as const;
  const s = map[status];
  return (
    <span className="flex min-w-0 items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-secondary-fg" aria-live="polite">
      {s.dot ? <span className={cn("size-2 shrink-0 rounded-full", s.dot)} /> : <Loader2 className="size-3.5 shrink-0 animate-spin" />}
      <span className="truncate">{s.text}</span>
    </span>
  );
}

export function Simulator({ initialCode, storageKey, restoreDraft = true, fileName = "program.py", onRun, toolbarExtra, className, placeholder, onCodeChange }: Props) {
  const [code, setCode] = useState(() => {
    if (typeof window === "undefined" || !storageKey || !restoreDraft) return initialCode;
    try {
      return localStorage.getItem(storageKey) ?? initialCode;
    } catch {
      return initialCode;
    }
  });
  const [stdin, setStdin] = useState("");
  const [showStdin, setShowStdin] = useState(false);
  const [logs, setLogs] = useState<RunLog[]>([]);
  const [tab, setTab] = useState<"plots" | "files">("plots");
  const [copied, setCopied] = useState(false);
  const { status, files } = usePy();
  const editor = useRef<EditorHandle>(null);
  const consoleEnd = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const busy = status === "running" || (status === "booting" && logs.some((l) => l.ok === undefined));

  // Restore a saved draft (playground only), then warm Python up in the background.
  // Warm Python up in the background as soon as an editor is on screen.
  useEffect(() => {
    bootPython();
  }, []);

  // Keep the editor in sync when the parent swaps the program (not on first mount,
  // so a restored draft survives).
  const lastInitial = useRef(initialCode);
  useEffect(() => {
    if (lastInitial.current === initialCode) return;
    lastInitial.current = initialCode;
    setCode(initialCode);
  }, [initialCode]);

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
    consoleEnd.current?.scrollIntoView({ block: "end" });
  }, [logs]);

  const run = useCallback(async () => {
    if (usePy.getState().status === "running") return;
    const n = logs.length + 1;
    setLogs((l) => [...l.slice(-19), { n, chunks: [] }]);
    const collected: string[] = [];
    let images = 0;
    const res = await runPython(code, stdin, (ev) => {
      if (ev.type === "stdout" || ev.type === "stderr" || ev.type === "stdin") collected.push(ev.data);
      if (ev.type === "image") {
        images++;
        setTab("plots");
      }
      setLogs((all) => {
        const copy = [...all];
        const last = copy[copy.length - 1];
        if (!last) return all;
        const chunks = [...last.chunks];
        const prev = chunks[chunks.length - 1];
        if (prev && prev.type === ev.type && (ev.type === "stdout" || ev.type === "stderr")) {
          chunks[chunks.length - 1] = { ...prev, data: prev.data + ev.data };
        } else chunks.push(ev);
        copy[copy.length - 1] = { ...last, chunks };
        return copy;
      });
    });
    setLogs((all) => {
      const copy = [...all];
      const last = copy[copy.length - 1];
      if (last) copy[copy.length - 1] = { ...last, ok: res.ok, ms: res.ms };
      return copy;
    });
    onRun?.({ ok: res.ok, text: collected.join(""), images });
  }, [code, stdin, logs.length, onRun]);

  const images = useMemo(
    () => logs.flatMap((l) => l.chunks.filter((c) => c.type === "image").map((c, i) => ({ src: c.data, key: `${l.n}-${i}`, n: l.n }))).reverse(),
    [logs],
  );

  const errorLine = (text: string) => {
    const all = [...text.matchAll(new RegExp(`File "${fileName.replace(".", "\\.")}", line (\\d+)`, "g"))];
    const last = all[all.length - 1];
    return last ? Number(last[1]) : null;
  };

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={cn("grid min-h-0 gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]", className)}>
      {/* Editor */}
      <section className="card flex min-h-[420px] flex-col overflow-hidden" aria-label="Editor">
        <div className="flex flex-wrap items-center gap-2 border-b-2 border-border px-3 py-2">
          <span className="rounded-lg bg-muted px-3 py-1.5 font-mono text-xs font-bold">{fileName}</span>
          {toolbarExtra}
          <div className="ml-auto flex items-center gap-2">
            <button onClick={copy} className="flex size-10 items-center justify-center rounded-xl text-secondary-fg hover:bg-muted" aria-label="Copy code">
              {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
            </button>
            {initialCode.trim() && (
              <Tooltip label="Reset code" side="bottom">
              <button
                onClick={() => setCode(initialCode)}
                className="flex size-10 items-center justify-center rounded-xl text-secondary-fg hover:bg-muted"
                aria-label="Reset to the original code"
              >
                <RotateCcw className="size-4" />
              </button>
              </Tooltip>
            )}
            {status === "running" ? (
              <Button variant="danger" size="sm" onClick={restartPython} aria-label="Stop">
                <Square className="size-4" fill="currentColor" /> Stop
              </Button>
            ) : (
              <Tooltip label="F5 or ⌘/Ctrl + Enter" side="bottom">
                <Button size="sm" onClick={run} disabled={busy}>
                  <Play className="size-4" fill="currentColor" /> Run
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <CodeEditor ref={editor} value={code} onChange={setCode} onRun={run} placeholder={placeholder} minHeight="100%" />
        </div>
      </section>

      {/* Right column: plots/files on top, console below, as in Spyder */}
      <div className="flex min-h-0 flex-col gap-3">
        <section className="card flex min-h-[220px] flex-[0.9] flex-col overflow-hidden" aria-label="Plots and files">
          <div className="flex items-center gap-1 border-b-2 border-border px-2 py-1.5" role="tablist">
            {(
              [
                ["plots", `Plots${images.length ? ` (${images.length})` : ""}`, ImageIcon],
                ["files", `Files (${files.length})`, FileSpreadsheet],
              ] as const
            ).map(([k, label, Icon]) => (
              <button
                key={k}
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-extrabold uppercase tracking-wide text-secondary-fg hover:bg-muted",
                  tab === k && "bg-accent-subtle text-primary hover:bg-accent-subtle",
                )}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-3">
            {tab === "plots" ? (
              images.length ? (
                <div className="flex flex-col gap-3">
                  {images.map((img) => (
                    <figure key={img.key} className="overflow-hidden rounded-xl border-2 border-border bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`data:image/png;base64,${img.src}`} alt={`Plot from run ${img.n}`} className="w-full" />
                      <figcaption className="flex items-center justify-between border-t-2 border-border bg-elevated px-3 py-1.5 text-xs font-bold text-secondary-fg">
                        Run {img.n}
                        <a href={`data:image/png;base64,${img.src}`} download={`plot-${img.key}.png`} className="flex items-center gap-1 text-primary">
                          <Download className="size-3.5" /> PNG
                        </a>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <p className="grid h-full place-items-center text-center text-sm text-secondary-fg">
                  Graphs from plt.show() appear here, like Spyder&apos;s Plots pane.
                </p>
              )
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => fileInput.current?.click()}>
                    <Upload className="size-4" /> Upload file
                  </Button>
                  <input
                    ref={fileInput}
                    type="file"
                    multiple
                    hidden
                    onChange={(e) => {
                      if (e.target.files?.length) uploadFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <span className="text-xs text-secondary-fg">Then read it with pd.read_csv(&apos;name.csv&apos;)</span>
                </div>
                {files.length ? (
                  <ul className="divide-y-2 divide-border rounded-xl border-2 border-border">
                    {files.map((f) => (
                      <li key={f} className="flex items-center justify-between px-3 py-2 font-mono text-xs">
                        {f}
                        <button onClick={() => downloadFile(f)} className="flex size-9 items-center justify-center rounded-lg hover:bg-muted" aria-label={`Download ${f}`}>
                          <Download className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-6 text-center text-sm text-secondary-fg">The working folder appears here once Python starts.</p>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="card flex min-h-[260px] flex-1 flex-col overflow-hidden" aria-label="Console">
          <div className="flex items-center gap-2 border-b-2 border-border px-3 py-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wide text-secondary-fg">Console</span>
            <div className="ml-auto flex min-w-0 items-center gap-1">
              <StatusPill />
              <Tooltip label="Input for input()" side="bottom">
              <button
                onClick={() => setShowStdin((s) => !s)}
                className={cn("flex size-9 items-center justify-center rounded-lg text-secondary-fg hover:bg-muted", showStdin && "bg-accent-subtle text-primary")}
                aria-label="Input for input()"
                aria-pressed={showStdin}
              >
                <Keyboard className="size-4" />
              </button>
              </Tooltip>
              <Tooltip label="Clear console" side="bottom">
                <button onClick={() => setLogs([])} className="flex size-9 items-center justify-center rounded-lg text-secondary-fg hover:bg-muted" aria-label="Clear console">
                  <Trash2 className="size-4" />
                </button>
              </Tooltip>
            </div>
          </div>
          {showStdin && (
            <div className="border-b-2 border-border bg-subtle px-3 py-2">
              <label htmlFor="stdin" className="mb-1 flex items-center justify-between text-xs font-bold text-secondary-fg">
                Typed input for input(), one value per line
                <button onClick={() => setShowStdin(false)} aria-label="Close input" className="rounded p-1 hover:bg-muted">
                  <X className="size-3.5" />
                </button>
              </label>
              <textarea
                id="stdin"
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                rows={2}
                placeholder={"5\nAsha"}
                className="w-full resize-y rounded-lg border-2 border-border bg-elevated px-2 py-1 font-mono text-xs"
              />
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-auto bg-subtle px-3 py-2 font-mono text-[12.5px] leading-5" role="log" aria-live="polite">
            {!logs.length && (
              <p className="py-6 text-center font-sans text-sm text-secondary-fg">
                Press <kbd className="rounded border-2 border-border bg-elevated px-1.5 font-mono text-xs">F5</kbd> or{" "}
                <kbd className="rounded border-2 border-border bg-elevated px-1.5 font-mono text-xs">⌘/Ctrl + Enter</kbd> to run.
                {status === "booting" && <span className="mt-1 block">The first start downloads Python (about 30 MB), so give it a few seconds.</span>}
              </p>
            )}
            {logs.map((log) => {
              const errText = log.chunks.filter((c) => c.type === "stderr").map((c) => c.data).join("");
              const line = log.ok === false ? errorLine(errText) : null;
              return (
                <div key={log.n} className="mb-3">
                  <div className="font-bold text-primary">
                    In [{log.n}]: <span className="text-foreground">runfile(&apos;{fileName}&apos;)</span>
                  </div>
                  {log.chunks.map((c, i) =>
                    c.type === "image" ? (
                      <button key={i} onClick={() => setTab("plots")} className="my-1 block" aria-label="Show in plots pane">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`data:image/png;base64,${c.data}`} alt="Plot" className="max-h-40 rounded-lg border-2 border-border bg-white" />
                      </button>
                    ) : c.type === "html" ? (
                      <iframe key={i} srcDoc={c.data} sandbox="allow-scripts" title="Interactive chart" className="my-1 h-[420px] w-full rounded-lg border-2 border-border bg-white" />
                    ) : (
                      <pre
                        key={i}
                        className={cn(
                          "whitespace-pre-wrap break-words",
                          c.type === "stderr" && "text-danger",
                          c.type === "stdin" && "font-bold text-success",
                        )}
                      >
                        {c.data}
                      </pre>
                    ),
                  )}
                  {log.ok === undefined ? (
                    <div className="flex items-center gap-2 text-secondary-fg">
                      <Loader2 className="size-3.5 animate-spin" /> working…
                    </div>
                  ) : (
                    <div className={cn("mt-1 flex flex-wrap items-center gap-2 font-sans text-xs font-bold", log.ok ? "text-success" : "text-danger")}>
                      {log.ok ? "✓ Finished" : "✗ Error"} in {(log.ms! / 1000).toFixed(2)}s
                      {line && (
                        <button onClick={() => editor.current?.goToLine(line)} className="rounded-md bg-danger-subtle px-2 py-0.5 text-danger hover:underline">
                          Go to line {line}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={consoleEnd} />
          </div>
        </section>
      </div>
    </div>
  );
}
