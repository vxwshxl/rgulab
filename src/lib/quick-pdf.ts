// Builds the A4 "codes and outputs" PDF for a lab's /quick page (pdf-lib, fonts embedded and subset).
import fontkit from "@pdf-lib/fontkit";
import { PDFArray, PDFDocument, PDFName, PDFNull, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import fs from "node:fs/promises";
import path from "node:path";
import { getLab, type LabId, type Program } from "@/data/labs";
import { algorithmOf, printedComplexity, quickPrograms } from "./quick";
import { SITE } from "./site";

const A4: [number, number] = [595.28, 841.89];
const M = 44; // page margin
const W = A4[0] - 2 * M;
const INK = rgb(0.09, 0.09, 0.09);
const MUTED = rgb(0.4, 0.4, 0.4);
const RULE = rgb(0.86, 0.86, 0.86);
const CODE_BG = rgb(0.962, 0.962, 0.962);
const ACCENT: Record<LabId, RGB> = { ds: rgb(0.18, 0.52, 0), os: rgb(0.54, 0.31, 0.8), daa: rgb(0.68, 0.35, 0) };

type Fonts = { sans: PDFFont; bold: PDFFont; mono: PDFFont; monoBold: PDFFont };

const fontFile = (f: string) => fs.readFile(path.join(process.cwd(), "src/assets/fonts", f));

/** Expand tabs to spaces (terminal-style 8-column stops for output, 4 for code). */
function expandTabs(s: string, stop: number) {
  return s
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => {
      let out = "";
      for (const ch of line) out += ch === "\t" ? " ".repeat(stop - (out.length % stop)) : ch;
      return out;
    })
    .join("\n");
}

class Writer {
  page!: PDFPage;
  y = 0;
  pages: PDFPage[] = [];
  constructor(
    readonly doc: PDFDocument,
    readonly f: Fonts,
    readonly accent: RGB,
  ) {}

  newPage() {
    this.page = this.doc.addPage(A4);
    this.pages.push(this.page);
    this.y = A4[1] - M;
  }
  ensure(h: number) {
    if (this.y - h < M + 24) this.newPage();
  }
  gap(h: number) {
    this.y -= h;
  }

  /** Word-wrapped proportional text. */
  para(text: string, { font = this.f.sans, size = 10, color = INK, lead = 1.4 } = {}) {
    const lh = size * lead;
    for (const raw of text.split("\n")) {
      const words = raw.split(/(\s+)/);
      let line = "";
      const flush = () => {
        this.ensure(lh);
        this.page.drawText(line.trimEnd(), { x: M, y: this.y - size, size, font, color });
        this.y -= lh;
        line = "";
      };
      for (const w of words) {
        if (font.widthOfTextAtSize(line + w, size) > W && line.trim()) flush();
        line += line || !/^\s+$/.test(w) ? w : "";
      }
      if (line.trim() || !raw) flush();
    }
  }

  label(text: string) {
    this.ensure(30);
    this.gap(8);
    this.page.drawText(text.toUpperCase(), { x: M, y: this.y - 8, size: 8, font: this.f.bold, color: this.accent });
    this.y -= 14;
  }

  /** Monospace block with a grey background; long lines wrap with a margin tick (no extra characters, so copy-paste stays clean). */
  mono(text: string, { size = 8, tab = 4 } = {}) {
    const lh = size * 1.32;
    const charW = this.f.mono.widthOfTextAtSize("0", size);
    const pad = 7;
    const max = Math.floor((W - pad * 2) / charW);
    const rows: { s: string; cont: boolean }[] = [];
    for (const line of expandTabs(text.replace(/\n+$/, ""), tab).split("\n")) {
      if (line.length <= max) rows.push({ s: line, cont: false });
      else for (let i = 0; i < line.length; i += max) rows.push({ s: line.slice(i, i + max), cont: i > 0 });
    }
    const band = (h: number) => this.page.drawRectangle({ x: M, y: this.y - h, width: W, height: h, color: CODE_BG });
    this.ensure(lh + pad * 2);
    band(pad);
    this.y -= pad;
    for (const r of rows) {
      if (this.y - lh < M + 24) {
        this.newPage();
      }
      band(lh);
      if (r.cont) this.page.drawRectangle({ x: M + 2, y: this.y - lh + 2, width: 2, height: lh - 4, color: this.accent });
      if (r.s) this.page.drawText(r.s, { x: M + pad, y: this.y - size, size, font: this.f.mono, color: INK });
      this.y -= lh;
    }
    if (this.y - pad >= M + 24) band(pad);
    this.y -= pad;
  }

  async image(file: string, alt: string) {
    let bytes: Buffer;
    try {
      bytes = await fs.readFile(path.join(process.cwd(), "public", file));
    } catch {
      return;
    }
    const img = file.endsWith(".png") ? await this.doc.embedPng(bytes) : await this.doc.embedJpg(bytes);
    const scale = Math.min(W / img.width, 330 / img.height, 1.2);
    const w = img.width * scale;
    const h = img.height * scale;
    this.ensure(h + 18);
    this.page.drawRectangle({ x: M, y: this.y - h - 2, width: W, height: h + 4, borderColor: RULE, borderWidth: 1 });
    this.page.drawImage(img, { x: M + (W - w) / 2, y: this.y - h, width: w, height: h });
    this.y -= h + 6;
    this.page.drawText(alt, { x: M, y: this.y - 8, size: 7.5, font: this.f.sans, color: MUTED });
    this.y -= 14;
  }
}

function addLink(page: PDFPage, rect: [number, number, number, number], target: PDFPage) {
  const ctx = page.doc.context;
  const dest = PDFArray.withContext(ctx);
  dest.push(target.ref);
  dest.push(PDFName.of("XYZ"));
  dest.push(PDFNull);
  dest.push(PDFNull);
  dest.push(PDFNull);
  const annot = ctx.register(ctx.obj({ Type: "Annot", Subtype: "Link", Rect: rect, Border: [0, 0, 0], Dest: dest }));
  page.node.addAnnot(annot);
}

async function build(labId: LabId): Promise<Uint8Array> {
  const lab = getLab(labId)!;
  const programs = quickPrograms(labId);
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const [sans, bold, mono, monoBold] = await Promise.all(["DejaVuSans.ttf", "DejaVuSans-Bold.ttf", "DejaVuSansMono.ttf", "DejaVuSansMono-Bold.ttf"].map(fontFile));
  const f: Fonts = {
    sans: await doc.embedFont(sans!, { subset: true }),
    bold: await doc.embedFont(bold!, { subset: true }),
    mono: await doc.embedFont(mono!, { subset: true }),
    monoBold: await doc.embedFont(monoBold!, { subset: true }),
  };
  const title = `${lab.name}: codes and outputs`;
  doc.setTitle(title);
  doc.setSubject(`${lab.subject}: all ${programs.length} record programs with ${labId === "daa" ? "algorithm, code, output and complexity" : labId === "os" ? "algorithm, code and output" : "code, output and graphs"}`);
  doc.setAuthor("rguLAB");
  doc.setCreator(SITE.url);
  doc.setKeywords([lab.name, lab.subject, "lab programs", "code", "output"]);

  const wr = new Writer(doc, f, ACCENT[labId]);
  wr.newPage();
  const cover = wr.page;

  const starts: { p: Program; page: PDFPage }[] = [];
  for (const p of programs) {
    wr.newPage();
    starts.push({ p, page: wr.page });
    // Header
    wr.page.drawRectangle({ x: M, y: wr.y - 3, width: 36, height: 3, color: wr.accent });
    wr.gap(10);
    wr.page.drawText(`PROGRAM ${p.id}`, { x: M, y: wr.y - 9, size: 9, font: f.bold, color: wr.accent });
    wr.gap(14);
    wr.para(p.title, { font: f.bold, size: 17, lead: 1.25 });
    wr.gap(2);
    wr.para(`Aim: ${p.aim}`, { size: 10, color: MUTED });

    const algo = algorithmOf(p);
    if (algo && labId !== "ds") {
      wr.label("Algorithm");
      wr.mono(algo, { size: 8.5 });
    }
    wr.label(labId === "ds" ? "Program (Python)" : p.lang === "bash" ? "Program (shell script)" : "Program (C)");
    wr.mono(p.code, { size: 8, tab: 4 });

    p.samples.forEach((s, i) => {
      if (s.stdin.trim()) {
        wr.label(p.samples.length > 1 ? `Input ${i + 1}` : "Input");
        wr.mono(s.stdin.trim(), { size: 8 });
      }
      wr.label(p.samples.length > 1 ? `Output ${i + 1}` : "Output");
      wr.mono(s.output || "(no printed output)", { size: 8, tab: 8 });
    });

    for (const [i, img] of p.images.entries()) {
      if (i === 0) wr.label(p.images.length > 1 ? "Graphs" : "Graph");
      await wr.image(img, `Figure ${p.id}${p.images.length > 1 ? `.${i + 1}` : ""}: ${p.title}`);
    }

    if (labId === "daa") {
      const pc = printedComplexity(p.code);
      const c = p.complexity;
      wr.label("Complexity");
      const lines = [pc.time && `Time complexity:  ${pc.time}`, pc.space && `Space complexity: ${pc.space}`].filter(Boolean) as string[];
      if (c) lines.push(`Best: ${c.best}   Average: ${c.avg}   Worst: ${c.worst}   Paradigm: ${c.paradigm}`);
      wr.mono(lines.join("\n"), { size: 8.5 });
    }
  }

  // Cover + contents (drawn last so page numbers are known; each row links to its program).
  const pageNo = (pg: PDFPage) => wr.pages.indexOf(pg) + 1;
  let y = A4[1] - M - 10;
  cover.drawRectangle({ x: M, y: y - 4, width: 56, height: 5, color: wr.accent });
  y -= 40;
  cover.drawText(lab.name, { x: M, y, size: 34, font: f.bold, color: INK });
  y -= 24;
  cover.drawText(lab.subject, { x: M, y, size: 14, font: f.sans, color: MUTED });
  y -= 22;
  const what = labId === "daa" ? "Algorithm, program, output and complexity" : labId === "os" ? "Algorithm, program and output" : "Program, output and graphs";
  cover.drawText(`All ${programs.length} record programs · ${what}`, { x: M, y, size: 10.5, font: f.sans, color: INK });
  y -= 30;
  cover.drawLine({ start: { x: M, y }, end: { x: M + W, y }, thickness: 1, color: RULE });
  y -= 22;
  cover.drawText("CONTENTS", { x: M, y, size: 9, font: f.bold, color: wr.accent });
  y -= 8;
  const rowH = Math.min(17, (y - M - 40) / programs.length);
  const size = rowH < 15 ? 9 : 10;
  for (const { p, page } of starts) {
    y -= rowH;
    const n = String(pageNo(page));
    cover.drawText(p.id, { x: M, y, size, font: f.monoBold, color: wr.accent });
    const t = p.title.length > 70 ? `${p.title.slice(0, 68)}…` : p.title;
    cover.drawText(t, { x: M + 32, y, size, font: f.sans, color: INK });
    const nw = f.sans.widthOfTextAtSize(n, size);
    cover.drawText(n, { x: M + W - nw, y, size, font: f.sans, color: MUTED });
    const tw = f.sans.widthOfTextAtSize(t, size);
    for (let x = M + 40 + tw; x < M + W - nw - 6; x += 4) cover.drawText(".", { x, y, size: size - 1, font: f.sans, color: RULE });
    addLink(cover, [M, y - 4, M + W, y + rowH - 4], page);
  }
  cover.drawText(`Generated ${new Date().toISOString().slice(0, 10)} · ${SITE.url.replace(/^https?:\/\//, "")}/quick${labId === "ds" ? "" : `/${labId}`}`, {
    x: M,
    y: M - 6,
    size: 8,
    font: f.sans,
    color: MUTED,
  });

  // Footers
  const total = wr.pages.length;
  wr.pages.forEach((pg, i) => {
    if (i === 0) return;
    pg.drawLine({ start: { x: M, y: M + 6 }, end: { x: M + W, y: M + 6 }, thickness: 0.6, color: RULE });
    pg.drawText(`rguLAB · ${title}`, { x: M, y: M - 6, size: 7.5, font: f.sans, color: MUTED });
    const label = `Page ${i + 1} of ${total}`;
    pg.drawText(label, { x: M + W - f.sans.widthOfTextAtSize(label, 7.5), y: M - 6, size: 7.5, font: f.sans, color: MUTED });
  });

  return doc.save();
}

const cache = new Map<LabId, Promise<Uint8Array>>();

/** The PDF for a lab, built once per server instance. */
export function quickPdf(labId: LabId) {
  if (!cache.has(labId)) cache.set(labId, build(labId).catch((e) => (cache.delete(labId), Promise.reject(e))));
  return cache.get(labId)!;
}

export const pdfFileName = (labId: LabId) => `rguLAB-${getLab(labId)!.name.replace(/\s+/g, "-")}-codes-and-outputs.pdf`;
