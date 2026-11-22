"use client";

import { useSearchParams } from "next/navigation";
import { Exam } from "./exam";
import { Playground } from "./playground";
import { makeYourOwn, titanicDrills } from "@/data/labs/cheatsheet-ds";
import { getProgram, type LabId } from "@/data/labs";

export function PlaygroundFromQuery({ lab }: { lab: LabId }) {
  const q = useSearchParams();
  const p = q.get("p");
  const s = q.get("s");
  const program = p ? getProgram(lab, p) : undefined;
  const snippet = lab === "ds" && s ? [...makeYourOwn, ...titanicDrills].find((x) => x.id === s) : undefined;
  const preset = program ? { key: `p:${program.id}`, code: program.code } : snippet ? { key: `s:${snippet.id}`, code: snippet.code } : null;
  return <Playground key={preset?.key ?? "none"} lab={lab} preset={preset} />;
}

export function ExamFromQuery({ lab }: { lab: LabId }) {
  const p = useSearchParams().get("p") ?? undefined;
  return <Exam key={p ?? "random"} lab={lab} preset={p} />;
}
