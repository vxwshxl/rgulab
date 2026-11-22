import { LabFrame } from "@/components/lab-frame";
import { LAB_IDS } from "@/data/labs";

export function generateStaticParams() {
  return LAB_IDS.map((lab) => ({ lab }));
}

export default function LabLayout({ children }: LayoutProps<"/[lab]">) {
  return <LabFrame shell>{children}</LabFrame>;
}
