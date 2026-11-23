import { Dumbbell, Rocket } from "lucide-react";
import { notFound } from "next/navigation";
import { LearnPath } from "@/components/learn-path";
import { DailyGoal, ExamCard, SideRail } from "@/components/side-rail";
import { ButtonLink } from "@/components/ui/button";
import { getLab, type LabId } from "@/data/labs";
import { abs, labMeta, ld } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lab]">) {
  const { lab } = await params;
  const L = getLab(lab);
  if (!L) return {};
  const title = `${L.name}: ${L.subject} lab programs`;
  const description = `${L.programs.length} ${L.subject} lab programs with code, sample output, lessons, an online ${L.runtime.split(" ·")[0]} simulator, mock exams and viva questions.`;
  return labMeta(lab, title, description, `/${lab}`);
}

export default async function LearnPage({ params }: PageProps<"/[lab]">) {
  const { lab } = await params;
  const L = getLab(lab);
  if (!L) notFound();
  const id = lab as LabId;
  const course = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${L.name}: ${L.subject}`,
    description: L.tagline,
    url: abs(`/${id}`),
    provider: { "@type": "Organization", name: "rguLAB", url: abs("/") },
    educationalLevel: "Undergraduate",
    isAccessibleForFree: true,
    inLanguage: "en",
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: `PT${L.programs.length}H` },
    hasPart: L.programs.map((p) => ({ "@type": "LearningResource", name: `${p.id}. ${p.title}`, url: abs(`/${id}/program/${p.id}`) })),
  };
  return (
    <div className="mx-auto flex max-w-5xl gap-12 px-4 py-6 sm:px-6 lg:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(course)} />
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-secondary-fg">
              {L.subject} · {L.programs.length} programs
            </p>
            <h1 className="text-3xl font-extrabold">{L.name} path</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {id === "ds" && (
              <ButtonLink href="/quick" size="sm">
                <Rocket className="size-4" /> All codes + viva
              </ButtonLink>
            )}
            <ButtonLink href={`/${id}/lesson/review`} variant="secondary" size="sm">
              <Dumbbell className="size-4" /> Mixed review
            </ButtonLink>
          </div>
        </div>
        <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:hidden">
          <DailyGoal />
          <ExamCard lab={id} />
        </div>
        <LearnPath lab={id} />
      </div>
      <div className="sticky top-6 hidden w-80 shrink-0 self-start xl:block">
        <SideRail lab={id} />
      </div>
    </div>
  );
}
