"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type SelectOption = { value: string; label: string; hint?: string };
export type SelectGroup = { group: string; options: SelectOption[] };
type Item = SelectOption | SelectGroup;

const isGroup = (i: Item): i is SelectGroup => "group" in i;

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Item[];
  label: string;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  size?: "sm" | "md";
  align?: "start" | "end";
};

/** Custom listbox dropdown: keyboard (↑ ↓ Home End Enter Esc), type-to-filter, click-outside. */
export function Select({ value, onChange, options, label, placeholder = "Select…", searchable, className, size = "md", align = "start" }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [up, setUp] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const search = useRef<HTMLInputElement>(null);

  const flat = useMemo(() => options.flatMap((o) => (isGroup(o) ? o.options : [o])), [options]);
  const current = flat.find((o) => o.value === value);
  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      options
        .map((o) => (isGroup(o) ? { ...o, options: o.options.filter((x) => !q || x.label.toLowerCase().includes(q)) } : o))
        .filter((o) => (isGroup(o) ? o.options.length > 0 : !q || o.label.toLowerCase().includes(q))),
    [options, q],
  );
  const visibleFlat = useMemo(() => visible.flatMap((o) => (isGroup(o) ? o.options : [o])), [visible]);

  const openMenu = () => {
    const r = trigger.current?.getBoundingClientRect();
    if (r) setUp(window.innerHeight - r.bottom < 340 && r.top > window.innerHeight - r.bottom);
    setQuery("");
    setActive(Math.max(0, flat.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const close = (focus = true) => {
    setOpen(false);
    if (focus) trigger.current?.focus();
  };
  const choose = (v: string) => {
    onChange(v);
    close();
  };

  useEffect(() => {
    if (!open) return;
    (searchable ? search.current : list.current)?.focus();
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, searchable]);

  useEffect(() => {
    if (!open) return;
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(visibleFlat.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(visibleFlat.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const o = visibleFlat[active];
      if (o) choose(o.value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      close(false);
    }
  };

  let idx = -1;
  const renderOption = (o: SelectOption) => {
    idx++;
    const i = idx;
    const selected = o.value === value;
    return (
      <li
        key={o.value}
        id={`${id}-opt-${i}`}
        data-index={i}
        role="option"
        aria-selected={selected}
        onMouseEnter={() => setActive(i)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => choose(o.value)}
        className={cn(
          "flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold",
          i === active && "bg-muted",
          selected && "text-primary",
        )}
      >
        <span className="min-w-0 flex-1 truncate">{o.label}</span>
        {o.hint && <span className="shrink-0 text-xs font-medium text-secondary-fg">{o.hint}</span>}
        {selected && <Check className="size-4 shrink-0" strokeWidth={3} />}
      </li>
    );
  };

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            openMenu();
          }
        }}
        className={cn(
          "ledge flex w-full items-center gap-2 rounded-xl border-2 border-border bg-elevated px-3 text-left font-bold [--ledge:var(--ds-border)]",
          size === "sm" ? "h-9 text-xs" : "h-11 text-sm",
          open && "border-(--ds-accent)",
        )}
      >
        <span className={cn("min-w-0 flex-1 truncate", !current && "text-secondary-fg")}>{current?.label ?? placeholder}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-secondary-fg transition-transform duration-150", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 min-w-full animate-pop overflow-hidden rounded-2xl border-2 border-border bg-elevated text-left shadow-e3",
            up ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top",
            align === "end" ? "right-0" : "left-0",
            searchable && "w-80 max-w-[calc(100vw-2rem)]",
          )}
          onKeyDown={onKey}
        >
          {searchable && (
            <div className="flex items-center gap-2 border-b-2 border-border px-3">
              <Search className="size-4 shrink-0 text-secondary-fg" />
              <input
                ref={search}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder="Type to filter…"
                aria-label={`Filter ${label}`}
                aria-controls={`${id}-list`}
                aria-activedescendant={visibleFlat.length ? `${id}-opt-${active}` : undefined}
                className="h-11 min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:font-medium placeholder:text-secondary-fg"
              />
            </div>
          )}
          <ul
            ref={list}
            id={`${id}-list`}
            role="listbox"
            aria-label={label}
            tabIndex={-1}
            aria-activedescendant={visibleFlat.length ? `${id}-opt-${active}` : undefined}
            className="max-h-80 overflow-y-auto p-1.5 outline-none"
          >
            {visible.length === 0 && <li className="px-3 py-6 text-center text-sm text-secondary-fg">Nothing matches “{query}”</li>}
            {visible.map((o) =>
              isGroup(o) ? (
                <li key={o.group} role="presentation">
                  <p className="px-3 pb-1 pt-3 text-[11px] font-extrabold uppercase tracking-widest text-secondary-fg">{o.group}</p>
                  <ul role="group" aria-label={o.group}>
                    {o.options.map(renderOption)}
                  </ul>
                </li>
              ) : (
                renderOption(o)
              ),
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
