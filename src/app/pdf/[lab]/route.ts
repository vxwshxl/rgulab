import { LAB_IDS, type LabId } from "@/data/labs";
import { pdfFileName, quickPdf } from "@/lib/quick-pdf";

export function generateStaticParams() {
  return LAB_IDS.map((lab) => ({ lab }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ lab: string }> }) {
  const { lab } = await params;
  if (!(LAB_IDS as readonly string[]).includes(lab)) return new Response("Not found", { status: 404 });
  const bytes = await quickPdf(lab as LabId);
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdfFileName(lab as LabId)}"`,
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
