import { ArrowLeft, ArrowRight, BookOpen, Dumbbell, GraduationCap, Keyboard, Lightbulb, MessageCircleQuestion, Terminal } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBlock, OutputBlock } from "@/components/code-block";
import { CrownLevel, LiveRunner } from "@/components/program-parts";
import { ButtonLink } from "@/components/ui/button";
import { getLab, getProgram, labs, type LabId } from "@/data/labs";
import { abs, labMeta, ld } from "@/lib/site";
import { hueVars } from "@/lib/utils";
import { Disclosure } from "@/components/ui/disclosure";

export function generateStaticParams() {
  return labs.flatMap((l) => l.programs.map((p) => ({ lab: l.id, id: p.id })));
}

export async function generateMetadata({ params }: PageProps<"/[lab]/program/[id]">) {
  const { lab, id } = await params;
  const p = getProgram(lab, id);
  const L = getLab(lab);
  if (!p || !L) return { title: "Program" };
  const title = `${L.short} ${p.id}: ${p.title} (program, output & viva)`;
  const description = `${p.aim} Full ${p.lang === "python" ? "Python" : p.lang === "c" ? "C" : "shell script"} code with sample output, step-by-step recipe and viva questions. Run it online.`;
  return labMeta(lab, title, description, `/${lab}/program/${id}`, "article");
}

export default async function ProgramPage({ params }: PageProps<"/[lab]/program/[id]">) {
  const { lab, id } = await params;
  const L = getLab(lab);
  const p = getProgram(lab, id);
  if (!L || !p) notFound();
  const unit = L.units.find((u) => u.id === p.unit)!;
  const at = L.order.indexOf(p.id);
  const prev = L.order[at - 1];
  const next = L.order[at + 1];
  const base = `/${lab}`;

  const structured = [
    {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: `${L.short} ${p.id}: ${p.title}`,
      description: p.aim,
      url: abs(`${base}/program/${p.id}`),
      learningResourceType: "Lab program",
      educationalLevel: "Undergraduate",
      teaches: p.title,
      programmingLanguage: p.lang === "python" ? "Python" : p.lang === "c" ? "C" : "Bash",
      isPartOf: { "@type": "Course", name: `${L.name}: ${L.subject}`, url: abs(base) },
      isAccessibleForFree: true,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: p.mcq.map((q) => ({ "@type": "Question", name: q.q, acceptedAnswer: { "@type": "Answer", text: `${q.correct}. ${q.why}` } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "rguLAB", item: abs("/") },
        { "@type": "ListItem", position: 2, name: L.name, item: abs(base) },
        { "@type": "ListItem", position: 3, name: p.title, item: abs(`${base}/program/${p.id}`) },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-10" style={hueVars(unit.hue)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(structured)} />
      <Link href={base} className="mb-6 inline-flex h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-secondary-fg hover:bg-muted">
        <ArrowLeft className="size-4" /> {L.name} path
      </Link>

      <header className="mb-8 rounded-2xl bg-(--u) p-6 text-white" style={{ boxShadow: "0 4px 0 var(--ledge)" }}>
        <p className="text-xs font-extrabold uppercase tracking-widest opacity-90">
          {L.short} · {unit.title} · Program {p.id} · {p.record ? "In the record" : "Bonus"}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight">{p.title}</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed opacity-95">{p.aim}</p>
        {p.complexity && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-extrabold">
            <span className="rounded-full bg-white/20 px-3 py-1">{p.complexity.paradigm}</span>
            <span className="rounded-full bg-white/20 px-3 py-1">Best {p.complexity.best}</span>
            <span className="rounded-full bg-white/20 px-3 py-1">Average {p.complexity.avg}</span>
            <span className="rounded-full bg-white/20 px-3 py-1">Worst {p.complexity.worst}</span>
          </div>
        )}
      </header>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <ButtonLink href={`${base}/lesson/${p.id}`}>
          <BookOpen className="size-4" /> Lesson
        </ButtonLink>
        <ButtonLink href={`${base}/lesson/${p.id}?mode=recall`} variant="secondary">
          <Dumbbell className="size-4" /> Recall
        </ButtonLink>
        <ButtonLink href={`${base}/exam?p=${p.id}`} variant="secondary">
          <GraduationCap className="size-4" /> Exam this
        </ButtonLink>
        <ButtonLink href={`${base}/simulator?p=${p.id}`} variant="ghost">
          <Terminal className="size-4" /> Simulator
        </ButtonLink>
        <div className="ml-auto">
          <CrownLevel pkey={p.key} />
        </div>
      </div>

      <div className="grid gap-8">
        <section aria-labelledby="recipe">
          <h2 id="recipe" className="mb-3 text-xl font-extrabold">
            {p.algorithm ? "Algorithm" : "The recipe"}
          </h2>
          {p.algorithm ? (
            <pre className="code-surface overflow-x-auto whitespace-pre p-4 text-[13px] leading-6">{p.algorithm}</pre>
          ) : (
            <ol className="card flex flex-col gap-3 p-5">
              {p.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-(--u) text-sm font-extrabold text-white">{i + 1}</span>
                  <span className="pt-0.5 font-mono text-[13px] leading-6">{s}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section aria-labelledby="code">
          <h2 id="code" className="mb-3 flex items-baseline justify-between gap-3 text-xl font-extrabold">
            Code <span className="font-mono text-sm font-bold text-secondary-fg">{p.fileName}</span>
          </h2>
          <CodeBlock code={p.code} numbers lang={p.lang} />
        </section>

        <section aria-labelledby="output">
          <h2 id="output" className="mb-3 text-xl font-extrabold">
            {p.lang === "python" ? "Expected output" : "Sample run"}
          </h2>
          <div className="flex flex-col gap-4">
            {p.samples.map((s, i) => (
              <div key={i} className="flex flex-col gap-2">
                {p.samples.length > 1 && <p className="text-sm font-extrabold text-secondary-fg">Sample {i + 1}</p>}
                {s.stdin && (
                  <div className="flex items-start gap-2 rounded-xl bg-accent-subtle px-3 py-2 text-sm">
                    <Keyboard className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>
                      <span className="font-bold">Input typed: </span>
                      <code className="font-mono text-[13px]">{s.stdin.split("\n").join("  ⏎  ")}</code>
                    </span>
                  </div>
                )}
                <OutputBlock text={s.output} />
              </div>
            ))}
            {p.images.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt={`Graph produced by program ${p.id}`} className="w-full rounded-2xl border-2 border-border bg-white" loading="lazy" />
            ))}
          </div>
        </section>

        {p.tip && (
          <aside className="flex gap-3 rounded-2xl border-2 border-(--ds-warning) bg-[color-mix(in_srgb,var(--ds-warning)_10%,transparent)] p-4">
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-(--ds-warning)" />
            <p className="text-sm leading-relaxed">
              <strong className="font-extrabold">Exam tip: </strong>
              {p.tip}
            </p>
          </aside>
        )}

        <section aria-labelledby="viva">
          <h2 id="viva" className="mb-3 flex items-center gap-2 text-xl font-extrabold">
            <MessageCircleQuestion className="size-6 text-(--u)" /> Viva questions
          </h2>
          <div className="flex flex-col gap-3">
            {p.mcq.map((q) => (
              <Disclosure key={q.q} summary={q.q}>
                <p className="font-extrabold text-success">{q.correct}</p>
                <p className="mt-1 text-sm text-secondary-fg">{q.why}</p>
              </Disclosure>
            ))}
            <Link href={`${base}/viva`} className="text-sm font-bold text-primary hover:underline">
              More {L.subject} viva questions →
            </Link>
          </div>
        </section>

        <section aria-labelledby="live">
          <h2 id="live" className="mb-3 text-xl font-extrabold">
            Try it live
          </h2>
          <LiveRunner lab={lab as LabId} id={p.id} />
        </section>

        <nav className="flex items-center justify-between gap-3 border-t-2 border-border pt-6" aria-label="Program navigation">
          {prev ? (
            <ButtonLink href={`${base}/program/${prev}`} variant="secondary" size="sm">
              <ArrowLeft className="size-4" /> {prev}
            </ButtonLink>
          ) : (
            <span />
          )}
          {next && (
            <ButtonLink href={`${base}/program/${next}`} variant="secondary" size="sm">
              {next} <ArrowRight className="size-4" />
            </ButtonLink>
          )}
        </nav>
      </div>
    </div>
  );
}
