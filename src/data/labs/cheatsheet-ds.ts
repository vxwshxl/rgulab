export type DatasetRow = { call: string; what: string; offline: boolean; note?: string };

export const datasets: DatasetRow[] = [
  { call: "load_iris()", what: "150 flowers · 4 features · 3 species", offline: true, note: "from sklearn.datasets" },
  { call: "load_wine()", what: "178 wines · 13 features · 3 classes", offline: true, note: "from sklearn.datasets" },
  { call: "load_breast_cancer()", what: "569 tumours · 30 features · 2 classes", offline: true, note: "from sklearn.datasets" },
  { call: "load_digits()", what: "1797 8×8 images · 64 features · 10 digits", offline: true, note: "from sklearn.datasets" },
  { call: "load_diabetes()", what: "442 patients · 10 features · regression target", offline: true, note: "from sklearn.datasets" },
  { call: "make_classification() / make_blobs() / make_regression() / make_moons()", what: "Generate any size you want", offline: true, note: "from sklearn.datasets" },
  { call: "px.data.iris() / tips() / gapminder() / stocks()", what: "Ships inside plotly", offline: true, note: "import plotly.express as px" },
  { call: "nx.karate_club_graph()", what: "34-node social network", offline: true, note: "import networkx as nx" },
  { call: "sns.load_dataset('titanic' | 'tips' | 'iris')", what: "Downloads from GitHub", offline: false, note: "Fails with no internet unless it was cached in ~/seaborn-data before" },
  { call: "fetch_california_housing() / fetch_openml()", what: "Downloads on first use", offline: false, note: "Use load_diabetes() or a hand-made DataFrame instead" },
  { call: "nltk.download('stopwords')", what: "Downloads NLTK data", offline: false, note: "Use sklearn's ENGLISH_STOP_WORDS instead" },
];

export type Snippet = { id: string; title: string; when: string; code: string };

export const makeYourOwn: Snippet[] = [
  {
    id: "students",
    title: "Student marks",
    when: "Stats, regression, preprocessing",
    code: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    'Name': ['Asha', 'Rahul', 'Meera', 'Arjun', 'Priya', 'Karan', 'Dev', 'Sara'],
    'Hours': [2, 4, 6, 8, 5, 7, 3, 9],
    'Attendance': [60, 75, 85, 95, 80, 90, 70, 98],
    'Marks': [45, 58, 70, 88, 66, 79, 52, 93]})
df['Pass'] = (df['Marks'] >= 60).astype(int)
print(df)
print(df.describe())`,
  },
  {
    id: "titanic-mini",
    title: "Mini Titanic (typed by hand)",
    when: "Titanic was asked but no CSV is on the system",
    code: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    'Survived': [0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0],
    'Pclass':   [3, 1, 3, 1, 3, 3, 1, 3, 2, 3, 2, 1],
    'Sex':      ['male', 'female', 'female', 'female', 'male', 'male',
                 'male', 'female', 'female', 'male', 'female', 'male'],
    'Age':      [22, 38, 26, 35, 35, np.nan, 54, 2, 14, 20, np.nan, 40],
    'Fare':     [7.25, 71.28, 7.92, 53.1, 8.05, 8.46, 51.86, 21.07, 30.07, 8.05, 26.0, 61.0],
    'Embarked': ['S', 'C', 'S', 'S', 'S', 'Q', 'S', 'S', 'C', np.nan, 'S', 'C']})
print(df)
print("\\nMissing values:\\n", df.isnull().sum())`,
  },
  {
    id: "iris-frame",
    title: "Iris as a DataFrame",
    when: "Any question that says 'use the Iris dataset'",
    code: `from sklearn.datasets import load_iris

iris = load_iris(as_frame=True)
df = iris.frame                      # 4 feature columns + 'target'
df['species'] = iris.target_names[iris.target]
print(df.head())
print(df['species'].value_counts())`,
  },
  {
    id: "salary",
    title: "Experience vs salary",
    when: "Simple / multiple linear regression",
    code: `import pandas as pd

df = pd.DataFrame({
    'Experience': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    'Salary': [30000, 35000, 41000, 44000, 52000, 55000, 62000, 66000, 71000, 78000]})
print(df)
print("Correlation:", df['Experience'].corr(df['Salary']))`,
  },
];

export const titanicDrills: Snippet[] = [
  {
    id: "t-pre",
    title: "Preprocess Titanic",
    when: "Program 02 on Titanic",
    code: `import pandas as pd

df = pd.read_csv('titanic.csv')
print("Before:\\n", df.isnull().sum())

df['Age'] = df['Age'].fillna(df['Age'].median())
df['Embarked'] = df['Embarked'].fillna(df['Embarked'].mode()[0])
df = df.drop(columns=['Cabin']).drop_duplicates()
df['Sex'] = df['Sex'].map({'male': 0, 'female': 1})

print("\\nAfter:\\n", df.isnull().sum())
print(df.head())`,
  },
  {
    id: "t-eda",
    title: "Titanic EDA + plots",
    when: "Programs 10 / 39 on Titanic",
    code: `import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

df = pd.read_csv('titanic.csv')
df.info()
print("\\nSummary:\\n", df.describe())
print("\\nSurvival rate by sex:\\n", df.groupby('Sex')['Survived'].mean())
print("\\nSurvival rate by class:\\n", df.groupby('Pclass')['Survived'].mean())

fig, ax = plt.subplots(1, 3, figsize=(15, 4))
sns.countplot(data=df, x='Pclass', hue='Survived', ax=ax[0]).set_title("Survival by Class")
sns.histplot(df['Age'].dropna(), bins=15, ax=ax[1]).set_title("Age Distribution")
sns.boxplot(data=df, x='Pclass', y='Fare', ax=ax[2]).set_title("Fare by Class")
plt.tight_layout()
plt.show()`,
  },
  {
    id: "t-clf",
    title: "Predict survival",
    when: "Programs 15 / 17 / 21 / 22 on Titanic",
    code: `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, confusion_matrix

df = pd.read_csv('titanic.csv')
df['Age'] = df['Age'].fillna(df['Age'].median())
df['Sex'] = df['Sex'].map({'male': 0, 'female': 1})
X = df[['Pclass', 'Sex', 'Age', 'Fare']]
y = df['Survived']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

for name, model in [('Logistic Regression', LogisticRegression(max_iter=1000)),
                    ('Decision Tree', DecisionTreeClassifier(max_depth=3, random_state=42))]:
    y_pred = model.fit(X_train, y_train).predict(X_test)
    print(f"{name:20s} Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(confusion_matrix(y_test, y_pred))`,
  },
];

export const spyderKeys: { keys: string; does: string }[] = [
  { keys: "F5", does: "Run the whole file" },
  { keys: "F9", does: "Run the selected lines (or the current line)" },
  { keys: "Ctrl + Enter", does: "Run the current cell (cells start with #%%)" },
  { keys: "Shift + Enter", does: "Run the cell and move to the next one" },
  { keys: "Ctrl + .", does: "Restart the kernel (clears all variables)" },
  { keys: "Ctrl + I", does: "Show help for the name under the cursor, which works offline" },
  { keys: "Tab", does: "Autocomplete: type sklearn.metrics. and press Tab to list the functions" },
  { keys: "Ctrl + 1", does: "Comment or uncomment the selected lines" },
];

export const spyderTips: string[] = [
  "Plots land in the Plots pane. For pop-up windows, run %matplotlib qt in the console (and %matplotlib inline to go back).",
  "Check the working directory (top-right folder) before read_csv('titanic.csv'). Or give the full path.",
  "Forgot a function's arguments? help(train_test_split) or Ctrl+I works without internet.",
  "dir(model) lists every attribute, e.g. coef_, intercept_, feature_importances_.",
  "Variable Explorer shows DataFrames as tables, so it's a quick way to check your preprocessing.",
  "Seeds matter: use random_state=42 everywhere so your output matches what you write in the record.",
];
