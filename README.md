# rguLAB

A Duolingo-style trainer for university lab exams. It covers three labs, each with lessons, a live simulator, a timed mock exam and viva prep. There is no backend and no database: progress lives in the browser's `localStorage`.

| Lab | Programs | Runtime in the browser | Lab-specific output |
|-----|---------:|------------------------|---------------------|
| **DS**: Introduction to Data Science | 40 | Python 3.14 via Pyodide (numpy, pandas, scikit-learn, scipy, matplotlib, seaborn, plotly, networkx, nltk) | Spyder-style Plots pane, Files pane, `input()` support |
| **OS**: Operating Systems | 30 | bash via [just-bash](https://github.com/vercel-labs/just-bash), plus C for the two scheduling programs | Terminal window with echoed input, Gantt chart for FCFS and priority scheduling |
| **DAA**: Design & Analysis of Algorithms | 27 | Real C, precompiled to WebAssembly; edited code compiles in the browser with clang-for-wasm | Comparisons, `clock()` time and complexity cards, array bars |

## Run it

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm build && pnpm start
```

## How the content is built

The lab programs live in `content/<lab>/`, copied from `~/Programs/{DS,OS,DAA} LAB`. Running

```bash
pnpm labs:sync      # copy fresh sources from ~/Programs, then rebuild
pnpm labs           # rebuild from content/ only
```

parses each file into its aim, algorithm, code and recorded output, and writes `src/data/labs/<lab>.gen.json`. For C and bash programs it also **rebuilds the sample keyboard input from the recorded transcript and verifies it by running the program**: 56 of 57 programs reproduce their recorded output exactly. The exception is OS 30, whose recorded run had X11 available for `xclock`. C programs are compiled to `public/wasm/<lab>/*.wasm`, and those files are committed, so Vercel never needs the compiler.

Hand-written study content lives in `src/data/labs/`:

- `ds-notes.ts`, `os-notes.ts`, `daa-notes.ts`: per-program steps, viva-style MCQs with explanations, and exam tips
- `viva.ts`: subject-level viva banks (UG 3rd-year level)
- `cheatsheet-*.ts`: per-lab cheatsheets

Other scripts: `pnpm datasets` regenerates the practice CSVs (`titanic.csv` is synthetic, with the Kaggle column layout), and `pnpm vendor` re-bundles just-bash and the WASI shim into `public/vendor/`.

## SEO, AEO and GEO

- Per-page titles, descriptions, canonicals, and Open Graph and Twitter cards
- Generated OG banners: `/opengraph-image`, plus `/og/{ds,os,daa}` per lab
- JSON-LD: `WebSite`, `WebApplication`, `Course` per lab, `LearningResource` + `FAQPage` + `BreadcrumbList` per program, and `FAQPage` on every viva page
- `sitemap.xml`, `robots.txt` (AI crawlers allowed) and `llms.txt` for answer engines
- Set `NEXT_PUBLIC_SITE_URL` if the domain isn't `https://rgulab.vercel.app`

## Deploy

Push to GitHub, import the repo in Vercel, and keep the default settings. It's a pure static and edge Next.js 16 app, so no environment variables are required.

Not an official university site.
