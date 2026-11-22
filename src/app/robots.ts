import type { MetadataRoute } from "next";
import { abs } from "@/lib/site";

// Search engines and AI answer engines are all welcome: the content is study material.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/*/lesson/"] },
      { userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended", "CCBot"], allow: "/" },
    ],
    sitemap: abs("/sitemap.xml"),
    host: abs("/"),
  };
}
