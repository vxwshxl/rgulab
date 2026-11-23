// /quick: a 90-minute DS lab crash revision. Plain language, written for someone who has
// copied the programs once and now needs to understand and recall them.

export type QuickProgram = {
  id: string;
  /** What the program does, in one plain sentence. */
  simple: string;
  /** The 2–4 things to remember to rewrite it from memory. */
  remember: string[];
  /** What the graph shows, if there is one. */
  graph?: string;
  /** Extra viva questions specific to this program (shown with answers). */
  viva?: [string, string][];
};

export type QuickGroup = { id: string; title: string; minutes: number; idea: string; programs: QuickProgram[] };

export const schedule: { label: string; minutes: number; href: string }[] = [
  { label: "How every program works", minutes: 5, href: "#recipe" },
  { label: "Packages and imports", minutes: 10, href: "#packages" },
  { label: "The ML skeleton", minutes: 5, href: "#skeleton" },
  { label: "Pandas basics: 01 02 03 08", minutes: 8, href: "#pandas" },
  { label: "Statistics: 04 05 06 07", minutes: 8, href: "#stats" },
  { label: "Graphs: 09 10 37 38", minutes: 7, href: "#plots" },
  { label: "Regression: 11 12 13", minutes: 7, href: "#regression" },
  { label: "Classification: 14 – 22", minutes: 12, href: "#classification" },
  { label: "Clustering: 23 24 25", minutes: 6, href: "#clustering" },
  { label: "EDA + full project: 39 40", minutes: 5, href: "#project" },
  { label: "Subject viva", minutes: 10, href: "#viva" },
  { label: "Errors + exam-day plan", minutes: 7, href: "#errors" },
];

export const recipe: { step: string; what: string; code: string }[] = [
  { step: "1. Import", what: "Bring in the tools.", code: "import pandas as pd" },
  { step: "2. Get data", what: "Make a small DataFrame, read a CSV, or load a built-in dataset.", code: "df = pd.DataFrame({'Age': [25, 30, 35]})" },
  { step: "3. Do the work", what: "Clean, calculate, train a model, cluster…", code: "df['Age'].mean()" },
  { step: "4. Show it", what: "print() the result and/or plt.show() the graph.", code: "print(df)\nplt.show()" },
];

export const packages: { name: string; imp: string; job: string; hook: string; use: string }[] = [
  { name: "pandas", imp: "import pandas as pd", job: "Tables (DataFrame), reading/writing files, cleaning.", hook: "pd = 'panel data', think Excel inside Python.", use: "pd.DataFrame, read_csv, fillna, describe" },
  { name: "numpy", imp: "import numpy as np", job: "Fast arrays, maths, random numbers.", hook: "np = number crunching.", use: "np.nan, np.mean, np.random.normal" },
  { name: "matplotlib", imp: "import matplotlib.pyplot as plt", job: "Basic graphs.", hook: "plt = plot.", use: "plt.plot / bar / hist / pie / scatter, plt.show()" },
  { name: "seaborn", imp: "import seaborn as sns", job: "Prettier statistical graphs in one line.", hook: "sns sits on top of plt, so you still call plt.show().", use: "sns.heatmap, scatterplot, pairplot, boxplot, countplot" },
  { name: "scipy", imp: "from scipy import stats", job: "Statistics tests.", hook: "sci-py = science maths.", use: "stats.ttest_1samp, stats.t.interval, stats.sem" },
  { name: "scikit-learn", imp: "from sklearn.<module> import <Thing>", job: "Machine learning: datasets, splitting, models, metrics.", hook: "Always: from sklearn.SOMETHING import ClassName.", use: "train_test_split, LinearRegression, KMeans, accuracy_score" },
  { name: "plotly", imp: "import plotly.express as px", job: "Interactive graphs that open in the browser.", hook: "px = plotly express.", use: "px.data.iris(), px.scatter, fig.show()" },
];

/** Where each sklearn class lives. The question examiners love: "which module?" */
export const sklearnMap: { module: string; things: string; tip: string }[] = [
  { module: "sklearn.datasets", things: "load_iris, load_wine, load_breast_cancer, make_blobs, make_classification", tip: "Built in, so they work without internet." },
  { module: "sklearn.model_selection", things: "train_test_split, cross_val_score", tip: "Splitting and checking models." },
  { module: "sklearn.preprocessing", things: "StandardScaler", tip: "Scaling numbers to the same range." },
  { module: "sklearn.pipeline", things: "make_pipeline", tip: "Glue: scaler → model in one object." },
  { module: "sklearn.linear_model", things: "LinearRegression, LogisticRegression, Ridge, Lasso", tip: "Everything with a straight-line formula inside." },
  { module: "sklearn.neighbors", things: "KNeighborsClassifier", tip: "kNN." },
  { module: "sklearn.tree", things: "DecisionTreeClassifier, export_text", tip: "Trees." },
  { module: "sklearn.svm", things: "SVC", tip: "Support Vector Classifier." },
  { module: "sklearn.ensemble", things: "RandomForestClassifier", tip: "Ensemble = many trees together." },
  { module: "sklearn.naive_bayes", things: "GaussianNB", tip: "Naive Bayes." },
  { module: "sklearn.cluster", things: "KMeans, AgglomerativeClustering", tip: "Clustering." },
  { module: "sklearn.mixture", things: "GaussianMixture", tip: "Mixture of Gaussians (soft clustering)." },
  { module: "sklearn.decomposition", things: "PCA", tip: "Dimensionality reduction." },
  { module: "sklearn.metrics", things: "accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, classification_report, mean_squared_error, r2_score, silhouette_score, davies_bouldin_score", tip: "Every score lives here." },
];

export const skeleton = `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier     # ← only this line changes
from sklearn.metrics import accuracy_score

X, y = load_iris(return_X_y=True)                                        # 1. data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)  # 2. split
model = KNeighborsClassifier().fit(X_train, y_train)                     # 3. train
y_pred = model.predict(X_test)                                           # 4. predict
print("Accuracy:", accuracy_score(y_test, y_pred))                       # 5. score`;

export const skeletonSwap: [string, string, string][] = [
  ["16 kNN", "from sklearn.neighbors import KNeighborsClassifier", "KNeighborsClassifier(n_neighbors=5)"],
  ["17 Decision tree", "from sklearn.tree import DecisionTreeClassifier", "DecisionTreeClassifier(max_depth=3)"],
  ["18 SVM", "from sklearn.svm import SVC", "SVC(kernel='rbf')"],
  ["19 Random forest", "from sklearn.ensemble import RandomForestClassifier", "RandomForestClassifier(n_estimators=100)"],
  ["20 Naive Bayes", "from sklearn.naive_bayes import GaussianNB", "GaussianNB()"],
  ["21 Logistic", "from sklearn.linear_model import LogisticRegression", "LogisticRegression()"],
];

export const groups: QuickGroup[] = [
  {
    id: "pandas",
    title: "Pandas basics",
    minutes: 8,
    idea: "Make a table, save it, clean it, describe it. Almost every line starts with df.",
    programs: [
      {
        id: "01",
        simple: "Make a small table, save it as CSV, JSON and Excel, then read each file back and print it.",
        remember: ["to_csv / to_json / to_excel write; read_csv / read_json / read_excel read", "index=False so row numbers aren't saved as an extra column", "orient='records' = one JSON object per row"],
      },
      {
        id: "02",
        simple: "Clean messy data: fill missing ages, remove a duplicate row, fix 'eve ' → 'Eve', replace a negative salary.",
        remember: ["fillna(median) fills NaN", "drop_duplicates() removes repeated rows", "str.strip().str.title() fixes text", "where(salary > 0) turns bad values into NaN, then fill them"],
        viva: [["What is data preprocessing?", "Cleaning raw data before analysis: handling missing values, duplicates, wrong types and inconsistent text, so the results are correct."]],
      },
      {
        id: "03",
        simple: "Print the mean, median, mode, variance, standard deviation and covariance of two columns.",
        remember: ["Each is just df.<name>(): mean, median, mode, var, std, cov", "mode() returns a table because there can be more than one mode", "std = √variance"],
        viva: [["Mean vs median?", "Mean is the average; median is the middle value. The median is better when there are outliers."]],
      },
      {
        id: "08",
        simple: "Add a Bonus column, filter people older than 30, and sort by salary.",
        remember: ["New column: df['Bonus'] = df['Salary'] * 0.10", "Filter: df[df['Age'] > 30]", "Sort: df.sort_values('Salary', ascending=False)"],
      },
    ],
  },
  {
    id: "stats",
    title: "Statistics",
    minutes: 8,
    idea: "Numbers that describe data and tests that decide if a difference is real.",
    programs: [
      {
        id: "04",
        simple: "Print the covariance and correlation matrices and draw both as heatmaps side by side.",
        remember: ["df.cov() and df.corr()", "plt.subplots(1, 2) makes 2 boxes: ax[0], ax[1]", "sns.heatmap(..., annot=True, ax=ax[0])"],
        graph: "Two coloured grids with the numbers written inside.",
        viva: [["Covariance vs correlation?", "Both show how two variables move together. Correlation is scaled to −1…1 and has no units, so it is easier to compare."]],
      },
      {
        id: "05",
        simple: "Generate 1000 normal random numbers (and 2-D correlated points), print their mean/std, draw a histogram and a scatter.",
        remember: ["np.random.normal(mean, std, size) → normal(50, 10, 1000)", "multivariate_normal(means, cov_matrix, size)", "ax[0].hist(...), ax[1].scatter(...)"],
        graph: "Left: bell-shaped histogram. Right: a tilted oval cloud of points.",
        viva: [["What is a normal distribution?", "A symmetric bell-shaped curve where mean = median = mode. About 68% of values lie within 1 std, 95% within 2 std."]],
      },
      {
        id: "06",
        simple: "One-sample t-test: is the average of 10 numbers different from 50?",
        remember: ["t, p = stats.ttest_1samp(data, 50)", "p < 0.05 → reject H₀, otherwise fail to reject", "Here p = 0.627, so fail to reject"],
        viva: [
          ["What is the null hypothesis here?", "H₀: the population mean is 50. The test checks if the data gives enough evidence against it."],
          ["What does the p-value mean?", "The chance of getting data this extreme if H₀ is true. Small p (< 0.05) means H₀ is unlikely."],
        ],
      },
      {
        id: "07",
        simple: "Find the 95% confidence interval for the mean of 10 numbers.",
        remember: ["stats.t.interval(0.95, n − 1, loc=mean, scale=stats.sem(data))", "sem = std ÷ √n", "Answer: about 48.9 to 51.7"],
        viva: [["What does a 95% confidence interval mean?", "If we repeated the sampling many times, about 95% of such intervals would contain the true population mean."]],
      },
    ],
  },
  {
    id: "plots",
    title: "Graphs",
    minutes: 7,
    idea: "plt.subplots(rows, cols) makes a grid, ax[...] picks a box, plt.show() displays. Seaborn takes ax= too.",
    programs: [
      {
        id: "09",
        simple: "Same data drawn twice: a Matplotlib line plot and a Seaborn scatter plot.",
        remember: ["ax[0].plot(x, y, marker='o')", "sns.scatterplot(data=df, x='Age', y='Salary', ax=ax[1])"],
        graph: "Left: rising line with dots. Right: rising dots.",
      },
      {
        id: "10",
        simple: "Six chart types in a 2×3 grid: bar, histogram, pie, box plot, scatter, heatmap.",
        remember: ["plt.subplots(2, 3) → ax[row, col]", "bar · hist · pie(autopct='%1.1f%%') · boxplot · scatter · sns.heatmap", "plt.tight_layout() stops titles overlapping"],
        graph: "Six small charts in two rows.",
        viva: [["Which chart for what?", "Bar = compare categories, histogram = distribution, pie = parts of a whole, box = spread and outliers, scatter = relationship, heatmap = correlation matrix."]],
      },
      {
        id: "37",
        simple: "An interactive Plotly scatter of the iris flowers that opens in the browser.",
        remember: ["df = px.data.iris() (built in, no internet)", "px.scatter(df, x=, y=, color='species', size=, hover_data=)", "fig.show()"],
        graph: "Coloured bubbles; hovering shows values.",
      },
      {
        id: "38",
        simple: "Pair plot of all iris features, then PCA squeezes 4 features into 2 for one scatter plot.",
        remember: ["sns.pairplot(df, hue='species')", "PCA(n_components=2).fit_transform(X)", "Plot X_pca[:, 0] vs X_pca[:, 1]"],
        graph: "A grid of scatter plots, then one 2-D PCA scatter with 3 coloured groups.",
        viva: [["Why PCA?", "To reduce many features to a few (here 4 → 2) while keeping the most variance, so we can visualise the data."]],
      },
    ],
  },
  {
    id: "regression",
    title: "Regression (predict a number)",
    minutes: 7,
    idea: "Fit a line through the data, then predict salary from experience. Score with R² (closer to 1 is better).",
    programs: [
      {
        id: "11",
        simple: "Fit salary = slope × experience + intercept, print it, predict for 11 years and draw the line.",
        remember: ["X must be 2-D: df[['Experience']] (double brackets)", "model.coef_ = slope, model.intercept_ = intercept", "model.score() gives R²"],
        graph: "Blue dots with a red straight line through them.",
        viva: [["What is linear regression?", "A model that fits the best straight line y = mx + c through the data to predict a continuous value."]],
      },
      {
        id: "12",
        simple: "Predict salary from 3 columns, with a train/test split, and report MSE and R².",
        remember: ["X = df.drop(columns='Salary'), y = df['Salary']", "train_test_split(X, y, test_size=0.3, random_state=1)", "mean_squared_error and r2_score on the test set"],
        viva: [["MSE vs R²?", "MSE is the average squared error (lower is better, in squared units). R² is the fraction of variance explained (closer to 1 is better)."]],
      },
      {
        id: "13",
        simple: "Ridge and Lasso: regression with a penalty. Lasso pushes a useless column (Distance) to 0.",
        remember: ["make_pipeline(StandardScaler(), Ridge(alpha=1.0))", "Lasso(alpha=100, max_iter=10000)", "Ridge = L2 (shrinks), Lasso = L1 (can make exactly 0)"],
        viva: [["Why regularisation?", "To stop overfitting by penalising big coefficients. Ridge shrinks them; Lasso can remove features completely."]],
      },
    ],
  },
  {
    id: "classification",
    title: "Classification (predict a class)",
    minutes: 12,
    idea: "Same 5-line skeleton every time; only the model line changes. Score with accuracy.",
    programs: [
      {
        id: "14",
        simple: "Compare 3 models with a test split AND 5-fold cross-validation, then print the best.",
        remember: ["make_classification(...) makes fake data", "cross_val_score(m, X, y, cv=5).mean()", "max(cv, key=cv.get) picks the best name"],
        viva: [["What is cross-validation?", "Split data into k folds; train on k−1 and test on the remaining one, k times. Average score is more reliable than one split."]],
      },
      {
        id: "15",
        simple: "Breast-cancer data with logistic regression; print the confusion matrix, accuracy, precision, recall, F1 and ROC-AUC.",
        remember: ["y_prob = model.predict_proba(X_test)[:, 1] (for ROC-AUC)", "Every metric is f(y_test, y_pred)", "Confusion matrix [[TN, FP], [FN, TP]]"],
        viva: [
          ["Precision vs recall?", "Precision = TP/(TP+FP): of predicted positives, how many were right. Recall = TP/(TP+FN): of real positives, how many we found."],
          ["What is F1?", "The harmonic mean of precision and recall; useful when classes are imbalanced."],
        ],
      },
      {
        id: "16",
        simple: "kNN on iris: a flower gets the majority class of its 5 nearest neighbours.",
        remember: ["KNeighborsClassifier(n_neighbors=5)", "iris.target_names[...] turns 0 into 'setosa'", "Accuracy 1.0"],
        viva: [["How does kNN work?", "It stores the training data. For a new point it finds the k closest points (by distance) and takes the majority vote."]],
      },
      {
        id: "17",
        simple: "Decision tree on iris, limited to depth 3, and print its if/else rules.",
        remember: ["DecisionTreeClassifier(criterion='gini', max_depth=3)", "export_text(dt, feature_names=iris.feature_names)"],
        viva: [["What is Gini?", "A measure of impurity: 0 means a node has only one class. The tree picks the split that lowers impurity the most."]],
      },
      {
        id: "18",
        simple: "SVM on iris with 3 kernels: linear, poly, rbf.",
        remember: ["for kernel in ['linear', 'poly', 'rbf']:", "SVC(kernel=kernel)"],
        viva: [["What does SVM do?", "Finds the boundary with the widest margin between classes. Kernels let it draw curved boundaries."]],
      },
      {
        id: "19",
        simple: "Random forest of 100 trees on the wine dataset.",
        remember: ["load_wine(return_X_y=True)", "RandomForestClassifier(n_estimators=100, random_state=42)"],
        viva: [["Why is a random forest better than one tree?", "Many trees on random samples vote together, which reduces overfitting (variance)."]],
      },
      {
        id: "20",
        simple: "Gaussian Naive Bayes on iris.",
        remember: ["from sklearn.naive_bayes import GaussianNB", "GaussianNB().fit(X_train, y_train)"],
        viva: [["Why 'naive'?", "It assumes all features are independent of each other given the class, which is rarely true but works well."]],
      },
      {
        id: "21",
        simple: "Logistic regression on breast-cancer data: accuracy and the probability for one patient.",
        remember: ["make_pipeline(StandardScaler(), LogisticRegression())", "predict_proba(X_test[:1])[0, 1] = probability of class 1 (benign)"],
        viva: [["Is logistic regression regression?", "No, it is a classifier. It uses the sigmoid to turn a score into a probability between 0 and 1."]],
      },
      {
        id: "22",
        simple: "Six classifiers in a dictionary, trained and scored in one loop on the wine data.",
        remember: ["X = StandardScaler().fit_transform(X) first", "models = {'name': Model(), ...}", "for name, model in models.items(): fit, predict, print"],
      },
    ],
  },
  {
    id: "clustering",
    title: "Clustering (find groups, no labels)",
    minutes: 6,
    idea: "No y, no split. Use fit_predict(X) to get a group number for each point.",
    programs: [
      {
        id: "23",
        simple: "Make 4 blobs of points and let K-Means find the 4 groups and their centres.",
        remember: ["X, _ = make_blobs(n_samples=300, centers=4, ...)", "KMeans(n_clusters=4, n_init=10).fit_predict(X)", "kmeans.cluster_centers_ → red X marks"],
        graph: "Coloured groups of dots with a red X in the middle of each.",
        viva: [["How does K-Means work?", "Pick k centres, assign each point to the nearest centre, move each centre to the mean of its points, repeat until nothing changes."]],
      },
      {
        id: "24",
        simple: "Hierarchical clustering: merge closest points step by step and draw the tree (dendrogram).",
        remember: ["from scipy.cluster.hierarchy import linkage, dendrogram, fcluster", "Z = linkage(X, method='ward')", "fcluster(Z, t=3, criterion='maxclust') → 3 groups"],
        graph: "An upside-down tree; cutting it horizontally gives the clusters.",
      },
      {
        id: "25",
        simple: "Compare K-Means, Agglomerative and Gaussian Mixture with silhouette and Davies–Bouldin scores.",
        remember: ["Silhouette: higher is better (max 1)", "Davies–Bouldin: lower is better", "GaussianMixture uses n_components, not n_clusters"],
      },
    ],
  },
  {
    id: "project",
    title: "EDA and the full project",
    minutes: 5,
    idea: "39 = look at the data. 40 = everything together: load → clean → plot → model → evaluate → predict.",
    programs: [
      {
        id: "39",
        simple: "Explore the wine data: info(), describe(), missing values, and a box plot.",
        remember: ["df = load_wine(as_frame=True).frame", "df.info() prints by itself (no print needed)", "df.isnull().sum() counts missing values", "sns.boxplot(data=df, x='target', y='alcohol')"],
        graph: "Three boxes showing alcohol level per wine class.",
        viva: [["What is EDA?", "Exploratory Data Analysis: understanding data with summaries and graphs (shape, types, missing values, distributions, outliers) before modelling."]],
      },
      {
        id: "40",
        simple: "The complete pipeline on breast-cancer data, with 6 commented steps.",
        remember: ["Steps: load → drop_duplicates/dropna → split → scale → countplot → LogisticRegression → report → predict", "scaler.fit_transform(X_train) but only transform(X_test)", "classification_report prints precision/recall/F1 per class"],
        graph: "Bar chart of how many malignant (0) vs benign (1) patients.",
        viva: [["Why fit the scaler only on train?", "So no information from the test set leaks into training. The test set must stay unseen."]],
      },
    ],
  },
];

export const errors: [string, string][] = [
  ["FileNotFoundError: 'titanic.csv'", "The file isn't in Spyder's working directory. Set the folder (top right), or use the full path, or build the data with pd.DataFrame({...})."],
  ["ModuleNotFoundError: No module named 'seaborn'", "Package not installed and no internet. Use matplotlib only (plt.bar, plt.hist, plt.scatter, plt.imshow for a heatmap)."],
  ["ValueError: Expected 2D array, got 1D array", "X must be 2-D. Use df[['Col']] (double brackets), not df['Col']. For a list: [[5.1, 3.5, 1.4, 0.2]]."],
  ["ValueError: could not convert string to float: 'male'", "Text columns can't go into a model. Use pd.get_dummies(df, columns=['Sex']) or map: df['Sex'].map({'male': 0, 'female': 1})."],
  ["ValueError: Input contains NaN", "Fill or drop missing values first: df.fillna(df.median(numeric_only=True)) or df.dropna()."],
  ["KeyError: 'age'", "Column name is wrong (case and spaces matter). print(df.columns) to see the real names."],
  ["ConvergenceWarning (LogisticRegression)", "Only a warning. Scale the data (StandardScaler) or use LogisticRegression(max_iter=1000)."],
  ["Graph doesn't appear", "Add plt.show() at the end. In Spyder, check the Plots pane (top right)."],
];

export const titanic = `import pandas as pd
df = pd.read_csv('titanic.csv')
print(df.head()); df.info()
print(df.isnull().sum())                              # missing per column
df['Age'] = df['Age'].fillna(df['Age'].median())      # numbers → median
df['Embarked'] = df['Embarked'].fillna(df['Embarked'].mode()[0])  # text → mode
df = df.drop(columns=['Cabin'])                        # mostly empty
df['Sex'] = df['Sex'].map({'male': 0, 'female': 1})    # text → number
print(df.groupby('Sex')['Survived'].mean())            # survival rate by sex
print(df.groupby('Pclass')['Survived'].mean())         # by class`;

export const makeData = `import pandas as pd
import numpy as np
# Option 1: type a tiny table yourself
df = pd.DataFrame({'Name': ['A', 'B', 'C', 'D', 'E'],
                   'Age': [25, 30, 35, 40, 45],
                   'Salary': [50000, 60000, 70000, 80000, 90000]})
# Option 2: random data
np.random.seed(0)
df = pd.DataFrame({'Marks': np.random.randint(40, 100, 50),
                   'Hours': np.random.randint(1, 10, 50)})
# Option 3: built-in datasets (no internet needed)
from sklearn.datasets import load_iris
df = load_iris(as_frame=True).frame`;

export const examPlan: string[] = [
  "Read the question twice. Underline what to print and what to plot.",
  "Check the dataset: is the CSV in the folder? If not, load_iris / load_wine / make your own DataFrame.",
  "Write the imports first, then follow the 4 steps: import → data → work → print/plot.",
  "Run after every few lines (F9 runs the selected line) so errors are easy to find.",
  "Print with labels: print(\"Accuracy:\", acc), not just print(acc).",
  "Finish with plt.show() for graphs. Save the file as your roll number if asked.",
  "In the viva, explain in this order: what the program does → which library → what the output means.",
];

export const lastMinute: string[] = [
  "df[['Col']] (2-D) for X, df['Col'] (1-D) for y.",
  "train_test_split → fit(X_train, y_train) → predict(X_test) → score with y_test.",
  "Regression → R², MSE. Classification → accuracy, precision, recall, F1. Clustering → silhouette (high good), Davies–Bouldin (low good).",
  "p < 0.05 → reject H₀.",
  "Scale (StandardScaler) for kNN, SVM, logistic regression and PCA; trees don't need it.",
  "Ridge = L2 shrink; Lasso = L1 can make 0.",
  "K-Means needs k; hierarchical gives a dendrogram; GMM gives probabilities.",
  "fit_transform on train, transform on test.",
  "plt.subplots(r, c) → ax[i] or ax[i, j]; seaborn takes ax=.",
  "Iris 150×4, 3 classes · Wine 178×13, 3 classes · Breast cancer 569×30, 2 classes.",
];
