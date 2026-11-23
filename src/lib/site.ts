export const SITE = {
  name: "rguLAB",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://rgulab.vercel.app").replace(/\/$/, ""),
  title: "rguLAB · lab exam trainer for DS, OS and DAA",
  description:
    "Free Duolingo-style trainer for university lab exams: bite-sized lessons, in-browser simulators for Python, bash and C, timed mock exams and viva questions with answers for Data Science, Operating Systems and DAA labs.",
  keywords: [
    "lab exam practice",
    "data science lab programs",
    "python data science lab",
    "operating systems lab shell scripts",
    "bash shell script programs",
    "DAA lab programs in C",
    "design and analysis of algorithms lab",
    "viva questions and answers",
    "online python compiler with matplotlib",
    "online C compiler",
    "FCFS scheduling program in C",
    "scikit-learn programs",
    "B.Tech lab manual",
  ],
};

export const abs = (path = "/") => `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;

/** Serialise JSON-LD safely for a <script type="application/ld+json"> tag. */
export const ld = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });

/** Page metadata for a lab page, with the lab's OG banner attached. */
export function labMeta(lab: string, title: string, description: string, path: string, type: "website" | "article" = "website") {
  const images = [{ url: `/og/${lab}`, width: 1200, height: 630, alt: title }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type, siteName: SITE.name, images },
    twitter: { card: "summary_large_image" as const, title, description, images: images.map((i) => i.url) },
  };
}

/** The code + viva page for a lab: /quick is DS (the default), others live at /quick/<lab>. */
export const quickHref = (lab: string) => (lab === "ds" ? "/quick" : `/quick/${lab}`);
