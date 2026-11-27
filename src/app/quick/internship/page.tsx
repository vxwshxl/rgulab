import { AlertTriangle, BookOpen, Brain, Clock, ExternalLink, Lightbulb, ListChecks, Lock, MessageCircleQuestion, Mic, Newspaper, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/shell";
import { cn } from "@/lib/utils";
import { type Block, facts, glossary, type Module, modules, news, pitch, quiz, viva } from "./data";
import { Diagram } from "./diagrams";
import { Quiz } from "./quiz";

// Personal page: reachable only by its direct link. Kept out of search engines,
// the sitemap, the /quick index and llms.txt on purpose.
export const metadata: Metadata = {
  title: "Internship: learn + viva (personal)",
  description: "Personal study notes for the IITG-TIC internship: admin console, backend and database.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

/** **bold** and `code` inside plain strings. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") ? (
          <strong key={i} className="font-extrabold">{p.slice(2, -2)}</strong>
        ) : p.startsWith("`") ? (
          <code key={i} className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">{p.slice(1, -1)}</code>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
function blockWords(b: Block): number {
  switch (b.kind) {
    case "p": case "say": return words(b.text);
    case "tip": return words(b.title + " " + b.text);
    case "list": case "steps": return b.items.reduce((n, x) => n + words(x), 0);
    case "code": return words(b.code) * 0.6;
    case "table": return [b.head, ...b.rows].flat().reduce((n, x) => n + words(x), 0);
    case "check": return b.items.reduce((n, [q, a]) => n + words(q) + words(a), 0);
    case "diagram": return 90; // ~30 s to study a diagram
  }
}
const WPM = 170; // study pace, not skim pace
const moduleMinutes = (m: Module) => Math.max(2, Math.round((words(m.intro) + m.blocks.reduce((n, b) => n + blockWords(b), 0)) / WPM));
const newsMinutes = Math.round(news.reduce((n, x) => n + words([x.what, x.how, x.fix, x.lesson].join(" ")), 0) / WPM);
const vivaCount = viva.reduce((n, g) => n + g.items.length, 0);
const vivaMinutes = Math.round(viva.reduce((n, g) => n + g.items.reduce((k, [q, a]) => k + words(q) + words(a), 0), 0) / WPM) + 4; // + time to answer aloud
const quizMinutes = 6;
const pitchMinutes = 3;
const totalMinutes = pitchMinutes + modules.reduce((n, m) => n + moduleMinutes(m), 0) + newsMinutes + vivaMinutes + quizMinutes;

function Label({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-secondary-fg">
      {icon}
      {children}
    </p>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.kind) {
    case "p":
      return <p className="leading-relaxed"><Rich text={b.text} /></p>;
    case "list":
      return (
        <ul className="flex flex-col gap-2">
          {b.items.map((x) => (
            <li key={x} className="flex gap-2 leading-snug">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              <span><Rich text={x} /></span>
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className="flex flex-col gap-2">
          {b.items.map((x, i) => (
            <li key={x} className="flex gap-3 leading-snug">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">{i + 1}</span>
              <span><Rich text={x} /></span>
            </li>
          ))}
        </ol>
      );
    case "code":
      return (
        <div>
          {b.label && <p className="mb-1.5 text-sm font-extrabold">{b.label}</p>}
          <pre className="code-surface overflow-x-auto whitespace-pre p-4 text-[12.5px] leading-relaxed">{b.code}</pre>
        </div>
      );
    case "table":
      return (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs font-extrabold uppercase tracking-wider text-secondary-fg">
              <tr>{b.head.map((h, i) => <th key={i} className="px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y-2 divide-border">
              {b.rows.map((r) => (
                <tr key={r.join("|")}>
                  {r.map((c, i) => (
                    <td key={i} className={cn("px-4 py-2.5 align-top leading-snug", i === 0 && "font-bold")}><Rich text={c} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "diagram":
      return (
        <figure className="card overflow-hidden">
          <div className="overflow-x-auto p-3 sm:p-4">
            <div className="min-w-[640px]"><Diagram id={b.id} /></div>
          </div>
          <figcaption className="border-t-2 border-border bg-muted px-4 py-2 text-sm font-bold text-secondary-fg">{b.caption}</figcaption>
        </figure>
      );
    case "tip":
      return (
        <div className="rounded-xl border-2 border-(--ds-accent) bg-(--ds-accent-subtle) px-4 py-3">
          <p className="flex items-center gap-1.5 font-extrabold"><Lightbulb className="size-4 text-primary" />{b.title}</p>
          <p className="mt-1 leading-snug"><Rich text={b.text} /></p>
        </div>
      );
    case "say":
      return (
        <div className="flex gap-3 rounded-xl bg-muted px-4 py-3">
          <Mic className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="leading-snug"><span className="font-extrabold">Say it like this: </span><Rich text={b.text} /></p>
        </div>
      );
    case "check":
      return (
        <div>
          <Label icon={<Brain className="size-4 text-primary" />}>Check yourself (tap to reveal)</Label>
          <div className="flex flex-col gap-2">
            {b.items.map(([q, a]) => <Reveal key={q} q={q} a={a} />)}
          </div>
        </div>
      );
  }
}

function Reveal({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl border-2 border-border bg-elevated px-4 py-3 open:border-(--ds-accent)">
      <summary className="cursor-pointer list-none font-extrabold leading-snug marker:hidden">
        <span className="text-primary">Q. </span><Rich text={q} />
      </summary>
      <p className="mt-2 leading-snug"><span className="font-extrabold text-primary">A. </span><Rich text={a} /></p>
    </details>
  );
}

function SectionTitle({ id, icon, title, minutes }: { id: string; icon: React.ReactNode; title: string; minutes?: number }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-border pb-2">
      <h2 id={id} className="flex items-center gap-2 text-2xl font-extrabold sm:text-3xl">{icon}{title}</h2>
      {minutes !== undefined && <span className="flex items-center gap-1 text-sm font-bold text-secondary-fg"><Clock className="size-4" />~{minutes} min</span>}
    </div>
  );
}

export default function InternshipPage() {
  const toc = [
    { href: "#pitch", label: "The 60-second pitch", min: pitchMinutes },
    ...modules.map((m, i) => ({ href: `#${m.id}`, label: `${i + 1}. ${m.title}`, min: moduleMinutes(m) })),
    { href: "#news", label: "Up to date: what just happened", min: newsMinutes },
    { href: "#viva", label: `Viva bank (${vivaCount} questions)`, min: vivaMinutes },
    { href: "#quiz", label: "Self-test quiz", min: quizMinutes },
    { href: "#glossary", label: "Glossary", min: undefined },
  ];

  return (
    <div className="min-h-dvh bg-(--ds-bg)">
      <header className="sticky top-0 z-20 border-b-2 border-border bg-(--ds-bg)/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo compact />
            <span className="hidden items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider text-secondary-fg sm:flex">
              <Lock className="size-3.5" /> Personal · link only
            </span>
          </div>
          <ThemeToggle compact />
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-14 px-4 pb-24 pt-8">
        <section className="flex flex-col gap-5">
          <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Internship · learn + viva + up to date</p>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
            IITG-TIC admin console, backend &amp; database
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-secondary-fg">
            Everything I built at the IIT Guwahati Technology Incubation Centre, explained from first principles, with diagrams, the questions
            examiners ask, and the security news of the last few weeks tied back to my own design.
          </p>
          <div className="flex flex-wrap gap-2 text-sm font-extrabold">
            <span className="flex items-center gap-1.5 rounded-full bg-(--ds-accent-subtle) px-3 py-1.5"><Clock className="size-4 text-primary" />about {totalMinutes} minutes in total</span>
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5"><BookOpen className="size-4" />{modules.length} modules</span>
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5"><MessageCircleQuestion className="size-4" />{vivaCount} viva Q&amp;A</span>
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5"><Newspaper className="size-4" />{news.length} recent events</span>
          </div>

          <nav aria-label="Contents" className="card p-4">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-secondary-fg">Contents · read top to bottom once, then use the viva bank and quiz</p>
            <ol className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {toc.map((t) => (
                <li key={t.href}>
                  <a href={t.href} className="flex items-baseline justify-between gap-3 rounded-lg px-2 py-1 font-bold hover:bg-muted">
                    <span>{t.label}</span>
                    {t.min !== undefined && <span className="shrink-0 text-xs text-secondary-fg">{t.min} min</span>}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </section>

        <section aria-labelledby="pitch" className="flex scroll-mt-20 flex-col gap-5">
          <SectionTitle id="pitch" icon={<Mic className="size-7 text-primary" />} title="The 60-second pitch" minutes={pitchMinutes} />
          <div className="flex flex-col gap-3 rounded-2xl bg-(--ds-accent-subtle) p-5 text-lg leading-relaxed">
            {pitch.map((p) => <p key={p}><Rich text={p} /></p>)}
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y-2 divide-border">
                {facts.map(([k, v]) => (
                  <tr key={k}>
                    <th className="w-40 bg-muted px-4 py-2.5 align-top text-xs font-extrabold uppercase tracking-wider text-secondary-fg">{k}</th>
                    <td className="px-4 py-2.5 leading-snug">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {modules.map((m, i) => (
          <section key={m.id} aria-labelledby={m.id} className="flex scroll-mt-20 flex-col gap-5">
            <SectionTitle id={m.id} icon={<span className="grid size-9 place-items-center rounded-xl bg-primary text-lg text-primary-foreground">{i + 1}</span>} title={m.title} minutes={moduleMinutes(m)} />
            <p className="text-secondary-fg italic">{m.intro}</p>
            {m.blocks.map((b, bi) => <BlockView key={bi} b={b} />)}
          </section>
        ))}

        <section aria-labelledby="news" className="flex scroll-mt-20 flex-col gap-5">
          <SectionTitle id="news" icon={<Newspaper className="size-7 text-primary" />} title="Up to date: what just happened" minutes={newsMinutes} />
          <p className="text-secondary-fg">
            Researched on 27 November 2026. Each item ends with the lesson for <strong>my</strong> project, which is what turns news into a strong viva
            answer. Early reports disagree on some numbers; the sources are linked so you can check.
          </p>
          <div className="flex flex-col gap-4">
            {news.map((n) => (
              <article key={n.id} id={n.id} className="card flex scroll-mt-20 flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-danger-subtle px-2.5 py-1 text-xs font-extrabold text-danger"><AlertTriangle className="size-3.5" />{n.tag}</span>
                  <span className="text-xs font-bold text-secondary-fg">{n.when}</span>
                </div>
                <h3 className="text-xl font-extrabold leading-snug">{n.title}</h3>
                <dl className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {([["What happened", n.what], ["How it works", n.how], ["Fix", n.fix], ["Lesson for my project", n.lesson]] as const).map(([k, v]) => (
                    <div key={k} className={cn("rounded-xl px-4 py-3", k === "Lesson for my project" ? "bg-(--ds-accent-subtle)" : "bg-muted")}>
                      <dt className="text-xs font-extrabold uppercase tracking-wider text-secondary-fg">{k}</dt>
                      <dd className="mt-1 leading-snug"><Rich text={v} /></dd>
                    </div>
                  ))}
                </dl>
                <div className="flex flex-wrap gap-2">
                  {n.sources.map((s) => (
                    <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full border-2 border-border px-2.5 py-1 text-xs font-bold hover:border-(--ds-accent)">
                      {s.label}<ExternalLink className="size-3" />
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="viva" className="flex scroll-mt-20 flex-col gap-5">
          <SectionTitle id="viva" icon={<MessageCircleQuestion className="size-7 text-primary" />} title="Viva bank" minutes={vivaMinutes} />
          <p className="text-secondary-fg">Read the question, answer it out loud, then open it to compare. Short, specific, with a number or an example from the project — that is what sounds confident.</p>
          {viva.map((g) => (
            <div key={g.topic} className="flex flex-col gap-2">
              <h3 className="text-lg font-extrabold">{g.topic}</h3>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {g.items.map(([q, a]) => <Reveal key={q} q={q} a={a} />)}
              </div>
            </div>
          ))}
        </section>

        <section aria-labelledby="quiz" className="flex scroll-mt-20 flex-col gap-5">
          <SectionTitle id="quiz" icon={<ListChecks className="size-7 text-primary" />} title="Self-test quiz" minutes={quizMinutes} />
          <Quiz items={quiz} />
        </section>

        <section aria-labelledby="glossary" className="flex scroll-mt-20 flex-col gap-5">
          <SectionTitle id="glossary" icon={<Sparkles className="size-7 text-primary" />} title="Glossary" />
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {glossary.map(([t, d]) => (
              <div key={t} className="rounded-xl bg-muted px-4 py-2.5">
                <dt className="font-extrabold">{t}</dt>
                <dd className="text-sm leading-snug text-secondary-fg">{d}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </div>
  );
}
