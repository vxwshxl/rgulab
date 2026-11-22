// DS Lab study notes per program. MCQs list the correct option FIRST; the UI shuffles them.
import { m, type Note } from "./types";

export const dsNotes: Record<string, Note> = {
  "01": {
    title: "Import & export files",
    steps: [
      "Build a small DataFrame from a dict",
      "Write it with to_csv / to_json / to_excel (index=False)",
      "Read each file back with read_csv / read_json / read_excel and print",
    ],
    mcq: [
      m("Why pass index=False to to_csv()?", "So the row numbers are not saved as an extra column", ["So the header row is skipped", "So the file is compressed", "So rows are sorted first"], "Without it, reading the file back gives you an extra 'Unnamed: 0' column."),
      m("Which package does pandas use to write .xlsx files?", "openpyxl", ["xlrd", "numpy", "csv"], "openpyxl reads and writes .xlsx. xlrd only reads the old .xls format."),
      m("to_json(orient='records') writes…", "A list of row objects: [{...}, {...}]", ["One object per column", "A CSV string", "Only the column names"], "'records' gives one JSON object per row, which is the most readable layout."),
    ],
    tip: "Files are written to Spyder's working directory (top-right folder bar). Set it to your exam folder first.",
  },
  "02": {
    title: "Data preprocessing",
    steps: [
      "Fill missing Age with the median: fillna(df['Age'].median())",
      "Remove repeated rows with drop_duplicates()",
      "Fix messy text: str.strip().str.title()",
      "Turn invalid values (salary ≤ 0) into NaN with where(), then fill with the median",
    ],
    mcq: [
      m("What does df['Salary'].where(df['Salary'] > 0) return?", "The same column with non-positive values turned into NaN", ["Only the rows with positive salary", "The column with negatives set to 0", "A True/False mask"], "where() keeps values where the condition is True and puts NaN everywhere else."),
      m("Why fill missing values with the median rather than the mean?", "The median isn't pulled by outliers like -10000", ["The median is always an integer", "The mean can't be computed with NaN", "pandas only supports median"], "One bad value drags the mean a lot but barely moves the median."),
      m("'eve ' becomes 'Eve' because of…", "str.strip().str.title()", ["str.upper()", "str.replace(' ', '')", "str.lower().strip()"], "strip() removes the spaces at both ends, title() capitalises the first letter."),
    ],
    tip: "Titanic version: Age → fillna(median), Embarked → fillna(mode()[0]), drop the Cabin column (mostly empty).",
  },
  "03": {
    title: "Descriptive statistics",
    steps: [
      "Make a DataFrame with two numeric columns",
      "Call df.mean(), median(), mode(), var(), std()",
      "Call df.cov() for the covariance matrix",
    ],
    mcq: [
      m("pandas df.var() divides by…", "n − 1 (sample variance)", ["n", "n + 1", "√n"], "pandas uses ddof=1 by default. NumPy's np.var uses n, so the two give different answers."),
      m("Why does df.mode() return a DataFrame, not one number?", "A column can have more than one mode", ["Mode only works on text", "It also returns the counts", "It sorts the data"], "If two values tie for most frequent, both are modes, so pandas returns rows."),
      m("Standard deviation is…", "The square root of the variance", ["Variance squared", "Mean minus median", "Range ÷ 2"], "std = √var, which puts it back in the same units as the data."),
    ],
  },
  "04": {
    title: "Covariance & correlation",
    steps: [
      "Compute df.cov() and df.corr()",
      "Make two side-by-side axes: plt.subplots(1, 2, figsize=(12, 5))",
      "Draw each matrix with sns.heatmap(..., annot=True, cmap='coolwarm', ax=ax[i])",
    ],
    mcq: [
      m("Correlation always lies between…", "−1 and 1", ["0 and 1", "0 and 100", "−∞ and ∞"], "Correlation is covariance scaled by both standard deviations, so it is bounded."),
      m("annot=True in sns.heatmap…", "Writes the number inside each cell", ["Adds a colour bar", "Adds axis titles", "Sorts the matrix"], "Without annot you only see colours."),
      m("Why is corr(A, B) exactly 1.0 here?", "B is always A + 5, a perfect straight-line relation", ["They have the same mean", "Both have 6 values", "Correlation is always 1 on the diagonal"], "Any exact linear relation y = ax + b with a > 0 gives correlation 1."),
    ],
  },
  "05": {
    title: "Normal distributions",
    steps: [
      "Univariate: np.random.normal(mean, std, size)",
      "Multivariate: np.random.multivariate_normal(mean_vector, cov_matrix, size)",
      "Print sample mean / std / np.cov(..., rowvar=False)",
      "Plot a histogram and a scatter side by side",
    ],
    mcq: [
      m("In np.random.normal(50, 10, 1000), what is 10?", "The standard deviation", ["The variance", "The number of bins", "The minimum value"], "The arguments are loc (mean), scale (std) and size."),
      m("Why do the numbers change on every run?", "There is no random seed; add np.random.seed(0)", ["matplotlib is random", "The covariance is wrong", "1000 samples is too few"], "With a fixed seed you get the same samples every time."),
      m("With cov [[100, 50], [50, 64]], the std of the 2nd variable is…", "8", ["64", "50", "32"], "The diagonal holds the variances, and √64 = 8."),
    ],
  },
  "06": {
    title: "Hypothesis testing",
    steps: [
      "State H₀: the population mean is 50",
      "t, p = stats.ttest_1samp(sample, 50)",
      "If p < 0.05, reject H₀; otherwise fail to reject",
    ],
    mcq: [
      m("p = 0.627 at α = 0.05 means…", "Fail to reject the null hypothesis", ["Reject the null hypothesis", "The test is invalid", "The mean is exactly 50"], "A large p-value means the data is consistent with H₀."),
      m("Which test compares the means of two independent groups?", "stats.ttest_ind", ["stats.ttest_1samp", "stats.ttest_rel", "stats.pearsonr"], "ttest_rel is for paired (before/after) data; ttest_1samp compares one group with a fixed value."),
      m("The p-value is…", "The probability of a result this extreme if H₀ were true", ["The probability H₀ is true", "The effect size", "The sample mean"], "A small p means the data would be surprising under H₀."),
    ],
    tip: "Also good to know: stats.chi2_contingency(table) for categorical data, stats.shapiro(x) for a normality check.",
  },
  "07": {
    title: "Confidence intervals",
    steps: [
      "mean = np.mean(data)",
      "Standard error: stats.sem(data)",
      "stats.t.interval(0.95, len(data) - 1, loc=mean, scale=sem)",
    ],
    mcq: [
      m("The degrees of freedom passed to t.interval are…", "n − 1", ["n", "n + 1", "0.95"], "One degree of freedom is used up estimating the mean."),
      m("stats.sem(data) computes…", "std ÷ √n (standard error of the mean)", ["std × √n", "variance ÷ n²", "mean ÷ std"], "SEM shows how much the sample mean would vary between samples."),
      m("Why use the t-distribution here, not the normal?", "Small sample and the population std is unknown", ["The data isn't numeric", "t is always narrower", "SciPy has no normal interval"], "For large n the t-distribution approaches the normal anyway."),
    ],
  },
  "08": {
    title: "Pandas manipulation",
    steps: [
      "Add a column: df['Bonus'] = df['Salary'] * 0.10",
      "Filter: df[df['Age'] > 30]",
      "Sort: df.sort_values('Salary', ascending=False)",
    ],
    mcq: [
      m("df[df['Age'] > 30] is called…", "Boolean indexing (filtering)", ["Slicing by position", "Grouping", "Pivoting"], "The inner part makes a True/False Series, and the outer brackets keep the True rows."),
      m("How do you sort from highest to lowest?", "sort_values(..., ascending=False)", ["sort_values(..., reverse=True)", "sort_index()", "sort_values(..., order='desc')"], "pandas uses ascending=; Python's sorted() uses reverse=."),
      m("Average salary per department is…", "df.groupby('Dept')['Salary'].mean()", ["df.mean('Dept')", "df.pivot('Salary')", "df['Dept'].mean()"], "groupby → pick the column → aggregate. A common extension in the exam."),
    ],
  },
  "09": {
    title: "Matplotlib & Seaborn",
    steps: [
      "fig, ax = plt.subplots(1, 2, figsize=(12, 5))",
      "Matplotlib: ax[0].plot(x, y, marker='o')",
      "Seaborn: sns.scatterplot(data=df, x=..., y=..., ax=ax[1])",
      "plt.show()",
    ],
    mcq: [
      m("figsize=(12, 5) is measured in…", "Inches (width, height)", ["Pixels", "Centimetres", "Grid cells"], "Pixels = inches × dpi."),
      m("How do you draw a Seaborn plot inside a specific subplot?", "Pass ax=ax[1]", ["Call plt.subplot(1) first", "Use sns.set_axis()", "You can't"], "Every axes-level Seaborn function accepts ax=."),
      m("marker='o' in plot()…", "Draws a dot at every data point", ["Draws an outline", "Makes the line dotted", "Adds a legend"], "Line style is linestyle='--'; marker is the point symbol."),
    ],
  },
  "10": {
    title: "Six chart types",
    steps: [
      "plt.subplots(2, 3) gives a 2×3 grid → ax[row, col]",
      "bar, hist, pie(autopct), boxplot, scatter",
      "sns.heatmap(df.corr(), annot=True, ax=ax[1, 2])",
      "plt.tight_layout() then plt.show()",
    ],
    mcq: [
      m("autopct='%1.1f%%' on a pie chart…", "Shows each slice's percentage with 1 decimal", ["Rotates the labels", "Explodes the slices", "Sorts the slices"], "%% prints a literal % sign."),
      m("plt.tight_layout() is used to…", "Stop titles and labels of subplots overlapping", ["Make the figure smaller", "Remove the axes", "Save the figure"], "It adjusts the spacing between subplots automatically."),
      m("A box plot shows…", "Median, quartiles (IQR) and outliers", ["Mean and mode", "Every data point", "Category counts"], "The box is Q1–Q3, the line is the median, and the whiskers go to 1.5×IQR."),
    ],
  },
  "11": {
    title: "Simple linear regression",
    steps: [
      "X = df[['Experience']] (2-D), y = df['Salary']",
      "model = LinearRegression().fit(X, y)",
      "Print coef_[0] (slope), intercept_, score(X, y) (R²)",
      "Predict a new value, then plot the points with the regression line",
    ],
    mcq: [
      m("Why df[['Experience']] with double brackets?", "scikit-learn needs X to be 2-D (rows × features)", ["To copy the data", "To sort the column", "Single brackets are an error in pandas"], "Single brackets give a 1-D Series; double brackets give a one-column DataFrame."),
      m("For a regressor, model.score(X, y) returns…", "R² (coefficient of determination)", ["Accuracy", "MSE", "The slope"], "For classifiers, score() returns accuracy instead."),
      m("A prediction from simple linear regression is…", "intercept + slope × x", ["slope + intercept × x", "slope × x²", "mean of y"], "This is ŷ = b₀ + b₁x."),
    ],
  },
  "12": {
    title: "Multiple linear regression",
    steps: [
      "X = df.drop(columns='Salary'), y = df['Salary']",
      "train_test_split(X, y, test_size=0.3, random_state=1)",
      "Fit on train, predict on test",
      "Evaluate with mean_squared_error and r2_score",
    ],
    mcq: [
      m("With 15 rows and test_size=0.3, the test set has how many rows?", "5", ["4", "4.5", "10"], "scikit-learn rounds the test size up: ceil(4.5) = 5."),
      m("random_state=1 in train_test_split…", "Gives the same split every run", ["Uses 1 test row", "Picks the first row as test", "Turns off shuffling"], "Any fixed integer works; it seeds the shuffle."),
      m("MSE is measured in…", "The target's units squared", ["Percent", "The same units as the target", "It has no units"], "Take √MSE (RMSE) to get back to the target's units."),
    ],
  },
  "13": {
    title: "Ridge & Lasso",
    steps: [
      "Split the data into train and test",
      "make_pipeline(StandardScaler(), Ridge(alpha=1.0))",
      "make_pipeline(StandardScaler(), Lasso(alpha=100.0))",
      "Compare test R² and the coefficients",
    ],
    mcq: [
      m("Which one can shrink a coefficient to exactly 0?", "Lasso (L1 penalty)", ["Ridge (L2 penalty)", "Plain LinearRegression", "Both equally"], "That is why Lasso also does feature selection: a coefficient printed as 0 (or -0.) means that feature was dropped."),
      m("Ridge adds which penalty to the loss?", "Sum of squared coefficients (L2)", ["Sum of absolute coefficients (L1)", "Number of features", "The MSE squared"], "L2 shrinks all coefficients smoothly but rarely to zero."),
      m("Why scale the features before Ridge/Lasso?", "The penalty treats all coefficients equally, so features must share a scale", ["It makes training slower", "Lasso can't read integers", "It removes outliers"], "Otherwise a feature measured in big units gets penalised differently."),
    ],
  },
  "14": {
    title: "Train-test split & CV",
    steps: [
      "Make data with make_classification(...)",
      "Split 75/25 and score each model on the test set",
      "cross_val_score(model, X, y, cv=5).mean()",
      "Pick the best: max(cv, key=cv.get)",
    ],
    mcq: [
      m("cross_val_score(m, X, y, cv=5)…", "Trains and tests 5 times, each fold taking a turn as the test set", ["Trains 5 different models", "Uses 5% of the data", "Repeats the same split 5 times"], "It returns 5 scores; their mean is a steadier estimate."),
      m("max(cv, key=cv.get) returns…", "The model name with the highest CV score", ["The highest score", "The last model", "A sorted dict"], "key= tells max to compare by the dict values."),
      m("Why use cross-validation over a single split?", "The score depends less on one lucky or unlucky split", ["It's always faster", "It needs no test data", "It increases accuracy"], "Every sample is used for testing exactly once."),
    ],
  },
  "15": {
    title: "Evaluation metrics",
    steps: [
      "Train a scaled LogisticRegression on breast cancer data",
      "y_pred = predict(X_test), y_prob = predict_proba(X_test)[:, 1]",
      "confusion_matrix, accuracy, precision, recall, F1 from y_pred",
      "roc_auc_score from y_prob",
    ],
    mcq: [
      m("Precision =", "TP / (TP + FP)", ["TP / (TP + FN)", "(TP + TN) / total", "TN / (TN + FP)"], "Of everything predicted positive, how much really was positive."),
      m("Recall =", "TP / (TP + FN)", ["TP / (TP + FP)", "TN / (TN + FN)", "2PR / (P + R)"], "Of all actual positives, how many we caught."),
      m("roc_auc_score needs…", "Probabilities for the positive class (predict_proba[:, 1])", ["Hard 0/1 predictions only", "The confusion matrix", "The training data"], "AUC measures ranking across every threshold, so it needs scores, not labels."),
      m("In sklearn's confusion_matrix, the rows are…", "Actual classes (columns are predicted)", ["Predicted classes", "Features", "Folds"], "So [[TN, FP], [FN, TP]] for binary labels 0/1."),
    ],
  },
  "16": {
    title: "k-Nearest Neighbors",
    steps: [
      "iris = load_iris(); split 70/30 with random_state=42",
      "KNeighborsClassifier(n_neighbors=5).fit(X_train, y_train)",
      "Accuracy + confusion matrix on the test set",
      "Predict a new flower and map it with iris.target_names",
    ],
    mcq: [
      m("What is k in kNN?", "The number of nearest neighbours that vote", ["The number of classes", "The number of features", "The number of folds"], "The new point takes the majority label of its k closest training points."),
      m("What does kNN do during fit()?", "It just stores the training data (lazy learner)", ["Builds a tree", "Finds a separating line", "Computes class means"], "All the work happens at predict time."),
      m("The Iris dataset has…", "150 samples, 4 features, 3 classes", ["178 samples, 13 features, 3 classes", "569 samples, 30 features, 2 classes", "100 samples, 2 features, 2 classes"], "Iris, Wine and Breast Cancer all ship with scikit-learn, so they load without internet."),
    ],
  },
  "17": {
    title: "Decision Tree",
    steps: [
      "DecisionTreeClassifier(criterion='gini', max_depth=3, random_state=42)",
      "Fit on train, print the test accuracy",
      "export_text(dt, feature_names=iris.feature_names) prints the rules",
    ],
    mcq: [
      m("max_depth=3…", "Limits the tree to 3 levels so it doesn't overfit", ["Uses 3 features", "Builds 3 trees", "Needs 3 samples per leaf"], "Deeper trees memorise noise."),
      m("Besides 'gini', which criterion can a tree split on?", "'entropy' (information gain)", ["'mse'", "'cosine'", "'ward'"], "Both measure impurity; they usually give similar trees."),
      m("export_text() prints…", "The tree's if/else rules as text", ["The confusion matrix", "Feature importances", "A picture of the tree"], "For a picture, use sklearn.tree.plot_tree(dt) + plt.show()."),
    ],
  },
  "18": {
    title: "Support Vector Machine",
    steps: [
      "Load iris and split 70/30",
      "Loop over kernels ['linear', 'poly', 'rbf']",
      "SVC(kernel=k).fit(...) and print each accuracy",
    ],
    mcq: [
      m("SVC's default kernel is…", "'rbf'", ["'linear'", "'poly'", "'sigmoid'"], "RBF (Gaussian) handles curved boundaries well."),
      m("The kernel trick…", "Lets the SVM separate data in a higher dimension without computing it", ["Removes outliers", "Scales the data", "Picks k neighbours"], "It is why SVMs can draw non-linear boundaries."),
      m("Support vectors are…", "The training points closest to the decision boundary", ["All the training points", "The cluster centres", "The misclassified points only"], "Only they decide where the margin sits."),
    ],
  },
  "19": {
    title: "Random Forest",
    steps: [
      "load_wine(return_X_y=True), split 70/30",
      "RandomForestClassifier(n_estimators=100, random_state=42)",
      "Fit and print the test accuracy",
    ],
    mcq: [
      m("n_estimators=100 means…", "The forest has 100 decision trees", ["100 features", "100 training rows", "Depth 100"], "More trees means more stable predictions, but slower."),
      m("A random forest classifies by…", "A majority vote of its trees", ["Using the single best tree", "Averaging the features", "Nearest neighbour"], "Each tree sees a bootstrap sample and random feature subsets (bagging)."),
      m("The Wine dataset has…", "178 samples, 13 features, 3 classes", ["150 samples, 4 features, 3 classes", "569 samples, 30 features, 2 classes", "1797 samples, 64 features, 10 classes"], "Useful when they ask you to describe the dataset."),
    ],
    tip: "Bonus line: print(rf.feature_importances_) shows which features mattered most.",
  },
  "20": {
    title: "Naive Bayes",
    steps: [
      "Load iris and split 70/30",
      "GaussianNB().fit(X_train, y_train)",
      "Print the test accuracy",
    ],
    mcq: [
      m("What is 'naive' about Naive Bayes?", "It assumes features are independent given the class", ["It ignores the class prior", "It uses only one feature", "It never trains"], "That assumption is rarely true, but it still works well."),
      m("GaussianNB assumes that, within each class, each feature…", "Is normally distributed", ["Is binary", "Is a word count", "Is uniform"], "It learns a mean and variance per feature per class."),
      m("For text word counts you would use…", "MultinomialNB", ["GaussianNB", "LinearRegression", "KMeans"], "BernoulliNB is for yes/no word presence."),
    ],
  },
  "21": {
    title: "Logistic regression",
    steps: [
      "load_breast_cancer(return_X_y=True), split 75/25",
      "make_pipeline(StandardScaler(), LogisticRegression())",
      "Print the accuracy and predict_proba for one sample",
    ],
    mcq: [
      m("Logistic regression outputs…", "A probability, through the sigmoid function", ["A continuous salary-like value", "A cluster label", "A distance"], "The class is 1 if the probability is ≥ 0.5."),
      m("In load_breast_cancer, target 1 means…", "Benign (0 = malignant)", ["Malignant", "Unknown", "Missing value"], "Check data.target_names: ['malignant', 'benign']."),
      m("Why put StandardScaler in the pipeline?", "The features have very different ranges; scaling helps the solver converge", ["Logistic regression needs negative numbers", "It removes rows", "It is needed for predict_proba"], "Without it you often get a ConvergenceWarning."),
    ],
  },
  "22": {
    title: "Compare classifiers",
    steps: [
      "Load wine and scale X with StandardScaler",
      "Put 6 models in a dict",
      "Loop: fit, predict, print accuracy aligned with f'{name:20s}'",
    ],
    mcq: [
      m("f'{name:20s}' does what?", "Pads the name to 20 characters so the columns line up", ["Cuts the name to 20 characters", "Prints it 20 times", "Converts it to a float"], ":.4f in the same line formats a number to 4 decimals."),
      m("What is slightly off about scaling before train_test_split?", "Test data leaks into the scaler's mean/std", ["Nothing, it's required", "Trees can't use scaled data", "It changes the labels"], "Strictly, fit the scaler on train only (see program 40). Fine for a lab, worth mentioning in a viva."),
      m("Which models benefit most from scaling?", "kNN and SVM (distance-based)", ["Decision Tree and Random Forest", "Naive Bayes only", "None of them"], "Trees split one feature at a time, so scale doesn't matter to them."),
    ],
  },
  "23": {
    title: "K-Means clustering",
    steps: [
      "X, _ = make_blobs(n_samples=300, centers=4, ...)",
      "KMeans(n_clusters=4, n_init=10, random_state=42).fit_predict(X)",
      "Print cluster_centers_",
      "Scatter coloured by label, with centres as red X",
    ],
    mcq: [
      m("n_init=10 means…", "Run 10 times from different starting centroids and keep the best", ["Use 10 clusters", "Run 10 iterations", "Use 10% of the data"], "K-Means can get stuck in bad local optima."),
      m("A common way to choose k is…", "The elbow method on inertia_ (or the silhouette score)", ["Always use k = 3", "Count the features", "Use cross_val_score"], "Plot inertia for k = 1..10 and look for the bend."),
      m("plt.scatter(*kmeans.cluster_centers_.T, ...) works because…", "The transpose gives [all x, all y], and * unpacks them as two arguments", ["T sorts the centres", "* multiplies them", "scatter takes a matrix"], "Same as scatter(centers[:, 0], centers[:, 1])."),
    ],
  },
  "24": {
    title: "Hierarchical clustering",
    steps: [
      "Z = linkage(X, method='ward')",
      "fcluster(Z, t=3, criterion='maxclust') gives the labels",
      "dendrogram(Z) then plt.show()",
    ],
    mcq: [
      m("Agglomerative (bottom-up) clustering starts with…", "Every point as its own cluster", ["One big cluster", "k random centres", "The two farthest points"], "It keeps merging the closest pair until one cluster is left."),
      m("Ward linkage merges the pair that…", "Least increases the within-cluster variance", ["Is farthest apart", "Has the most points", "Was created first"], "Other options: 'single', 'complete', 'average'."),
      m("fcluster(Z, t=3, criterion='maxclust')…", "Cuts the tree into 3 flat clusters", ["Draws 3 dendrograms", "Uses 3 linkage methods", "Keeps the 3 largest points"], "Visually: a horizontal cut through the dendrogram."),
    ],
  },
  "25": {
    title: "Compare clustering",
    steps: [
      "make_blobs with 4 centres of different spreads",
      "KMeans, AgglomerativeClustering, GaussianMixture",
      "silhouette_score (higher is better) and davies_bouldin_score (lower is better)",
    ],
    mcq: [
      m("Silhouette score ranges from…", "−1 to 1, higher is better", ["0 to 1, lower is better", "0 to ∞, lower is better", "−1 to 1, lower is better"], "Close to 1 means tight, well-separated clusters."),
      m("Davies–Bouldin index: better clusters give…", "A lower value", ["A higher value", "Exactly 1", "A negative value"], "It averages how similar each cluster is to its closest neighbour."),
      m("Gaussian Mixture differs from K-Means because it…", "Gives soft (probabilistic) memberships with elliptical clusters", ["Needs no number of clusters", "Builds a dendrogram", "Only works on text"], "Use gmm.predict_proba(X) to see the probabilities."),
    ],
  },
  "26": {
    title: "Collaborative filtering",
    steps: [
      "User × movie ratings table (0 = not rated)",
      "cosine_similarity between users",
      "Find the most similar user and recommend what they rated but you haven't",
    ],
    mcq: [
      m("User-based collaborative filtering recommends…", "Items liked by users similar to you", ["Items similar in content", "The most popular items only", "Random items"], "It uses ratings only, not item descriptions."),
      m("sim[user].drop(user).idxmax() finds…", "The most similar other user", ["The user's favourite movie", "The highest rating", "The least similar user"], "The drop() removes the user's similarity of 1.0 with themselves."),
    ],
  },
  "27": {
    title: "Content-based recommendation",
    steps: [
      "Combine Genre + Description into one text per movie",
      "TfidfVectorizer(stop_words='english').fit_transform(text)",
      "cosine_similarity, then sort one movie's row",
    ],
    mcq: [
      m("Content-based recommendation compares…", "Item features (genre, description)", ["Users' ratings", "Purchase times", "Prices only"], "That is why it works for a brand-new item with no ratings."),
      m("TF-IDF gives a low weight to words that…", "Appear in almost every document", ["Appear once", "Are long", "Are nouns"], "IDF = log of (total docs ÷ docs containing the word)."),
    ],
  },
  "28": {
    title: "SVD",
    steps: [
      "U, S, Vt = np.linalg.svd(A, full_matrices=False)",
      "Rank-2 approximation: U[:, :2] @ np.diag(S[:2]) @ Vt[:2]",
      "TruncatedSVD(n_components=20) on digits, then explained_variance_ratio_.sum()",
    ],
    mcq: [
      m("np.linalg.svd returns singular values sorted…", "In descending order", ["In ascending order", "Randomly", "By column"], "So the first k components keep the most information."),
      m("A rank-k approximation keeps…", "The top k singular values and vectors", ["k random rows", "The first k columns of A", "The k smallest singular values"], "It is the best possible rank-k approximation (Eckart–Young)."),
    ],
  },
  "29": {
    title: "PCA",
    steps: [
      "Scale wine data with StandardScaler",
      "PCA(n_components=2).fit_transform(X)",
      "Print the shapes and explained_variance_ratio_, then scatter PC1 vs PC2",
    ],
    mcq: [
      m("Why scale before PCA?", "Otherwise features with big units (like proline) dominate the variance", ["PCA needs integers", "It makes PCA supervised", "To remove the labels"], "PCA looks for directions of maximum variance."),
      m("PC1 is…", "The direction of maximum variance", ["The first original column", "The class label", "The smallest eigenvector"], "PC2 is the next best direction, perpendicular to PC1."),
    ],
  },
  "30": {
    title: "PCA vs SVD",
    steps: [
      "Load digits",
      "Fit PCA(10) and TruncatedSVD(10), timing each with time.time()",
      "Compare explained_variance_ratio_.sum()",
    ],
    mcq: [
      m("The main difference between PCA and TruncatedSVD is…", "PCA centres the data first; TruncatedSVD doesn't, so it works on sparse matrices", ["SVD is supervised", "PCA can't reduce dimensions", "They are identical"], "That is why TruncatedSVD is used on TF-IDF text matrices."),
    ],
  },
  "31": {
    title: "Text preprocessing",
    steps: [
      "word_tokenize(text.lower()), keep w.isalnum()",
      "Remove stopwords.words('english')",
      "PorterStemmer().stem(w)",
    ],
    mcq: [
      m("Stemming 'studies' with Porter gives…", "'studi'", ["'study'", "'stud'", "'studies'"], "Stemmers chop suffixes by rule, so the result needn't be a real word."),
      m("Stemming vs lemmatization:", "Stemming chops suffixes; lemmatization returns the dictionary word", ["They are the same", "Lemmatization is always faster", "Stemming needs a dictionary"], "WordNetLemmatizer gives 'study' for 'studies'."),
    ],
    tip: "No internet = nltk.download() fails unless the data is already installed. Offline fallback: re.findall(r'[a-z0-9]+', text.lower()) + sklearn's ENGLISH_STOP_WORDS + PorterStemmer (needs no data).",
  },
  "32": {
    title: "Information retrieval (TF-IDF)",
    steps: [
      "Fit TfidfVectorizer on the documents",
      "transform([query]) with the same vectorizer",
      "cosine_similarity, then scores.argsort()[::-1][:3] for the top 3",
    ],
    mcq: [
      m("scores.argsort()[::-1] gives…", "Document indices from highest to lowest score", ["The scores sorted ascending", "The original order reversed", "Only the best index"], "argsort sorts ascending; [::-1] reverses it."),
      m("Why transform() the query instead of fit_transform()?", "The query must use the same vocabulary and IDF as the documents", ["fit_transform is slower", "Queries can't be fitted", "It removes stop words"], "Refitting on one query would make a different vocabulary."),
    ],
  },
  "33": {
    title: "Cosine similarity",
    steps: [
      "TfidfVectorizer().fit_transform(docs)",
      "cosine_similarity(tfidf) gives an n × n matrix",
      "Read the pairs: sim[0][1], sim[0][3]",
    ],
    mcq: [
      m("A cosine similarity of 0 between two TF-IDF docs means…", "They share no words", ["They are identical", "One is empty", "They are opposite"], "TF-IDF values are ≥ 0, so cosine is between 0 and 1 here."),
      m("Why is the diagonal all 1s?", "Every document is identical to itself", ["It is normalised", "It's a bug", "Stop words were removed"], "cos(0°) = 1."),
    ],
  },
  "34": {
    title: "Social network graph",
    steps: [
      "G = nx.Graph(list_of_edges)",
      "Print G.nodes(), G.edges(), dict(G.degree())",
      "nx.shortest_path(G, 'Asha', 'Dev')",
      "nx.draw(G, with_labels=True) then plt.show()",
    ],
    mcq: [
      m("A node's degree is…", "The number of edges connected to it", ["Its distance from the centre", "Its label length", "The number of communities"], "Meera, Arjun and Karan have degree 3 here."),
      m("On an unweighted graph, shortest_path finds…", "The path with the fewest edges (BFS)", ["The alphabetical path", "The longest path", "A random path"], "With weights it uses Dijkstra."),
    ],
  },
  "35": {
    title: "Community detection",
    steps: [
      "G = nx.karate_club_graph() (built in, works offline)",
      "greedy_modularity_communities(G)",
      "Print each community sorted",
    ],
    mcq: [
      m("Modularity measures…", "How much denser the links are inside communities than between them", ["The number of nodes", "The graph's diameter", "The average degree"], "Greedy modularity merges groups while modularity keeps going up."),
      m("Zachary's karate club graph has…", "34 nodes", ["50 nodes", "7 nodes", "150 nodes"], "It is the classic small social network."),
    ],
  },
  "36": {
    title: "Graph partitioning",
    steps: [
      "kernighan_lin_bisection(G, seed=42) → A, B",
      "nx.cut_size(G, A, B) counts the edges between the halves",
      "neighbors, degree, clustering for one node",
    ],
    mcq: [
      m("Kernighan–Lin bisection…", "Splits the graph into two equal halves with few cut edges", ["Finds the shortest path", "Colours the nodes", "Removes isolated nodes"], "It swaps node pairs between the halves to reduce the cut."),
      m("A node's clustering coefficient is…", "The fraction of its neighbour pairs that are also connected", ["Its degree ÷ total nodes", "The number of triangles in the whole graph", "Its community number"], "0.15 for node 0 means its friends rarely know each other."),
    ],
  },
  "37": {
    title: "Interactive Plotly",
    steps: [
      "df = px.data.iris() (bundled, works offline)",
      "px.scatter(df, x=..., y=..., color='species', size=..., hover_data=[...])",
      "fig.show() opens in the browser",
    ],
    mcq: [
      m("Does px.data.iris() need internet?", "No, the sample data ships inside plotly", ["Yes, it downloads the CSV", "Only the first time", "Only in Spyder"], "Other bundled ones: px.data.tips(), gapminder(), stocks(). sns.load_dataset() does need internet."),
      m("size='petal_length' in px.scatter…", "Sets each marker's size from petal length", ["Sets the figure size", "Sorts by petal length", "Filters small petals"], "color= sets the colour, hover_data= adds tooltip fields."),
    ],
  },
  "38": {
    title: "Pair plots & PCA",
    steps: [
      "iris = load_iris(as_frame=True); df = iris.data",
      "df['species'] = iris.target_names[iris.target]",
      "sns.pairplot(df, hue='species'); plt.show()",
      "PCA(2) → sns.scatterplot(x=PC1, y=PC2, hue=species)",
    ],
    mcq: [
      m("A pair plot shows…", "A scatter plot for every pair of columns, with distributions on the diagonal", ["One big scatter plot", "Only histograms", "A correlation heatmap"], "hue= colours the points by class."),
      m("iris.target_names[iris.target] works because…", "NumPy fancy indexing maps each 0/1/2 to its name", ["target_names is a dict", "pandas merges them", "It's a special iris method"], "An array indexed by an array of integers."),
    ],
  },
  "39": {
    title: "Exploratory data analysis",
    steps: [
      "df = load_wine(as_frame=True).frame",
      "df.info(), df.describe(), df.isnull().sum()",
      "sns.boxplot(data=df, x='target', y='alcohol')",
    ],
    mcq: [
      m("df.info() shows…", "Columns, non-null counts, dtypes and memory use", ["Only the first 5 rows", "Mean and std", "Correlations"], "It's the quickest check for missing values and wrong dtypes."),
      m("In df.describe(), the 50% row is…", "The median", ["The mean", "Half the count", "The mode"], "25% and 75% are the 1st and 3rd quartiles."),
      m("df.isnull().sum() returns…", "The count of missing values in each column", ["The total of each column", "Rows with no missing values", "True/False for the whole frame"], "True counts as 1 when you sum."),
    ],
    tip: "For a Titanic EDA, add: df['Survived'].value_counts(), df.groupby('Sex')['Survived'].mean(), sns.countplot(x='Pclass', hue='Survived', data=df).",
  },
  "40": {
    title: "End-to-end application",
    steps: [
      "Load → drop_duplicates().dropna()",
      "Split 80/20, then scaler.fit_transform(X_train) and scaler.transform(X_test)",
      "Visualise the class balance with sns.countplot",
      "Fit LogisticRegression, print confusion_matrix + classification_report",
      "Predict one sample and map it with target_names",
    ],
    mcq: [
      m("Why fit_transform on X_train but only transform on X_test?", "So no information from the test set leaks into the scaler", ["transform is faster", "X_test has no labels", "fit_transform only works once"], "The test set must stay unseen data."),
      m("In classification_report, 'support' is…", "The number of true samples of each class in the test set", ["The model's confidence", "The number of features", "The F1 score"], "43 malignant + 71 benign = 114 test rows."),
      m("'macro avg' in classification_report is…", "The plain average over classes", ["Weighted by support", "The accuracy", "The best class's score"], "'weighted avg' weights each class by its support."),
    ],
  },
};
