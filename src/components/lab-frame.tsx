"use client";

import { notFound, useParams } from "next/navigation";
import { AppShell } from "./shell";
import { getLab, type LabId } from "@/data/labs";
import { cn } from "@/lib/utils";

/**
 * Reads the lab from the URL on the client, so the [lab] layouts never await `params`
 * and navigations between labs stay instant.
 */
export function LabFrame({ children, shell = false }: { children: React.ReactNode; shell?: boolean }) {
  const { lab } = useParams<{ lab: string }>();
  if (!getLab(lab)) notFound();
  return <div className={cn(`lab-${lab}`, !shell && "min-h-dvh")}>{shell ? <AppShell lab={lab as LabId}>{children}</AppShell> : children}</div>;
}
