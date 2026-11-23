"use client";

import { useRouter } from "next/navigation";
import { Select } from "./ui/select";
import { labs, type LabId } from "@/data/labs";
import { quickHref } from "@/lib/site";

/** Dropdown to jump between the DS / OS / DAA code + viva pages. */
export function QuickLabSwitch({ current }: { current: LabId }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-extrabold uppercase tracking-wide text-secondary-fg">Lab</span>
      <Select
        label="Switch lab"
        align="end"
        className="w-64 max-w-[calc(100vw-6rem)]"
        value={current}
        onChange={(v) => router.push(quickHref(v))}
        options={labs.map((l) => ({ value: l.id, label: `${l.name} · ${l.subject}`, hint: `${l.programs.filter((p) => p.record).length}` }))}
      />
    </div>
  );
}
