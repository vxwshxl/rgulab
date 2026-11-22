// DAA Lab notes per program. Steps come from each file's Algorithm block when left empty.
import { m, type Note } from "./types";

type DaaNote = Omit<Note, "steps"> & { steps?: string[]; best: string; avg: string; worst: string; paradigm: string };

export const daaNotes: Record<string, DaaNote> = {
  "01": { title: "Linear search", paradigm: "Brute force", best: "O(1)", avg: "O(n)", worst: "O(n)", mcq: [
    m("Linear search's best case happens when…", "The key is the first element", ["The key is last", "The key is missing", "The array is sorted"], "One comparison, so O(1)."),
    m("Does linear search need a sorted array?", "No, it works on any order", ["Yes, always", "Only for numbers", "Only descending"], "Binary search is the one that needs sorted input."),
  ] },
  "02": { title: "Binary search", paradigm: "Divide & conquer", best: "O(1)", avg: "O(log n)", worst: "O(log n)", mcq: [
    m("Binary search requires…", "A sorted array", ["A linked list", "Distinct primes", "An even number of elements"], "It discards half of the range each step."),
    m("mid is computed as…", "low + (high − low) / 2", ["(low × high) / 2", "high − low", "n / 2 always"], "That form avoids integer overflow of (low + high)."),
    m("Maximum comparisons for n = 1024 is about…", "11", ["1024", "512", "32"], "⌊log₂ 1024⌋ + 1 = 11."),
  ] },
  "03": { title: "Bubble sort", paradigm: "Brute force", best: "O(n²)", avg: "O(n²)", worst: "O(n²)", mcq: [
    m("After pass 1 of bubble sort, where is the largest element?", "At the end of the array", ["At the start", "In the middle", "It depends on the input"], "Big values 'bubble' to the right."),
    m("How can bubble sort reach O(n) on sorted input?", "Stop when a pass makes no swaps (swapped flag)", ["Use recursion", "Start from the middle", "It can't"], "This version always runs every pass, so it stays O(n²)."),
    m("Comparisons made for n = 6 are…", "15", ["36", "6", "30"], "n(n − 1) / 2 = 15."),
  ] },
  "04": { title: "Selection sort", paradigm: "Brute force", best: "O(n²)", avg: "O(n²)", worst: "O(n²)", mcq: [
    m("Selection sort makes at most how many swaps?", "n − 1", ["n²", "n log n", "0"], "One swap per pass: useful when writing to memory is expensive."),
    m("Is selection sort stable?", "No, the long-distance swap can reorder equal keys", ["Yes, always", "Only for integers", "Only when n is even"], "Insertion sort and merge sort are stable."),
  ] },
  "05": { title: "Insertion sort", paradigm: "Incremental", best: "O(n)", avg: "O(n²)", worst: "O(n²)", mcq: [
    m("Insertion sort's best case is…", "An already sorted array: O(n)", ["A reversed array", "All keys equal to 0", "Random order"], "Each new key is compared once and stays put."),
    m("Insertion sort is like…", "Sorting playing cards in your hand", ["Building a heap", "Splitting into halves", "Counting digits"], "Take the next card and slide it left into place."),
  ] },
  "06": { title: "Radix sort", paradigm: "Non-comparison", best: "O(d·n)", avg: "O(d·n)", worst: "O(d·n)", mcq: [
    m("Radix sort sorts by…", "One digit at a time, least significant digit first", ["Comparing whole numbers", "Picking a pivot", "Merging halves"], "Each pass uses a stable counting sort on one digit."),
    m("Why must each digit pass be stable?", "To keep the order from the earlier digit passes", ["To save memory", "To handle negatives", "It doesn't need to be"], "Otherwise the earlier passes' work would be lost."),
  ] },
  "07": { title: "Bucket sort", paradigm: "Distribution", best: "O(n+k)", avg: "O(n+k)", worst: "O(n²)", mcq: [
    m("Bucket sort is fastest when the input is…", "Uniformly spread across the range", ["All in one bucket", "Already sorted", "All negative"], "If everything lands in one bucket it degrades to the inner sort, O(n²)."),
  ] },
  "08": { title: "Quick sort", paradigm: "Divide & conquer", best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)", mcq: [
    m("Quick sort's worst case happens when…", "The pivot is always the smallest or largest element", ["The array is random", "All elements are distinct", "n is a power of 2"], "For example, a sorted array with the last element as pivot."),
    m("partition() places the pivot…", "At its final sorted position", ["At index 0", "In the middle", "At the end"], "Smaller elements go left of it and larger ones right."),
    m("Is quick sort in-place?", "Yes, it only needs the O(log n) recursion stack", ["No, it needs O(n) extra space", "Only for small n", "Only iteratively"], "Merge sort is the one needing O(n) extra space."),
  ] },
  "09": { title: "Merge sort", paradigm: "Divide & conquer", best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", mcq: [
    m("Merge sort's recurrence is…", "T(n) = 2T(n/2) + O(n)", ["T(n) = T(n − 1) + O(1)", "T(n) = 2T(n − 1)", "T(n) = T(n/2) + O(1)"], "By the master theorem, that solves to O(n log n)."),
    m("Merge sort's extra space is…", "O(n) for the temporary array", ["O(1)", "O(log n)", "O(n²)"], "Its time is always O(n log n), even in the worst case."),
  ] },
  "10": { title: "Fibonacci (recursive)", paradigm: "Recursion", best: "O(2ⁿ)", avg: "O(2ⁿ)", worst: "O(2ⁿ)", mcq: [
    m("Why is recursive Fibonacci exponential?", "It recomputes the same subproblems many times", ["Recursion is always exponential", "It uses arrays", "It prints every term"], "fib(n − 2) is computed by both fib(n) and fib(n − 1)."),
  ] },
  "11": { title: "Fibonacci (DP)", paradigm: "Dynamic programming", best: "O(n)", avg: "O(n)", worst: "O(n)", mcq: [
    m("The two key properties DP needs are…", "Overlapping subproblems and optimal substructure", ["Sorting and searching", "Greedy choice and recursion", "Randomness and pruning"], "Fibonacci has overlapping subproblems, so storing them gives O(n)."),
    m("Memoization vs tabulation:", "Top-down with a cache vs bottom-up filling a table", ["They are identical", "Tabulation is recursive", "Memoization never uses memory"], "This program fills f[0..n] bottom-up (tabulation)."),
  ] },
  "12": { title: "Matrix chain multiplication", paradigm: "Dynamic programming", best: "O(n³)", avg: "O(n³)", worst: "O(n³)", mcq: [
    m("Matrix chain multiplication decides…", "The parenthesisation with the fewest scalar multiplications", ["The product matrix", "Whether the matrices can be multiplied", "The determinant"], "The product is the same either way; only the cost changes."),
    m("Cost of multiplying a p×q by a q×r matrix:", "p × q × r", ["p + q + r", "p × r", "q²"], "m[i][j] = min over k of m[i][k] + m[k+1][j] + p(i−1)·p(k)·p(j)."),
  ] },
  "13": { title: "0/1 knapsack", paradigm: "Dynamic programming", best: "O(nW)", avg: "O(nW)", worst: "O(nW)", mcq: [
    m("In 0/1 knapsack, each item is…", "Taken whole or left out", ["Taken in any fraction", "Taken at most twice", "Always taken"], "Fractions are allowed only in the fractional (greedy) version."),
    m("The DP table K[i][w] stores…", "The best value using the first i items with capacity w", ["The weight of item i", "The number of items", "The ratio value/weight"], "K[i][w] = max(K[i−1][w], v[i] + K[i−1][w − wt[i]])."),
    m("Why is O(nW) called pseudo-polynomial?", "It grows with the numeric value W, not with the input size", ["It is exponential in n", "It ignores n", "It is O(n²)"], "Doubling W's digits makes W exponentially larger."),
  ] },
  "14": { title: "Longest common subsequence", paradigm: "Dynamic programming", best: "O(mn)", avg: "O(mn)", worst: "O(mn)", mcq: [
    m("Subsequence vs substring:", "A subsequence keeps the order but can skip characters", ["They are the same", "A substring can skip characters", "A subsequence must be contiguous"], "BCBA is an LCS of ABCBDAB and BDCABA (length 4)."),
    m("When x[i] = y[j], c[i][j] =", "c[i−1][j−1] + 1", ["max(c[i−1][j], c[i][j−1])", "0", "c[i−1][j] + 1"], "Otherwise take the max of the cells above and to the left."),
  ] },
  "15": { title: "Fractional knapsack", paradigm: "Greedy", best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", mcq: [
    m("The greedy choice for fractional knapsack is…", "Highest value/weight ratio first", ["Lightest item first", "Most valuable item first", "Random order"], "Sorting by ratio is the O(n log n) step."),
    m("Does the same greedy rule solve 0/1 knapsack optimally?", "No, 0/1 knapsack needs DP", ["Yes, always", "Only when W is even", "Only for 4 items"], "Without fractions, a high-ratio item can waste capacity."),
  ] },
  "16": { title: "Job sequencing with deadlines", paradigm: "Greedy", best: "O(n log n)", avg: "O(n²)", worst: "O(n²)", mcq: [
    m("Job sequencing greedily picks jobs by…", "Highest profit first, put in the latest free slot before its deadline", ["Earliest deadline first only", "Shortest job first", "Lowest profit first"], "Each job takes one unit of time."),
  ] },
  "17": { title: "Huffman coding", paradigm: "Greedy", best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", mcq: [
    m("Huffman coding repeatedly merges…", "The two lowest-frequency nodes", ["The two highest-frequency nodes", "Adjacent characters", "Vowels first"], "So frequent characters end up with short codes."),
    m("Huffman codes are prefix codes, meaning…", "No code is the start of another code", ["Every code starts with 0", "All codes are the same length", "Codes are sorted"], "That makes decoding unambiguous."),
  ] },
  "18": { title: "N-Queen", paradigm: "Backtracking", best: "O(n!)", avg: "O(n!)", worst: "O(n!)", mcq: [
    m("Backtracking means…", "Undo the last choice when it leads to a dead end", ["Trying every option at once", "Sorting first", "Dividing into halves"], "Place a queen; if no safe column remains in the next row, move the previous queen."),
    m("Two queens at (i, a) and (j, b) attack diagonally when…", "|i − j| = |a − b|", ["i = j", "a + b = 0", "i × j = a × b"], "That is the place() check, together with a ≠ b."),
    m("How many solutions does 4-Queen have?", "2", ["1", "4", "0"], "8-Queen has 92."),
  ] },
  "19": { title: "Travelling salesman (DP)", paradigm: "Dynamic programming", best: "O(n²·2ⁿ)", avg: "O(n²·2ⁿ)", worst: "O(n²·2ⁿ)", mcq: [
    m("The Held–Karp DP state g(i, S) is…", "The shortest path from i through every city in S, back to the start", ["The distance from i to j", "The number of cities", "A spanning tree"], "That's 2ⁿ subsets × n cities."),
    m("TSP is…", "NP-hard", ["Solvable in O(n log n)", "A greedy problem", "Always solved by Dijkstra"], "DP is exact but exponential, and brute force is O(n!)."),
  ] },
  "20": { title: "Breadth-first search", paradigm: "Graph traversal", best: "O(V+E)", avg: "O(V+E)", worst: "O(V+E)", mcq: [
    m("BFS uses which data structure?", "A queue (FIFO)", ["A stack", "A heap", "A hash map only"], "Visit level by level from the source."),
    m("On an unweighted graph, BFS finds…", "Shortest paths in number of edges", ["The minimum spanning tree", "Topological order", "Strongly connected components"], "With an adjacency matrix it is O(V²)."),
  ] },
  "21": { title: "Depth-first search", paradigm: "Graph traversal", best: "O(V+E)", avg: "O(V+E)", worst: "O(V+E)", mcq: [
    m("DFS uses…", "A stack (or recursion)", ["A queue", "A priority queue", "Sorting"], "Go as deep as possible, then backtrack."),
    m("A common use of DFS is…", "Cycle detection and topological sort", ["Shortest weighted paths", "Huffman codes", "Matrix multiplication"], "Also connected components."),
  ] },
  "22": { title: "Job assignment (branch & bound)", paradigm: "Branch & bound", best: "O(n²)", avg: "O(n!)", worst: "O(n!)", mcq: [
    m("Branch & bound prunes a node when…", "Its lower bound is worse than the best solution found so far", ["It is a leaf", "Its cost is even", "It was visited twice"], "The least-cost (lb) node is expanded next."),
    m("Backtracking vs branch & bound:", "B&B uses bounds to prune and usually BFS / least-cost order", ["They are identical", "Backtracking always finds the optimum faster", "B&B never prunes"], "Backtracking is DFS with feasibility checks."),
  ] },
  "23": { title: "Dijkstra", paradigm: "Greedy", best: "O(V²)", avg: "O(V²)", worst: "O(V²)", mcq: [
    m("Dijkstra fails when the graph has…", "Negative edge weights", ["Cycles", "More than 10 vertices", "Undirected edges"], "Use Bellman–Ford for negative weights."),
    m("RELAX(u, v) does…", "if d[v] > d[u] + w(u, v): update d[v] and p[v]", ["Removes the edge (u, v)", "Swaps u and v", "Adds v to S"], "Each vertex is finalised when it is extracted with the minimum d."),
    m("With a binary heap, Dijkstra becomes…", "O((V + E) log V)", ["O(V³)", "O(VE)", "O(1)"], "This program uses a matrix scan, so it is O(V²)."),
  ] },
  "24": { title: "Floyd–Warshall", paradigm: "Dynamic programming", best: "O(V³)", avg: "O(V³)", worst: "O(V³)", mcq: [
    m("Floyd–Warshall's update is…", "d[i][j] = min(d[i][j], d[i][k] + d[k][j])", ["d[i][j] = d[i][k] × d[k][j]", "d[i][j] = max(...)", "d[i][j] = d[j][i]"], "k is the outermost loop: allow vertex k as an intermediate."),
    m("Floyd–Warshall solves…", "All-pairs shortest paths", ["Single-source only", "Minimum spanning trees", "Graph colouring"], "It handles negative edges, but not negative cycles."),
  ] },
  "25": { title: "Bellman–Ford", paradigm: "Dynamic programming", best: "O(VE)", avg: "O(VE)", worst: "O(VE)", mcq: [
    m("Bellman–Ford relaxes every edge how many times?", "V − 1", ["V", "E", "log V"], "A shortest path has at most V − 1 edges."),
    m("How does it detect a negative cycle?", "If any edge can still be relaxed after V − 1 rounds", ["d[source] becomes negative", "It counts the edges", "It can't"], "That V-th round check is the negative-cycle test."),
  ] },
  "26": { title: "Prim's MST", paradigm: "Greedy", best: "O(V²)", avg: "O(V²)", worst: "O(V²)", mcq: [
    m("Prim's algorithm grows the MST by…", "Adding the cheapest edge from the tree to a new vertex", ["Adding the globally cheapest edge anywhere", "Removing the heaviest edge", "BFS from every vertex"], "Kruskal is the one that picks the globally cheapest edge."),
    m("A spanning tree on V vertices has how many edges?", "V − 1", ["V", "E", "2V"], "Connected and without cycles."),
  ] },
  "27": { title: "Kruskal's MST", paradigm: "Greedy", best: "O(E²)", avg: "O(E²)", worst: "O(E²)", mcq: [
    m("Kruskal adds edges in order of…", "Increasing weight, skipping edges that form a cycle", ["Decreasing weight", "Vertex number", "Random order"], "Union-Find checks whether the two ends are already connected."),
    m("Kruskal is better than Prim on…", "Sparse graphs (few edges)", ["Dense graphs", "Complete graphs only", "Directed graphs"], "It sorts E edges, so it is O(E log E) with a proper sort."),
  ] },
};
