import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, balanced_accuracy_score, f1_score, classification_report

DATASET = "synthetic_personalization_dataset_v2.csv"
MODEL_OUT = "personalization_random_forest_v2.joblib"

FEATURES = [
    "accuracy", "response_time", "attempts", "completion", "hint_usage",
    "recent_performance", "difficulty", "game_type", "memory_score",
    "attention_score", "engagement_score", "fatigue_proxy"
]

RECOMMENDATIONS = {
    0: "Increase difficulty",
    1: "Maintain difficulty",
    2: "Reduce difficulty",
    3: "Change game type",
    4: "Increase repetition"
}

df = pd.read_csv(DATASET)
X = df[FEATURES]
y = df["recommendation"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, stratify=y, random_state=42
)

model = RandomForestClassifier(
    n_estimators=500,
    max_depth=14,
    min_samples_leaf=3,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)
pred = model.predict(X_test)

print(f"Test accuracy: {accuracy_score(y_test, pred):.2%}")
print(f"Balanced accuracy: {balanced_accuracy_score(y_test, pred):.2%}")
print(f"Weighted F1: {f1_score(y_test, pred, average='weighted'):.4f}")
print("\nClassification report:")
print(classification_report(y_test, pred, digits=4))

cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
cv_model = RandomForestClassifier(
    n_estimators=200, max_depth=14, min_samples_leaf=3,
    random_state=42, n_jobs=-1
)
scores = cross_val_score(cv_model, X, y, cv=cv, scoring="accuracy")
print(f"3-fold CV accuracy: {scores.mean():.2%} +/- {scores.std():.2%}")

package = {
    "model": model,
    "feature_names": FEATURES,
    "recommendations": RECOMMENDATIONS
}
joblib.dump(package, MODEL_OUT)
print(f"\nSaved: {MODEL_OUT}")
