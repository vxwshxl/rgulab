"use client";

import { useRouter } from "next/navigation";
import { Select } from "./ui/select";
import { labs, type LabId } from "@/data/labs";
import { quickHref } from "@/lib/site";

/** Dropdown to jump between the DS / OS / DAA code + viva pages. */
export function QuickLabSwitch({ current }: { current: LabId }) {
  const router = useRouter();
  return (
    <div className="w-full">
      <Select
        label="Switch lab"
        className="w-full"
        value={current}
        onChange={(v) => router.push(quickHref(v))}
        options={labs.map((l) => ({ value: l.id, label: l.name, hint: `${l.subject} · ${l.programs.filter((p) => p.record).length}` }))}
      />
    </div>
  );
}
