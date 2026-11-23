// Theory blocks for the /quick pages: what goes in the exam copy, and the theory examiners ask about.
import type { LabId } from "./labs";

export type Resource = { label: string; by: string; href: string; kind: "video" | "article" };

/** What to write in the exam copy, in order. */
export const examCopy: Partial<Record<LabId, { steps: string[]; note: string }>> = {
  daa: {
    steps: ["Aim", "Algorithm", "Program (type and run it on the machine)", "Output", "Time and space complexity"],
    note: "Implement the code on the machine, then write the algorithm, output and complexity in the exam copy. Every DAA card below shows them in that order.",
  },
  os: {
    steps: ["Aim", "Algorithm", "Program (type and run it on the machine)", "Output"],
    note: "Type and run the script or C program on the machine, then copy the algorithm and output. For the scheduling programs, also write the formulas used.",
  },
};

export const resources: Partial<Record<LabId, Resource[]>> = {
  daa: [
    { label: "NP-Hard and NP-Complete Problems", by: "Abdul Bari", href: "https://youtu.be/e2cF8a5aAhE", kind: "video" },
    { label: "Complexity Classes: P & NP classes", by: "Bhanu Priya · Education 4u", href: "https://www.youtube.com/watch?v=0yHYbz-Hec8", kind: "video" },
    { label: "Complexity Classes: P, NP, Co-NP, NP-Hard", by: "Coding Blocks", href: "https://www.youtube.com/watch?v=SeRUm32Dk-0", kind: "video" },
    { label: "Design and Analysis of Algorithms tutorial", by: "Tpoint Tech", href: "https://www.tpointtech.com/daa-tutorial", kind: "article" },
  ],
};

export type TheoryBlock = { title: string; points?: string[]; table?: { head: string[]; rows: string[][] }; qa?: [string, string][] };

export const daaTheory: TheoryBlock[] = [
  {
    title: "Asymptotic notations",
    table: {
      head: ["Notation", "Meaning", "Definition"],
      rows: [
        ["Big-O  O(g(n))", "Upper bound (at most)", "f(n) ≤ c·g(n) for all n ≥ n₀"],
        ["Big-Omega  Ω(g(n))", "Lower bound (at least)", "f(n) ≥ c·g(n) for all n ≥ n₀"],
        ["Big-Theta  Θ(g(n))", "Tight bound (exactly that order)", "c₁·g(n) ≤ f(n) ≤ c₂·g(n) for all n ≥ n₀"],
        ["little-o  o(g(n))", "Strictly smaller order", "f(n)/g(n) → 0"],
        ["little-omega  ω(g(n))", "Strictly larger order", "f(n)/g(n) → ∞"],
      ],
    },
    points: [
      "Growth order: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!).",
      "Best case = fewest steps for any input of size n; worst case = most steps; average case = expected steps over all inputs.",
      "Space complexity = extra memory the algorithm needs (auxiliary space), not counting the input.",
      "In the lab, time is measured with clock(): (end − start) / CLOCKS_PER_SEC gives seconds; 'count' tallies the basic operation.",
    ],
  },
  {
    title: "Recurrences and the Master theorem",
    points: [
      "Divide-and-conquer time is written as T(n) = a·T(n/b) + f(n): a subproblems of size n/b, plus f(n) to split and combine.",
      "Compare f(n) with n^(log_b a):",
      "Case 1: f(n) smaller → T(n) = Θ(n^(log_b a)).",
      "Case 2: f(n) equal → T(n) = Θ(n^(log_b a) · log n).",
      "Case 3: f(n) bigger (and regular) → T(n) = Θ(f(n)).",
    ],
    table: {
      head: ["Algorithm", "Recurrence", "Result"],
      rows: [
        ["Binary search", "T(n) = T(n/2) + O(1)", "O(log n)"],
        ["Merge sort", "T(n) = 2T(n/2) + O(n)", "O(n log n)"],
        ["Quick sort (best/avg)", "T(n) = 2T(n/2) + O(n)", "O(n log n)"],
        ["Quick sort (worst)", "T(n) = T(n − 1) + O(n)", "O(n²)"],
        ["Recursive Fibonacci", "T(n) = T(n − 1) + T(n − 2) + O(1)", "O(2ⁿ)"],
      ],
    },
  },
  {
    title: "Complexity classes: P, NP, NP-complete, NP-hard",
    points: [
      "Decision problem: the answer is yes/no (e.g. 'is there a tour of cost ≤ k?'). Optimisation problem: find the best value (e.g. 'shortest tour'). Classes P and NP are defined for decision problems.",
      "P: problems solvable in polynomial time by a deterministic algorithm. Examples: sorting, searching, shortest path (Dijkstra), MST (Prim, Kruskal).",
      "NP: problems whose 'yes' answer can be verified in polynomial time (equivalently, solvable in polynomial time by a non-deterministic algorithm). Every P problem is in NP, so P ⊆ NP.",
      "NP-hard: every NP problem can be reduced to it in polynomial time. It may not be in NP itself (e.g. the optimisation version of TSP, the halting problem).",
      "NP-complete: in NP and NP-hard at the same time, the hardest problems in NP. Examples: SAT, 3-SAT, vertex cover, clique, Hamiltonian cycle, TSP (decision), 0/1 knapsack (decision), subset sum, graph colouring.",
      "Cook–Levin theorem: SAT was the first problem proved NP-complete.",
      "Reduction (A ≤ₚ B): convert any instance of A to B in polynomial time. To prove X is NP-complete: show X ∈ NP, then reduce a known NP-complete problem to X.",
      "Co-NP: problems whose 'no' answer can be verified in polynomial time.",
      "P vs NP is unsolved: if any NP-complete problem has a polynomial algorithm, then P = NP.",
      "Tractable = solvable in polynomial time; intractable = no known polynomial algorithm.",
      "Non-deterministic algorithm: uses choice() to guess, then failure()/success() to check; it 'guesses' a solution and verifies it in polynomial time.",
    ],
    table: {
      head: ["Class", "Solve in poly time?", "Verify in poly time?", "Lab example"],
      rows: [
        ["P", "Yes", "Yes", "Binary search, sorting, Dijkstra, Prim, Kruskal, BFS, DFS"],
        ["NP", "Not known", "Yes", "Subset sum, 0/1 knapsack (decision), N-Queen existence"],
        ["NP-complete", "Not known", "Yes", "0/1 knapsack (decision), TSP (decision), subset sum"],
        ["NP-hard", "Not known", "Not necessarily", "TSP (optimisation, program 19 / 22)"],
      ],
    },
  },
  {
    title: "Design paradigms in this lab",
    table: {
      head: ["Paradigm", "Idea", "Lab programs"],
      rows: [
        ["Brute force", "Try every possibility directly", "Linear search, bubble sort, selection sort"],
        ["Divide & conquer", "Split, solve parts recursively, combine", "Binary search, merge sort, quick sort"],
        ["Greedy", "Take the best local choice each step", "Fractional knapsack, job sequencing, Huffman, Prim, Kruskal, Dijkstra"],
        ["Dynamic programming", "Store answers of overlapping subproblems", "Fibonacci DP, MCM, 0/1 knapsack, LCS, Floyd–Warshall, Bellman–Ford, TSP"],
        ["Backtracking", "Build step by step, undo on a dead end", "N-Queen"],
        ["Branch & bound", "Explore states, prune with bounds", "Job assignment"],
      ],
    },
  },
  {
    title: "Theory viva",
    qa: [
      ["What is an algorithm?", "A finite sequence of well-defined steps that takes input and produces output. Properties: input, output, definiteness, finiteness, effectiveness."],
      ["Why use asymptotic notation instead of seconds?", "Seconds depend on the machine and compiler; asymptotic notation describes how the work grows with n, independent of hardware."],
      ["Difference between O, Ω and Θ?", "O is an upper bound, Ω a lower bound and Θ a tight bound (both at once)."],
      ["What is the difference between P and NP?", "P problems can be solved in polynomial time; NP problems can have a proposed solution verified in polynomial time. P ⊆ NP; whether P = NP is unknown."],
      ["What is the difference between NP-hard and NP-complete?", "NP-complete problems are NP-hard AND in NP. NP-hard problems need not be in NP (they may not even be decision problems)."],
      ["Give an NP-complete problem.", "SAT (the first, by Cook's theorem), 3-SAT, vertex cover, Hamiltonian cycle, subset sum, 0/1 knapsack (decision)."],
      ["Is 0/1 knapsack solved in polynomial time by DP?", "No: O(nW) is pseudo-polynomial because it depends on the numeric value W, not the input size. The decision version is NP-complete."],
      ["What is a reduction?", "A polynomial-time conversion of one problem into another, used to show the second is at least as hard as the first."],
      ["Greedy vs dynamic programming?", "Greedy commits to the best local choice and never revisits it; DP solves all subproblems and combines them, so it works when greedy choice fails (e.g. 0/1 knapsack)."],
      ["Backtracking vs branch & bound?", "Backtracking explores depth-first and undoes choices that break constraints; branch & bound uses cost bounds to prune and usually explores the least-cost node first."],
    ],
  },
];
