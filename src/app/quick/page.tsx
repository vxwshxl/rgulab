import { ArrowLeft, ListOrdered, MessageCircleQuestion, Package, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { QuickIndex, type IndexItem } from "@/components/quick-index";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/shell";
import { getLab } from "@/data/labs";
import { changes, groups } from "@/data/quick-ds";
import { statements } from "@/lib/exercises";
import { explainImportLine, explainPyLine } from "@/lib/explain";
import { abs, labMeta, ld } from "@/lib/site";

const title = "DS lab: all 29 codes + viva questions with answers";
const description =
  "Copy-paste Python code for all 29 DS record programs, each with viva questions answered: which module is used and why, what every line does, concept questions and quick changes examiners ask for.";

export const metadata: Metadata = {
  ...labMeta("quick", title, description, "/quick", "article"),
  keywords: ["DS lab programs", "data science lab code", "DS lab viva questions", "sklearn viva", "pandas viva", "Python lab exam", "Spyder"],
};

const lab = getLab("ds")!;
const order = groups.flatMap((g) => g.programs.map((p) => p.id)).sort();
const allCode = order
  .map((id) => {
    const p = lab.byId.get(id)!;
    return `# ===== Program ${id}: ${p.title} =====\n${p.code.replace(/\n+$/, "")}\n`;
  })
  .join("\n");

// Search text per program: title, aim, and every imported name / called function in the code.
const indexItems: IndexItem[] = order.map((id) => {
  const p = lab.byId.get(id)!;
  const group = groups.find((g) => g.programs.some((x) => x.id === id))!.title;
  const words = [...new Set(p.code.match(/[A-Za-z_][\w.]*/g) ?? [])].filter((w) => w.length > 2).join(" ");
  return { id, title: p.title, group, text: `${p.aim} ${words}` };
});

function Label({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-secondary-fg">
      {icon}
      {children}
    </p>
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

export default function QuickPage() {
  const qa: { q: string; a: string }[] = [];
  const cards = groups.map((g) => ({
    ...g,
    programs: g.programs.map((qp) => {
      const p = lab.byId.get(qp.id)!;
      const stmts = statements(p.code);
      const concepts: [string, string][] = [...(qp.viva ?? []), ...p.mcq.map((m): [string, string] => [m.q, `${m.correct}. ${m.why}`])];
      for (const [q, a] of concepts) qa.push({ q: `Program ${p.id} (${p.title}): ${q}`, a });
      return {
        p,
        concepts,
        imports: stmts.filter((x) => /^(from|import)\s/.test(x)).flatMap((x) => explainImportLine(x) ?? []),
        lines: stmts.filter((x) => !/^(from|import)\s/.test(x)).map((x) => ({ code: x, what: explainPyLine(x) })),
        edits: changes[p.id] ?? [],
      };
    }),
  }));

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [...qa, ...lab.viva.map((v) => ({ q: v.q, a: v.a }))].map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })),
  };
  const resource = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: title,
    description,
    url: abs("/quick"),
    educationalLevel: "Undergraduate",
    learningResourceType: "Lab programs and viva questions",
    programmingLanguage: "Python",
    isAccessibleForFree: true,
    hasPart: order.map((id) => ({ "@type": "SoftwareSourceCode", name: `DS ${id}: ${lab.byId.get(id)!.title}`, programmingLanguage: "Python", url: abs(`/quick#p${id}`) })),
  };

  return (
    <div className="lab-ds min-h-dvh">
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(resource)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(faq)} />
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 pt-5 sm:px-6">
        <Link href="/" aria-label="rguLAB home">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/ds" className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-extrabold uppercase tracking-wide text-secondary-fg hover:bg-muted sm:flex">
            <ArrowLeft className="size-4" /> DS lab
          </Link>
          <ThemeToggle compact />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <div className="pb-6 pt-8">
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">DS lab: all codes + viva</h1>
          <p className="mt-2 max-w-3xl text-lg text-secondary-fg">29 record programs. Copy any code, and read the viva answers right below it.</p>
        </div>

        <QuickIndex items={indexItems} allCode={allCode} />

        <div className="mt-10 flex flex-col gap-14">
          {cards.map((g) => (
            <section key={g.id} aria-labelledby={`${g.id}-h`} className="flex flex-col gap-6">
              <h2 id={`${g.id}-h`} className="border-b-2 border-border pb-2 text-2xl font-extrabold sm:text-3xl">
                {g.title}
              </h2>
              {g.programs.map(({ p, concepts, imports, lines, edits }) => (
                <article key={p.id} id={`p${p.id}`} className="card scroll-mt-36 overflow-hidden">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-border bg-muted/60 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Program {p.id}</p>
                      <h3 className="text-xl font-extrabold">{p.title}</h3>
                      <p className="mt-0.5 text-sm text-secondary-fg">{p.aim}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <CopyButton text={p.code} primary />
                      <Link
                        href={`/ds/simulator?p=${p.id}`}
                        className="inline-flex h-10 items-center rounded-xl border-2 border-border px-3 text-xs font-extrabold uppercase tracking-wide text-primary hover:bg-elevated"
                      >
                        Run it
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 p-5">
                    <CodeBlock code={p.code} />

                    <div>
                      <Label icon={<Package className="size-4 text-primary" />}>Viva: which module is used and why</Label>
                      <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                        {imports.map((x) => (
                          <QA key={x.q} q={x.q} a={x.a} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label icon={<ListOrdered className="size-4 text-primary" />}>Viva: what does each line do?</Label>
                      <ol className="divide-y-2 divide-border overflow-hidden rounded-xl border-2 border-border">
                        {lines.map((l, i) => (
                          <li key={i} className="grid grid-cols-1 gap-1 px-3 py-2.5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-4">
                            <pre className="min-w-0 overflow-x-auto whitespace-pre font-mono text-[12.5px] font-bold">{l.code}</pre>
                            <p className="text-sm leading-snug text-secondary-fg">{l.what}</p>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <Label icon={<MessageCircleQuestion className="size-4 text-primary" />}>Viva: concepts</Label>
                      <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                        {concepts.map(([q, a]) => (
                          <QA key={q} q={q} a={a} />
                        ))}
                      </div>
                    </div>

                    {edits.length > 0 && (
                      <div>
                        <Label icon={<Pencil className="size-4 text-primary" />}>Viva: &quot;change it to…&quot;</Label>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {edits.map(([ask, code]) => (
                            <div key={ask} className="flex min-w-0 flex-col gap-1.5">
                              <p className="text-sm font-extrabold">→ {ask}</p>
                              <CodeBlock code={code} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </section>
          ))}

          <section id="viva" aria-labelledby="viva-h" className="scroll-mt-36">
            <h2 id="viva-h" className="border-b-2 border-border pb-2 text-2xl font-extrabold sm:text-3xl">
              Subject viva
            </h2>
            <div className="mt-6 flex flex-col gap-8">
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
          </section>
        </div>
      </main>
    </div>
  );
}
