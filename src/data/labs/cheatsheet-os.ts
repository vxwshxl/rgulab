export const shellSyntax: { title: string; code: string }[] = [
  { title: "Read & print", code: 'echo "Enter a number:"\nread n\necho "You typed $n"\nread a b        # two values on one line\nread -p "Name: " name' },
  { title: "Arithmetic", code: "sum=$((a + b))\nrem=$((n % 10))\nlet c=a*b\nx=$(expr $a + $b)\n# decimals need bc:\narea=$(echo \"scale=2; 3.14 * $r * $r\" | bc)" },
  { title: "if / elif / else", code: 'if [ $n -gt 0 ]\nthen\n    echo "positive"\nelif [ $n -eq 0 ]\nthen\n    echo "zero"\nelse\n    echo "negative"\nfi' },
  { title: "Loops", code: "for ((i = 1; i <= 10; i++))\ndo\n    echo $i\ndone\n\nwhile [ $n -gt 0 ]\ndo\n    n=$((n - 1))\ndone\n\nfor f in a b c; do echo $f; done" },
  { title: "case menu", code: 'case $choice in\n    1) echo "one" ;;\n    2) echo "two" ;;\n    *) echo "invalid" ;;\nesac' },
  { title: "Functions & arrays", code: 'square() {\n    local x=$1\n    echo $((x * x))\n}\nres=$(square 5)\n\narr=(10 20 30)\necho ${arr[0]} ${arr[@]} ${#arr[@]}' },
];

export const testOps: [string, string][] = [
  ["-eq / -ne", "equal / not equal"],
  ["-gt / -ge", "greater than / greater or equal"],
  ["-lt / -le", "less than / less or equal"],
  ["= / != (strings)", "string equal / not equal"],
  ["-z $s / -n $s", "string is empty / not empty"],
  ["-f file / -d dir", "file exists / directory exists"],
  ["&& / ||", "and / or between tests"],
];

export const linuxCmds: [string, string][] = [
  ["pwd, ls -l, cd dir, cd ..", "where am I, list, move around"],
  ["mkdir d, rmdir d, rm -r d", "make / remove folders"],
  ["touch f, cp a b, mv a b, rm f", "create, copy, move or rename, delete"],
  ["cat f, head -n 5 f, tail f, wc -l f", "show, first / last lines, count lines"],
  ["echo hi > f, echo hi >> f", "overwrite, append"],
  ["grep -i 'x' f, grep -v, grep -c", "search (ignore case), invert, count"],
  ["sed 's/old/new/g' f", "find and replace on every line"],
  ["sort f | uniq, cut -d, -f1", "sort, de-duplicate, pick columns"],
  ["chmod +x s.sh, chmod 755 f", "permissions (r=4 w=2 x=1)"],
  ["ps, top, kill PID, &", "processes, stop one, run in background"],
  ["cal 7 2026, date, whoami, uname -a", "calendar, date, user, system info"],
  ["xclock, oclock", "graphical clocks (need X11)"],
];

export const schedFormulas: [string, string][] = [
  ["TAT = CT − AT", "turnaround = completion − arrival"],
  ["WT = TAT − BT", "waiting = turnaround − burst"],
  ["RT = first run − AT", "response time"],
  ["FCFS (AT = 0)", "wt[i] = wt[i−1] + bt[i−1]"],
  ["Average", "sum of WT (or TAT) ÷ n"],
  ["Round Robin", "run min(q, remaining); unfinished → back of queue"],
  ["Banker's: Need", "Need = Max − Allocation"],
  ["Banker's: safe", "Need ≤ Work → Work = Work + Allocation"],
  ["First / Best / Worst Fit", "first big-enough / smallest that fits / largest block"],
];
