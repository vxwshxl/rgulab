export const cSnippets: { title: string; code: string }[] = [
  { title: "Timing template (every DAA program)", code: "#include <stdio.h>\n#include <time.h>\n\nclock_t start = clock();\n/* ... algorithm ... */\nclock_t end = clock();\ndouble t = (double)(end - start) / CLOCKS_PER_SEC;\nprintf(\"\\nTime taken:%f seconds\", t);" },
  { title: "Read an array", code: 'int n, i;\nprintf("Enter the number of elements:");\nscanf("%d", &n);\nint a[n];\nprintf("Enter the elements:");\nfor (i = 0; i < n; i++)\n    scanf("%d", &a[i]);' },
  { title: "Read an n×n matrix", code: "int w[50][50];\nfor (i = 1; i <= n; i++)\n    for (j = 1; j <= n; j++)\n        scanf(\"%d\", &w[i][j]);" },
  { title: "Swap", code: "int temp = a[i];\na[i] = a[j];\na[j] = temp;" },
  { title: "Count comparisons", code: "int count = 0;\nfor (...) {\n    count++;          // one comparison\n    if (a[j] > a[j + 1]) ...\n}\nprintf(\"\\nNumber of comparisons:%d\", count);" },
];

export const paradigms: { name: string; idea: string; examples: string }[] = [
  { name: "Divide & conquer", idea: "Split into independent subproblems, solve each, combine", examples: "Binary search, merge sort, quick sort" },
  { name: "Dynamic programming", idea: "Overlapping subproblems + optimal substructure, so store and reuse the answers", examples: "Fibonacci DP, MCM, 0/1 knapsack, LCS, Floyd–Warshall, Bellman–Ford, TSP" },
  { name: "Greedy", idea: "Take the locally best choice; optimal only with the greedy-choice property", examples: "Fractional knapsack, job sequencing, Huffman, Prim, Kruskal, Dijkstra" },
  { name: "Backtracking", idea: "Build a solution step by step and undo when a constraint fails", examples: "N-Queen, subset sum, graph colouring" },
  { name: "Branch & bound", idea: "Explore the state space, prune with lower or upper bounds", examples: "Job assignment, TSP, 0/1 knapsack" },
];
