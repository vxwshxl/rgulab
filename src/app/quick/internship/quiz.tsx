"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import type { QuizQ } from "./data";
import { cn } from "@/lib/utils";

export function Quiz({ items }: { items: QuizQ[] }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => items.map(() => null));
  const answered = picked.filter((p) => p !== null).length;
  const score = picked.reduce<number>((s, p, i) => s + (p === items[i].correct ? 1 : 0), 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="card flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="font-extrabold">
          Score: <span className="text-primary">{score}</span> / {items.length}
          <span className="ml-2 text-sm font-bold text-secondary-fg">({answered} answered)</span>
        </p>
        <button
          type="button"
          onClick={() => setPicked(items.map(() => null))}
          className="ledge inline-flex items-center gap-1.5 rounded-xl border-2 border-border bg-elevated px-3 py-1.5 text-sm font-extrabold"
        >
          <RotateCcw className="size-4" /> Reset
        </button>
      </div>
      <ol className="flex flex-col gap-3">
        {items.map((q, qi) => {
          const p = picked[qi];
          return (
            <li key={q.q} className="card p-4">
              <p className="font-extrabold leading-snug">
                {qi + 1}. {q.q}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {q.options.map((o, oi) => {
                  const isPicked = p === oi;
                  const isRight = oi === q.correct;
                  const show = p !== null;
                  return (
                    <button
                      key={o}
                      type="button"
                      disabled={show}
                      onClick={() => setPicked((prev) => prev.map((v, i) => (i === qi ? oi : v)))}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-xl border-2 px-3 py-2 text-left text-sm font-bold transition-colors",
                        !show && "border-border hover:border-(--ds-accent)",
                        show && isRight && "border-(--ds-success) bg-success-subtle",
                        show && isPicked && !isRight && "border-(--ds-danger) bg-danger-subtle",
                        show && !isPicked && !isRight && "border-border opacity-60",
                      )}
                    >
                      <span>{o}</span>
                      {show && isRight && <Check className="size-4 shrink-0 text-success" />}
                      {show && isPicked && !isRight && <X className="size-4 shrink-0 text-danger" />}
                    </button>
                  );
                })}
              </div>
              {p !== null && <p className="mt-3 text-sm leading-snug text-secondary-fg">{q.why}</p>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
