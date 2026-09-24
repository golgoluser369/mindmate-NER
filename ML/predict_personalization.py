import joblib
import pandas as pd

MODEL_FILE = "personalization_random_forest_v2.joblib"

data = joblib.load(MODEL_FILE)
model = data["model"]
feature_names = data["feature_names"]
recommendations = data["recommendations"]

# Replace these values with real gameplay/session telemetry.
session = {
    "accuracy": 0.92,
    "response_time": 2.1,
    "attempts": 1,
    "completion": 1.0,
    "hint_usage": 0,
    "recent_performance": 0.88,
    "difficulty": 3,
    "game_type": 0,
    "memory_score": 0.84,
    "attention_score": 0.79,
    "engagement_score": 0.91,
    "fatigue_proxy": 0.10
}

# DataFrame preserves the exact feature names used during training.
X = pd.DataFrame([session], columns=feature_names)

prediction = int(model.predict(X)[0])
probabilities = model.predict_proba(X)[0]

print("AI Recommendation:", recommendations[prediction])
print("\nPrediction probabilities:")
for class_id, probability in enumerate(probabilities):
    print(f"{recommendations[class_id]}: {probability:.2%}")
