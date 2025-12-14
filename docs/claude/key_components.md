# Key Components of the Adaptive Learning System

## 1. System Concept

An adaptive learning management system (LMS) that:
- Analyzes user actions and learning outcomes through tests and chatbot dialogs
- Collects results and identifies strengths/weaknesses
- Adapts content presentation based on individual user characteristics
- Maintains users in their "Zone of Proximal Development" (Vygotsky, 1934)

**Core Principle**: Automatically adjust content, difficulty, and presentation format to match individual learner needs.

## 2. System Goals

- Deliver the **right content at the right moment** (level, format, pace)
- Learn from dialogs: use 17 metrics to decide "what to show next"
- Create a flexible baseline system that individualizes learning
- Gradually develop different perception channels (visual, text, interactive, video)

## 3. Major System Blocks

### 3.1 Content Model
- Catalog of lessons/exercises with tags:
  - `topic`, `subtopic`
  - `difficulty_level` (easy/normal/hard/challenge)
  - `format` (text/visual/video/interactive)
  - `skills`
- Each exercise contains: reference answers, hints, explanations, examples

### 3.2 Dialog and Event Collection
- Database schema: `users`, `dialogs`, `messages`, `attachments`, `metrics`, `experiments`
- Logging of 17 metrics + technical events (hint opened, video viewed, etc.)

### 3.3 Metrics Pipeline (Computation)
- **Synchronous**: timestamps → times/attempts/accuracy
- **Asynchronous** (selective 10-20%): LLM metrics (awareness, depth, error pattern)
- Aggregates by topics/sessions (EMA, rolling averages)

### 3.4 User Profile
- Current indicators per topic/skill: `topic_mastery`, average pace, preferred format, common error patterns
- Stored as `user_profile` (JSONB or separate table)

### 3.5 Adaptation Engine (Core)
- Outputs decisions: `next_difficulty`, `next_format`, `next_tempo`, `remediation_focus`
- Works in 2-3 layers:
  - **Basic rules** (simple thresholds — fast, transparent)
  - **ML model** (contextual bandit) — for content variant selection
  - **IRT/BKT** (Item Response Theory / Bayesian Knowledge Tracing)

### 3.6 API / UI
- Endpoints: `POST /dialogs`, `POST /messages`, `POST /metrics`, `POST /recommend_next`
- Student interface + admin panel (content/analytics)

### 3.7 Evaluation and Monitoring
- **Online**: hint CTR, % correct answers, average time, retention
- **Offline**: AUC/F1 for classifiers, offline-replay for policies (bandit)

### 3.8 Security/Ethics/Consent
- Storage policies, anonymization, signed URLs for attachments, access audits

## 4. Types of Dialogs

### 4.1 Educational Dialogs
**Purpose**: User receives explanations of material, can ask follow-up questions
- Main learning activity
- Transfer new knowledge (theory, examples, explanations)

**Metrics**:
- Interaction time
- Number of clarifying questions
- Comprehensibility rating

### 4.2 Test Dialogs
**Purpose**: User answers questions or completes tests to verify knowledge
- Check material mastery
- Determine appropriate difficulty level

**Metrics**:
- Answer accuracy
- Number of attempts
- Response time
- Difficulty vs. result correlation

### 4.3 Assessment Dialogs
**Purpose**: Collect data about learning process quality and individual user characteristics
- Identify most effective learning format
- Determine convenience and clarity of explanations
- Adjust pace and difficulty

**Metrics**:
- Preferred learning format
- Typical error types
- User satisfaction
- Learning pace
- Difficulty level feedback

### 4.4 Reflective Dialogs
**Purpose**: User explains their actions ("why chose this answer")
- Develop critical thinking
- Identify deep logic errors

**Metrics**:
- Awareness score
- Explanation depth
- Confidence level
- Error patterns

## 5. The 17 Metrics

### Educational Metrics (3)
1. **Interaction time** — duration of entire session/dialog
2. **Followups count** — number of clarifying questions during explanation
3. **Satisfaction score** — comprehensibility/satisfaction rating (1-5) or sentiment analysis

### Test Metrics (4)
4. **Accuracy** — percentage of correct answers
5. **Attempts count** — number of retry attempts for same question
6. **Response time** — time between question and answer
7. **Difficulty-result correlation** — relationship between task difficulty level and accuracy

### Assessment Metrics (5)
8. **Preferred learning format** — user's chosen perception format (text/video/diagrams/interactive)
9. **Error type** — classification of answers: logical, computational, grammatical
10. **Satisfaction score** — learning quality rating (1-5) or sentiment analysis
11. **Learning pace** — average session duration and response time
12. **Difficulty feedback** — user's subjective difficulty level ("too easy", "optimal", "hard")

### Reflective Metrics (4)
13. **Awareness score** — how well user understands and can explain their choice (0-1, LLM-evaluated)
14. **Explanation depth** — structure and number of steps in explanation (0-1)
15. **Confidence level** — how confident user is in answer (slider 1-5 or marker analysis)
16. **Error pattern** — recurring mistakes (classifier/LLM compares with reference logic)

### General Metrics (1)
17. **Difficulty level** — static difficulty assigned by author (easy/normal/hard/challenge)

## 6. Adaptation Logic

### Lifecycle of Adaptation:
1. **Data collection (metrics)** → system captures user actions
2. **User state assessment** → computes current knowledge level, emotional state, pace, engagement
3. **Decision making (adaptation engine)** → compares metrics with thresholds or model
4. **Action application** → changes task, inserts hint, suggests visualization, updates learning path
5. **User profile update** → records new topic mastery level, preferences

### Adaptation Levels:

| Level | What Changes | System Behavior |
|-------|-------------|-----------------|
| **1. Content** | Task/topic selection | Provides easier/harder examples or moves to new topic |
| **2. Tempo** | Speed and volume | Reduces subtopics, adds checkpoints, or accelerates |
| **3. Format** | Material type | Shows diagrams, interactives, or text explanations |
| **4. Hints** | Hint frequency | Provides hints earlier or later |
| **5. Cognitive-emotional** | Support level, tone, motivation | Switches to simpler explanation style or encouragement |
| **6. Metacognitive** | Reflection tasks | Asks "explain why" or shows counterexample |

## 7. ML Approaches (Three Complexity Levels)

### Level A (MVP) — Rules + Scoring
- Simple if/else based on 17 metric thresholds
- Soft scoring for "gray zones":
  - `score = 0.6*accuracy - 0.3*norm(response_time) - 0.1*norm(followups)`
- Decision: ↑/↓ difficulty; format: `visual_short` if many clarifications or low comprehension

### Level B (ML without heavy science) — Contextual Bandits
- Acts as adaptive content variant recommender
- **Context (features)**: subset of 17 metrics from last N steps + topic profile + current level
- **Actions (arms)**: presentation format (text/visual/video/interactive) or "next exercise type"
- **Reward**: combination `r = 0.7*correct_next - 0.2*hint_used + 0.1*satisfaction_next`
- Learns online, computationally cheap, easy to implement

### Level C (Very scientific) — IRT/BKT + Policy Learning
- **IRT (Item Response Theory)**: calibrates task parameters (difficulty b, discrimination a), estimates latent ability θ
- **BKT (Bayesian Knowledge Tracing)**: probability of knowing specific skill with transitions learn/slip/guess
- **Policy** (logistic regression or light gradient boosting): decides next task/format
- Strong science for thesis, but more work

## 8. Analogous Systems (Examples)

### For Schools and Universities:
- **Khan Academy** — adaptive tests that adjust difficulty based on student success
- **DreamBox Learning** — adapts tasks based on 100+ interaction parameters
- **ALEKS** — creates individual learning trajectories in math, chemistry, business
- **Smart Sparrow** — university adaptive platform considering student thinking logic

### For Adults and Corporate Learning:
- **Coursera/Udemy/LinkedIn Learning** — personalized course recommendations, dynamic tests
- **Duolingo** — classic adaptive language learning, adjusts task level based on errors
- **Area9 Lyceum & Knewton** — specialized adaptive systems using "zone of proximal development" models

## 9. Technology Stack

- **Backend**: Python (FastAPI)
- **ML**: PyTorch (scikit-learn) — if training custom models; not needed if using LLM only
- **Frontend**: React
- **Database**: SQLite / PostgreSQL / MongoDB
- **LLM Integration**: Ollama, DeepSeek, or other AI services

## 10. Zone of Proximal Development (ZPD)

**Concept**: Level of development a person can achieve with help from a more experienced partner, but cannot yet perform independently (Vygotsky, 1934).

**Application to adaptive learning**:
- Tasks should remain achievable but challenging
- System maintains user in ZPD by adapting difficulty
- Prevents boredom (too easy) and frustration (too hard)
- Applicable to adult learning through mentorship, coaching, collaborative work

## 11. Key Design Decisions

1. **What system will adapt**: Theory, tests, examples, presentation format
2. **Content storage format**: Structured catalog with metadata (tags, difficulty, format)
3. **Dialog storage**: Complete conversation history with timestamps and metadata
4. **Metrics computation**: Mixed synchronous (fast) + asynchronous LLM-based (selective)
5. **User mapping**: Aggregated profile with topic mastery, preferences, error patterns
6. **LLM role**: Determines presentation format based on user metrics and context
7. **Content adaptation**: Efficient storage through tags and variant selection vs. full regeneration
