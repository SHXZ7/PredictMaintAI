import pandas as pd
import pickle

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report

# ===============================
# LOAD DATASET
# ===============================
df = pd.read_csv("data/dataset.csv")

# ===============================
# TARGET
# ===============================
TARGET = "Machine failure"

# ===============================
# EXPLICIT FEATURES (NO LEAKAGE)
# ===============================
FEATURES = [
    "Air temperature [K]",
    "Process temperature [K]",
    "Rotational speed [rpm]",
    "Torque [Nm]",
    "Tool wear [min]"
]

# 🔴 Explicitly drop everything else
X = df[FEATURES]
y = df[TARGET]

print("✅ Training with features:")
for f in FEATURES:
    print(" -", f)

# ===============================
# TRAIN / TEST SPLIT
# ===============================
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# ===============================
# MODEL PIPELINE
# ===============================
model = Pipeline([
    ("scaler", StandardScaler()),
    ("rf", RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        n_jobs=-1
    ))
])

# ===============================
# TRAIN
# ===============================
model.fit(X_train, y_train)

# ===============================
# EVALUATE
# ===============================
y_pred = model.predict(X_test)
print("\nMODEL PERFORMANCE\n")
print(classification_report(y_test, y_pred))

# ===============================
# SAVE MODEL
# ===============================
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

print("\n✅ Clean model trained & saved as model.pkl")
