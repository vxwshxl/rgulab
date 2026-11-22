// OS Lab study notes per program. MCQs list the correct option FIRST; the UI shuffles them.
import { m, type Note } from "./types";

export const osNotes: Record<string, Note> = {
  "01": {
    title: "Add two numbers",
    steps: ["echo a prompt, then read a", "read b the same way", "sum=$((a + b)) and echo the result"],
    mcq: [
      m("Which syntax does integer arithmetic in bash?", "$(( a + b ))", ["$( a + b )", "${ a + b }", "[ a + b ]"], "$(( )) is arithmetic expansion. $( ) runs a command instead."),
      m("What does `read a` do?", "Reads one line from the keyboard into variable a", ["Prints a", "Reads a file called a", "Declares a as an integer"], "read stores what the user types; use $a to get the value back."),
    ],
  },
  "02": {
    title: "Simple interest",
    steps: ["read principal p, rate r, time t", "si=$(echo \"scale=2; $p * $r * $t / 100\" | bc)", "total=$(echo \"scale=2; $p + $si\" | bc) and print both"],
    mcq: [
      m("Why pipe the formula into bc?", "Bash arithmetic is integer only; bc handles decimals", ["bc is faster", "echo can't print numbers", "To round the answer"], "$(( 5 / 2 )) gives 2, but bc with scale=2 gives 2.50."),
      m("In bc, scale=2 means…", "Keep 2 digits after the decimal point", ["Multiply by 2", "Round to 2 significant figures", "Use base 2"], "bc truncates to that many decimal places."),
    ],
  },
  "03": {
    title: "Odd or even",
    steps: ["read n", "if [ $((n % 2)) -eq 0 ] → even", "else → odd, close with fi"],
    mcq: [
      m("Which operator gives the remainder?", "%", ["/", "//", "mod"], "n % 2 is 0 for even numbers."),
      m("How does an if block end in bash?", "fi", ["end", "done", "endif"], "if … then … else … fi. case ends with esac, loops with done."),
    ],
  },
  "04": {
    title: "Factorial (loop)",
    steps: ["read n, set fact=1", "while [ $n -gt 1 ]: fact=$((fact * n)), n=$((n - 1))", "echo the factorial"],
    mcq: [
      m("-gt inside [ ] means…", "Greater than", ["Greater or equal", "Get text", "Global"], "-eq, -ne, -lt, -le, -gt, -ge compare integers."),
      m("Why does fact start at 1, not 0?", "Multiplying by 0 would always give 0", ["Bash variables can't be 0", "0! is undefined", "To skip the first loop"], "1 is the multiplicative identity, and 0! = 1."),
    ],
  },
  "05": {
    title: "Reverse a number",
    steps: ["read n, rev=0", "loop while n > 0: digit=$((n % 10)), rev=$((rev * 10 + digit)), n=$((n / 10))", "print rev"],
    mcq: [
      m("n % 10 gives…", "The last digit of n", ["The first digit", "n divided by 10", "The number of digits"], "12345 % 10 = 5."),
      m("n / 10 in bash arithmetic…", "Drops the last digit (integer division)", ["Gives a decimal", "Adds a 0", "Reverses n"], "12345 / 10 = 1234."),
    ],
  },
  "06": {
    title: "Sum of digits",
    steps: ["read n, sum=0", "while n > 0: sum += n % 10; n /= 10", "print sum"],
    mcq: [
      m("Sum of digits of 4567 is…", "22", ["4567", "7654", "20"], "4 + 5 + 6 + 7 = 22."),
      m("Which loop keeps going while a condition is true?", "while", ["until", "case", "select"], "until is the opposite: it runs while the condition is false."),
    ],
  },
  "07": {
    title: "Prime check",
    steps: ["read n; n < 2 is not prime", "for i from 2 to n/2 (or √n): if n % i == 0 → not prime", "use a flag to print the result"],
    mcq: [
      m("A prime number has…", "Exactly two factors: 1 and itself", ["No factors", "Only even factors", "More than two factors"], "1 is not prime, 2 is the only even prime."),
      m("Why can the loop stop at √n?", "Any factor larger than √n pairs with one smaller than √n", ["Bash can't count higher", "Primes are small", "To avoid division by zero"], "If n = a × b and a ≤ b, then a ≤ √n."),
    ],
  },
  "08": {
    title: "Fibonacci series",
    steps: ["read n terms, a=0, b=1", "loop n times: print a; next=$((a + b)); a=$b; b=$next", "echo -n keeps terms on one line"],
    mcq: [
      m("First 6 Fibonacci terms are…", "0 1 1 2 3 5", ["1 2 3 4 5 6", "0 1 2 3 5 8", "1 1 2 4 8 16"], "Each term is the sum of the two before it."),
      m("echo -n …", "Prints without the trailing newline", ["Prints a number", "Prints nothing", "Prints in bold"], "So the series stays on one line."),
    ],
  },
  "09": {
    title: "Area of a circle",
    steps: ["read r", "area=$(echo \"scale=2; 3.14 * $r * $r\" | bc)", "echo the area"],
    mcq: [
      m("Area of a circle =", "πr²", ["2πr", "πd", "r²/π"], "2πr is the circumference (program 14)."),
      m("$( … ) is called…", "Command substitution", ["Arithmetic expansion", "A subshell array", "Process substitution"], "It replaces itself with the command's output."),
    ],
  },
  "10": {
    title: "GCD (Euclid)",
    steps: ["read a and b", "while b != 0: r=$((a % b)); a=$b; b=$r", "a is the GCD"],
    mcq: [
      m("GCD(48, 18) is…", "6", ["2", "3", "18"], "48 % 18 = 12 → 18 % 12 = 6 → 12 % 6 = 0."),
      m("Euclid's algorithm repeatedly replaces (a, b) with…", "(b, a mod b)", ["(a − 1, b)", "(a × b, a)", "(b, a + b)"], "It stops when the remainder is 0."),
    ],
  },
  "11": {
    title: "Sum of a 3-digit number's digits",
    steps: ["read n (e.g. 456)", "d1=$((n / 100)), d2=$((n / 10 % 10)), d3=$((n % 10))", "print d1 + d2 + d3"],
    mcq: [
      m("For n = 456, n / 10 % 10 gives…", "5", ["4", "6", "45"], "456 / 10 = 45, and 45 % 10 = 5."),
    ],
  },
  "12": {
    title: "Odd & even sums (1–50)",
    steps: ["for ((i=1; i<=50; i++))", "if i % 2 == 0, add to even, else add to odd", "print both sums"],
    mcq: [
      m("Sum of even numbers from 1 to 50 is…", "650", ["625", "1275", "600"], "2 + 4 + … + 50 = 25 × 26 = 650; the odd sum is 625."),
      m("for ((i=1; i<=50; i++)) is…", "A C-style for loop", ["A while loop", "An infinite loop", "Invalid bash"], "Bash also has the list form: for i in 1 2 3."),
    ],
  },
  "13": {
    title: "Multiplication table",
    steps: ["read n", "for i in 1..10: echo \"$n x $i = $((n * i))\"", "done"],
    mcq: [
      m("Which keyword ends a for/while loop body?", "done", ["fi", "end", "esac"], "for … do … done."),
    ],
  },
  "14": {
    title: "Circumference of a circle",
    steps: ["read r", "c=$(echo \"scale=2; 2 * 3.14 * $r\" | bc)", "print c"],
    mcq: [
      m("Circumference =", "2πr", ["πr²", "πr", "4πr²"], "With r = 7: 2 × 3.14 × 7 = 43.96."),
    ],
  },
  "15": {
    title: "FCFS scheduling (C)",
    steps: ["read n and each burst time", "wt[0] = 0; wt[i] = wt[i-1] + bt[i-1]", "tat[i] = wt[i] + bt[i]; print the table and the averages"],
    mcq: [
      m("FCFS runs processes in order of…", "Arrival (first come, first served)", ["Shortest burst", "Highest priority", "Round robin slices"], "It is non-preemptive and uses a FIFO queue."),
      m("With all arrivals at 0, a process's waiting time is…", "The sum of the bursts before it", ["Its own burst", "Always 0", "The average burst"], "That is exactly wt[i] = wt[i-1] + bt[i-1]."),
      m("FCFS's main drawback is…", "The convoy effect: short jobs wait behind a long one", ["Starvation of high priority", "Too many context switches", "It needs priorities"], "One long burst at the front raises everyone's waiting time."),
    ],
    tip: "Learn these: TAT = CT − AT = WT + BT, and WT = TAT − BT. Here AT = 0, so TAT = CT.",
  },
  "16": {
    title: "Priority scheduling (C)",
    steps: ["read burst time and priority for each process", "sort by priority (smaller number = higher priority), swapping bt and pid too", "compute wt and tat as in FCFS and print the averages"],
    mcq: [
      m("The main problem with priority scheduling is…", "Starvation of low-priority processes", ["The convoy effect only", "It can't be implemented in C", "It always has the highest waiting time"], "The fix is aging: slowly raise a waiting process's priority."),
      m("Non-preemptive means…", "A running process keeps the CPU until it finishes", ["The OS can interrupt at any time", "Every process gets a time slice", "Processes run in parallel"], "Preemptive priority would switch as soon as a higher-priority job arrives."),
    ],
  },
  "17": {
    title: "Leap year",
    steps: ["read y", "leap if (y % 4 == 0 && y % 100 != 0) || y % 400 == 0", "echo the result"],
    mcq: [
      m("Is 1900 a leap year?", "No: divisible by 100 but not by 400", ["Yes: divisible by 4", "Yes: divisible by 100", "Only in some calendars"], "2000 is a leap year because it is divisible by 400."),
    ],
  },
  "18": {
    title: "Menu with case",
    steps: ["while true: show the menu, read choice", "case $choice in 1) multiply ;; 2) subtract ;; 3) exit 0 ;; *) invalid ;; esac", "done"],
    mcq: [
      m("Which ends each case branch?", ";;", [";", "break", "fi"], "The whole case block ends with esac."),
      m("How does this infinite loop stop?", "Choice 3 runs exit 0", ["It times out", "After 10 rounds", "break inside case 2"], "while true never ends by itself."),
      m("The *) branch matches…", "Anything not matched above (default)", ["Only '*'", "Multiplication", "Empty input only"], "It's like default: in a C switch."),
    ],
    tip: "In the simulator, the input box must end with 3 (Exit), otherwise the loop keeps asking for input.",
  },
  "19": {
    title: "Swap without a third variable",
    steps: ["read a and b", "a=$((a + b)); b=$((a - b)); a=$((a - b))", "print the swapped values"],
    mcq: [
      m("After a=a+b; b=a−b; a=a−b with a=10, b=20…", "a = 20, b = 10", ["a = 10, b = 20", "a = 30, b = 10", "a = 20, b = 30"], "A XOR swap (a^=b; b^=a; a^=b) also works."),
    ],
  },
  "20": {
    title: "Grade from marks",
    steps: ["read m1 m2 m3 m4 on one line", "avg=$(( (m1 + m2 + m3 + m4) / 4 ))", "if / elif ladder: ≥ 90 → A, ≥ 75 → B, …"],
    mcq: [
      m("How do you read four values typed on one line?", "read m1 m2 m3 m4", ["read m1,m2,m3,m4", "read -4 m", "input m1 m2 m3 m4"], "read splits the line on spaces into each variable."),
      m("elif is short for…", "else if", ["else fi", "end if", "elseif loop"], "if … elif … else … fi."),
    ],
  },
  "21": {
    title: "Power without built-ins",
    steps: ["read base and exp", "result=1; loop exp times: result=$((result * base))", "print result"],
    mcq: [
      m("2 to the power 10 is…", "1024", ["20", "512", "100"], "Bash also has ** in $(( 2 ** 10 )), but the aim says not to use it."),
    ],
  },
  "22": {
    title: "Factorial with a function",
    steps: ["factorial() { local n=$1; … echo $fact; }", "read num", "result=$(factorial $num) and print"],
    mcq: [
      m("Inside a function, $1 is…", "The first argument passed to it", ["The script's name", "The exit status", "The number of arguments"], "$0 is the script, $# the argument count, $? the last exit status."),
      m("Why use `local` inside the function?", "So the variable doesn't leak into the rest of the script", ["To make it faster", "Bash requires it", "To make it read-only"], "Without local, every variable in bash is global."),
    ],
  },
  "23": {
    title: "Full name from title and name",
    steps: ["read title (Mr / Ms / Dr)", "read name", "echo \"$title. $name\""],
    mcq: [
      m("Joining two strings in bash is done by…", "Writing them next to each other: \"$a $b\"", ["a + b", "concat(a, b)", "a . b"], "Bash has no + for strings."),
    ],
  },
  "24": {
    title: "Star pyramid",
    steps: ["read rows n", "for each row i: print n − i spaces, then 2i − 1 stars", "echo after each row"],
    mcq: [
      m("Row i of a centred pyramid has how many stars?", "2i − 1", ["i", "2i", "i²"], "1, 3, 5, 7, …"),
    ],
  },
  "25": {
    title: "Number pattern",
    steps: ["read n", "nested loops: outer i = 1..n, inner j = 1..i", "echo -n $j, then a newline after each row"],
    mcq: [
      m("In a nested loop, the inner loop runs…", "Completely for every single outer iteration", ["Once in total", "Only when the outer loop ends", "In parallel"], "That is why the work is n × n for full grids."),
    ],
  },
  "26": {
    title: "Array input & display",
    steps: ["read n", "for i in 0..n-1: read arr[i]", "loop again and print arr[$i] (or ${arr[@]})"],
    mcq: [
      m("${arr[@]} gives…", "All the elements of the array", ["The array length", "The first element", "The last index"], "${#arr[@]} gives the length."),
      m("Bash array indices start at…", "0", ["1", "-1", "Any number you choose"], "Same as C."),
    ],
  },
  "27": {
    title: "Largest in an array",
    steps: ["read the elements into arr", "max=${arr[0]}", "loop: if [ ${arr[i]} -gt $max ] then max=${arr[i]}"],
    mcq: [
      m("Why start max at arr[0] and not 0?", "So it also works when every element is negative", ["0 is not allowed", "It is faster", "arr[0] is always largest"], "Starting at 0 would wrongly return 0 for [-5, -2]."),
    ],
  },
  "28": {
    title: "Pascal's triangle",
    steps: ["read rows", "each entry: c = c × (i − j) / (j + 1), starting at 1", "print spaces first to centre each row"],
    mcq: [
      m("Each inner number in Pascal's triangle is…", "The sum of the two numbers above it", ["Double the one above", "Its row number", "Always 1"], "Row n holds the binomial coefficients nCk."),
    ],
  },
  "29": {
    title: "Largest of three",
    steps: ["read a b c", "if a ≥ b and a ≥ c → a; elif b ≥ c → b; else c", "print the largest"],
    mcq: [
      m("How do you write AND between two tests?", "[ $a -ge $b ] && [ $a -ge $c ]", ["[ $a -ge $b and $a -ge $c ]", "[ $a >= $b & $a >= $c ]", "if a ≥ b, c"], "Inside one [ ], -a also means AND, but && is clearer."),
    ],
  },
  "30": {
    title: "Linux commands",
    steps: ["mkdir, cd, ls: make and move around folders", "> writes, >> appends; cat shows a file", "grep searches, sed replaces, cal shows a calendar; xclock / oclock need X11"],
    mcq: [
      m("What is the difference between > and >>?", "> overwrites the file, >> appends to it", [">> overwrites, > appends", "They are the same", "> is for directories"], "echo hi >> notes.txt adds a line at the end."),
      m("grep -i 'an' file…", "Finds lines containing 'an', ignoring case", ["Deletes those lines", "Counts the lines", "Inverts the match"], "-v inverts, -n shows line numbers, -c counts."),
      m("sed 's/apple/grape/g' does…", "Replace every 'apple' with 'grape' on each line", ["Delete apple", "Search only", "Sort the file"], "Without g, only the first match on each line is replaced."),
    ],
  },
};
