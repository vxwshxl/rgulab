import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PlaygroundFromQuery } from "@/components/route-clients";
import { labMeta } from "@/lib/site";
import { getLab, type LabId } from "@/data/labs";

export async function generateMetadata({ params }: PageProps<"/[lab]/simulator">) {
  const { lab } = await params;
  const L = getLab(lab);
  if (!L) return {};
  const title = `${L.short} simulator: ${L.subject}`;
  const description = `Run ${L.subject} lab programs online: ${L.runtime}, in your browser with nothing to install.`;
  return labMeta(lab, title, description, `/${lab}/simulator`);
}

export default async function SimulatorPage({ params }: PageProps<"/[lab]/simulator">) {
  const { lab } = await params;
  if (!getLab(lab)) notFound();
  return (
    <Suspense>
      <PlaygroundFromQuery lab={lab as LabId} />
    </Suspense>
  );
}
