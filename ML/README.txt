PERSONALIZATION AI - VERSION 2

Files
-----
personalization_random_forest_v2.joblib
    Trained Random Forest + metadata.

synthetic_personalization_dataset_v2.csv
    30,000 synthetic gameplay sessions.

predict_personalization.py
    Simple inference test using the trained model.

train_personalization_model.py
    Reproduces the training/evaluation process.

training_report_v2.txt
    Metrics and feature importance.

confusion_matrix_v2.png
feature_importance_v2.png

Feature order
-------------
accuracy
response_time
attempts
completion
hint_usage
recent_performance
difficulty
game_type
memory_score
attention_score
engagement_score
fatigue_proxy

Game type encoding
------------------
0 = Memory
1 = Attention
2 = Problem Solving
3 = Reaction

Recommendation classes
----------------------
0 = Increase difficulty
1 = Maintain difficulty
2 = Reduce difficulty
3 = Change game type
4 = Increase repetition

Important
---------
This is an initial model trained on synthetic gameplay telemetry and simulated
recommendation labels. It is not a clinical/diagnostic model and has not been
validated on real elderly users. Future anonymized app telemetry can be used
for retraining and real-world validation.

Environment
-----------
Use Python with scikit-learn 1.8.0.
Install:
    pip install -r requirements.txt

Test:
    python predict_personalization.py
