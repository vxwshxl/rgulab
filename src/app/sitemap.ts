import type { MetadataRoute } from "next";
import { labs } from "@/data/labs";
import { abs } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-11-22");
  return [
    { url: abs("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: abs("/quick"), lastModified: new Date("2026-11-23"), changeFrequency: "monthly", priority: 0.9 },
    ...labs.flatMap((l) => [
      { url: abs(`/${l.id}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
      { url: abs(`/${l.id}/viva`), lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
      { url: abs(`/${l.id}/cheatsheet`), lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
      { url: abs(`/${l.id}/simulator`), lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 },
      { url: abs(`/${l.id}/exam`), lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 },
      ...l.programs.map((p) => ({ url: abs(`/${l.id}/program/${p.id}`), lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
    ]),
  ];
}
