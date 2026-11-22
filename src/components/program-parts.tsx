"use client";

import { Crown, Play } from "lucide-react";
import { useState } from "react";
import { NativeSimulator } from "./native-sim";
import { useMounted } from "./shell";
import { Simulator } from "./simulator";
import { Button } from "./ui/button";
import { getLab, getProgram, type LabId } from "@/data/labs";
import { useProgress } from "@/lib/store";

export function CrownLevel({ pkey }: { pkey: string }) {
  const level = useProgress((s) => s.crowns[pkey] ?? 0);
  const mounted = useMounted();
  const l = mounted ? level : 0;
  const label = ["Not started", "Lesson done", "Recalled", "Written from memory"][l];
  return (
    <span className="flex items-center gap-2 text-sm font-bold text-secondary-fg">
      <span className="flex">
        {[1, 2, 3].map((n) => (
          <Crown key={n} className={n <= l ? "size-5 text-gold-ledge dark:text-gold" : "size-5 text-locked-fg opacity-40"} fill="currentColor" aria-hidden />
        ))}
      </span>
      {label}
    </span>
  );
}

/** Lab-appropriate live runner: Spyder-style for Python, a terminal for bash and C. */
export function LabRunner({ lab, id, className }: { lab: LabId; id: string; className?: string }) {
  const L = getLab(lab)!;
  const p = getProgram(lab, id)!;
  if (p.lang === "python") return <Simulator initialCode={p.code} fileName={p.fileName} className={className} />;
  return <NativeSimulator lab={L} program={p} initialCode={p.code} fileName={p.fileName} className={className} />;
}

export function LiveRunner({ lab, id }: { lab: LabId; id: string }) {
  const [on, setOn] = useState(false);
  const L = getLab(lab)!;
  if (!on) {
    return (
      <div className="card flex flex-col items-center gap-3 p-6 text-center">
        <p className="text-base font-extrabold">Run program {id} in your browser</p>
        <p className="max-w-md text-sm text-secondary-fg">
          {L.runtime}. Change the code or the input, run it, break it, and see what happens.
        </p>
        <Button onClick={() => setOn(true)}>
          <Play className="size-4" fill="currentColor" /> Open live editor
        </Button>
      </div>
    );
  }
  return <LabRunner lab={lab} id={id} className="lg:min-h-[640px]" />;
}
