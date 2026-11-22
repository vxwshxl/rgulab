import { Mascot } from "./mascot";

/** Shown while client-only parts (simulator, exam) stream in. */
export function PageLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="grid min-h-[70dvh] place-items-center px-4" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-sm font-bold text-secondary-fg">
        <Mascot mood="think" className="size-20 animate-float" />
        {label}
      </div>
    </div>
  );
}
