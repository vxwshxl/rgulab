"use client";

import { useMemo, useState } from "react";
import { NativeSimulator } from "./native-sim";
import { Simulator } from "./simulator";
import { makeYourOwn, titanicDrills } from "@/data/labs/cheatsheet-ds";
import { getLab, type LabId } from "@/data/labs";

const WELCOME: Record<LabId, string> = {
  ds: `# Welcome to the rguLAB DS simulator: real Python 3.14 running in your browser.
# Press F5 (or Ctrl/Cmd + Enter) to run. Plots appear on the right, like Spyder.
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv('titanic.csv')   # sample files: titanic.csv, iris.csv, students.csv
print(df.head())
print("\\nMissing values:\\n", df.isnull().sum())

df['Pclass'].value_counts().sort_index().plot(kind='bar', title='Passengers per class')
plt.show()
`,
  os: `#!/bin/bash
# Welcome to the rguLAB OS terminal. Type what the script reads in "Keyboard input".
echo "Enter your name:"
read name
echo "Enter a number:"
read n

echo "Hello, $name!"
for ((i = 1; i <= n; i++))
do
    echo "$i squared is $((i * i))"
done
`,
  daa: `// Welcome to the rguLAB DAA workbench: real C, compiled to WebAssembly.
// Edited code compiles in your browser (the compiler downloads once, about 100 MB).
#include <stdio.h>
#include <time.h>

int main() {
    int n, i, sum = 0, count = 0;
    printf("Enter n:");
    scanf("%d", &n);
    clock_t start = clock();
    for (i = 1; i <= n; i++) {
        sum += i;
        count++;
    }
    clock_t end = clock();
    printf("\\nSum of 1..%d = %d", n, sum);
    printf("\\nNumber of comparisons:%d", count);
    printf("\\nTime taken:%f seconds\\n", (double)(end - start) / CLOCKS_PER_SEC);
    return 0;
}
`,
};

export function Playground({ lab, preset }: { lab: LabId; preset: { key: string; code: string } | null }) {
  const L = getLab(lab)!;
  const [choice, setChoice] = useState(preset?.key ?? "");
  const [code, setCode] = useState(preset?.code ?? WELCOME[lab]);

  const templates = useMemo(
    () =>
      new Map<string, string>([
        ["welcome", WELCOME[lab]],
        ["blank", ""],
        ...L.programs.map((p) => [`p:${p.id}`, p.code] as const),
        ...(lab === "ds" ? [...makeYourOwn, ...titanicDrills].map((s) => [`s:${s.id}`, s.code] as const) : []),
      ]),
    [L, lab],
  );
  const program = choice.startsWith("p:") ? L.byId.get(choice.slice(2)) : undefined;
  const ext = L.lang === "python" ? "py" : L.lang === "bash" ? "sh" : "c";
  const fileName = program?.fileName ?? `main.${ext}`;

  return (
    <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:min-h-dvh lg:py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">{L.short} simulator</h1>
          <p className="text-sm text-secondary-fg">
            {lab === "ds" && "Laid out like Spyder: editor on the left, plots and console on the right."}
            {lab === "os" && "A bash terminal in your browser. Input is typed in advance, and the Gantt chart appears for the scheduling programs."}
            {lab === "daa" && "Real C compiled to WebAssembly, with comparisons, timing and array views after each run."}{" "}
            Your draft is saved in this browser.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-bold">
          <span className="text-secondary-fg">Load</span>
          <select
            value={choice}
            onChange={(e) => {
              const k = e.target.value;
              setChoice(k);
              const c = templates.get(k);
              if (c !== undefined) setCode(c);
            }}
            className="h-11 max-w-72 rounded-xl border-2 border-border bg-elevated px-3 text-sm font-bold"
          >
            <option value="" disabled>
              Choose a template…
            </option>
            <option value="welcome">Welcome tour</option>
            <option value="blank">Blank file</option>
            <optgroup label={`${L.name} programs`}>
              {L.programs.map((p) => (
                <option key={p.id} value={`p:${p.id}`}>
                  {p.id} · {p.title}
                </option>
              ))}
            </optgroup>
            {lab === "ds" && (
              <>
                <optgroup label="Make your own data">
                  {makeYourOwn.map((s) => (
                    <option key={s.id} value={`s:${s.id}`}>
                      {s.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Titanic drills">
                  {titanicDrills.map((s) => (
                    <option key={s.id} value={`s:${s.id}`}>
                      {s.title}
                    </option>
                  ))}
                </optgroup>
              </>
            )}
          </select>
        </label>
      </div>
      {L.lang === "python" ? (
        <Simulator initialCode={code} storageKey={`rgulab-${lab}-playground`} restoreDraft={!preset} className="min-h-0 flex-1 lg:h-[calc(100dvh-140px)]" />
      ) : (
        <NativeSimulator
          lab={L}
          program={program}
          initialCode={code}
          fileName={fileName}
          storageKey={`rgulab-${lab}-playground`}
          restoreDraft={!preset}
          initialStdin={program ? undefined : lab === "os" ? "Asha\n4" : "10"}
          className="min-h-0 flex-1"
        />
      )}
    </div>
  );
}
