import { labs } from "@/data/labs";
import { abs, SITE } from "@/lib/site";

// llms.txt (https://llmstxt.org): a plain-text map of the site for AI answer engines.
export function GET() {
  const lines: string[] = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    "Every program page has the aim, the algorithm or recipe, the full source code, a sample input and output, and viva questions with answers. Each lab also has a subject-level viva bank and a cheatsheet.",
    "",
    `- [DS lab in 90 minutes](${abs("/quick")}): one-page revision of all 29 DS record programs with plain-English explanations, code, outputs, imports, common errors and viva answers`,
    "",
  ];
  for (const l of labs) {
    lines.push(`## ${l.name}: ${l.subject}`, "", `${l.tagline}. Runtime: ${l.runtime}.`, "");
    lines.push(`- [${l.name} viva questions and answers](${abs(`/${l.id}/viva`)}): ${l.viva.length} subject questions with model answers`);
    lines.push(`- [${l.name} cheatsheet](${abs(`/${l.id}/cheatsheet`)})`);
    lines.push(`- [${l.name} online simulator](${abs(`/${l.id}/simulator`)})`);
    for (const p of l.programs) lines.push(`- [${l.short} ${p.id}: ${p.title}](${abs(`/${l.id}/program/${p.id}`)}): ${p.aim}`);
    lines.push("");
  }
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
