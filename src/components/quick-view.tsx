import { ArrowLeft, BookOpen, ClipboardList, ExternalLink, Gauge, ListOrdered, MessageCircleQuestion, Package, Pencil, PlayCircle, Terminal, Workflow } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock, OutputBlock } from "./code-block";
import { CopyButton } from "./copy-button";
import { Logo } from "./logo";
import { QuickIndex, type IndexExtra, type IndexItem } from "./quick-index";
import { QuickLabSwitch } from "./quick-lab-switch";
import { ThemeToggle } from "./shell";
import { getLab, type Lab, type LabId, type Program } from "@/data/labs";
import { linuxCmds, schedFormulas, shellSyntax, testOps } from "@/data/labs/cheatsheet-os";
import { changes, groups as dsGroups } from "@/data/quick-ds";
import { daaTheory, examCopy, resources, type TheoryBlock } from "@/data/quick-theory";
import { statements } from "@/lib/exercises";
import { explainCodeLine, explainImportLine, explainModules, explainPyLine } from "@/lib/explain";
import { abs, labMeta, ld, quickHref } from "@/lib/site";
import { cn } from "@/lib/utils";

const COPY: Record<LabId, { what: string; mod: string; og: string }> = {
  ds: { what: "Python", mod: "which module is used and why", og: "quick" },
  os: { what: "shell script and C", mod: "which commands are used and why", og: "quick/os" },
  daa: { what: "C", mod: "which header is used and why", og: "quick/daa" },
};

function recordPrograms(lab: Lab) {
  return lab.programs.filter((p) => p.record);
}

export function quickMeta(labId: LabId): Metadata {
  const lab = getLab(labId)!;
  const n = recordPrograms(lab).length;
  const title = `${lab.name}: all ${n} codes + viva questions with answers`;
  const extra = labId === "daa" ? "algorithm, output and time/space complexity" : labId === "os" ? "algorithm and output" : "output and graphs";
  const description = `Copy-paste ${COPY[labId].what} code for all ${n} ${lab.name} record programs with their ${extra}, each with viva questions answered: ${COPY[labId].mod}, what every line does and concept questions.${labId === "daa" ? " Plus P, NP, NP-complete and NP-hard theory." : ""}`;
  return {
    ...labMeta(COPY[labId].og, title, description, quickHref(labId), "article"),
    keywords: [`${lab.name} programs`, `${lab.subject} lab code`, `${lab.name} viva questions`, `${lab.subject} viva`, "lab exam", "viva questions with answers"],
  };
}

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

/** Exam-copy algorithm: DAA has its own Algorithm block; OS steps become Start → steps → Stop. */
function algorithmOf(p: Program): string {
  if (p.algorithm?.trim()) return p.algorithm.trim();
  if (!p.steps?.length) return "";
  const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
  return ["1. Start", ...p.steps.map((x, i) => `${i + 2}. ${cap(x)}`), `${p.steps.length + 2}. Stop`].join("\n");
}

/** The time/space complexity lines the program prints (what goes in the exam copy). */
function printedComplexity(code: string): { time?: string; space?: string } {
  const grab = (k: string) => code.match(new RegExp(`${k} complexity:([^"]*)"`, "i"))?.[1]?.replace(/\\n/g, "").trim();
  return { time: grab("Time"), space: grab("Space") };
}

function PlainBlock({ text }: { text: string }) {
  return (
    <div className="relative">
      <pre className="code-surface whitespace-pre-wrap break-words p-4 pt-16 font-mono text-[13px] leading-relaxed sm:pr-28 sm:pt-4">{text}</pre>
      <CopyButton text={text} label="Copy" className="absolute right-3 top-3 h-9" />
    </div>
  );
}

function Theory({ blocks }: { blocks: TheoryBlock[] }) {
  return (
    <div className="flex flex-col gap-8">
      {blocks.map((b) => (
        <div key={b.title}>
          <h3 className="mb-3 text-lg font-extrabold">{b.title}</h3>
          {b.points && (
            <ul className="mb-3 flex flex-col gap-2">
              {b.points.map((x) => (
                <li key={x} className="flex gap-2 leading-snug">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          )}
          {b.table && (
            <div className="card overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-xs font-extrabold uppercase tracking-wider text-secondary-fg">
                  <tr>{b.table.head.map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y-2 divide-border">
                  {b.table.rows.map((r) => (
                    <tr key={r.join("|")}>
                      {r.map((c, i) => (
                        <td key={i} className={cn("px-4 py-3 align-top", i === 0 && "whitespace-nowrap font-mono text-[13px] font-bold")}>{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {b.qa && (
            <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              {b.qa.map(([q, a]) => <QA key={q} q={q} a={a} />)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const osTheory: TheoryBlock[] = [
  { title: "CPU scheduling formulas", table: { head: ["Formula", "Meaning"], rows: schedFormulas } },
  { title: "Test operators inside [ ]", table: { head: ["Operator", "Meaning"], rows: testOps } },
  { title: "Common Linux commands", table: { head: ["Command", "What it does"], rows: linuxCmds } },
];

type Card = {
  p: Program;
  concepts: [string, string][];
  modules: { q: string; a: string }[];
  lines: { code: string; what: string }[];
  edits: [string, string][];
};

function buildCard(p: Program, extraViva: [string, string][] = []): Card {
  const concepts: [string, string][] = [...extraViva];
  if (p.complexity) {
    const c = p.complexity;
    concepts.push([`What is the time complexity of ${p.title}?`, `Best ${c.best}, average ${c.avg}, worst ${c.worst}. Design paradigm: ${c.paradigm}.`]);
  }
  concepts.push(...p.mcq.map((m): [string, string] => [m.q, `${m.correct}. ${m.why}`]));

  if (p.lang === "python") {
    const stmts = statements(p.code);
    return {
      p,
      concepts,
      modules: stmts.filter((x) => /^(from|import)\s/.test(x)).flatMap((x) => explainImportLine(x) ?? []),
      lines: stmts.filter((x) => !/^(from|import)\s/.test(x)).map((x) => ({ code: x, what: explainPyLine(x) })),
      edits: changes[p.id] ?? [],
    };
  }
  const lang = p.lang;
  const seen = new Set<string>();
  const lines = p.code
    .split("\n")
    .map((l) => ({ code: l.trim(), what: explainCodeLine(l, lang, p.code) }))
    .filter((l) => l.what && !seen.has(l.code) && seen.add(l.code));
  return { p, concepts, modules: explainModules(p.code, lang), lines, edits: [] };
}

export function QuickView({ labId }: { labId: LabId }) {
  const lab = getLab(labId)!;
  const extra = new Map(dsGroups.flatMap((g) => g.programs.map((x) => [x.id, x.viva ?? []] as const)));
  const groups =
    labId === "ds"
      ? dsGroups.map((g) => ({ id: g.id, title: g.title, ids: g.programs.map((x) => x.id) }))
      : lab.units.map((u) => ({ id: u.id, title: u.title, ids: u.ids.filter((id) => lab.byId.get(id)?.record) })).filter((g) => g.ids.length);
  const cards = groups.map((g) => ({ ...g, cards: g.ids.map((id) => buildCard(lab.byId.get(id)!, labId === "ds" ? [...(extra.get(id) ?? [])] : [])) }));
  const order = groups.flatMap((g) => g.ids).sort();
  const comment = lab.lang === "c" ? "//" : "#";
  const allCode = order
    .map((id) => {
      const p = lab.byId.get(id)!;
      return `${comment} ===== Program ${id}: ${p.title} =====\n${p.code.replace(/\n+$/, "")}\n`;
    })
    .join("\n");
  const indexItems: IndexItem[] = order.map((id) => {
    const p = lab.byId.get(id)!;
    const group = groups.find((g) => g.ids.includes(id))!.title;
    const words = [...new Set(p.code.match(/[A-Za-z_][\w.]*/g) ?? [])].filter((w) => w.length > 2).join(" ");
    return { id, title: p.title, group, text: `${p.aim} ${words}` };
  });

  const copyGuide = examCopy[labId];
  const theory = labId === "daa" ? daaTheory : labId === "os" ? osTheory : [];
  const links = resources[labId] ?? [];
  const extras: IndexExtra[] = [
    ...(theory.length ? [{ href: `#${labId}-theory`, short: "Th", label: labId === "daa" ? "Theory: complexity classes" : "Theory: formulas and commands" }] : []),
    { href: `#${labId}-viva`, short: "Q&A", label: "Subject viva" },
  ];
  const meta = quickMeta(labId);
  const title = String(meta.title);
  const description = String(meta.description);
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      ...cards.flatMap((g) => g.cards.flatMap((c) => c.concepts.map(([q, a]) => ({ q: `${lab.short} ${c.p.id} (${c.p.title}): ${q}`, a })))),
      ...lab.viva.map((v) => ({ q: v.q, a: v.a })),
    ].map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })),
  };
  const resource = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: title,
    description,
    url: abs(quickHref(labId)),
    educationalLevel: "Undergraduate",
    learningResourceType: "Lab programs and viva questions",
    isAccessibleForFree: true,
    hasPart: order.map((id) => ({ "@type": "SoftwareSourceCode", name: `${lab.short} ${id}: ${lab.byId.get(id)!.title}`, programmingLanguage: lab.byId.get(id)!.lang, url: abs(`${quickHref(labId)}#${labId}-p${id}`) })),
  };

  return (
    <div className={cn(`lab-${labId}`, "min-h-dvh")}>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(resource)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(faq)} />
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 pt-5 sm:px-6">
        <Link href="/" aria-label="rguLAB home" className="shrink-0">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/${labId}`} className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-extrabold uppercase tracking-wide text-secondary-fg hover:bg-muted md:flex">
            <ArrowLeft className="size-4" /> {lab.short} path
          </Link>
          <ThemeToggle compact />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6 pt-8">
          <div className="min-w-0">
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">{lab.name}: all codes + viva</h1>
            <p className="mt-2 max-w-3xl text-lg text-secondary-fg">
              {order.length} record programs. Copy any code; the output{labId === "ds" ? ", graphs" : ""} and viva answers are right below it.
            </p>
          </div>
          <QuickLabSwitch current={labId} />
        </div>

        {copyGuide && (
          <aside className="card mb-6 border-primary bg-accent-subtle/60 p-4 sm:p-5">
            <p className="flex items-center gap-2 font-extrabold">
              <ClipboardList className="size-5 text-primary" /> What to write in the exam copy
            </p>
            <ol className="mt-3 flex flex-wrap gap-2">
              {copyGuide.steps.map((x, i) => (
                <li key={x} className="flex items-center gap-2 rounded-xl border-2 border-border bg-elevated px-3 py-1.5 text-sm font-bold">
                  <span className="grid size-6 place-items-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">{i + 1}</span>
                  {x}
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm leading-snug text-secondary-fg">{copyGuide.note}</p>
          </aside>
        )}

        <QuickIndex items={indexItems} allCode={allCode} total={order.length} prefix={labId} extras={extras} />

        <div className="mt-10 flex flex-col gap-14">
          {cards.map((g) => (
            <section key={g.id} aria-labelledby={`${labId}-${g.id}-h`} className="flex flex-col gap-6">
              <h2 id={`${labId}-${g.id}-h`} className="border-b-2 border-border pb-2 text-2xl font-extrabold sm:text-3xl">
                {g.title}
              </h2>
              {g.cards.map(({ p, concepts, modules, lines, edits }) => (
                <article key={p.id} id={`${labId}-p${p.id}`} className="card scroll-mt-6 overflow-hidden">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-border bg-muted/60 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Program {p.id}</p>
                      <h3 className="text-xl font-extrabold">{p.title}</h3>
                      <p className="mt-0.5 text-sm text-secondary-fg">{p.aim}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <CopyButton text={p.code} primary />
                      <Link
                        href={`/${labId}/simulator?p=${p.id}`}
                        className="inline-flex h-10 items-center rounded-xl border-2 border-border px-3 text-xs font-extrabold uppercase tracking-wide text-primary hover:bg-elevated"
                      >
                        Run it
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 p-5">
                    {algorithmOf(p) && (
                      <div>
                        <Label icon={<Workflow className="size-4 text-primary" />}>Algorithm</Label>
                        <PlainBlock text={algorithmOf(p)} />
                      </div>
                    )}

                    <div>
                      {algorithmOf(p) && <Label icon={<Terminal className="size-4 text-primary" />}>Program</Label>}
                      <CodeBlock code={p.code} lang={p.lang} />
                    </div>

                    <div>
                      <Label icon={<Terminal className="size-4 text-primary" />}>Output</Label>
                      <div className="flex flex-col gap-3">
                        {p.samples.map((s, i) => (
                          <div key={i} className="flex flex-col gap-1.5">
                            {s.stdin.trim() && (
                              <p className="text-sm">
                                <span className="font-extrabold">Input typed: </span>
                                <code className="font-mono text-[13px]">{s.stdin.trim().split("\n").join("  ⏎  ")}</code>
                              </p>
                            )}
                            <OutputBlock text={s.output.replace(/\n+$/, "")} />
                          </div>
                        ))}
                        {p.images.length > 0 && (
                          <div className={cn("grid grid-cols-1 gap-3", p.images.length > 1 && "md:grid-cols-2")}>
                            {p.images.map((src, i) => (
                              <figure key={src} className="overflow-hidden rounded-xl border-2 border-border bg-white">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={src} alt={`Graph ${i + 1} produced by ${lab.short} program ${p.id}: ${p.title}`} className="w-full" loading="lazy" />
                                <figcaption className="border-t-2 border-border bg-elevated px-3 py-1.5 text-xs font-bold text-secondary-fg">
                                  Graph{p.images.length > 1 ? ` ${i + 1}` : ""} · Program {p.id}
                                </figcaption>
                              </figure>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {labId === "daa" && (() => {
                      const pc = printedComplexity(p.code);
                      const c = p.complexity;
                      const copy = [pc.time && `Time complexity: ${pc.time}`, pc.space && `Space complexity: ${pc.space}`].filter(Boolean).join("\n");
                      return (
                        <div>
                          <Label icon={<Gauge className="size-4 text-primary" />}>Complexity</Label>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {copy && <PlainBlock text={copy} />}
                            {c && (
                              <div className="card overflow-hidden">
                                <table className="w-full text-left text-sm">
                                  <tbody className="divide-y-2 divide-border">
                                    {[["Best case", c.best], ["Average case", c.avg], ["Worst case", c.worst], ["Paradigm", c.paradigm]].map(([k, v]) => (
                                      <tr key={k}>
                                        <th className="w-36 bg-muted px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-secondary-fg">{k}</th>
                                        <td className="px-4 py-2 font-mono font-bold">{v}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {modules.length > 0 && (
                      <div>
                        <Label icon={<Package className="size-4 text-primary" />}>Viva: {COPY[labId].mod}</Label>
                        <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                          {modules.map((x) => (
                            <QA key={x.q} q={x.q} a={x.a} />
                          ))}
                        </div>
                      </div>
                    )}

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

                    {concepts.length > 0 && (
                      <div>
                        <Label icon={<MessageCircleQuestion className="size-4 text-primary" />}>Viva: concepts</Label>
                        <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                          {concepts.map(([q, a]) => (
                            <QA key={q} q={q} a={a} />
                          ))}
                        </div>
                      </div>
                    )}

                    {edits.length > 0 && (
                      <div>
                        <Label icon={<Pencil className="size-4 text-primary" />}>Viva: &quot;change it to…&quot;</Label>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {edits.map(([ask, code]) => (
                            <div key={ask} className="flex min-w-0 flex-col gap-1.5">
                              <p className="text-sm font-extrabold">→ {ask}</p>
                              <CodeBlock code={code} lang={p.lang} />
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

          {theory.length > 0 && (
            <section id={`${labId}-theory`} aria-labelledby={`${labId}-theory-h`} className="scroll-mt-6">
              <h2 id={`${labId}-theory-h`} className="border-b-2 border-border pb-2 text-2xl font-extrabold sm:text-3xl">
                {labId === "daa" ? "Theory: complexity classes" : "Theory: formulas and commands"}
              </h2>
              {links.length > 0 && (
                <div className="mt-6">
                  <Label icon={<BookOpen className="size-4 text-primary" />}>Watch and read</Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {links.map((r) => (
                      <a key={r.href} href={r.href} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-3 p-3 hover:border-(--ds-accent)">
                        {r.kind === "video" ? <PlayCircle className="size-8 shrink-0 text-danger" /> : <BookOpen className="size-8 shrink-0 text-primary" />}
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold leading-snug">{r.label}</span>
                          <span className="block text-xs text-secondary-fg">{r.by}</span>
                        </span>
                        <ExternalLink className="size-4 shrink-0 text-secondary-fg" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {labId === "os" && (
                <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {shellSyntax.map((x) => (
                    <div key={x.title} className="flex min-w-0 flex-col gap-1.5">
                      <p className="text-sm font-extrabold">{x.title}</p>
                      <CodeBlock code={x.code} lang="bash" />
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6">
                <Theory blocks={theory} />
              </div>
            </section>
          )}

          <section id={`${labId}-viva`} aria-labelledby={`${labId}-viva-h`} className="scroll-mt-6">
            <h2 id={`${labId}-viva-h`} className="border-b-2 border-border pb-2 text-2xl font-extrabold sm:text-3xl">
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
