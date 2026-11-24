"use client";

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type IndexItem = { id: string; title: string; group: string; text: string };

export type IndexExtra = { href: string; short: string; label: string };
type Props = { items: IndexItem[]; prefix: string; extras: IndexExtra[] };

function useFilter(items: IndexItem[], q: string) {
  return useMemo(() => {
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return items;
    return items.filter((it) => {
      const hay = `${it.id} ${Number(it.id)} ${it.title} ${it.group} ${it.text}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [items, q]);
}

/** Which program card is currently in the reading zone, plus whether the inline index is on screen. */
function useCurrent(items: IndexItem[], prefix: string) {
  const [current, setCurrent] = useState<string | null>(null);
  const [indexVisible, setIndexVisible] = useState(true);
  useEffect(() => {
    const cards = items.map((it) => document.getElementById(`${prefix}-p${it.id}`)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id.slice(prefix.length + 2));
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    cards.forEach((c) => io.observe(c));
    const idx = document.getElementById(`${prefix}-find`);
    const io2 = new IntersectionObserver(([e]) => setIndexVisible(!!e?.isIntersecting));
    if (idx) io2.observe(idx);
    return () => {
      io.disconnect();
      io2.disconnect();
    };
  }, [items, prefix]);
  return { current, indexVisible };
}

function Row({ it, href, active, selected, onPick }: { it: IndexItem; href: string; active?: boolean; selected?: boolean; onPick: () => void }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onPick();
      }}
      data-selected={selected || undefined}
      className={cn("flex min-h-11 items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-accent-subtle", selected && "bg-accent-subtle", active && "ring-2 ring-(--ds-accent)")}
    >
      <span className="grid h-8 min-w-10 shrink-0 place-items-center rounded-md bg-muted font-mono text-sm font-extrabold text-primary">{it.id}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold">{it.title}</span>
        <span className="block truncate text-xs text-secondary-fg">{it.group}</span>
      </span>
    </a>
  );
}

/** Searchable program index, floating program rail with prev/next, and a Find popup. */
export function QuickIndex({ items, prefix, extras }: Props) {
  const [q, setQ] = useState("");
  const hits = useFilter(items, q);
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { current, indexVisible } = useCurrent(items, prefix);
  const pos = current ? items.findIndex((it) => it.id === current) : -1;

  const go = (id: string) => {
    document.getElementById(`${prefix}-p${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${prefix}-p${id}`);
  };
  const step = (d: number) => {
    const next = items[Math.min(items.length - 1, Math.max(0, (pos < 0 ? -1 : pos) + d))];
    if (next) go(next.id);
  };

  // "/" or Ctrl/Cmd+K opens Find; Alt+↑/↓ (or [ ]) moves between programs.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if ((e.key === "/" && !typing) || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setOpen(true);
      } else if (!typing && !open && (e.key === "]" || (e.altKey && e.key === "ArrowDown"))) {
        e.preventDefault();
        step(1);
      } else if (!typing && !open && (e.key === "[" || (e.altKey && e.key === "ArrowUp"))) {
        e.preventDefault();
        step(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const railRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    railRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: "nearest" });
  }, [current]);

  const showFloat = !indexVisible;

  return (
    <>
      {/* Inline index at the top of the page */}
      <nav id={`${prefix}-find`} aria-label="Find a program" className="card scroll-mt-4 p-3 sm:p-4">
        <div className="flex">
          <SearchBox q={q} setQ={setQ} onEnter={() => hits[0] && go(hits[0].id)} />
        </div>
        <ul className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {hits.map((it, i) => (
            <li key={it.id} className={cn(!showAll && !q.trim() && i >= 6 && "hidden sm:block")}>
              <Row it={it} href={`#${prefix}-p${it.id}`} selected={i === 0 && q.trim().length > 0} onPick={() => go(it.id)} />
            </li>
          ))}
          {!showAll && !q.trim() && hits.length > 6 && (
            <li className="sm:hidden">
              <button type="button" onClick={() => setShowAll(true)} className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border-2 border-border text-xs font-extrabold uppercase tracking-wide text-primary">
                Show all {hits.length} programs <ChevronDown className="size-4" />
              </button>
            </li>
          )}
          {hits.length === 0 && <li className="px-2 py-4 text-sm text-secondary-fg">No program matches “{q}”.</li>}
          {!q.trim() && <ExtraRows extras={extras} />}
        </ul>
      </nav>

      {/* Left rail (wide screens): every program number, current one highlighted, title on hover */}
      <aside
        aria-label="Programs"
        className={cn(
          "fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-1 rounded-2xl border-2 border-border bg-elevated p-1.5 shadow-e2 transition-opacity duration-200 xl:flex",
          showFloat ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <RailButton label="Previous program" onClick={() => step(-1)} disabled={pos <= 0}>
          <ChevronUp className="size-5" />
        </RailButton>
        <ol ref={railRef} className="flex max-h-[62vh] flex-col gap-1 overflow-y-auto px-0.5 [scrollbar-width:none]">
          {items.map((it) => {
            const on = it.id === current;
            return (
              <li key={it.id} className="group/rail relative">
                <a
                  href={`#${prefix}-p${it.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    go(it.id);
                  }}
                  aria-current={on || undefined}
                  aria-label={`Program ${it.id}: ${it.title}`}
                  className={cn("grid h-8 w-10 place-items-center rounded-lg font-mono text-xs font-extrabold", on ? "bg-primary text-primary-foreground" : "text-secondary-fg hover:bg-muted hover:text-foreground")}
                >
                  {it.id}
                </a>
              </li>
            );
          })}
        </ol>
        <RailButton label="Next program" onClick={() => step(1)} disabled={pos >= items.length - 1}>
          <ChevronDown className="size-5" />
        </RailButton>
      </aside>
      {/* Hover preview for the rail: rendered outside the scrolling list so it isn't clipped */}
      <RailPreview items={items} prefix={prefix} />

      {/* Bottom pill (smaller screens): ‹ current › — tap the number for the list */}
      <div
        className={cn(
          "fixed bottom-5 left-4 z-40 flex h-12 items-center rounded-2xl border-2 border-border bg-elevated shadow-e2 transition-opacity duration-200 xl:hidden",
          showFloat ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <button type="button" onClick={() => step(-1)} disabled={pos <= 0} aria-label="Previous program" className="grid h-full w-11 place-items-center text-primary disabled:opacity-35">
          <ChevronLeft className="size-6" />
        </button>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open program list" className="flex h-full min-w-16 flex-col items-center justify-center border-x-2 border-border px-2 leading-none">
          <span className="font-mono text-base font-extrabold">{current ?? items[0]?.id}</span>
          <span className="mt-0.5 text-[10px] font-bold text-secondary-fg">
            {pos + 1 > 0 ? pos + 1 : 1}/{items.length}
          </span>
        </button>
        <button type="button" onClick={() => step(1)} disabled={pos >= items.length - 1} aria-label="Next program" className="grid h-full w-11 place-items-center text-primary disabled:opacity-35">
          <ChevronRight className="size-6" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ledge fixed bottom-5 right-5 z-40 flex h-12 items-center gap-2 rounded-2xl bg-primary px-4 text-sm font-extrabold uppercase tracking-wide text-primary-foreground [--ledge:var(--ds-accent-ledge)]"
      >
        <Search className="size-5" /> Find
      </button>

      {open && <FindPopup items={items} prefix={prefix} extras={extras} current={current} onClose={() => setOpen(false)} onPick={(id) => go(id)} />}
    </>
  );
}

function RailButton({ children, label, onClick, disabled }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} className="grid h-9 w-10 place-items-center rounded-lg text-primary hover:bg-accent-subtle disabled:opacity-35 disabled:hover:bg-transparent">
      {children}
    </button>
  );
}

/** Floating title preview next to the rail number under the pointer. */
function RailPreview({ items, prefix }: { items: IndexItem[]; prefix: string }) {
  const [tip, setTip] = useState<{ title: string; id: string; y: number } | null>(null);
  useEffect(() => {
    const onOver = (e: PointerEvent) => {
      const a = (e.target as Element | null)?.closest?.(`aside[aria-label="Programs"] a[href^="#${prefix}-p"]`);
      if (!a) return setTip(null);
      const id = a.getAttribute("href")!.slice(prefix.length + 3);
      const it = items.find((x) => x.id === id);
      const r = a.getBoundingClientRect();
      setTip(it ? { title: it.title, id, y: r.top + r.height / 2 } : null);
    };
    window.addEventListener("pointerover", onOver);
    return () => window.removeEventListener("pointerover", onOver);
  }, [items, prefix]);
  if (!tip) return null;
  return (
    <div role="tooltip" className="pointer-events-none fixed left-[76px] z-50 hidden -translate-y-1/2 animate-pop rounded-lg bg-foreground px-3 py-1.5 text-sm font-bold text-background shadow-e2 xl:block" style={{ top: tip.y }}>
      <span className="font-mono opacity-70">{tip.id}</span> · {tip.title}
    </div>
  );
}

function SearchBox({ q, setQ, onEnter, onKeyDown, autoFocus }: { q: string; setQ: (v: string) => void; onEnter: () => void; onKeyDown?: (e: React.KeyboardEvent) => void; autoFocus?: boolean }) {
  return (
    <label className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-xl border-2 border-border bg-background px-3 focus-within:border-(--ds-accent)">
      <Search className="size-5 shrink-0 text-secondary-fg" />
      <input
        autoFocus={autoFocus}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented) return;
          if (e.key === "Enter") {
            e.preventDefault();
            onEnter();
          } else if (e.key === "Escape" && q) {
            e.stopPropagation();
            setQ("");
          }
        }}
        placeholder="Search by number, name or keyword…"
        aria-label="Search programs"
        className="h-full min-w-0 flex-1 bg-transparent text-base font-bold outline-none placeholder:font-medium placeholder:text-secondary-fg"
      />
      {q && (
        <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="grid size-8 place-items-center rounded-lg text-secondary-fg hover:bg-muted">
          <X className="size-4" />
        </button>
      )}
    </label>
  );
}

/** Modal program picker: search, ↑/↓ to move, Enter to jump, Esc or outside click to close. */
function FindPopup({ items, prefix, extras, current, onClose, onPick }: { items: IndexItem[]; prefix: string; extras: IndexExtra[]; current: string | null; onClose: () => void; onPick: (id: string) => void }) {
  const [q, setQ] = useState("");
  const hits = useFilter(items, q);
  const [sel, setSel] = useState(() => Math.max(0, items.findIndex((it) => it.id === current)));
  const list = useRef<HTMLUListElement>(null);
  const selected = Math.min(sel, Math.max(0, hits.length - 1));

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    list.current?.querySelector("[data-selected]")?.scrollIntoView({ block: "nearest" });
  }, [selected, q]);

  const pick = (id: string) => {
    // Unlock scrolling first, otherwise the smooth scroll is swallowed while the popup unmounts.
    document.body.style.overflow = "";
    onClose();
    setTimeout(() => onPick(id), 30);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 px-3 pt-[8vh] backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Find a program" className="card flex max-h-[80vh] w-full max-w-xl animate-pop flex-col overflow-hidden shadow-e3">
        <div className="flex items-center gap-2 border-b-2 border-border p-3">
          <SearchBox
            autoFocus
            q={q}
            setQ={(v) => {
              setQ(v);
              setSel(0);
            }}
            onEnter={() => hits[selected] && pick(hits[selected].id)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSel((s) => Math.min(hits.length - 1, s + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSel((s) => Math.max(0, s - 1));
              }
            }}
          />
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-12 shrink-0 place-items-center rounded-xl text-secondary-fg hover:bg-muted">
            <X className="size-6" />
          </button>
        </div>
        <ul ref={list} className="flex flex-col gap-1 overflow-y-auto p-2" aria-live="polite">
          {hits.map((it, i) => (
            <li key={it.id} onMouseEnter={() => setSel(i)}>
              <Row it={it} href={`#${prefix}-p${it.id}`} selected={i === selected} active={it.id === current} onPick={() => pick(it.id)} />
            </li>
          ))}
          {hits.length === 0 && <li className="px-3 py-6 text-center text-sm text-secondary-fg">No program matches “{q}”.</li>}
          {!q.trim() && <ExtraRows extras={extras} onClick={onClose} />}
        </ul>
        <p className="hidden border-t-2 border-border px-4 py-2 text-xs font-bold text-secondary-fg sm:block">↑ ↓ to move · Enter to open · Esc to close · [ ] for previous / next program</p>
      </div>
    </div>
  );
}

function ExtraRows({ extras, onClick }: { extras: IndexExtra[]; onClick?: () => void }) {
  return extras.map((x) => (
    <li key={x.href}>
      <a href={x.href} onClick={onClick} className="flex min-h-11 items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-accent-subtle">
        <span className="grid h-8 min-w-10 shrink-0 place-items-center rounded-md bg-muted px-1.5 text-xs font-extrabold text-primary">{x.short}</span>
        <span className="font-bold">{x.label}</span>
      </a>
    </li>
  ));
}
