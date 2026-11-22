import { notFound } from "next/navigation";
import { getLab, LAB_IDS } from "@/data/labs";

export function generateStaticParams() {
  return LAB_IDS.map((lab) => ({ lab }));
}

export default async function FocusLayout({ children, params }: LayoutProps<"/[lab]">) {
  const { lab } = await params;
  if (!getLab(lab)) notFound();
  return <div className={`lab-${lab} min-h-dvh`}>{children}</div>;
}
