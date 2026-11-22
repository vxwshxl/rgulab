import { LabFrame } from "@/components/lab-frame";
import { LAB_IDS } from "@/data/labs";

export function generateStaticParams() {
  return LAB_IDS.map((lab) => ({ lab }));
}

export default function FocusLayout({ children }: LayoutProps<"/[lab]">) {
  return <LabFrame>{children}</LabFrame>;
}
