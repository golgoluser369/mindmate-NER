# Mind Mate — Adaptive Cognitive-Care & Memory Assistance Platform

**SIH26003: AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in North Eastern Region (NER)**

> *"The game is not the product. The adaptive cognitive journey connecting the person, their daily routines, and their caregiver is the product."*

### 🌐 Live Production Deployments
- **Vercel Production URL**: [https://ner-mocha.vercel.app/](https://ner-mocha.vercel.app/)
- **GitHub Pages Live App**: [https://jahwanthpulugujju-create.github.io/NER/](https://jahwanthpulugujju-create.github.io/NER/)
- **GitHub Codebase**: [https://github.com/jahwanthpulugujju-create/NER](https://github.com/jahwanthpulugujju-create/NER)

---

## Overview

**Mind Mate** is an offline-first, explainable, adaptive cognitive-support platform specifically designed for elderly individuals experiencing cognitive decline and their caregivers across the **8 Sister States of North East India** (Assam, Manipur, Meghalaya, Mizoram, Tripura, Nagaland, Sikkim, and Arunachal Pradesh).

Instead of generic mini-games with flashy graphics and black-box AI claims, Mind Mate implements a clinically grounded, calm, and dignifying loop:
$$\text{Observe} \longrightarrow \text{Assess} \longrightarrow \text{Adapt} \longrightarrow \text{Engage} \longrightarrow \text{Assist} \longrightarrow \text{Reassure}$$

---

## Key Pillars & Architecture

### 1. Dual-Layer Adaptive Intelligence: Clinical Rule Base + Random Forest ML
Mind Mate operates on a dual-engine architecture combining clinical interpretability with predictive machine learning:
1. **Clinical Deterministic Rule Base**:
   $$\text{Composite Score} = 0.40 \times \text{Accuracy} + 0.25 \times \text{Speed} + 0.15 \times \text{Consistency} + 0.10 \times \text{Completion} + 0.10 \times \text{Trend}$$
   - **Score > 0.80**: Increase difficulty level (Level $N \rightarrow N+1$).
   - **Score 0.55 – 0.80**: Maintain current level.
   - **Score < 0.55**: Reduce difficulty (Level $N \rightarrow N-1$) to eliminate frustration and support positive retention.
2. **Machine Learning Personalization Model (Random Forest V2)**:
   - **Trained on**: 30,000 synthetic gameplay sessions across 4 game categories.
   - **Model Accuracy**: 80.78% (Balanced Accuracy: 76.99%, Weighted F1: 0.8040).
   - **12 Live Telemetry Features**: `accuracy`, `response_time`, `attempts`, `completion`, `hint_usage`, `recent_performance`, `difficulty`, `game_type`, `memory_score`, `attention_score`, `engagement_score`, `fatigue_proxy`.
   - **5 Recommendation Classes**:
     - `0`: Increase difficulty
     - `1`: Maintain difficulty
     - `2`: Reduce difficulty
     - `3`: Change game type
     - `4`: Increase repetition
   - **Dual Execution Mode**: Operates in pure TypeScript directly in the browser (for zero-latency offline clinics and static hosting) and connects to a live Python Scikit-Learn REST API (`ML/serve_model.py` on `localhost:8000`) when running locally.

### 2. Digital India Bhashini Multilingual Integration
Mind Mate incorporates language standards and profiles from **Digital India Bhashini (National Language Translation Mission - NLTM)**:
- **Comprehensive Coverage**:
  - **Assam**: Assamese (`as`), Bodo (`brx`), Karbi (`mjw`), Mishing (`mif`)
  - **Manipur**: Manipuri / Meitei (`mni`)
  - **Tripura & Barak Valley**: Bengali (`bn`), Kokborok (`kok`)
  - **Sikkim**: Nepali (`ne`)
  - **Meghalaya**: Khasi (`kha`), Garo (`grt`)
  - **Mizoram**: Mizo (`lus`)
  - **Nagaland**: Nagamese (`nag`)
  - **Arunachal Pradesh**: Nyishi / Adi (`adi`)
  - **National & Universal**: Hindi (`hi`), English (`en`)
- **Elderly-Paced Speech Cadence**: Calibrated TTS pacing ($0.85\times - 0.90\times$ speed) to prevent cognitive overload.

### 3. Centralized 21-Activity Matrix
Every activity targets specific cognitive domains and adapts across difficulty levels:
- **Memory & Recall**: Memory Match, Who Am I?, Picture Pair, Sequence Recall, Story Recall, Object Memory, Family Quiz.
- **Attention & Executive Function**: Attention Challenge, Tap/Target, Planning (Appointment Routine), Rule Switch (Cognitive Flexibility).
- **Functional & Daily Routines**: Daily Routine Recall (Tea $\rightarrow$ Medicine $\rightarrow$ Courtyard Walk), Shopping Memory (Market Basket), Route Memory (Tezpur Neighborhood Navigation), Step Sequencing (Assam Tea Making).
- **Language & Visual-Spatial**: Picture Naming (Voice + Touch), Object Selection, Spatial Tasks (2D Relational Placement), Number Sequence.

### 4. Six Tailored Demonstration Pathways
1. **General Cognitive Support**: Balanced cognitive maintenance across all domains.
2. **Memory & Routine Support**: Dementia-focused pathway prioritizing routine recall, familiar face recognition, and gentle working memory.
3. **Vascular-Cognitive Support**: Vascular dementia focus on motor coordination, shopping navigation, and route recall.
4. **Memory-Focused Support**: Alzheimer's profile emphasizing autobiographical recall, picture pairs, and daily routine anchoring.
5. **Attention & Planning Support**: Mild Cognitive Impairment (MCI) focus on vigilance, planning tasks, number sequences, and rule switching.
6. **Post-Stroke Cognitive Support**: Post-stroke rehabilitation focusing on picture naming, functional object selection, and step sequencing.

### 5. Offline-First Continuity for the North Eastern Region
- Built for intermittent connectivity in remote hill districts and rural river valley communities.
- Complete client-side functionality with persistent local storage.
- Synchronous pending queue that safely holds sessions and reminders locally, syncing immediately when network connectivity is restored.

### 6. Connected Caregiver Portal & AI Telemetry Inspector
- Longitudinal tracking across sessions: Accuracy (%), Response Latency (seconds), Completion Rate (%), and Consistency (%).
- Clean interactive SVG trend chart with toggleable metrics.
- **AI Personalization Inspector**: Live telemetry vector inspection, fatigue proxy meters, and 5-class recommendation probabilities.
- Personal Memory Editor: configure family members, hometown landmarks, household objects, and daily routine steps.

---

## Strict Healthcare Safety & Ethical Non-Diagnostic Charter

Mind Mate strictly adheres to healthcare software best practices:
- **No diagnostic claims**: Mind Mate does not diagnose dementia, compute medical severity, or replace licensed geriatric assessment.
- **No punitive messaging**: Low scores provide supportive feedback (*"That's okay. Let's try the next activity."*) and gentle difficulty reductions.
- **Explainable adaptation**: Every adjustment is accompanied by an open audit trail, mathematical breakdown, and clinical disclaimer.

---

## Tech Stack

- **Core Framework**: React 19, TypeScript
- **Build Tool**: Vite 8
- **Machine Learning**: Scikit-Learn 1.8, Joblib, Pandas, Python REST Microservice (`ML/serve_model.py`)
- **Multilingual**: Digital India Bhashini (NLTM) standards & profiles
- **Design System**: Accessible Vanilla CSS tokens (Navy `#0A1C33`, Teal `#1D7A82`, Warm Patient Surface `#FAF9F6`)
- **Icons**: Lucide SVG System (`1.75` stroke weight, standardized scales)
- **Quality Assurance**: Automated end-to-end test suite (`verifySuite.ts`)

---

## Verification & Test Suite

Run the full system verification suite covering all 21 activities, 6 pathways, mathematical adaptation boundaries, ML feature vectors, Random Forest inference, Bhashini languages, and non-diagnostic safety:

```bash
npx.cmd --yes tsx src/tests/verifySuite.ts
```

Output:
```text
====================================================
      MIND MATE (SIH26003) SYSTEM VERIFICATION
====================================================
1. Centralized Activity Registry Verification:  21/21 PASSED
2. Demonstration Pathways & Activity Matrix:    6/6   PASSED
3. Adaptive Engine Mathematical Thresholds:     8/8   PASSED
4. Non-Diagnostic Healthcare Safety Audit:       6/6   PASSED
5. Multilingual Localization (8 States + Bhashini): 16/16 PASSED
6. Next-Best Activity Recommendation:            2/2   PASSED
7. Machine Learning Telemetry & Random Forest V2: 9/9  PASSED
8. Digital India Bhashini Platform Integration: 26/26 PASSED
====================================================
TOTAL: 160 Passed, 0 Failed (100% Pass Rate)
====================================================
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- *(Optional for live ML server)*: Python 3.10+ with `scikit-learn`, `joblib`, `pandas`

### Installation & Local Run
```bash
# 1. Clone repository
git clone https://github.com/jahwanthpulugujju-create/NER.git
cd NER

# 2. Install dependencies
npm install

# 3. Start local frontend development server
npm run dev

# 4. (Optional) Run the Python ML Inference server
python ML/serve_model.py
```

Open `http://localhost:5173/` in your browser.

---

## Presentation & Demonstration Controls

The demo evaluator bar at the top of the application includes:
- **ML Inspector**: Inspect real-time 12-feature telemetry vectors, fatigue proxies, and Random Forest probability distributions.
- **1-Click Test Scenarios**: Strong User (L2 $\rightarrow$ L3), Average User (Maintain L2), Struggling User (L3 $\rightarrow$ L2), Personal Routine, and Toggle Reminders.
- **Interactive Offline Simulator**: Toggle offline mode to test local persistence and background synchronization.
- **Demonstration Pathway Picker**: Instant switching between the 6 clinical support profiles.
- **Built-in 3-Minute Presentation Pitch Script**: Second-by-second speaking notes with timestamps and key talking points for hackathon evaluators.

---

## License & Attribution

Developed for **Smart India Hackathon (SIH26003)**. Dedicated to elderly individuals and caregivers across the North Eastern Region.
