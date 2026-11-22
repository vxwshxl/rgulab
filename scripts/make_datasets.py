"""Writes the practice CSVs into public/datasets/. Run: python3 scripts/make_datasets.py
titanic.csv is SYNTHETIC: it has the Kaggle Titanic column layout so you can practise
the same code, but the rows are generated, not the real passenger list."""
import json, os
import numpy as np
import pandas as pd
from sklearn.datasets import load_iris

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "datasets")
rng = np.random.default_rng(7)

# iris.csv: the real Iris data, exported from scikit-learn
iris = load_iris(as_frame=True)
df = iris.frame.rename(columns=lambda c: c.replace(" (cm)", "").replace(" ", "_"))
df["species"] = iris.target_names[iris.target]
df.drop(columns="target").to_csv(f"{OUT}/iris.csv", index=False)

# titanic.csv: synthetic rows in the Kaggle layout, with realistic gaps
n = 150
first_m = ["John", "William", "James", "Charles", "George", "Thomas", "Henry", "Arthur", "Frederick", "Albert"]
first_f = ["Mary", "Anna", "Elizabeth", "Margaret", "Alice", "Helen", "Edith", "Florence", "Ellen", "Ada"]
last = ["Smith", "Brown", "Taylor", "Wilson", "Davies", "Evans", "Thomas", "Johnson", "Roberts", "Walker",
        "Wright", "Hall", "Green", "Wood", "Harris", "Lewis", "Clarke", "Allen", "Hill", "Moore"]
pclass = rng.choice([1, 2, 3], n, p=[0.24, 0.21, 0.55])
sex = rng.choice(["male", "female"], n, p=[0.64, 0.36])
age = np.clip(rng.normal(30, 14, n), 0.5, 75).round(0)
sibsp = rng.choice([0, 1, 2, 3], n, p=[0.68, 0.23, 0.06, 0.03])
parch = rng.choice([0, 1, 2], n, p=[0.76, 0.14, 0.10])
fare = np.where(pclass == 1, rng.normal(85, 30, n), np.where(pclass == 2, rng.normal(22, 8, n), rng.normal(13, 5, n)))
fare = np.clip(fare, 5, 260).round(2)
embarked = rng.choice(["S", "C", "Q"], n, p=[0.72, 0.19, 0.09])
logit = -0.6 + 2.4 * (sex == "female") + 1.0 * (pclass == 1) + 0.4 * (pclass == 2) - 0.9 * (pclass == 3) + 0.8 * (age < 12) - 0.02 * (age - 30)
survived = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)
names = []
for i in range(n):
    if sex[i] == "male":
        names.append(f"{rng.choice(last)}, {'Master' if age[i] < 12 else 'Mr'}. {rng.choice(first_m)}")
    else:
        names.append(f"{rng.choice(last)}, {'Miss' if age[i] < 18 else rng.choice(['Mrs', 'Miss'])}. {rng.choice(first_f)}")
cabin = [f"{rng.choice(list('ABCDE'))}{rng.integers(2, 120)}" if p == 1 and rng.random() < 0.8 else np.nan for p in pclass]
t = pd.DataFrame({"PassengerId": range(1, n + 1), "Survived": survived, "Pclass": pclass, "Name": names,
                  "Sex": sex, "Age": age, "SibSp": sibsp, "Parch": parch, "Fare": fare, "Cabin": cabin,
                  "Embarked": embarked})
t.loc[rng.choice(n, 28, replace=False), "Age"] = np.nan
t.loc[rng.choice(n, 2, replace=False), "Embarked"] = np.nan
t.to_csv(f"{OUT}/titanic.csv", index=False)

# students.csv: small marks table, good for stats / regression drills
m = 40
hours = rng.uniform(1, 10, m).round(1)
attendance = rng.uniform(55, 100, m).round(0)
marks = np.clip(30 + 5.5 * hours + 0.25 * attendance + rng.normal(0, 5, m), 0, 100).round(0)
pd.DataFrame({"Name": [f"S{i:02d}" for i in range(1, m + 1)], "Hours": hours, "Attendance": attendance,
              "Marks": marks, "Pass": (marks >= 60).astype(int)}).to_csv(f"{OUT}/students.csv", index=False)

files = sorted(f for f in os.listdir(OUT) if f.endswith(".csv"))
json.dump(files, open(f"{OUT}/index.json", "w"))
print(files)
