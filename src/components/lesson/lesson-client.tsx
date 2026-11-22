"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Mascot } from "../mascot";
import type { Mode } from "./lesson-player";
import type { LabId } from "@/data/labs";

export function LessonLoading() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <Mascot mood="think" className="animate-float" />
    </div>
  );
}

/** Lessons shuffle their exercises, so they render on the client only (no hydration mismatch). */
const LessonPlayer = dynamic(() => import("./lesson-player").then((m) => m.LessonPlayer), { ssr: false, loading: LessonLoading });

export function LessonClient({ lab, id }: { lab: LabId; id: string }) {
  const params = useSearchParams();
  const special = id === "review" || id === "viva";
  const mode: Mode = special ? (id as Mode) : params.get("mode") === "recall" ? "recall" : "learn";
  return <LessonPlayer key={`${lab}-${id}-${mode}`} lab={lab} programId={id} mode={mode} />;
}
