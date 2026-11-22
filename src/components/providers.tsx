"use client";

import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { useProgress } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useProgress.persist.rehydrate();
  }, []);
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
