"use client";

import { BookOpen, Crown, Flame, GraduationCap, House, MessageCircleQuestion, Monitor, Moon, Sun, Terminal, Volume2, VolumeX, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Logo } from "./logo";
import { labs, type LabId } from "@/data/labs";
import { useLiveStreak, useProgress } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Tooltip } from "./ui/tooltip";

const navFor = (lab: LabId) => [
  { href: `/${lab}`, label: "Learn", icon: House, exact: true },
  { href: `/${lab}/simulator`, label: "Simulator", icon: Terminal },
  { href: `/${lab}/exam`, label: "Exam mode", icon: GraduationCap },
  { href: `/${lab}/viva`, label: "Viva prep", icon: MessageCircleQuestion },
  { href: `/${lab}/cheatsheet`, label: "Cheatsheet", icon: BookOpen },
];

const noop = () => () => {};
/** false during SSR and hydration, true afterwards: gates values read from localStorage. */
export function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}

export function ThemeToggle({ compact }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const opts = [
    { v: "light", icon: Sun, label: "Light" },
    { v: "dark", icon: Moon, label: "Dark" },
    { v: "system", icon: Monitor, label: "System" },
  ] as const;
  return (
    <div role="radiogroup" aria-label="Colour theme" className="flex gap-1 rounded-xl border-2 border-border p-1">
      {opts.map(({ v, icon: Icon, label }) => (
        <button
          key={v}
          role="radio"
          aria-checked={mounted && theme === v}
          aria-label={label}
          onClick={() => setTheme(v)}
          className={cn("flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-bold text-secondary-fg", mounted && theme === v && "bg-accent-subtle text-primary")}
        >
          <Icon className="size-4" />
          {!compact && label}
        </button>
      ))}
    </div>
  );
}

export function SoundToggle() {
  const sound = useProgress((s) => s.sound);
  const toggle = useProgress((s) => s.toggleSound);
  const mounted = useMounted();
  const on = !mounted || sound;
  return (
    <button onClick={toggle} aria-label={on ? "Mute sounds" : "Turn sounds on"} className="flex size-11 items-center justify-center rounded-xl text-secondary-fg hover:bg-muted">
      {on ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
    </button>
  );
}

export function Stats({ className, lab }: { className?: string; lab?: LabId }) {
  const streak = useLiveStreak();
  const xp = useProgress((s) => s.xp);
  const crowns = useProgress((s) =>
    Object.entries(s.crowns)
      .filter(([k]) => !lab || k.startsWith(`${lab}:`))
      .reduce((a, [, b]) => a + b, 0),
  );
  const mounted = useMounted();
  return (
    <div className={cn("flex items-center gap-4 text-sm font-extrabold", className)}>
      <Tooltip label="Day streak" side="bottom">
        <span tabIndex={0} aria-label={`Day streak ${mounted ? streak : 0}`} className={cn("flex items-center gap-1.5 rounded-md", mounted && streak ? "text-streak" : "text-locked-fg")}>
          <Flame className="size-5" fill={mounted && streak ? "currentColor" : "none"} /> {mounted ? streak : 0}
        </span>
      </Tooltip>
      <Tooltip label="Total XP" side="bottom">
        <span tabIndex={0} aria-label={`Total XP ${mounted ? xp : 0}`} className="flex items-center gap-1.5 rounded-md text-xp">
          <Zap className="size-5" fill="currentColor" /> {mounted ? xp : 0}
        </span>
      </Tooltip>
      <Tooltip label={lab ? "Crowns in this lab" : "Crowns"} side="bottom" align="end">
        <span tabIndex={0} aria-label={`Crowns ${mounted ? crowns : 0}`} className="flex items-center gap-1.5 rounded-md text-gold-ledge dark:text-gold">
          <Crown className="size-5" fill="currentColor" /> {mounted ? crowns : 0}
        </span>
      </Tooltip>
    </div>
  );
}

/** DS / OS / DAA switcher. Keeps you on the same section when you switch. */
export function LabSwitcher({ current, className }: { current: LabId; className?: string }) {
  const path = usePathname();
  const seg = path.split("/")[2];
  const section = seg && ["simulator", "exam", "viva", "cheatsheet"].includes(seg) ? `/${seg}` : "";
  return (
    <nav aria-label="Switch lab" className={cn("grid grid-cols-3 gap-1 rounded-2xl border-2 border-border p-1", className)}>
      {labs.map((l) => {
        const on = l.id === current;
        return (
          <Link
            key={l.id}
            href={`/${l.id}${section}`}
            aria-current={on ? "page" : undefined}
            className={cn("flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-extrabold tracking-wide", on ? "text-white" : "text-secondary-fg hover:bg-muted")}
            style={on ? { background: `var(--ds-hue-${l.hue})` } : undefined}
          >
            <span className="size-2 rounded-full" style={{ background: on ? "white" : `var(--ds-hue-${l.hue})` }} />
            {l.short}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ lab, children }: { lab: LabId; children: React.ReactNode }) {
  const path = usePathname();
  const nav = navFor(lab);
  const active = (href: string, exact?: boolean) => (exact ? path === href || path.startsWith(`${href}/program`) : path.startsWith(href));

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r-2 border-border px-4 py-6 lg:flex">
        <Link href="/" className="mb-6 px-3" aria-label="rguLAB home">
          <Logo />
        </Link>
        <LabSwitcher current={lab} className="mb-6" />
        <nav className="flex flex-col gap-1.5" aria-label="Main">
          {nav.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              aria-current={active(href, exact) ? "page" : undefined}
              className={cn(
                "flex h-12 items-center gap-4 rounded-xl border-2 border-transparent px-3 text-sm font-extrabold uppercase tracking-wide text-secondary-fg hover:bg-muted",
                active(href, exact) && "border-(--ds-accent) bg-accent-subtle text-primary hover:bg-accent-subtle",
              )}
            >
              <Icon className="size-6" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-2">
          <div className="flex-1">
            <ThemeToggle compact />
          </div>
          <SoundToggle />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b-2 border-border bg-background/95 px-4 py-2 backdrop-blur lg:hidden">
          <div className="flex h-10 items-center justify-between">
            <Link href="/" aria-label="rguLAB home">
              <Logo compact />
            </Link>
            <Stats lab={lab} />
          </div>
          <LabSwitcher current={lab} className="mt-2" />
        </header>
        <main className="flex-1 pb-24 lg:pb-0">{children}</main>
        <nav aria-label="Sections" className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch justify-around border-t-2 border-border bg-background lg:hidden">
          {nav.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active(href, exact) ? "page" : undefined}
              className={cn("my-2 flex min-w-14 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-bold text-secondary-fg", active(href, exact) && "bg-accent-subtle text-primary")}
            >
              <Icon className="size-6" />
              {label.split(" ")[0]}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
