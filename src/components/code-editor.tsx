"use client";

import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { StreamLanguage } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onRun?: () => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  language?: "python" | "c" | "bash";
};

export type EditorHandle = { goToLine: (n: number) => void; focus: () => void };

export const CodeEditor = forwardRef<EditorHandle, Props>(function CodeEditor(
  { value, onChange, onRun, placeholder, className, minHeight = "320px", language = "python" },
  ref,
) {
  const { resolvedTheme } = useTheme();
  const cm = useRef<ReactCodeMirrorRef>(null);
  const runRef = useRef(onRun);
  useEffect(() => {
    runRef.current = onRun;
  }, [onRun]);

  const extensions = useMemo(
    () => [
      language === "c" ? cpp() : language === "bash" ? StreamLanguage.define(shell) : python(),
      EditorView.lineWrapping,
      Prec.highest(
        keymap.of([
          { key: "Mod-Enter", run: () => (runRef.current?.(), true) },
          { key: "F5", run: () => (runRef.current?.(), true), preventDefault: true },
        ]),
      ),
    ],
    [language],
  );

  useImperativeHandle(
    ref,
    () => ({
      goToLine: (n: number) => {
        const view = cm.current?.view;
        if (!view) return;
        const line = view.state.doc.line(Math.min(Math.max(1, n), view.state.doc.lines));
        view.dispatch({ selection: { anchor: line.from, head: line.to }, scrollIntoView: true });
        view.focus();
      },
      focus: () => cm.current?.view?.focus(),
    }),
    [],
  );

  return (
    <CodeMirror
      ref={cm}
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme={resolvedTheme === "dark" ? githubDark : githubLight}
      placeholder={placeholder}
      className={className}
      minHeight={minHeight}
      height="100%"
      basicSetup={{ foldGutter: false, highlightActiveLine: true, autocompletion: true, tabSize: 4 }}
      indentWithTab
    />
  );
});
