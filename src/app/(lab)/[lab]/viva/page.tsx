import { notFound } from "next/navigation";
import { VivaBank } from "@/components/viva-bank";
import { getLab, type LabId } from "@/data/labs";
import { labMeta, ld } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lab]/viva">) {
  const { lab } = await params;
  const L = getLab(lab);
  if (!L) return {};
  const title = `${L.subject} viva questions and answers (${L.name})`;
  const description = `${L.viva.length} ${L.subject} viva questions with short model answers for UG lab exams, plus program-wise questions and a quiz mode.`;
  return labMeta(lab, title, description, `/${lab}/viva`);
}

export default async function VivaPage({ params }: PageProps<"/[lab]/viva">) {
  const { lab } = await params;
  const L = getLab(lab);
  if (!L) notFound();
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: L.viva.map((v) => ({ "@type": "Question", name: v.q, acceptedAnswer: { "@type": "Answer", text: v.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(faq)} />
      <VivaBank lab={lab as LabId} />
    </>
  );
}
