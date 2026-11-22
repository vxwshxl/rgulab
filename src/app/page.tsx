import { Dices, MessageCircleQuestion, Sparkles, Terminal } from "lucide-react";
import { LabCards } from "@/components/lab-cards";
import { Logo } from "@/components/logo";
import { Mascot } from "@/components/mascot";
import { SoundToggle, Stats, ThemeToggle } from "@/components/shell";
import { labs } from "@/data/labs";
import { abs, ld, SITE } from "@/lib/site";

const FEATURES = [
  { icon: Sparkles, title: "Bite-sized lessons", text: "Fill-the-blank, put lines in order, import quizzes and recall mode, built from your own lab programs." },
  { icon: Terminal, title: "Real simulators", text: "Python with plots, a bash terminal and real C compiled to WebAssembly. Nothing to install." },
  { icon: Dices, title: "Mock exams", text: "Draw a random program, beat the timer, then diff your code against the answer." },
  { icon: MessageCircleQuestion, title: "Viva prep", text: "Subject theory banks and program-specific questions with short, say-it-out-loud answers." },
];

export default function Home() {
  const structured = [
    { "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: abs("/"), description: SITE.description, inLanguage: "en" },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: SITE.name,
      url: abs("/"),
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any (web browser)",
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      featureList: ["Duolingo-style lessons", "In-browser Python, bash and C simulators", "Timed mock lab exams", "Viva questions with answers"],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: labs.map((l, i) => ({ "@type": "ListItem", position: i + 1, name: `${l.name}: ${l.subject}`, url: abs(`/${l.id}`) })),
    },
  ];
  return (
    <div className="min-h-dvh">
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(structured)} />
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-3">
          <Stats className="hidden sm:flex" />
          <div className="hidden w-40 md:block">
            <ThemeToggle compact />
          </div>
          <SoundToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <section className="flex flex-col items-center gap-6 py-10 text-center sm:py-16">
          <Mascot mood="cheer" className="size-28 animate-float sm:size-32" />
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Ace every lab exam, <span className="text-primary">one streak at a time.</span>
          </h1>
          <p className="max-w-xl text-lg text-secondary-fg">
            rguLAB turns your DS, OS and DAA lab programs into lessons, live simulators, mock exams and viva drills.
          </p>
        </section>

        <LabCards />

        <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="What's inside">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-5">
              <span className="mb-3 grid size-11 place-items-center rounded-xl bg-accent-subtle text-primary">
                <Icon className="size-6" />
              </span>
              <h2 className="text-base font-extrabold">{title}</h2>
              <p className="mt-1 text-sm text-secondary-fg">{text}</p>
            </div>
          ))}
        </section>

        <footer className="mt-16 border-t-2 border-border pt-6 text-center text-sm text-secondary-fg">
          Built by students for lab exams. Progress stays in your browser, with no account needed. Not an official university site.
        </footer>
      </main>
    </div>
  );
}
