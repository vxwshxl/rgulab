export type Mcq = { q: string; correct: string; wrong: string[]; why: string };
export type Note = { title: string; steps: string[]; mcq: Mcq[]; tip?: string };
export type VivaQ = { q: string; a: string; topic: string };

export const m = (q: string, correct: string, wrong: string[], why: string): Mcq => ({ q, correct, wrong, why });
