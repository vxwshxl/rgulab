import { Check, Keyboard, Lightbulb, Terminal, X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/code-block";
import { ButtonLink } from "@/components/ui/button";
import { labMeta } from "@/lib/site";
import { getLab, type Lab } from "@/data/labs";
import { datasets, makeYourOwn, spyderKeys, spyderTips, titanicDrills } from "@/data/labs/cheatsheet-ds";
import { cSnippets, paradigms } from "@/data/labs/cheatsheet-daa";
import { linuxCmds, schedFormulas, shellSyntax, testOps } from "@/data/labs/cheatsheet-os";
import { importMap } from "@/lib/exercises";

export async function generateMetadata({ params }: PageProps<"/[lab]/cheatsheet">) {
  const { lab } = await params;
  const L = getLab(lab);
  if (!L) return {};
  const title = `${L.subject} lab cheatsheet`;
  const description =
    lab === "ds"
      ? "Which datasets work offline (sklearn, plotly, seaborn), how to make your own DataFrame, Titanic drills, an import map and Spyder shortcuts."
      : lab === "os"
        ? "Shell scripting syntax, test operators, Linux commands and CPU scheduling formulas on one page."
        : "Time complexity of every DAA lab algorithm, design paradigms and reusable C snippets.";
  return labMeta(lab, title, description, `/${lab}/cheatsheet`);
}

function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24">
      <h2 id={`${id}-h`} className="text-2xl font-extrabold">
        {title}
      </h2>
      {intro && <p className="mt-1 max-w-2xl text-secondary-fg">{intro}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Table({ rows, head }: { rows: [string, string][]; head: [string, string] }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-xs font-extrabold uppercase tracking-wider text-secondary-fg">
          <tr>
            <th className="px-4 py-3">{head[0]}</th>
            <th className="px-4 py-3">{head[1]}</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-border">
          {rows.map(([a, b]) => (
            <tr key={a}>
              <td className="px-4 py-3 font-mono text-[13px] font-bold">{a}</td>
              <td className="px-4 py-3 text-secondary-fg">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Nav({ items }: { items: [string, string][] }) {
  return (
    <nav aria-label="On this page" className="no-scrollbar -mx-4 mb-10 flex gap-2 overflow-x-auto px-4">
      {items.map(([id, label]) => (
        <a key={id} href={`#${id}`} className="flex h-10 shrink-0 items-center rounded-full border-2 border-border px-4 text-sm font-bold hover:bg-muted">
          {label}
        </a>
      ))}
    </nav>
  );
}

function DsSheet({ lab }: { lab: Lab }) {
  return (
    <>
      <Nav items={[["datasets", "Offline datasets"], ["own", "Make your own data"], ["titanic", "Titanic drills"], ["imports", "Import map"], ["spyder", "Spyder keys"]]} />
      <div className="flex flex-col gap-14">
        <Section id="datasets" title="Which datasets work offline?" intro="No internet in the exam. The built-ins below ship inside the packages; the red ones try to download and will fail.">
          <div className="card overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-xs font-extrabold uppercase tracking-wider text-secondary-fg">
                <tr>
                  <th className="px-4 py-3">Call</th>
                  <th className="px-4 py-3">What you get</th>
                  <th className="px-4 py-3">Offline?</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-border">
                {datasets.map((d) => (
                  <tr key={d.call}>
                    <td className="px-4 py-3 font-mono text-[13px] font-bold">{d.call}</td>
                    <td className="px-4 py-3">
                      {d.what}
                      {d.note && <span className="block text-xs text-secondary-fg">{d.note}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {d.offline ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle px-2.5 py-1 text-xs font-extrabold text-success">
                          <Check className="size-3.5" /> Works
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-danger-subtle px-2.5 py-1 text-xs font-extrabold text-danger">
                          <X className="size-3.5" /> Needs internet
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
        {[
          { id: "own", title: "Make your own data", intro: "When the question names a dataset that isn't on the system, type a small DataFrame like these (six to twelve rows is plenty).", list: makeYourOwn },
          { id: "titanic", title: "Titanic drills", intro: "If titanic.csv is provided, these cover the usual asks. The simulator has a practice titanic.csv with the same columns (synthetic rows).", list: titanicDrills },
        ].map((sec) => (
          <Section key={sec.id} id={sec.id} title={sec.title} intro={sec.intro}>
            <div className="grid gap-6">
              {sec.list.map((s) => (
                <div key={s.id} className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-extrabold">{s.title}</h3>
                      <p className="text-sm text-secondary-fg">{s.when}</p>
                    </div>
                    <ButtonLink href={`/${lab.id}/simulator?s=${s.id}`} variant="secondary" size="sm">
                      <Terminal className="size-4" /> Try it
                    </ButtonLink>
                  </div>
                  <CodeBlock code={s.code} />
                </div>
              ))}
            </div>
          </Section>
        ))}
        <Section id="imports" title="Import map" intro="Every import used across the 40 programs, grouped by module. Forgetting the module is the most common exam slip.">
          <div className="grid gap-3 sm:grid-cols-2">
            {importMap(lab).map((m) => (
              <div key={m.module} className="card p-4">
                <p className="font-mono text-sm font-bold text-primary">{m.module}</p>
                {m.names.length > 0 && <p className="mt-1 font-mono text-[13px] leading-6 text-secondary-fg">{m.names.join(", ")}</p>}
              </div>
            ))}
          </div>
        </Section>
        <Section id="spyder" title="Spyder survival kit">
          <Table rows={spyderKeys.map((k) => [k.keys, k.does])} head={["Keys", "Does"]} />
          <ul className="mt-4 flex flex-col gap-3">
            {spyderTips.map((t) => (
              <li key={t} className="flex gap-3 text-[15px] leading-relaxed">
                <Lightbulb className="mt-1 size-4 shrink-0 text-(--ds-warning)" /> {t}
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </>
  );
}

function OsSheet() {
  return (
    <>
      <Nav items={[["syntax", "Shell syntax"], ["tests", "Test operators"], ["linux", "Linux commands"], ["sched", "Scheduling formulas"], ["run", "Running scripts"]]} />
      <div className="flex flex-col gap-14">
        <Section id="syntax" title="Shell syntax in six cards">
          <div className="grid gap-4 md:grid-cols-2">
            {shellSyntax.map((s) => (
              <div key={s.title}>
                <h3 className="mb-2 font-extrabold">{s.title}</h3>
                <CodeBlock code={s.code} lang="bash" />
              </div>
            ))}
          </div>
        </Section>
        <Section id="tests" title="Test operators inside [ ]" intro="Spaces matter: [ $a -gt $b ] works, [$a -gt $b] does not.">
          <Table rows={testOps} head={["Operator", "Meaning"]} />
        </Section>
        <Section id="linux" title="Linux commands (program 30 and beyond)">
          <Table rows={linuxCmds} head={["Command", "What it does"]} />
        </Section>
        <Section id="sched" title="CPU scheduling formulas" intro="Programs 15 and 16 assume every process arrives at time 0.">
          <Table rows={schedFormulas} head={["Formula", "Meaning"]} />
        </Section>
        <Section id="run" title="Running in the lab">
          <CodeBlock lang="bash" code={"chmod +x 01_add.sh   # once\n./01_add.sh          # or: bash 01_add.sh\n\ngcc 15_fcfs.c -o fcfs\n./fcfs"} />
        </Section>
      </div>
    </>
  );
}

function DaaSheet({ lab }: { lab: Lab }) {
  return (
    <>
      <Nav items={[["complexity", "Complexity table"], ["paradigms", "Paradigms"], ["snippets", "C snippets"], ["run", "Compile & run"]]} />
      <div className="flex flex-col gap-14">
        <Section id="complexity" title="All 27 algorithms at a glance">
          <div className="card overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-xs font-extrabold uppercase tracking-wider text-secondary-fg">
                <tr>
                  <th className="px-3 py-3">#</th>
                  <th className="px-3 py-3">Algorithm</th>
                  <th className="px-3 py-3">Paradigm</th>
                  <th className="px-3 py-3">Best</th>
                  <th className="px-3 py-3">Average</th>
                  <th className="px-3 py-3">Worst</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-border font-mono text-[13px]">
                {lab.programs.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2.5 font-bold text-secondary-fg">{p.id}</td>
                    <td className="px-3 py-2.5 font-sans font-bold">
                      <Link href={`/${lab.id}/program/${p.id}`} className="hover:underline">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 font-sans text-secondary-fg">{p.complexity?.paradigm}</td>
                    <td className="px-3 py-2.5 text-success">{p.complexity?.best}</td>
                    <td className="px-3 py-2.5">{p.complexity?.avg}</td>
                    <td className="px-3 py-2.5 text-danger">{p.complexity?.worst}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
        <Section id="paradigms" title="Design paradigms">
          <div className="grid gap-3 sm:grid-cols-2">
            {paradigms.map((p) => (
              <div key={p.name} className="card p-4">
                <p className="font-extrabold text-primary">{p.name}</p>
                <p className="mt-1 text-sm">{p.idea}</p>
                <p className="mt-2 text-xs font-bold text-secondary-fg">{p.examples}</p>
              </div>
            ))}
          </div>
        </Section>
        <Section id="snippets" title="C snippets you reuse everywhere">
          <div className="grid gap-4 md:grid-cols-2">
            {cSnippets.map((s) => (
              <div key={s.title}>
                <h3 className="mb-2 font-extrabold">{s.title}</h3>
                <CodeBlock code={s.code} lang="c" />
              </div>
            ))}
          </div>
        </Section>
        <Section id="run" title="Compile & run" intro="clock() is coarse: on six numbers it reports almost 0 s. The comparison count is the honest measure.">
          <CodeBlock lang="bash" code={"gcc -o 05.out 05_insertion.c\n./05.out\n\n# all at once\nfor f in *.c; do gcc -o \"${f%.c}.out\" \"$f\"; done"} />
          <p className="mt-3 flex items-center gap-2 text-sm text-secondary-fg">
            <Keyboard className="size-4" /> Type the inputs on one line separated by spaces, e.g. 42 8 27 14 35 19.
          </p>
        </Section>
      </div>
    </>
  );
}

export default async function CheatsheetPage({ params }: PageProps<"/[lab]/cheatsheet">) {
  const { lab } = await params;
  const L = getLab(lab);
  if (!L) notFound();
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-10">
      <p className="text-xs font-extrabold uppercase tracking-widest text-secondary-fg">{L.subject}</p>
      <h1 className="mb-6 text-3xl font-extrabold">{L.short} cheatsheet</h1>
      {L.id === "ds" ? <DsSheet lab={L} /> : L.id === "os" ? <OsSheet /> : <DaaSheet lab={L} />}
    </div>
  );
}
