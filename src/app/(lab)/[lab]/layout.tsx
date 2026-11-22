import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell";
import { getLab, LAB_IDS, type LabId } from "@/data/labs";

export function generateStaticParams() {
  return LAB_IDS.map((lab) => ({ lab }));
}

export default async function LabLayout({ children, params }: LayoutProps<"/[lab]">) {
  const { lab } = await params;
  if (!getLab(lab)) notFound();
  return (
    <div className={`lab-${lab}`}>
      <AppShell lab={lab as LabId}>{children}</AppShell>
    </div>
  );
}
