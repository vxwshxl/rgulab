import { Fragment } from "react";

export type HLang = "python" | "c" | "bash";

const KW: Record<HLang, Set<string>> = {
  python: new Set(["import", "from", "as", "def", "return", "for", "in", "if", "else", "elif", "while", "with", "lambda", "and", "or", "not", "True", "False", "None", "class", "try", "except", "finally", "is", "pass", "break", "continue", "yield"]),
  c: new Set(["int", "float", "double", "char", "void", "long", "unsigned", "struct", "return", "for", "while", "do", "if", "else", "switch", "case", "default", "break", "continue", "sizeof", "const", "static", "typedef", "clock_t"]),
  bash: new Set(["if", "then", "else", "elif", "fi", "for", "while", "until", "do", "done", "case", "esac", "in", "function", "local", "return", "exit", "break", "continue", "true", "false"]),
};
const BUILTIN: Record<HLang, Set<string>> = {
  python: new Set(["print", "range", "len", "list", "dict", "max", "min", "sorted", "enumerate", "int", "float", "str", "zip", "sum", "round", "input", "type", "set", "tuple", "abs"]),
  c: new Set(["printf", "scanf", "clock", "malloc", "free", "sprintf", "strlen", "strcpy", "strcmp", "qsort", "CLOCKS_PER_SEC", "NULL"]),
  bash: new Set(["echo", "read", "printf", "bc", "expr", "let", "cd", "ls", "mkdir", "cat", "grep", "sed", "cal", "rm", "pwd", "chmod"]),
};

const TOKEN: Record<HLang, RegExp> = {
  python: /(#.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|f?"(?:\\.|[^"\\])*"|f?'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?(?:e-?\d+)?\b)|(\b[A-Za-z_]\w*\b)/gm,
  c: /(\/\/.*$|\/\*[\s\S]*?\*\/|^\s*#\s*\w+.*$)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)/gm,
  bash: /((?:^|\s)#(?!!).*$)|("(?:\\.|[^"\\])*"|'[^']*')|(\$\{?[\w#@?$!]+\}?|\b\d+\b)|(-?\b[A-Za-z_]\w*\b)/gm,
};

/** Minimal syntax colouring, SSR-safe, for read-only code. */
export function Highlight({ code, lang = "python" }: { code: string; lang?: HLang }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of code.matchAll(TOKEN[lang])) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push(code.slice(last, idx));
    const [text, com, str, num, word] = m;
    let cls = "";
    if (com) cls = lang === "c" && /^\s*#/.test(com) ? "tok-kw" : "tok-com";
    else if (str) cls = "tok-str";
    else if (num) cls = lang === "bash" && num.startsWith("$") ? "tok-fn" : "tok-num";
    else if (word) {
      if (KW[lang].has(word)) cls = "tok-kw";
      else if (BUILTIN[lang].has(word)) cls = "tok-blt";
      else if (lang === "bash" && /^-[a-z]{1,2}$/.test(word)) cls = "tok-kw";
      else if (code[idx + word.length] === "(") cls = "tok-fn";
    }
    parts.push(cls ? <span key={k++} className={cls}>{text}</span> : <Fragment key={k++}>{text}</Fragment>);
    last = idx + text.length;
  }
  if (last < code.length) parts.push(code.slice(last));
  return <>{parts}</>;
}
