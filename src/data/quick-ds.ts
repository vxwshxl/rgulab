// /quick: every DS record program's code plus viva questions with answers, grouped by topic.

export type QuickProgram = {
  id: string;
  /** Extra viva questions specific to this program (shown with answers). */
  viva?: [string, string][];
};

export type QuickGroup = { id: string; title: string; programs: QuickProgram[] };

export const groups: QuickGroup[] = [
  {
    id: "pandas",
    title: "Pandas basics",
    programs: [
      {
        id: "01",
      },
      {
        id: "02",
        viva: [["What is data preprocessing?", "Cleaning raw data before analysis: handling missing values, duplicates, wrong types and inconsistent text, so the results are correct."]],
      },
      {
        id: "03",
        viva: [["Mean vs median?", "Mean is the average; median is the middle value. The median is better when there are outliers."]],
      },
      {
        id: "08",
      },
    ],
  },
  {
    id: "stats",
    title: "Statistics",
    programs: [
      {
        id: "04",
        viva: [["Covariance vs correlation?", "Both show how two variables move together. Correlation is scaled to −1…1 and has no units, so it is easier to compare."]],
      },
      {
        id: "05",
        viva: [["What is a normal distribution?", "A symmetric bell-shaped curve where mean = median = mode. About 68% of values lie within 1 std, 95% within 2 std."]],
      },
      {
        id: "06",
        viva: [
          ["What is the null hypothesis here?", "H₀: the population mean is 50. The test checks if the data gives enough evidence against it."],
          ["What does the p-value mean?", "The chance of getting data this extreme if H₀ is true. Small p (< 0.05) means H₀ is unlikely."],
        ],
      },
      {
        id: "07",
        viva: [["What does a 95% confidence interval mean?", "If we repeated the sampling many times, about 95% of such intervals would contain the true population mean."]],
      },
    ],
  },
  {
    id: "plots",
    title: "Graphs",
    programs: [
      {
        id: "09",
      },
      {
        id: "10",
        viva: [["Which chart for what?", "Bar = compare categories, histogram = distribution, pie = parts of a whole, box = spread and outliers, scatter = relationship, heatmap = correlation matrix."]],
      },
      {
        id: "37",
      },
      {
        id: "38",
        viva: [["Why PCA?", "To reduce many features to a few (here 4 → 2) while keeping the most variance, so we can visualise the data."]],
      },
    ],
  },
  {
    id: "regression",
    title: "Regression (predict a number)",
    programs: [
      {
        id: "11",
        viva: [["What is linear regression?", "A model that fits the best straight line y = mx + c through the data to predict a continuous value."]],
      },
      {
        id: "12",
        viva: [["MSE vs R²?", "MSE is the average squared error (lower is better, in squared units). R² is the fraction of variance explained (closer to 1 is better)."]],
      },
      {
        id: "13",
        viva: [["Why regularisation?", "To stop overfitting by penalising big coefficients. Ridge shrinks them; Lasso can remove features completely."]],
      },
    ],
  },
  {
    id: "classification",
    title: "Classification (predict a class)",
    programs: [
      {
        id: "14",
        viva: [["What is cross-validation?", "Split data into k folds; train on k−1 and test on the remaining one, k times. Average score is more reliable than one split."]],
      },
      {
        id: "15",
        viva: [
          ["Precision vs recall?", "Precision = TP/(TP+FP): of predicted positives, how many were right. Recall = TP/(TP+FN): of real positives, how many we found."],
          ["What is F1?", "The harmonic mean of precision and recall; useful when classes are imbalanced."],
        ],
      },
      {
        id: "16",
        viva: [["How does kNN work?", "It stores the training data. For a new point it finds the k closest points (by distance) and takes the majority vote."]],
      },
      {
        id: "17",
        viva: [["What is Gini?", "A measure of impurity: 0 means a node has only one class. The tree picks the split that lowers impurity the most."]],
      },
      {
        id: "18",
        viva: [["What does SVM do?", "Finds the boundary with the widest margin between classes. Kernels let it draw curved boundaries."]],
      },
      {
        id: "19",
        viva: [["Why is a random forest better than one tree?", "Many trees on random samples vote together, which reduces overfitting (variance)."]],
      },
      {
        id: "20",
        viva: [["Why 'naive'?", "It assumes all features are independent of each other given the class, which is rarely true but works well."]],
      },
      {
        id: "21",
        viva: [["Is logistic regression regression?", "No, it is a classifier. It uses the sigmoid to turn a score into a probability between 0 and 1."]],
      },
      {
        id: "22",
      },
    ],
  },
  {
    id: "clustering",
    title: "Clustering (find groups, no labels)",
    programs: [
      {
        id: "23",
        viva: [["How does K-Means work?", "Pick k centres, assign each point to the nearest centre, move each centre to the mean of its points, repeat until nothing changes."]],
      },
      {
        id: "24",
      },
      {
        id: "25",
      },
    ],
  },
  {
    id: "project",
    title: "EDA and the full project",
    programs: [
      {
        id: "39",
        viva: [["What is EDA?", "Exploratory Data Analysis: understanding data with summaries and graphs (shape, types, missing values, distributions, outliers) before modelling."]],
      },
      {
        id: "40",
        viva: [["Why fit the scaler only on train?", "So no information from the test set leaks into training. The test set must stay unseen."]],
      },
    ],
  },
];

/** "Change this quickly" edits examiners ask for, per program: [what they ask, the new line]. */
export const changes: Record<string, [string, string][]> = {
  "01": [
    ["Add a City column", "df['City'] = ['Delhi', 'Pune', 'Goa']"],
    ["Show only the first 2 rows of the CSV", "print(pd.read_csv('01.csv').head(2))"],
    ["Save JSON one object per column instead", "df.to_json('01.json')"],
  ],
  "02": [
    ["Fill Age with the mean instead of the median", "df['Age'] = df['Age'].fillna(df['Age'].mean())"],
    ["Just delete rows with missing values", "df = df.dropna()"],
    ["Make names UPPERCASE", "df['Name'] = df['Name'].str.strip().str.upper()"],
    ["Count missing values first", "print(df.isnull().sum())"],
  ],
  "03": [
    ["Only for column A", "print(df['A'].mean(), df['A'].median(), df['A'].std())"],
    ["All summary stats at once", "print(df.describe())"],
    ["Correlation instead of covariance", "print(df.corr())"],
  ],
  "04": [
    ["Only the correlation heatmap", "sns.heatmap(df.corr(), annot=True, cmap='coolwarm')\nplt.show()"],
    ["Different colours", "cmap='viridis'   # or 'Blues', 'YlGnBu'"],
  ],
  "05": [
    ["Mean 100, std 15", "data = np.random.normal(100, 15, 1000)"],
    ["Same numbers every run", "np.random.seed(0)   # put before generating"],
    ["More bars in the histogram", "ax[0].hist(data, bins=50)"],
  ],
  "06": [
    ["Test against 52 instead of 50", "t, p = stats.ttest_1samp(data, 52)"],
    ["Compare two groups", "t, p = stats.ttest_ind(group1, group2)"],
    ["Use α = 0.01", "print(\"Reject\" if p < 0.01 else \"Fail to reject\")"],
  ],
  "07": [
    ["99% confidence interval", "stats.t.interval(0.99, len(data) - 1, loc=mean, scale=stats.sem(data))"],
    ["Also print the standard deviation", "print(\"Std:\", np.std(data, ddof=1))"],
  ],
  "08": [
    ["Bonus of 20%", "df['Bonus'] = df['Salary'] * 0.20"],
    ["Salary above 60000", "print(df[df['Salary'] > 60000])"],
    ["Sort by age, youngest first", "print(df.sort_values('Age'))"],
    ["Average salary", "print(df['Salary'].mean())"],
  ],
  "09": [
    ["Red dashed line", "ax[0].plot(df['Age'], df['Salary'], marker='o', color='red', linestyle='--')"],
    ["Axis labels", "ax[0].set_xlabel('Age')\nax[0].set_ylabel('Salary')"],
  ],
  "10": [
    ["Only a bar chart", "plt.bar(df['Name'], df['Salary'])\nplt.title('Salary')\nplt.show()"],
    ["Horizontal bars", "plt.barh(df['Name'], df['Salary'])"],
    ["Save the figure", "plt.savefig('charts.png')   # before plt.show()"],
  ],
  "11": [
    ["Predict for 15 years", "print(model.predict(pd.DataFrame({'Experience': [15]}))[0])"],
    ["Also print MSE", "from sklearn.metrics import mean_squared_error\nprint(\"MSE:\", mean_squared_error(y, model.predict(X)))"],
  ],
  "12": [
    ["80/20 split", "test_size=0.2"],
    ["Show actual vs predicted", "print(pd.DataFrame({'Actual': y_test, 'Predicted': y_pred}))"],
  ],
  "13": [
    ["Stronger Ridge penalty", "Ridge(alpha=10.0)"],
    ["Plain linear regression to compare", "from sklearn.linear_model import LinearRegression\n('Linear', LinearRegression())"],
  ],
  "14": [
    ["10-fold cross-validation", "cross_val_score(m, X, y, cv=10).mean()"],
    ["Add an SVM to the comparison", "from sklearn.svm import SVC\nmodels['SVM'] = SVC()"],
  ],
  "15": [
    ["Full per-class report", "from sklearn.metrics import classification_report\nprint(classification_report(y_test, y_pred))"],
    ["Use a different split", "test_size=0.3"],
  ],
  "16": [
    ["k = 3", "KNeighborsClassifier(n_neighbors=3)"],
    ["Try k = 1 to 10", "for k in range(1, 11):\n    acc = KNeighborsClassifier(n_neighbors=k).fit(X_train, y_train).score(X_test, y_test)\n    print(k, acc)"],
  ],
  "17": [
    ["Use entropy", "DecisionTreeClassifier(criterion='entropy', max_depth=3, random_state=42)"],
    ["Draw the tree", "from sklearn.tree import plot_tree\nimport matplotlib.pyplot as plt\nplot_tree(dt, filled=True, feature_names=iris.feature_names)\nplt.show()"],
  ],
  "18": [
    ["Only RBF with C = 10", "svm = SVC(kernel='rbf', C=10).fit(X_train, y_train)"],
    ["Confusion matrix", "from sklearn.metrics import confusion_matrix\nprint(confusion_matrix(y_test, svm.predict(X_test)))"],
  ],
  "19": [
    ["50 trees", "RandomForestClassifier(n_estimators=50, random_state=42)"],
    ["Which features matter most", "print(rf.feature_importances_)"],
  ],
  "20": [
    ["Use the wine data", "from sklearn.datasets import load_wine\nX, y = load_wine(return_X_y=True)"],
    ["Confusion matrix", "from sklearn.metrics import confusion_matrix\nprint(confusion_matrix(y_test, nb.predict(X_test)))"],
  ],
  "21": [
    ["Predicted class for the first sample", "print(model.predict(X_test[:1]))"],
    ["Confusion matrix", "from sklearn.metrics import confusion_matrix\nprint(confusion_matrix(y_test, model.predict(X_test)))"],
  ],
  "22": [
    ["Print the best model", "scores = {}\n# inside the loop: scores[name] = accuracy_score(y_test, model.predict(X_test))\nprint(\"Best:\", max(scores, key=scores.get))"],
    ["Use iris instead of wine", "from sklearn.datasets import load_iris\nX, y = load_iris(return_X_y=True)"],
  ],
  "23": [
    ["3 clusters", "make_blobs(n_samples=300, centers=3, ...)\nKMeans(n_clusters=3, n_init=10, random_state=42)"],
    ["Elbow method to choose k", "for k in range(1, 11):\n    print(k, KMeans(n_clusters=k, n_init=10).fit(X).inertia_)"],
  ],
  "24": [
    ["Single linkage", "Z = linkage(X, method='single')"],
    ["4 clusters", "fcluster(Z, t=4, criterion='maxclust')"],
  ],
  "25": [
    ["Only K-Means silhouette", "labels = KMeans(n_clusters=4, n_init=10).fit_predict(X)\nprint(silhouette_score(X, labels))"],
    ["Try 3 clusters", "n_clusters=3   # and n_components=3 for GaussianMixture"],
  ],
  "37": [
    ["Plot petal sizes instead", "px.scatter(df, x='petal_length', y='petal_width', color='species')"],
    ["Interactive histogram", "px.histogram(df, x='sepal_length', color='species').show()"],
    ["Interactive bar chart", "px.bar(df, x='species', y='sepal_length').show()"],
  ],
  "38": [
    ["3 components", "PCA(n_components=3)"],
    ["How much variance PCA keeps", "pca = PCA(n_components=2)\nX_pca = pca.fit_transform(df.drop(columns='species'))\nprint(pca.explained_variance_ratio_)"],
  ],
  "39": [
    ["First 5 rows", "print(df.head())"],
    ["Correlation heatmap", "sns.heatmap(df.corr(), cmap='coolwarm')\nplt.show()"],
    ["Histogram of alcohol", "df['alcohol'].hist(bins=20)\nplt.show()"],
  ],
  "40": [
    ["Use Random Forest instead", "from sklearn.ensemble import RandomForestClassifier\nmodel = RandomForestClassifier(random_state=42).fit(X_train, y_train)"],
    ["Print accuracy", "from sklearn.metrics import accuracy_score\nprint(\"Accuracy:\", accuracy_score(y_test, y_pred))"],
  ],
};
