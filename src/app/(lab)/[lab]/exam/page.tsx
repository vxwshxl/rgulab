import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageLoading } from "@/components/page-loading";
import { ExamFromQuery } from "@/components/route-clients";
import { labMeta } from "@/lib/site";
import { getLab, type LabId } from "@/data/labs";

export async function generateMetadata({ params }: PageProps<"/[lab]/exam">) {
  const { lab } = await params;
  const L = getLab(lab);
  if (!L) return {};
  const title = `${L.short} exam mode: ${L.subject}`;
  const description = `Mock ${L.subject} lab exam: draw a random program, write it from memory against a timer, then diff it with the answer.`;
  return labMeta(lab, title, description, `/${lab}/exam`);
}

export default async function ExamPage({ params }: PageProps<"/[lab]/exam">) {
  const { lab } = await params;
  if (!getLab(lab)) notFound();
  return (
    <Suspense fallback={<PageLoading label="Shuffling exam questions…" />}>
      <ExamFromQuery lab={lab as LabId} />
    </Suspense>
  );
}
