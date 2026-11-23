// Answer explanations for generated exercises (blanks, imports, line ordering).
import type { Lang } from "@/data/labs";

/* ---------- Python / DS ---------- */

const PY: Record<string, string> = {
  // pandas
  DataFrame: "pd.DataFrame builds a 2-D table (rows × columns) from a dict, list or array.",
  Series: "pd.Series is a single labelled column of values.",
  read_csv: "pd.read_csv() loads a .csv file into a DataFrame.",
  read_excel: "pd.read_excel() loads an .xlsx sheet into a DataFrame (needs openpyxl).",
  read_json: "pd.read_json() loads a .json file into a DataFrame.",
  to_csv: "to_csv() writes the DataFrame to a .csv file.",
  to_excel: "to_excel() writes the DataFrame to an .xlsx file.",
  to_json: "to_json() writes the DataFrame to a .json file.",
  head: "head() shows the first 5 rows, a quick look at the data.",
  info: "info() prints column names, dtypes and non-null counts.",
  describe: "describe() gives count, mean, std, min, quartiles and max per numeric column.",
  isnull: "isnull() marks missing values as True; add .sum() to count them per column.",
  fillna: "fillna() replaces missing values (NaN) with the value you give it.",
  dropna: "dropna() removes rows (or columns) that contain missing values.",
  drop: "drop() removes the named rows or columns (axis=1 for columns).",
  drop_duplicates: "drop_duplicates() removes repeated rows.",
  where: "where() keeps values where the condition is True and puts NaN elsewhere.",
  strip: "str.strip() removes spaces at both ends of each string.",
  str: ".str gives string methods (strip, lower, title…) for a whole column.",
  lower: "lower() converts text to lowercase so 'The' and 'the' match.",
  title: "title() capitalises the first letter of each word (or sets a plot title).",
  mean: "mean() is the average: sum ÷ count.",
  median: "median() is the middle value when sorted; outliers barely move it.",
  mode: "mode() is the most frequent value; [0] takes the first one.",
  var: "var() is the variance: the average squared distance from the mean.",
  std: "std() is the standard deviation, the square root of the variance.",
  cov: "cov() gives the covariance matrix: how pairs of columns vary together.",
  corr: "corr() gives the correlation matrix, with values from −1 to 1.",
  sum: "sum() adds values (per column for a DataFrame).",
  round: "round() limits the number of decimal places.",
  sort_values: "sort_values() orders rows by a column; ascending=False for largest first.",
  ascending: "ascending=False sorts from largest to smallest.",
  idxmax: "idxmax() returns the index label of the largest value.",
  loc: "loc selects rows/columns by label or by a True/False mask.",
  shape: "shape is (rows, columns).",
  columns: "columns holds the column names.",
  index: "index holds the row labels (index=False stops it being written to files).",
  items: "items() loops over (key, value) pairs.",
  get: "get() reads a dict value safely, with a default if the key is missing.",
  orient: "orient='records' writes JSON as one object per row.",
  axis: "axis=0 works down the rows, axis=1 across the columns.",
  dtype: "dtype is the data type of the values (int64, float64, object…).",
  nan: "np.nan is the 'missing value' marker.",
  // numpy
  array: "np.array() turns a list into a NumPy array for fast maths.",
  linalg: "np.linalg holds the linear-algebra routines (svd, inv, eig…).",
  svd: "svd() splits a matrix into U, Σ and Vᵀ (singular value decomposition).",
  full_matrices: "full_matrices=False returns the compact (economy) SVD.",
  diag: "np.diag() turns the singular values into a diagonal matrix.",
  random: "np.random generates random numbers for synthetic data.",
  seed: "random.seed() fixes the random numbers so every run gives the same result.",
  normal: "random.normal(mean, std, size) samples from a bell curve.",
  multivariate_normal: "multivariate_normal() samples correlated 2-D points from a mean vector and covariance matrix.",
  argsort: "argsort() returns the indices that would sort the array.",
  rowvar: "rowvar=False tells np.cov that columns are variables.",
  // matplotlib / seaborn / plotly
  plot: "plot() draws a line or bar chart (kind='bar' for bars).",
  bar: "bar() draws a bar chart, for comparing categories.",
  hist: "hist() draws a histogram, which shows the distribution of one numeric column.",
  bins: "bins sets how many bars a histogram is split into.",
  scatter: "scatter() plots x against y as dots, which shows the relationship.",
  pie: "pie() draws a pie chart, which shows the share of each part in the whole.",
  autopct: "autopct='%1.1f%%' prints the percentage on each pie slice.",
  boxplot: "boxplot() shows the median, quartiles and outliers.",
  show: "plt.show() displays the figure (in Spyder it appears in the Plots pane).",
  xlabel: "xlabel() names the x-axis.",
  ylabel: "ylabel() names the y-axis.",
  legend: "legend() shows which colour is which series.",
  figsize: "figsize=(w, h) sets the figure size in inches.",
  subplots: "plt.subplots() makes a figure with one or more axes.",
  set_title: "ax.set_title() names one subplot.",
  tight_layout: "tight_layout() stops labels overlapping between subplots.",
  marker: "marker sets the dot shape on a line or scatter plot.",
  color: "color sets the colour of the plotted marks.",
  label: "label is the text that appears in the legend.",
  heatmap: "sns.heatmap() colours a matrix; used for correlation or confusion matrices.",
  annot: "annot=True writes the number inside each heatmap cell.",
  cmap: "cmap picks the colour map (e.g. 'coolwarm', 'Blues').",
  countplot: "sns.countplot() shows how many rows fall in each category.",
  pairplot: "sns.pairplot() draws a scatter plot for every pair of columns.",
  scatterplot: "sns.scatterplot() is a scatter plot; hue colours points by a category.",
  hue: "hue colours the points or bars by a category column.",
  hover_data: "hover_data lists the extra columns shown on hover in Plotly.",
  // sklearn datasets
  load_iris: "load_iris() loads the built-in Iris dataset (150 flowers, 3 species). No download needed.",
  load_wine: "load_wine() loads the built-in Wine dataset (178 samples, 3 classes).",
  load_digits: "load_digits() loads 8×8 handwritten digit images (64 features).",
  load_breast_cancer: "load_breast_cancer() loads a built-in binary classification dataset.",
  make_blobs: "make_blobs() creates synthetic clusters, which is ideal for clustering demos.",
  make_classification: "make_classification() creates a synthetic labelled dataset.",
  as_frame: "as_frame=True returns the dataset as a pandas DataFrame.",
  return_X_y: "return_X_y=True returns (X, y) directly instead of a Bunch object.",
  data: ".data is the feature matrix of a sklearn dataset.",
  target: ".target holds the labels (the y values).",
  target_names: "target_names holds the class names behind the numeric labels.",
  feature_names: "feature_names holds the column names of the features.",
  frame: ".frame is the dataset as one DataFrame (with as_frame=True).",
  n_samples: "n_samples is how many rows to generate.",
  n_features: "n_features is how many columns (features) to generate.",
  n_informative: "n_informative is how many features actually carry the signal.",
  n_redundant: "n_redundant is how many features are combinations of the informative ones.",
  centers: "centers is how many clusters make_blobs creates.",
  cluster_std: "cluster_std is how spread out each blob is.",
  random_state: "random_state fixes the randomness so results are reproducible.",
  // model selection & preprocessing
  train_test_split: "train_test_split() splits the data into training and test sets.",
  test_size: "test_size=0.2 keeps 20% of the rows for testing.",
  cross_val_score: "cross_val_score() trains and tests on k folds and returns one score per fold.",
  StandardScaler: "StandardScaler rescales each feature to mean 0 and std 1.",
  make_pipeline: "make_pipeline() chains steps (e.g. scaler → model) into one estimator.",
  fit: "fit() learns from the training data.",
  predict: "predict() gives the model's predicted labels or values.",
  predict_proba: "predict_proba() gives the probability for each class.",
  transform: "transform() applies a fitted transformation to new data.",
  fit_transform: "fit_transform() learns the transformation and applies it in one step.",
  fit_predict: "fit_predict() fits a clustering model and returns each point's cluster.",
  score: "score() returns accuracy (classifiers) or R² (regressors).",
  // models
  LinearRegression: "LinearRegression fits a straight line: y = mx + c.",
  LogisticRegression: "LogisticRegression is a classifier: it passes a linear score through the sigmoid.",
  Ridge: "Ridge is linear regression with an L2 penalty that shrinks the coefficients.",
  Lasso: "Lasso is linear regression with an L1 penalty that can make coefficients exactly 0.",
  alpha: "alpha is the regularisation strength: bigger means more shrinkage.",
  coef_: "coef_ holds the learned slopes (one per feature).",
  intercept_: "intercept_ is the learned constant term c.",
  DecisionTreeClassifier: "DecisionTreeClassifier splits the data with if/else rules on the features.",
  max_depth: "max_depth limits how deep a tree grows, which helps against overfitting.",
  criterion: "criterion picks the split measure: 'gini' or 'entropy'.",
  export_text: "export_text() prints the decision tree's rules as text.",
  RandomForestClassifier: "RandomForestClassifier averages many decision trees (bagging).",
  n_estimators: "n_estimators is the number of trees in the forest.",
  KNeighborsClassifier: "KNeighborsClassifier labels a point by majority vote of its k nearest neighbours.",
  n_neighbors: "n_neighbors is k, the number of neighbours that vote.",
  GaussianNB: "GaussianNB is Naive Bayes for numeric features, assuming each follows a normal distribution.",
  SVC: "SVC is a support vector classifier: it finds the widest-margin boundary.",
  kernel: "kernel chooses the SVM's boundary shape: 'linear', 'rbf', 'poly'.",
  max_iter: "max_iter caps the number of training iterations.",
  KMeans: "KMeans groups points around k centroids.",
  n_clusters: "n_clusters is k, the number of groups.",
  n_init: "n_init is how many times K-Means restarts with new centroids (the best run is kept).",
  cluster_centers_: "cluster_centers_ holds the final centroid coordinates.",
  labels: "labels holds the cluster assigned to each point.",
  AgglomerativeClustering: "AgglomerativeClustering merges the closest clusters bottom-up (hierarchical clustering).",
  GaussianMixture: "GaussianMixture models the data as a mix of Gaussian blobs (soft clustering).",
  n_components: "n_components is how many components (or dimensions) to keep.",
  PCA: "PCA projects the data onto the directions of most variance.",
  explained_variance_ratio_: "explained_variance_ratio_ is the share of the variance each component keeps.",
  TruncatedSVD: "TruncatedSVD reduces dimensions by keeping the top singular vectors.",
  linkage: "linkage() builds the hierarchical merge tree that the dendrogram draws.",
  dendrogram: "dendrogram() draws the hierarchical clustering tree.",
  fcluster: "fcluster() cuts the dendrogram into flat cluster labels.",
  method: "method picks how cluster distance is measured ('ward', 'single', 'complete').",
  // metrics
  accuracy_score: "accuracy_score() is correct predictions ÷ total.",
  precision_score: "precision_score() is TP ÷ (TP + FP): how many predicted positives were right.",
  recall_score: "recall_score() is TP ÷ (TP + FN): how many real positives were found.",
  f1_score: "f1_score() is the harmonic mean of precision and recall.",
  roc_auc_score: "roc_auc_score() is the area under the ROC curve; 1.0 is perfect, 0.5 is guessing.",
  confusion_matrix: "confusion_matrix() counts TP, FP, FN and TN for each class.",
  classification_report: "classification_report() prints precision, recall and F1 for every class.",
  mean_squared_error: "mean_squared_error() is the average squared prediction error; take √ for RMSE.",
  r2_score: "r2_score() is the share of the variance in y the model explains.",
  silhouette_score: "silhouette_score() runs from −1 to 1; higher means tighter, better-separated clusters.",
  davies_bouldin_score: "davies_bouldin_score(): lower is better; it compares cluster spread with the distance between clusters.",
  cosine_similarity: "cosine_similarity() measures the angle between vectors: 1 means the same direction.",
  // scipy
  stats: "scipy.stats holds the statistical tests and distributions.",
  ttest_1samp: "ttest_1samp() tests whether a sample's mean differs from a given value.",
  sem: "sem() is the standard error of the mean: std ÷ √n.",
  interval: "t.interval() gives a confidence interval for the mean.",
  // text / nltk
  TfidfVectorizer: "TfidfVectorizer turns text into TF-IDF weights, so rare, telling words score high.",
  stop_words: "stop_words='english' drops common words like 'the' and 'is'.",
  get_feature_names_out: "get_feature_names_out() returns the vocabulary words for the columns.",
  word_tokenize: "word_tokenize() splits a sentence into words and punctuation.",
  stopwords: "stopwords.words('english') is NLTK's list of common words to remove.",
  words: "words('english') returns the stop-word list.",
  PorterStemmer: "PorterStemmer cuts words to their stem: 'running' → 'run'.",
  stem: "stem() reduces a word to its root form.",
  isalnum: "isalnum() keeps only tokens that are letters or digits (drops punctuation).",
  download: "nltk.download() fetches a corpus; data is already bundled offline here.",
  quiet: "quiet=True hides the download progress output.",
  // networkx
  Graph: "nx.Graph() creates an empty undirected graph.",
  karate_club_graph: "karate_club_graph() is the classic 34-member social network.",
  nodes: "nodes() lists the graph's vertices.",
  edges: "edges() lists the graph's connections.",
  degree: "degree is how many edges touch a node.",
  draw: "nx.draw() plots the graph.",
  with_labels: "with_labels=True writes each node's name on it.",
  node_color: "node_color sets the colour of each node.",
  node_size: "node_size sets how big the nodes are drawn.",
  shortest_path: "shortest_path() returns the fewest-hop route between two nodes.",
  greedy_modularity_communities: "greedy_modularity_communities() finds tightly connected groups.",
  kernighan_lin_bisection: "kernighan_lin_bisection() splits a graph into two balanced halves with few cut edges.",
  cut_size: "cut_size() counts the edges crossing between two node sets.",
  clustering: "clustering() measures how many of a node's neighbours are also connected.",
  neighbors: "neighbors() lists the nodes directly connected to a node.",
  // misc
  time: "time.time() returns the current time in seconds; subtract two readings to time code.",
  key: "key= tells sort/max which value to compare by.",
  size: "size sets how many values to generate (or the marker size).",
  json: "json reads and writes JSON files.",
  csv: "csv is Python's built-in CSV reader/writer.",
  xlsx: ".xlsx is the Excel file format.",
};

const PY_MODULES: Record<string, string> = {
  pandas: "pandas: tables (DataFrame) and file I/O.",
  numpy: "numpy: fast arrays and maths.",
  "matplotlib.pyplot": "matplotlib.pyplot: the plotting interface, imported as plt.",
  seaborn: "seaborn: statistical plots built on matplotlib.",
  "plotly.express": "plotly.express: interactive charts.",
  scipy: "scipy: scientific maths, including stats.",
  "scipy.cluster.hierarchy": "scipy.cluster.hierarchy: linkage, dendrogram and fcluster for hierarchical clustering.",
  "sklearn.datasets": "sklearn.datasets: built-in datasets (load_*) and generators (make_*).",
  "sklearn.model_selection": "sklearn.model_selection: splitting and cross-validation tools.",
  "sklearn.preprocessing": "sklearn.preprocessing: scalers and encoders.",
  "sklearn.linear_model": "sklearn.linear_model: linear and logistic regression, Ridge, Lasso.",
  "sklearn.tree": "sklearn.tree: decision trees.",
  "sklearn.ensemble": "sklearn.ensemble: random forests and boosting.",
  "sklearn.neighbors": "sklearn.neighbors: k-nearest neighbours.",
  "sklearn.naive_bayes": "sklearn.naive_bayes: Naive Bayes classifiers.",
  "sklearn.svm": "sklearn.svm: support vector machines.",
  "sklearn.cluster": "sklearn.cluster: K-Means, agglomerative and other clustering.",
  "sklearn.mixture": "sklearn.mixture: Gaussian mixture models.",
  "sklearn.decomposition": "sklearn.decomposition: PCA and TruncatedSVD.",
  "sklearn.metrics": "sklearn.metrics: accuracy, precision, recall, F1, R², silhouette…",
  "sklearn.metrics.pairwise": "sklearn.metrics.pairwise: similarity and distance between rows.",
  "sklearn.pipeline": "sklearn.pipeline: chaining preprocessing and model steps.",
  "sklearn.feature_extraction.text": "sklearn.feature_extraction.text: turning text into numeric vectors.",
  nltk: "nltk: natural-language toolkit.",
  "nltk.corpus": "nltk.corpus: word lists such as stopwords.",
  "nltk.tokenize": "nltk.tokenize: splitting text into words or sentences.",
  "nltk.stem": "nltk.stem: stemmers such as PorterStemmer.",
  networkx: "networkx: graphs and network analysis.",
  "networkx.algorithms.community": "networkx.algorithms.community: community detection.",
  time: "time: wall-clock timing.",
};

/* ---------- C ---------- */

const C: Record<string, string> = {
  printf: "printf() prints formatted output (%d int, %f float, %s string).",
  scanf: "scanf() reads input into variables; pass their addresses with &.",
  sprintf: "sprintf() formats text into a string instead of printing it.",
  strlen: "strlen() returns the length of a string (without the '\\0').",
  clock: "clock() reads processor time; the difference between two calls times the algorithm.",
  clock_t: "clock_t is the type that holds clock() readings.",
  CLOCKS_PER_SEC: "Dividing by CLOCKS_PER_SEC converts clock ticks to seconds.",
  start: "start stores clock() before the algorithm runs.",
  end: "end stores clock() after the algorithm finishes.",
  time_taken: "time_taken = (end − start) / CLOCKS_PER_SEC, in seconds.",
  for: "for (init; condition; update) repeats a block a counted number of times.",
  while: "while (condition) repeats as long as the condition is true.",
  if: "if runs the block only when the condition is true.",
  else: "else runs when the if condition was false.",
  return: "return exits the function and hands back a value.",
  break: "break leaves the nearest loop (or switch) immediately.",
  continue: "continue skips to the next loop iteration.",
  count: "count tallies the basic operations (comparisons/steps) to show the complexity.",
  comp: "comp counts comparisons, the basic operation being measured.",
  low: "low is the left end of the current search or sort range.",
  high: "high is the right end of the current range.",
  mid: "mid = (low + high) / 2 splits the range in half.",
  key: "key is the value being searched for, or the element being inserted.",
  temp: "temp holds one value while two are swapped.",
  min: "min tracks the smallest value (or its index) found so far.",
  max: "max tracks the largest value found so far.",
  smallest: "smallest is the index of the minimum in the unsorted part.",
  pivot: "pivot is the element partition() places in its final sorted position.",
  partition: "partition() puts smaller elements left of the pivot and larger ones right.",
  quickSort: "quickSort() partitions, then sorts both sides recursively.",
  mergeSort: "mergeSort() splits the array in half, sorts each half recursively, then merges.",
  merge: "merge() combines two sorted halves into one sorted run.",
  left: "left is the start index of the left half (or the left child).",
  right: "right is the end index of the right half (or the right child).",
  heapify: "heapify() pushes a node down until the max-heap property holds.",
  bucket: "bucket groups values by digit (radix) or by range (bucket sort).",
  exp: "exp is the digit place (1, 10, 100…) radix sort is sorting on.",
  countSort: "countSort() is the stable counting sort used for each radix digit.",
  output: "output is the temporary array the sorted pass is written into.",
  INF: "INF stands for 'no edge / unreachable' (a very large number).",
  MAX: "MAX is the array size limit set with #define.",
  cost: "cost holds the edge weights (the adjacency/cost matrix).",
  visited: "visited marks nodes already processed, so they are not repeated.",
  parent: "parent records each node's predecessor, used to rebuild the tree or path.",
  adj: "adj is the adjacency matrix: adj[i][j] is non-zero when there is an edge i → j.",
  dist: "dist holds the shortest distance found so far to each node.",
  relax: "relax() updates dist[v] if going through u is shorter.",
  initialize_single_source: "initialize_single_source() sets every distance to ∞ and the source to 0.",
  extractMin: "extractMin() removes the smallest item from the priority queue.",
  extract_min: "extract_min() removes the node with the smallest key.",
  make_set: "make_set() starts each vertex in its own set (union–find).",
  find_set: "find_set() returns the set representative, which is how Kruskal detects cycles.",
  union_set: "union_set() merges two sets after an edge is accepted.",
  rnk: "rnk (rank) keeps union–find trees shallow.",
  level: "level is the BFS depth (distance in edges from the start).",
  depth: "depth is how far the recursion/search has gone.",
  front: "front is the index of the next item to dequeue.",
  rear: "rear is where the next item is enqueued.",
  q_size: "q_size is how many items are in the queue.",
  qsize: "qsize is how many items are in the queue.",
  dfsVisit: "dfsVisit() explores as deep as possible from a node before backtracking.",
  order: "order stores the sequence in which nodes are visited.",
  step: "step counts the operations or stages printed in the trace.",
  trace: "trace prints each step so you can follow the algorithm.",
  total: "total accumulates the running sum (cost, value or weight).",
  job: "job is a task with a deadline and profit in job sequencing.",
  slot: "slot marks which time slots are already filled.",
  used: "used marks items or columns already taken.",
  nQueens: "nQueens() places one queen per row and backtracks on a clash.",
  place: "place() checks that no earlier queen shares a column or diagonal.",
  solutions: "solutions counts the valid boards found.",
  fib: "fib() computes Fibonacci numbers, showing recursion vs dynamic programming.",
  calls: "calls counts the recursive calls, which shows the exponential blow-up.",
  printLCS: "printLCS() walks the table backwards to print the common subsequence.",
  printOrder: "printOrder() prints the optimal parenthesisation recursively.",
  printCodes: "printCodes() walks the Huffman tree: left adds 0, right adds 1.",
  code: "code builds the Huffman bit string on the way down the tree.",
  root: "root is the top node of the tree.",
  new_node: "new_node() allocates and fills a tree/list node.",
  insert: "insert() adds an element and restores the structure's order.",
  bound: "bound is the best value this branch could still reach (branch and bound).",
  live: "live nodes are the branches still waiting to be expanded.",
  expanded: "expanded counts how many nodes branch-and-bound opened.",
  assignment: "assignment stores which task each worker gets.",
  ans: "ans holds the best answer found so far.",
  maxd: "maxd is the latest deadline, which sets how many slots exist.",
  remaining: "remaining is the burst time still left for each process.",
  tat: "tat is the turnaround time = completion − arrival.",
  total_wt: "total_wt sums waiting times for the average.",
  total_tat: "total_tat sums turnaround times for the average.",
  path: "path stores the route found.",
  first: "first marks the first item (or the first fit found).",
  size: "size is the number of elements.",
  index: "index is the position being worked on.",
  keep: "keep marks what is kept in the current solution.",
  full: "full checks whether the container is at capacity.",
  next: "next points to the following element.",
  nxt: "nxt is the next node to visit.",
  pos: "pos is the current position.",
  cell: "cell is one entry of the DP table.",
  neg: "neg flags a negative cycle (Bellman–Ford).",
  lft: "lft is the left subtree/child.",
  rgt: "rgt is the right subtree/child.",
};

const C_HEADERS: Record<string, string> = {
  "stdio.h": "stdio.h is standard input/output: printf, scanf.",
  "time.h": "time.h: clock(), clock_t, CLOCKS_PER_SEC for timing.",
  "stdlib.h": "stdlib.h: malloc, free, qsort, rand, abs.",
  "string.h": "string.h: strlen, strcpy, strcmp, memset.",
  "math.h": "math.h: sqrt, pow, fabs, ceil, floor.",
};

/* ---------- Bash ---------- */

const SH: Record<string, string> = {
  echo: "echo prints text to the terminal.",
  read: "read waits for a line of keyboard input and stores it in a variable.",
  then: "then starts the block that runs when the if condition is true.",
  else: "else runs when the if condition is false.",
  elif: "elif checks another condition when the previous one failed.",
  fi: "fi ('if' backwards) closes an if block.",
  do: "do starts the body of a for/while loop.",
  done: "done closes a for/while loop.",
  while: "while repeats as long as the condition is true.",
  until: "until repeats as long as the condition is false.",
  for: "for loops over a list or a counted range.",
  case: "case matches a value against several patterns, like switch in C.",
  esac: "esac ('case' backwards) closes a case block.",
  in: "in introduces the list a for loop runs over, or the value case matches.",
  local: "local makes a variable visible only inside the function.",
  bc: "bc is the command-line calculator; bash only does integers, so bc handles decimals.",
  scale: "scale=2 tells bc how many decimal places to keep.",
  exit: "exit ends the script (0 means success).",
  return: "return ends a function with a status code.",
  printf: "printf prints with a format, like C's printf.",
  break: "break leaves the loop immediately.",
  continue: "continue skips to the next iteration.",
  let: "let evaluates an arithmetic expression.",
  expr: "expr evaluates an expression (older style than $(( ))).",
  function: "function declares a reusable block of commands.",
  true: "true always succeeds, so while true loops forever until a break.",
  mkdir: "mkdir creates a directory.",
  grep: "grep prints lines that match a pattern.",
  sed: "sed edits text as a stream (e.g. find and replace).",
  cat: "cat prints a file's contents.",
  ls: "ls lists the files in a directory.",
  cd: "cd changes the current directory.",
  cal: "cal prints a calendar.",
  rm: "rm deletes files.",
  pwd: "pwd prints the current directory.",
  "-eq": "-eq means equal (numbers) inside [ ].",
  "-ne": "-ne means not equal (numbers).",
  "-gt": "-gt means greater than.",
  "-lt": "-lt means less than.",
  "-ge": "-ge means greater than or equal.",
  "-le": "-le means less than or equal.",
  "-z": "-z is true when a string is empty.",
  "-n": "-n is true when a string is not empty.",
  "-f": "-f is true when the path is a regular file.",
  "-d": "-d is true when the path is a directory.",
};

/* ---------- line roles ---------- */

function lineRole(line: string, lang: Lang): string {
  const t = line.trim();
  if (lang === "python") {
    if (/\bplt\.show\(|\.show\(/.test(t)) return "This line displays the plot.";
    if (/\bprint\(/.test(t)) return "This line prints a result.";
    if (/\.fit\(/.test(t)) return "This line trains the model.";
    if (/\.predict/.test(t)) return "This line makes predictions.";
    if (/read_(csv|excel|json)/.test(t)) return "This line loads the data.";
    if (/^\w+\s*=/.test(t)) return `This line stores the result in ${t.split("=")[0]!.trim()}.`;
    return "";
  }
  if (lang === "c") {
    if (/\bscanf\s*\(/.test(t)) return "This line reads input.";
    if (/\bprintf\s*\(/.test(t)) return "This line prints output.";
    if (/\bclock\s*\(/.test(t)) return "This line records the time.";
    if (/^for\s*\(/.test(t)) return "This line is the loop header.";
    if (/^while\s*\(/.test(t)) return "This line is a while loop.";
    if (/^(if|else)\b/.test(t)) return "This line is a decision.";
    if (/^return\b/.test(t)) return "This line returns from the function.";
    if (/\w+\s*\([^;]*\)\s*\{?$/.test(t) && /^(int|void|double|float|char|long|struct)\b/.test(t)) return "This line defines a function.";
    return "";
  }
  if (/^\s*read\b/.test(t)) return "This line takes keyboard input.";
  if (/^\s*echo\b/.test(t)) return "This line prints to the terminal.";
  if (/^\s*(if|elif)\b/.test(t)) return "This line is a condition test.";
  if (/^\s*(for|while|until)\b/.test(t)) return "This line starts a loop.";
  return "";
}

/** Explanation for a filled-in word. */
export function explainToken(tok: string, line: string, lang: Lang, code: string): string {
  const role = lineRole(line, lang);
  let def = lang === "python" ? PY[tok] : lang === "c" ? C[tok] : SH[tok];
  if (!def && lang === "c") {
    if (new RegExp(`^\\s*(?:int|void|double|float|char|long|struct\\s+\\w+)\\s*\\*?\\s*${tok}\\s*\\(`, "m").test(code)) def = `${tok}() is a function defined in this program.`;
    else if (new RegExp(`\\b(?:int|double|float|char|long|clock_t)\\b[^;(]*\\b${tok}\\b`).test(code)) def = `${tok} is a variable declared in this program.`;
  }
  if (!def && lang === "python") {
    if (/^[A-Z]/.test(tok)) def = `${tok} is the class this line creates.`;
    else if (new RegExp(`\\b${tok}=`).test(line)) def = `${tok}= is a keyword argument that sets an option of the call.`;
    else def = `${tok} is the method this line calls.`;
  }
  if (!def && lang === "bash") def = `${tok} is the shell word this line needs.`;
  return [def, role].filter(Boolean).join(" ");
}

/** Explanation for a Python `from X import Y` or `import X as Y` question. */
export function explainImport(module: string, name: string, alias = false): string {
  const mod = PY_MODULES[module] ?? `${module}.`;
  if (alias) return `${name} is the standard short name for ${module}. ${mod}`;
  const what = PY[name];
  return `${name} lives in ${module}. ${mod}${what ? ` ${what}` : ""}`;
}

export function explainHeader(header: string, fn: string): string {
  return `${fn} is declared in <${header}>. ${C_HEADERS[header] ?? ""}`.trim();
}

/* ---------- line ordering ---------- */

const ident = /\b[A-Za-z_]\w*\b/g;

function defsOf(line: string, lang: Lang): string[] {
  const t = line.trim();
  if (lang === "python") {
    const m = t.match(/^([\w\s,]+?)\s*=(?!=)/);
    if (m) return m[1]!.split(",").map((s) => s.trim()).filter(Boolean);
    const f = t.match(/^for\s+([\w\s,]+?)\s+in\b/);
    return f ? f[1]!.split(",").map((s) => s.trim()) : [];
  }
  if (lang === "c") {
    const out: string[] = [];
    const decl = t.match(/^(?:int|double|float|char|long|clock_t|struct\s+\w+)\s+(.+?);/);
    if (decl) for (const part of decl[1]!.split(",")) out.push(part.trim().replace(/[\s*]*([A-Za-z_]\w*).*/, "$1"));
    const asg = t.match(/^([A-Za-z_]\w*)\s*=(?!=)/);
    if (asg) out.push(asg[1]!);
    for (const m of t.matchAll(/&([A-Za-z_]\w*)/g)) if (/scanf/.test(t)) out.push(m[1]!);
    return out;
  }
  const out: string[] = [];
  const asg = t.match(/^([A-Za-z_]\w*)=/);
  if (asg) out.push(asg[1]!);
  const rd = t.match(/^read\s+(?:-\w+\s+)*([\w\s]+)/);
  if (rd) out.push(...rd[1]!.trim().split(/\s+/));
  const f = t.match(/^for\s+([A-Za-z_]\w*)\s+in\b/);
  if (f) out.push(f[1]!);
  return out;
}

function usesOf(line: string): Set<string> {
  return new Set(line.replace(/(["'])(?:\\.|(?!\1).)*\1/g, (s) => (s.includes("$") ? s : "")).match(ident) ?? []);
}

const isFnHeader = (line: string, lang: Lang) =>
  lang === "python"
    ? /^\s*def\s/.test(line)
    : lang === "c"
      ? /^\s*(?:int|void|double|float|char|long|struct\s+\w+)\s*\*?\s*\w+\s*\([^;]*$/.test(line)
      : /^\s*(?:function\s+)?\w+\s*\(\)\s*\{?\s*$/.test(line);

/** Explain why the lines go in this order, from data dependencies. */
export function explainOrder(lines: string[], lang: Lang, steps: string[]): string {
  const deps: string[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < lines.length && deps.length < 2; i++) {
    for (const v of defsOf(lines[i]!, lang)) {
      if (seen.has(v) || v.length < 1) continue;
      const j = lines.findIndex((l, k) => k > i && !isFnHeader(l, lang) && usesOf(l).has(v) && !defsOf(l, lang).includes(v));
      if (j > i) {
        seen.add(v);
        deps.push(`line ${i + 1} sets ${v}, which line ${j + 1} uses`);
        break;
      }
    }
  }
  const parts: string[] = [];
  if (deps.length) parts.push(`A value must exist before it is used: ${deps.join("; ")}.`);
  else parts.push("Code runs top to bottom: set up inputs first, then process them, then print the result.");
  if (lines.some((l) => isFnHeader(l, lang))) parts.push("A function's header line comes before the statements in its body.");
  if (lines.some((l) => /^\s*(for|while)\b/.test(l))) parts.push("A loop header comes before the statements it repeats.");
  if (lang === "bash" && lines.some((l) => /^\s*(then|fi|do|done)\b/.test(l))) parts.push("In bash, if … then … fi and do … done wrap their blocks: the opener comes first and the closer last.");
  if (steps.length) parts.push(`Program flow: ${steps.slice(0, 4).join(" → ")}${steps.length > 4 ? " → …" : ""}.`);
  return parts.join(" ");
}

/* ---------- whole-line explanations (viva: "what does this line do?") ---------- */

const EXTRA: Record<string, string> = {
  DataFrame: "pd.DataFrame builds a table from the dict: each key becomes a column.",
  subplots: "plt.subplots(rows, cols) makes a figure with a grid of boxes (axes) to draw in.",
  items: "items() gives (name, model) pairs so the loop can use both.",
  mean: "mean() is the average.",
  T: ".T transposes the array (rows ↔ columns).",
  info: "info() prints the column names, non-null counts and data types (it prints by itself).",
  feature_importances_: "feature_importances_ says how much each feature helped the forest.",
};

/** Meanings that depend on the line a word appears in. */
function inContext(tok: string, line: string): string | undefined {
  const val = line.match(new RegExp(`\\b${tok}\\s*=\\s*([^,)]+)`))?.[1]?.trim();
  switch (tok) {
    case "alpha":
      return /scatter|plot|hist|bar/.test(line) ? `alpha=${val} sets transparency (0 = invisible, 1 = solid).` : undefined;
    case "title":
      return /plt\.title\(|set_title\(/.test(line) ? "title() puts a heading on the graph." : undefined;
    case "criterion":
      return /fcluster/.test(line) ? "criterion='maxclust' means: cut the tree into exactly t clusters." : undefined;
    case "loc":
      return /interval/.test(line) ? "loc=mean centres the interval on the sample mean." : undefined;
    case "scale":
      return /interval/.test(line) ? "scale=stats.sem(data) uses the standard error as the spread." : undefined;
    case "test_size":
      return val && !Number.isNaN(Number(val)) ? `test_size=${val} keeps ${Math.round(Number(val) * 100)}% of the rows for testing; the rest train the model.` : undefined;
    case "get":
      return /key\s*=/.test(line) ? "key=cv.get makes max() compare the dict's values (the scores) and return the best name." : undefined;
    case "c":
      return /scatter/.test(line) ? "c= colours each point (here by its cluster label)." : undefined;
    case "n_clusters":
      return val ? `n_clusters=${val}: the number of groups to find.` : undefined;
    case "data":
      return /\bdata\s*=(?!=)/.test(line) && /sns\.|px\./.test(line) ? "data=df tells seaborn which table to take the columns from." : undefined;
    case "labels":
      return /pie\(/.test(line) ? "labels= names each slice." : /\blabels\s*=(?!=)/.test(line) ? undefined : undefined;
    case "size":
      return /px\./.test(line) ? `size=${val} draws bigger bubbles for bigger values.` : /random/.test(line) ? "size is how many numbers to generate." : undefined;
    case "index":
      return /index\s*=\s*False/.test(line) ? "index=False stops pandas saving the row numbers as an extra column." : undefined;
    case "columns":
      return /drop\(/.test(line) ? `columns=${val} names the column to remove.` : undefined;
    case "random_state":
      return "random_state fixes the randomness so you get the same result every run.";
  }
  return undefined;
}

/** Explain one Python statement (may span several lines) in plain words. */
export function explainPyLine(stmt: string): string {
  const t = stmt.trim();
  const clean = t.replace(/(["'])(?:\\.|(?!\1).)*\1/g, (s) => " ".repeat(s.length));
  const parts: string[] = [];
  const seen = new Set<string>();
  for (const m of clean.matchAll(/\b[A-Za-z_]\w*\b/g)) {
    const tok = m[0];
    const i = m.index!;
    const before = clean[i - 1];
    const after = clean.slice(i + tok.length).trimStart();
    const prev = clean.slice(0, i).trimEnd().at(-1);
    const kwarg = /^=(?!=)/.test(after) && (prev === "(" || prev === ",");
    const callish = before === "." || after.startsWith("(") || kwarg || /^[A-Z]/.test(tok);
    const def = inContext(tok, t) ?? EXTRA[tok] ?? PY[tok];
    if (!def || !callish || seen.has(tok)) continue;
    seen.add(tok);
    parts.push(def);
    if (parts.length >= 3) break;
  }
  if (/^X\s*,\s*y\s*=/.test(t)) parts.unshift("X = the input columns (features), y = the answer column the model must predict (target).");
  else if (/^X_train,\s*X_test,\s*y_train,\s*y_test\s*=/.test(t)) parts.push("You get 4 parts: features and answers for training, and features and answers for testing.");
  if (/^for\s/.test(t)) {
    const m = t.match(/^for\s+(.+?)\s+in\s+(.+):/);
    if (m) parts.unshift(`Loop: repeats the indented lines for every ${m[1]} in ${m[2]}.`);
  } else if (/^print\(/.test(t)) {
    const label = t.match(/^print\(\s*f?(["'])(.*?)\1/)?.[2]?.replace(/\\n/g, "").replace(/\{[^}]*\}/g, "…").trim();
    parts.unshift(label ? `Prints "${label}" with the result.` : "Prints the result.");
  } else if (/^\w[\w\s,]*=(?!=)/.test(t) && !parts.length) {
    const lhs = t.split("=")[0]!.trim();
    parts.push(`Stores the value in ${lhs} for the next lines.`);
  } else if (/^[\w\[\]'", ]+\s*=(?!=)/.test(t)) {
    const lhs = t.split("=")[0]!.trim();
    if (/\[/.test(lhs)) parts.push(`Creates (or replaces) ${lhs} with this value.`);
    else if (!/^(X|y|df|model)\b/.test(lhs) || parts.length < 2) parts.push(`The result is stored in ${lhs}.`);
  }
  return parts.join(" ") || "Runs this step of the program.";
}

/** Viva Q&A for an import line. */
export function explainImportLine(line: string): { q: string; a: string } | null {
  const t = line.trim();
  const plain = t.match(/^import\s+([\w.]+)(?:\s+as\s+(\w+))?/);
  if (plain) {
    const [, mod, alias] = plain;
    return { q: alias ? `Why import ${mod} as ${alias}?` : `Why import ${mod}?`, a: `${PY_MODULES[mod!] ?? `${mod}.`}${alias ? ` ${alias} is just a short name so we can type ${alias}.something.` : ""}` };
  }
  const from = t.match(/^from\s+([\w.]+)\s+import\s+(.+)$/);
  if (!from) return null;
  const [, mod, names] = from;
  const list = names!.split(",").map((n) => n.trim().split(/\s+as\s+/)[0]!);
  const why = list.map((n) => PY[n] ?? EXTRA[n]).filter(Boolean).slice(0, 3).join(" ");
  return { q: `Why ${list.length > 1 ? `${list.slice(0, -1).join(", ")} and ${list.at(-1)}` : list[0]} from ${mod}?`, a: `${PY_MODULES[mod!] ?? `${mod}.`} ${why}`.trim() };
}
