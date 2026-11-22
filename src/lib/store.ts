"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { todayKey } from "./utils";

export type ExamAttempt = { id: string; at: number; ms: number; similarity: number; verdict: "pass" | "retry"; hints: number };

type State = {
  xp: number;
  goal: number;
  daily: { day: string; xp: number };
  streak: { count: number; last: string };
  crowns: Record<string, number>;
  lessons: Record<string, number>;
  exams: ExamAttempt[];
  sound: boolean;
  finishLesson: (id: string, opts: { xp: number; level: number }) => void;
  earnXp: (xp: number) => void;
  setCrown: (id: string, level: number) => void;
  logExam: (a: ExamAttempt) => void;
  setGoal: (g: number) => void;
  toggleSound: () => void;
  reset: () => void;
};

function bumpStreak(streak: State["streak"]): State["streak"] {
  const today = todayKey();
  if (streak.last === today) return streak;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return { count: streak.last === todayKey(y) ? streak.count + 1 : 1, last: today };
}

function addXp(s: State, xp: number) {
  const today = todayKey();
  const daily = s.daily.day === today ? { day: today, xp: s.daily.xp + xp } : { day: today, xp };
  return { xp: s.xp + xp, daily, streak: bumpStreak(s.streak) };
}

const initial = {
  xp: 0,
  goal: 50,
  daily: { day: "", xp: 0 },
  streak: { count: 0, last: "" },
  crowns: {} as Record<string, number>,
  lessons: {} as Record<string, number>,
  exams: [] as ExamAttempt[],
  sound: true,
};

export const STORE_KEY = "rgulab-progress";

export const useProgress = create<State>()(
  persist(
    (set) => ({
      ...initial,
      finishLesson: (id, { xp, level }) =>
        set((s) => ({
          ...addXp(s, xp),
          crowns: { ...s.crowns, [id]: Math.max(s.crowns[id] ?? 0, level) },
          lessons: { ...s.lessons, [id]: (s.lessons[id] ?? 0) + 1 },
        })),
      earnXp: (xp) => set((s) => addXp(s, xp)),
      setCrown: (id, level) => set((s) => ({ crowns: { ...s.crowns, [id]: Math.max(s.crowns[id] ?? 0, level) } })),
      logExam: (a) =>
        set((s) => ({
          ...addXp(s, a.verdict === "pass" ? 30 : 10),
          exams: [a, ...s.exams].slice(0, 50),
          crowns: a.verdict === "pass" ? { ...s.crowns, [a.id]: 3 } : s.crowns,
        })),
      setGoal: (goal) => set({ goal }),
      toggleSound: () => set((s) => ({ sound: !s.sound })),
      reset: () => set(initial),
    }),
    { name: STORE_KEY, skipHydration: true },
  ),
);

/** Today's XP, or 0 if the stored day is stale. */
export function useTodayXp() {
  return useProgress((s) => (typeof window !== "undefined" && s.daily.day === todayKey() ? s.daily.xp : 0));
}

/** Streak that reads 0 once a full day has been missed. */
export function useLiveStreak() {
  return useProgress((s) => {
    // Never read the clock while prerendering; the store is empty there anyway.
    if (typeof window === "undefined" || !s.streak.last) return 0;
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return s.streak.last === todayKey() || s.streak.last === todayKey(y) ? s.streak.count : 0;
  });
}
