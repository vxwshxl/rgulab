import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LessonClient, LessonLoading } from "@/components/lesson/lesson-client";
import { getLab, getProgram, labs, type LabId } from "@/data/labs";

export function generateStaticParams() {
  return labs.flatMap((l) => [...l.programs.map((p) => ({ lab: l.id, id: p.id })), { lab: l.id, id: "review" }, { lab: l.id, id: "viva" }]);
}

export async function generateMetadata({ params }: PageProps<"/[lab]/lesson/[id]">) {
  const { lab, id } = await params;
  const L = getLab(lab);
  return { title: id === "review" ? `${L?.short} mixed review` : id === "viva" ? `${L?.short} viva quiz` : `${L?.short} lesson ${id}` };
}

export default async function LessonPage({ params }: PageProps<"/[lab]/lesson/[id]">) {
  const { lab, id } = await params;
  const special = id === "review" || id === "viva";
  if (!getLab(lab) || (!special && !getProgram(lab, id))) notFound();
  return (
    <Suspense fallback={<LessonLoading />}>
      <LessonClient lab={lab as LabId} id={id} />
    </Suspense>
  );
}
