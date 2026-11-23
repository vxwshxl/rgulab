import {
  ArrowLeft,
  BarChart3,
  Lightbulb,
  MessageCircleQuestion,
  Rocket,
  TriangleAlert,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock, OutputBlock } from "@/components/code-block";
import { Logo } from "@/components/logo";
import { DoneButton, QuickPlan, QuickTimer } from "@/components/quick-tracker";
import { ThemeToggle } from "@/components/shell";
import { ButtonLink } from "@/components/ui/button";
import { getLab } from "@/data/labs";
import {
  errors,
  examPlan,
  groups,
  lastMinute,
  makeData,
  packages,
  recipe,
  schedule,
  skeleton,
  skeletonSwap,
  sklearnMap,
  titanic,
} from "@/data/quick-ds";
import { abs, labMeta, ld } from "@/lib/site";

const title = "DS lab in 90 minutes: quick revision";
const description =
  "Revise all 29 DS record programs in 90 minutes: plain-English explanations, full code, outputs, the imports you need, the ML skeleton, common Spyder errors and viva questions with answers.";

export const metadata: Metadata = labMeta(
  "ds",
  title,
  description,
  "/quick",
  "article",
);

const lab = getLab("ds")!;

function Section({
  id,
  n,
  title,
  minutes,
  intro,
  next,
  children,
}: {
  id: string;
  n: number;
  title: string;
  minutes: number;
  intro?: string;
  next?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-h`}
      className="scroll-mt-28 border-t-2 border-border pt-10"
    >
      <p className="text-xs font-extrabold uppercase tracking-widest text-primary">
        Step {n} · {minutes} min
      </p>
      <h2 id={`${id}-h`} className="mt-1 text-2xl font-extrabold sm:text-3xl">
        {title}
      </h2>
      {intro && (
        <p className="mt-2 max-w-3xl text-lg leading-snug text-secondary-fg">
          {intro}
        </p>
      )}
      <div className="mt-6">{children}</div>
      <DoneButton id={`#${id}`} next={next} />
    </section>
  );
}

function QA({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl bg-muted px-4 py-3">
      <p className="font-extrabold">Q. {q}</p>
      <p className="mt-1 leading-snug">
        <span className="font-extrabold text-primary">A. </span>
        {a}
      </p>
    </div>
  );
}

function shortOutput(text: string, max = 12) {
  const lines = text.replace(/\n+$/, "").split("\n");
  return lines.length > max
    ? `${lines.slice(0, max).join("\n")}\n… (${lines.length - max} more lines)`
    : lines.join("\n");
}

const nextOf = (id: string) => {
  const i = schedule.findIndex((s) => s.href === `#${id}`);
  return schedule[i + 1]?.href;
};

export default function QuickPage() {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: lab.viva.map((v) => ({
      "@type": "Question",
      name: v.q,
      acceptedAnswer: { "@type": "Answer", text: v.a },
    })),
  };
  const article = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: title,
    description,
    url: abs("/quick"),
    timeRequired: "PT90M",
    educationalLevel: "Undergraduate",
    learningResourceType: "Revision guide",
    isAccessibleForFree: true,
  };
  let step = 3;

  return (
    <div className="lab-ds min-h-dvh">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={ld(article)}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(faq)} />
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 pt-5 sm:px-6">
        <Link href="/" aria-label="rguLAB home">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/ds"
            className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-extrabold uppercase tracking-wide text-secondary-fg hover:bg-muted sm:flex"
          >
            <ArrowLeft className="size-4" /> DS lab
          </Link>
          <ThemeToggle compact />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <div className="pb-6 pt-8">
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary">
            <Rocket className="size-4" /> DS lab · 29 record programs
          </p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight sm:text-5xl">
            Everything in 90 minutes
          </h1>
          <p className="mt-3 max-w-3xl text-lg leading-snug text-secondary-fg">
            You&apos;ve already written every program once, so this page
            doesn&apos;t teach from zero. It tells you what each one{" "}
            <em>means</em>, the few lines worth remembering, what the output
            looks like, and what the examiner will ask. Go top to bottom; the
            timer tells you when to move on.
          </p>
        </div>

        <QuickTimer />

        <div className="mt-6">
          <h2 className="sr-only">Plan</h2>
          <QuickPlan />
        </div>

        <div className="mt-10 flex flex-col gap-14">
          {/* 1. recipe */}
          <Section
            id="recipe"
            n={1}
            title="How every program works"
            minutes={5}
            intro="Every one of the 29 programs is the same 4 steps. If you blank out in the exam, write these 4 comments first and fill them in."
            next={nextOf("recipe")}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recipe.map((r) => (
                <div key={r.step} className="card flex flex-col gap-2 p-4">
                  <p className="text-lg font-extrabold">{r.step}</p>
                  <p className="text-sm text-secondary-fg">{r.what}</p>
                  <pre className="code-surface mt-auto overflow-x-auto p-3 text-xs">
                    {r.code}
                  </pre>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 font-extrabold">
                  No dataset in the exam? Make one
                </h3>
                <CodeBlock code={makeData} />
              </div>
              <div>
                <h3 className="mb-2 font-extrabold">
                  If they give titanic.csv
                </h3>
                <CodeBlock code={titanic} />
              </div>
            </div>
          </Section>

          {/* 2. packages */}
          <Section
            id="packages"
            n={2}
            title="Packages and imports"
            minutes={10}
            intro="Seven packages cover all 29 programs. Learn the import line and the job; the hook helps it stick."
            next={nextOf("packages")}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {packages.map((p) => (
                <div key={p.name} className="card p-4">
                  <p className="text-lg font-extrabold">{p.name}</p>
                  <pre className="code-surface mt-2 overflow-x-auto px-3 py-2 text-[13px]">
                    {p.imp}
                  </pre>
                  <p className="mt-2">{p.job}</p>
                  <p className="mt-1 text-sm text-secondary-fg">
                    <Lightbulb className="mr-1 inline size-4 text-gold" />
                    {p.hook}
                  </p>
                  <p className="mt-1 font-mono text-xs text-secondary-fg">
                    {p.use}
                  </p>
                </div>
              ))}
            </div>
            <h3 className="mb-2 mt-8 text-xl font-extrabold">
              sklearn: which module has what
            </h3>
            <p className="mb-3 text-secondary-fg">
              Pattern:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm font-bold">
                from sklearn.MODULE import ClassName
              </code>
              . The module name says what the thing is for.
            </p>
            <div className="card overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-xs font-extrabold uppercase tracking-wider text-secondary-fg">
                  <tr>
                    <th className="px-4 py-3">Module</th>
                    <th className="px-4 py-3">What you import from it</th>
                    <th className="hidden px-4 py-3 md:table-cell">
                      Why there
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-border">
                  {sklearnMap.map((r) => (
                    <tr key={r.module}>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-[13px] font-bold">
                        {r.module}
                      </td>
                      <td className="px-4 py-3 font-mono text-[13px]">
                        {r.things}
                      </td>
                      <td className="hidden px-4 py-3 text-secondary-fg md:table-cell">
                        {r.tip}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 3. skeleton */}
          <Section
            id="skeleton"
            n={3}
            title="The ML skeleton"
            minutes={5}
            intro="Programs 16–21 are this exact code. Only the model import and one line change. Learn this once and you know six programs."
            next={nextOf("skeleton")}
          >
            <CodeBlock code={skeleton} numbers />
            <div className="card mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-xs font-extrabold uppercase tracking-wider text-secondary-fg">
                  <tr>
                    <th className="px-4 py-3">Program</th>
                    <th className="px-4 py-3">Change line 3 to</th>
                    <th className="px-4 py-3">Model line</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-border">
                  {skeletonSwap.map(([p, imp, m]) => (
                    <tr key={p}>
                      <td className="whitespace-nowrap px-4 py-3 font-bold">
                        {p}
                      </td>
                      <td className="px-4 py-3 font-mono text-[13px]">{imp}</td>
                      <td className="px-4 py-3 font-mono text-[13px]">{m}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-secondary-fg">
              Wine instead of iris? Swap load_iris for load_wine. Breast cancer?
              load_breast_cancer, and add a StandardScaler in a pipeline.
            </p>
          </Section>

          {/* 4–10. program groups */}
          {groups.map((g) => {
            step++;
            return (
              <Section
                key={g.id}
                id={g.id}
                n={step}
                title={g.title}
                minutes={g.minutes}
                intro={g.idea}
                next={nextOf(g.id)}
              >
                <div className="flex flex-col gap-6">
                  {g.programs.map((qp) => {
                    const p = lab.byId.get(qp.id)!;
                    const vivas: [string, string][] = [
                      ...(qp.viva ?? []),
                      ...p.mcq.map((m): [string, string] => [
                        m.q,
                        `${m.correct}. ${m.why}`,
                      ]),
                    ];
                    return (
                      <article
                        key={qp.id}
                        id={`p${qp.id}`}
                        className="card scroll-mt-28 overflow-hidden"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-border bg-muted/60 px-5 py-4">
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold uppercase tracking-widest text-primary">
                              Program {p.id}
                            </p>
                            <h3 className="text-xl font-extrabold">
                              {p.title}
                            </h3>
                            <p className="mt-1 text-[17px] leading-snug">
                              {qp.simple}
                            </p>
                          </div>
                          <Link
                            href={`/ds/simulator?p=${p.id}`}
                            className="shrink-0 rounded-xl border-2 border-border px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-primary hover:bg-elevated"
                          >
                            Run it
                          </Link>
                        </div>
                        <div className="flex flex-col gap-5 p-5">
                          <CodeBlock code={p.code} />
                          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <div className="flex min-w-0 flex-col gap-3">
                              <div>
                                <p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-secondary-fg">
                                  Output
                                </p>
                                <OutputBlock
                                  text={shortOutput(p.samples[0]?.output ?? "")}
                                />
                              </div>
                              <div>
                                <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-secondary-fg">
                                  <Lightbulb className="size-4 text-gold" />{" "}
                                  Remember
                                </p>
                                <ul className="flex flex-col gap-2">
                                  {qp.remember.map((r) => (
                                    <li
                                      key={r}
                                      className="flex gap-2 leading-snug"
                                    >
                                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                                      <span>{r}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              {qp.graph && (
                                <p className="flex gap-2 rounded-xl border-2 border-dashed border-border px-3 py-2 text-sm">
                                  <BarChart3 className="mt-0.5 size-4 shrink-0 text-primary" />
                                  <span>
                                    <b>Graph:</b> {qp.graph}
                                  </span>
                                </p>
                              )}
                            </div>
                            <div className="flex min-w-0 flex-col gap-4">
                              <div>
                                <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-secondary-fg">
                                  <MessageCircleQuestion className="size-4 text-primary" />{" "}
                                  Viva for this program
                                </p>
                                <div className="flex flex-col gap-2 text-sm">
                                  {vivas.map(([q, a]) => (
                                    <QA key={q} q={q} a={a} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </Section>
            );
          })}

          {/* 11. subject viva */}
          <Section
            id="viva"
            n={11}
            title="Subject viva: questions and answers"
            minutes={10}
            intro="The theory questions examiners ask beyond your program. Read the question, say your answer out loud, then read the answer."
            next={nextOf("viva")}
          >
            <div className="flex flex-col gap-8">
              {[...new Set(lab.viva.map((v) => v.topic))].map((topic) => (
                <div key={topic}>
                  <h3 className="mb-3 text-lg font-extrabold">{topic}</h3>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {lab.viva
                      .filter((v) => v.topic === topic)
                      .map((v) => (
                        <QA key={v.q} q={v.q} a={v.a} />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 12. errors + plan */}
          <Section
            id="errors"
            n={12}
            title="Errors you might hit, and the exam-day plan"
            minutes={7}
          >
            <div className="flex flex-col gap-2">
              {errors.map(([e, fix]) => (
                <div key={e} className="card flex gap-3 p-4">
                  <TriangleAlert className="mt-0.5 size-5 shrink-0 text-danger" />
                  <div className="min-w-0">
                    <p className="break-words font-mono text-sm font-bold">
                      {e}
                    </p>
                    <p className="mt-1 leading-snug">{fix}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="card p-5">
                <h3 className="text-lg font-extrabold">In the exam room</h3>
                <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 leading-snug">
                  {examPlan.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ol>
              </div>
              <div className="card border-primary p-5">
                <h3 className="text-lg font-extrabold">
                  Last look: 10 lines before you walk in
                </h3>
                <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 leading-snug">
                  {lastMinute.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ol>
              </div>
            </div>
          </Section>

          <div className="card flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-2xl font-extrabold">You&apos;re ready.</p>
            <p className="max-w-xl text-secondary-fg">
              Got 10 spare minutes? Take a viva quiz or a mock exam to check
              what stuck.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/ds/lesson/viva?mode=viva">
                Viva quiz
              </ButtonLink>
              <ButtonLink href="/ds/exam" variant="secondary">
                Mock exam
              </ButtonLink>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
