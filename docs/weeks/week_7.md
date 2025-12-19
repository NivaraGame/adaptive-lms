# Week 7: Contextual Bandit Implementation (Level B)

## Overview

Week 7 focuses on implementing a **Contextual Bandit algorithm** to enhance the adaptive learning system's recommendation strategy. The main goal is to move beyond the rules-based adaptation (Level A) to a machine learning approach that learns from user interactions to optimize content recommendations. This week implements the LinUCB (Linear Upper Confidence Bound) algorithm, which balances exploration and exploitation using user context features.

---

## General Specifications

### Architecture & Technology Stack

**ML Algorithm:**
- LinUCB (Linear Upper Confidence Bound) - contextual bandit
- Python implementation using NumPy for linear algebra
- Online learning - model updates after each interaction
- Confidence-based exploration (UCB strategy)

**Backend Integration:**
- New adaptation strategy alongside rules-based approach
- Integration with existing recommendation service
- Model persistence to filesystem or database
- Feature extraction from user profile metrics

**Context Features (17 metrics):**
From `@backend/app/schemas/user_profile.py`:
- `avg_accuracy` - Average correctness across interactions
- `total_time_spent` - Total learning time in minutes
- `total_interactions` - Total message/answer count
- `current_difficulty` - Current difficulty level (enum)
- `preferred_format` - Preferred content format (enum)
- `learning_pace` - Learning pace preference
- Topic mastery scores (aggregated/averaged)
- Response time averages
- Hint usage patterns
- Followup question counts
- Confidence levels (if available from LLM metrics)
- Session length patterns
- Error patterns

**Actions (Arms):**
Each arm represents a combination of:
- **Difficulty level**: easy, normal, hard, challenge (4 levels)
- **Content format**: text, visual, video, interactive (4 formats)
- **Total arms**: 16 combinations (4 × 4)

**Reward Function:**
Composite reward based on:
- **Accuracy**: Correct answer vs incorrect (primary signal)
- **Response time**: Faster responses (within reasonable bounds) = higher reward
- **Hint usage**: Fewer hints used = higher reward
- **Followups**: Fewer followup questions = better understanding
- **Engagement**: Session continuation vs dropout

Reward formula:
```
reward = w1 * accuracy + w2 * (1 - normalized_time) + w3 * (1 - normalized_hints) + w4 * engagement
```

Default weights: `w1=0.5, w2=0.2, w3=0.15, w4=0.15`

### Code Organization

**Directory Structure:**
```
backend/
├── app/
│   ├── core/
│   │   ├── adaptation/
│   │   │   ├── engine.py (existing - update to add bandit mode)
│   │   │   ├── rules.py (existing - Level A)
│   │   │   ├── bandit.py (new - LinUCB implementation)
│   │   │   └── rewards.py (new - reward computation)
│   │   └── ml/
│   │       ├── models/ (new directory)
│   │       │   └── linucb_model.pkl (persisted model)
│   │       └── features/ (new directory)
│   │           └── extractors.py (new - feature engineering)
│   ├── services/
│   │   └── recommendation_service.py (existing - update to use bandit)
│   ├── schemas/
│   │   └── recommendation.py (existing - may extend)
│   └── config.py (existing - add bandit config)
tests/
├── unit/
│   ├── test_linucb.py (new)
│   ├── test_rewards.py (new)
│   └── test_feature_extraction.py (new)
└── integration/
    └── test_bandit_recommendation.py (new)
```

**Naming Conventions:**
- Classes: PascalCase (e.g., `LinUCBBandit`, `FeatureExtractor`)
- Functions: snake_case (e.g., `extract_features`, `compute_reward`)
- Model files: descriptive with timestamp (e.g., `linucb_model_20250114.pkl`)
- Config keys: UPPER_SNAKE_CASE (e.g., `BANDIT_ALPHA`, `REWARD_WEIGHTS`)

### Algorithm Specifications

**LinUCB Algorithm:**

Reference: "A Contextual-Bandit Approach to Personalized News Article Recommendation" (Li et al., 2010)

**Core Formula:**
For each arm `a`, compute Upper Confidence Bound (UCB) score:
```
UCB(a) = θ_a^T * x + α * sqrt(x^T * A_a^-1 * x)
```

Where:
- `θ_a`: Learned weight vector for arm `a`
- `x`: Context vector (user features)
- `A_a`: Design matrix for arm `a` (d × d)
- `b_a`: Reward vector for arm `a` (d × 1)
- `α`: Exploration parameter (controls exploration vs exploitation)
- `d`: Dimension of context vector (17 features)

**Update Rule:**
After observing reward `r` for arm `a` with context `x`:
```
A_a ← A_a + x * x^T
b_a ← b_a + r * x
θ_a ← A_a^-1 * b_a
```

**Model Parameters:**
- `alpha`: Exploration coefficient (default: 0.5, range: 0.1-2.0)
  - Higher α = more exploration
  - Lower α = more exploitation
- `d`: Context dimension (fixed: 17)
- `n_arms`: Number of arms (fixed: 16)
- `A`: List of d×d matrices (one per arm), initialized to identity matrix
- `b`: List of d×1 vectors (one per arm), initialized to zeros

**Feature Normalization:**
All features normalized to [0, 1] range:
- Min-max scaling for continuous features
- One-hot encoding for categorical features (difficulty, format)
- Missing features filled with 0.5 (neutral value)

### Backend Integration Points

**Existing Services to Modify:**

1. **Recommendation Service** (`@backend/app/services/recommendation_service.py`):
   - Add `BanditAdapter` mode alongside `RulesAdapter`
   - Call feature extractor to build context vector
   - Call LinUCB to select arm (difficulty × format)
   - Query content matching selected arm
   - Return recommendation with reasoning

2. **Adaptation Engine** (`@backend/app/core/adaptation/engine.py`):
   - Add `strategy="bandit"` option
   - Initialize BanditAdapter if strategy is bandit
   - Route recommendation requests to bandit

3. **Metrics Computation** (`@backend/app/core/metrics/synchronous.py`):
   - After computing metrics, trigger bandit update
   - Compute reward from metrics
   - Update bandit model with (context, arm, reward)

**New Configuration** (`@backend/app/config.py`):
```python
BANDIT_ENABLED: bool = True
BANDIT_ALPHA: float = 0.5
BANDIT_MODEL_PATH: str = "app/core/ml/models/linucb_model.pkl"
BANDIT_REWARD_WEIGHTS: dict = {
    "accuracy": 0.5,
    "time": 0.2,
    "hints": 0.15,
    "engagement": 0.15
}
BANDIT_UPDATE_FREQUENCY: int = 1  # Update every N interactions
BANDIT_SAVE_FREQUENCY: int = 10  # Save model every N updates
```

### Error Handling

**Error Scenarios:**
1. **Model not found**: Initialize new model with identity matrices
2. **Feature extraction failure**: Fall back to rules-based adapter
3. **Numerical instability**: Regularize A matrix (add λ*I to diagonal)
4. **Invalid reward values**: Clamp reward to [0, 1] range
5. **Model load failure**: Initialize fresh model and log warning

**Fallback Strategy:**
If bandit fails at any point, fall back to rules-based adapter:
```python
try:
    recommendation = bandit_adapter.get_recommendation(context)
except Exception as e:
    logger.error(f"Bandit failed: {e}, falling back to rules")
    recommendation = rules_adapter.get_recommendation(user_profile)
```

**Logging:**
- Log every arm selection with context and UCB scores
- Log reward computation details
- Log model updates (A, b matrix changes)
- Log model save/load events
- Log fallback events

### Development Workflow

**Implementation Approach:**
1. Implement LinUCB algorithm in isolation (pure Python, testable)
2. Implement feature extraction and reward computation
3. Integrate with adaptation engine
4. Test with synthetic data (unit tests)
5. Test with real backend (integration tests)
6. Compare performance: bandit vs rules (offline evaluation)
7. Deploy with feature flag (gradual rollout)

**Testing Strategy:**
- **Unit tests**: Algorithm correctness, feature extraction, reward computation
- **Integration tests**: Full recommendation flow with bandit
- **Offline evaluation**: Replay historical user interactions, measure reward
- **A/B test preparation**: Setup for comparing bandit vs rules (Week 8+)

**Development Server Setup:**
```bash
# Terminal 1: Backend with bandit enabled
cd backend
export BANDIT_ENABLED=true
export BANDIT_ALPHA=0.5
uvicorn app.main:app --reload

# Terminal 2: Test bandit in isolation
cd backend
python -m app.core.adaptation.bandit  # If __main__ block added for testing
```

### Code Quality Standards

**ML Code Best Practices:**
- **Vectorization**: Use NumPy for matrix operations (avoid Python loops)
- **Numerical stability**: Regularize inverse operations, use pseudoinverse if needed
- **Reproducibility**: Set random seeds for exploration randomness
- **Model versioning**: Include timestamp or version in model filename
- **Immutability**: Don't mutate model state unexpectedly (clear update points)

**Algorithm Correctness:**
- Verify LinUCB implementation against reference paper
- Unit test matrix operations (A update, θ computation)
- Test exploration behavior (high α = diverse selections)
- Test exploitation behavior (low α = greedy selections)
- Verify reward computation matches intended formula

### Important Resources

**Backend References:**
- Adaptation engine: `@backend/app/core/adaptation/engine.py`
- Rules adapter: `@backend/app/core/adaptation/rules.py`
- Recommendation service: `@backend/app/services/recommendation_service.py`
- User profile schema: `@backend/app/schemas/user_profile.py`
- Metrics computation: `@backend/app/core/metrics/synchronous.py`
- Config: `@backend/app/config.py`

**External Libraries:**
- NumPy: Matrix operations (already in `requirements.txt`)
- Pickle: Model persistence (Python built-in)
- Optional: scikit-learn (for MinMaxScaler, feature normalization)

**Academic References:**
- LinUCB paper: "A Contextual-Bandit Approach to Personalized News Article Recommendation" (Li et al., 2010)
- **EXISTING** ML Pipeline doc: @docs/claude/ml_pipeline.md (lines 235-417 мають повну імплементацію LinUCB + BanditAdapter)

---

## Part A: Basic Minimum

These tasks are **essential** for Week 7 to be considered complete. They implement the core contextual bandit algorithm and integrate it into the recommendation pipeline.

### ВАЖЛИВО: Що вже існує в проекті

**ВЖЕ РЕАЛІЗОВАНО:**
1. **AdaptationEngine** (@backend/app/core/adaptation/engine.py):
   - Має enum AdaptationStrategy з BANDIT placeholder (line 28-38)
   - Має _initialize_strategies() з коментарем для BanditAdapter (line 117)
   - Має get_recommendation() що робить routing через adapter (line 223-230)
   - Використовується в RecommendationService (line 111-114)

2. **Config** (@backend/app/config.py):
   - Має BANDIT_ALPHA = 1.5 (line 36)
   - Має BANDIT_MODEL_PATH = "models/linucb_bandit.npz" (line 37)
   - Має ADAPTATION_MODE = "bandit" (line 35)

3. **UserProfile model** (@backend/app/models/user_profile.py):
   - Всі поля для features: topic_mastery, avg_accuracy, avg_response_time, total_time_spent, total_interactions, current_difficulty, preferred_format, learning_pace

4. **Metric model** (@backend/app/models/metric.py):
   - Поля для rewards: metric_name, metric_value_f, context

5. **RulesAdapter interface** (@backend/app/core/adaptation/rules.py):
   - get_recommendation(user_profile, recent_metrics, session_context) -> AdaptationRecommendation
   - Return types: AdaptationRecommendation, DifficultyDecision, FormatDecision

**ПОТРІБНО СТВОРИТИ:**
1. `app/core/adaptation/bandit.py` - новий файл
2. `app/core/adaptation/rewards.py` - новий файл
3. `app/core/ml/features/extractors.py` - новий файл (створити директорію)
4. Оновити `engine.py` line 117 щоб ініціалізувати BanditAdapter
5. Додати нові config поля в Settings class

---

## 1. Implement LinUCB Algorithm

### Module: `app/core/adaptation/bandit.py`

**References:**
- LinUCB algorithm paper (Li et al., 2010)
- **EXISTING** Adaptation engine: @backend/app/core/adaptation/engine.py (lines 28-38 має placeholder для BANDIT)
- **EXISTING** Config: @backend/app/config.py (вже є BANDIT_ALPHA=1.5, BANDIT_MODEL_PATH)

**Dependencies:**
- NumPy (already in requirements.txt)
- Python pickle (built-in)
- **EXISTING** @backend/app/config.py (settings.BANDIT_ALPHA, settings.BANDIT_MODEL_PATH)

- [ ] Create `app/core/adaptation/bandit.py` file (новий файл в існуючій директорії)

### Class: `LinUCBBandit`

**Reference implementation:** @docs/claude/ml_pipeline.md lines 251-323 має повний код

- [ ] Define `LinUCBBandit` class (копіювати з ml_pipeline.md lines 251-323)
  - [ ] `__init__(self, n_features: int, n_arms: int, alpha: float = 1.5)`
    - Використати settings.BANDIT_ALPHA замість hardcoded 1.5
  - [ ] Initialize model parameters
    - [ ] `self.A = [np.identity(n_features) for _ in range(n_arms)]`
    - [ ] `self.b = [np.zeros(n_features) for _ in range(n_arms)]`

- [ ] Implement `select_arm(self, context: np.ndarray) -> int`
  - **Code:** ml_pipeline.md lines 273-296
  - [ ] Копіювати логіку UCB computation

- [ ] Implement `update(self, arm_id: int, context: np.ndarray, reward: float)`
  - **Code:** ml_pipeline.md lines 298-311
  - [ ] `self.A[arm_id] += context @ context.T`
  - [ ] `self.b[arm_id] += reward * context.flatten()`

- [ ] Implement `save(self, path: str)` та `load(self, path: str)`
  - **Code:** ml_pipeline.md lines 313-322
  - [ ] Використати `np.savez` та `np.load`
  - [ ] Path з settings.BANDIT_MODEL_PATH

---

## 2. Implement Feature Extraction

### Module: `app/core/ml/features/extractors.py`

**References:**
- **EXISTING** UserProfile model: @backend/app/models/user_profile.py (має всі поля: topic_mastery, avg_accuracy, avg_response_time, total_time_spent, total_interactions, current_difficulty, preferred_format, learning_pace)
- **EXISTING** Metric model: @backend/app/models/metric.py (має metric_name, metric_value_f, context)

**Dependencies:**
- **EXISTING** @backend/app/models/user_profile.py (UserProfile ORM model)
- NumPy (already installed)
- Optional: scikit-learn (MinMaxScaler)

- [ ] Create directory: `mkdir -p app/core/ml/features`
- [ ] Create `app/core/ml/features/extractors.py` file

### Class: `FeatureExtractor`

- [ ] Define `FeatureExtractor` class

- [ ] Implement `extract_context(self, user_profile: UserProfile) -> np.ndarray`
  - [ ] Extract 17 features from user_profile:
    1. [ ] `avg_accuracy` (float, 0-1)
    2. [ ] `total_time_spent` (normalize to 0-1, max=1000 minutes)
    3. [ ] `total_interactions` (normalize to 0-1, max=1000)
    4. [ ] `current_difficulty` (one-hot: 4 values → 1 feature, normalized)
    5. [ ] `preferred_format` (one-hot: 4 values → 1 feature, normalized)
    6. [ ] `learning_pace` (categorical → numeric: slow=0.33, normal=0.66, fast=1.0)
    7. [ ] `avg_response_time` (normalize to 0-1, max=300 seconds)
    8. [ ] `hints_per_interaction` (avg_hints_used / total_interactions, clamp 0-1)
    9. [ ] `followups_per_interaction` (avg_followups / total_interactions, clamp 0-1)
    10. [ ] `session_length_avg` (normalize to 0-1, max=60 minutes)
    11. [ ] `topic_mastery_mean` (average of all topic_mastery values)
    12. [ ] `topic_mastery_std` (std dev of topic_mastery, normalized)
    13. [ ] `topic_mastery_min` (minimum topic mastery)
    14. [ ] `topic_mastery_max` (maximum topic mastery)
    15. [ ] `confidence_avg` (if available from LLM metrics, else 0.5)
    16. [ ] `error_rate` (1 - avg_accuracy)
    17. [ ] `engagement_score` (derived: sessions_completed / sessions_started, default 1.0)
  - [ ] Handle missing values: fill with 0.5 (neutral)
  - [ ] Return NumPy array of shape (17,)
  - [ ] Log: extracted features for debugging

- [ ] Implement normalization helpers
  - [ ] `normalize_min_max(value: float, max_val: float) -> float`
    - Clamp value to [0, max_val], then scale to [0, 1]
  - [ ] `encode_categorical(value: str, categories: list) -> float`
    - Map category to normalized value
  - [ ] `safe_divide(numerator: float, denominator: float, default: float) -> float`
    - Avoid division by zero

- [ ] Add validation
  - [ ] Verify output shape is (17,)
  - [ ] Verify all values in [0, 1]
  - [ ] Log warning if any feature is missing or out of range

---

## 3. Implement Reward Computation

### Module: `app/core/adaptation/rewards.py`

**References:**
- Metrics schemas: @backend/app/schemas/metric.py
- Config: @backend/app/config.py (BANDIT_REWARD_WEIGHTS)

**Dependencies:**
- @backend/app/models/metric.py (Metric model)
- @backend/app/config.py (reward weights config)

- [ ] Create `app/core/adaptation/rewards.py` file

### Function: `compute_reward`

**Reference:** ml_pipeline.md lines 352-375 має формулу reward

- [ ] Implement `compute_reward(metric: Metric, weights: dict) -> float`
  - **Formula:** ml_pipeline.md line 368-372
  - [ ] Extract з Metric model (metric_value_f для accuracy, response_time)
  - [ ] Hints з metric.context["hints_used"] якщо є
  - [ ] Weighted sum: `0.7*correct - 0.2*hint_penalty + 0.1*satisfaction`
  - [ ] Clamp to [0, 1]

- [ ] Використати weights з settings.BANDIT_REWARD_WEIGHTS (task 7)

---

## 4. Create Bandit Adapter

### Module: `app/core/adaptation/bandit.py` (update)

**References:**
- **EXISTING** Adaptation engine: @backend/app/core/adaptation/engine.py (має _initialize_strategies на line 106-123 з placeholder для BanditAdapter)
- **EXISTING** Rules adapter interface: @backend/app/core/adaptation/rules.py (RulesAdapter.get_recommendation приймає user_profile, recent_metrics, session_context)
- **EXISTING** Return types: AdaptationRecommendation, DifficultyDecision, FormatDecision (в rules.py)

**Dependencies:**
- LinUCBBandit class (Task 1)
- FeatureExtractor class (Task 2)
- compute_reward function (Task 3)
- **EXISTING** @backend/app/config.py (settings object)

- [ ] Add `BanditAdapter` class до існуючого `app/core/adaptation/bandit.py`

### Class: `BanditAdapter`

**Reference:** ml_pipeline.md lines 380-417 має BanditAdapter implementation

- [ ] Define `BanditAdapter` class
  - **Interface:** повинен мати `get_recommendation(user_profile, recent_metrics, session_context)` як RulesAdapter
  - **Return type:** AdaptationRecommendation з DifficultyDecision, FormatDecision (з rules.py)

- [ ] `__init__(self, db: Session, config: AdaptationConfig)`
  - [ ] Load або create LinUCBBandit з settings.BANDIT_MODEL_PATH
  - [ ] Initialize FeatureExtractor
  - [ ] Store db, config

- [ ] Implement `get_recommendation(user_profile, recent_metrics, session_context) -> AdaptationRecommendation`
  - [ ] Extract context з FeatureExtractor
  - [ ] Select arm з LinUCBBandit.select_arm()
  - [ ] Decode arm (ml_pipeline.md lines 325-350 має ARMS definition)
  - [ ] **ВАЖЛИВО:** Return AdaptationRecommendation з DifficultyDecision та FormatDecision (як RulesAdapter)
  - [ ] Store arm+context в metadata для пізнішого update

- [ ] Implement `update_from_feedback(arm, context, reward)`
  - [ ] Call bandit.update()
  - [ ] Periodically save model

### Helper Functions

- [ ] Implement `decode_arm(arm: int) -> (str, str)`
  - [ ] Map arm index to (difficulty, format) tuple
  - [ ] Example: arm 0 → ("easy", "text"), arm 5 → ("normal", "visual")

- [ ] Implement `encode_arm(difficulty: str, format: str) -> int`
  - [ ] Reverse mapping: (difficulty, format) → arm index
  - [ ] Used in testing or manual override

---

## 5. Integrate Bandit with Recommendation Service

### Module: `app/services/recommendation_service.py` (update)

**References:**
- **EXISTING** RecommendationService: @backend/app/services/recommendation_service.py (має get_next_recommendation на line 64-104)
- **EXISTING** Adaptation engine використання: line 111-114 викликає `self.adaptation_engine.get_recommendation()`
- **EXISTING** AdaptationEngine: @backend/app/core/adaptation/engine.py (вже має self.current_strategy)

**Dependencies:**
- BanditAdapter (Task 4)
- **EXISTING** AdaptationEngine (вже ініціалізований в RecommendationService.__init__ на line 61)

**ВАЖЛИВО: НЕ потрібно міняти RecommendationService! Він вже використовує AdaptationEngine.**

- [ ] Тільки оновити AdaptationEngine._initialize_strategies (task 8) щоб додати BanditAdapter

- [ ] Опціонально: зберігати (arm, context) в recommendation_metadata для пізнішого update
  - [ ] Додати поля до metadata dict на line 148-155 в recommendation_service.py

---

## 6. Ensure Profile Aggregation Works

### Module: `app/core/metrics/workflow.py` (verify)

**References:**
- **EXISTING** Workflow: @backend/app/core/metrics/workflow.py (має process_message_metrics)
- **EXISTING** Aggregators: @backend/app/core/metrics/aggregators.py (має aggregate_metrics, update_topic_mastery)

**ВАЖЛИВО:** Перевірити що метрики агрегуються в profile!

- [ ] Verify workflow викликається після message creation
  - [ ] Check @backend/app/api/routes/messages.py або dialogs.py
  - [ ] Має бути виклик `process_message_metrics(message_id, db)`

- [ ] Verify aggregators.aggregate_metrics() оновлює:
  - [ ] `avg_accuracy` в UserProfile
  - [ ] `avg_response_time` в UserProfile
  - [ ] `total_interactions` в UserProfile
  - [ ] `total_time_spent` в UserProfile
  - [ ] `topic_mastery` через update_topic_mastery()

- [ ] Якщо aggregation НЕ працює:
  - [ ] Додати виклик aggregate_metrics() в workflow.py після store_metrics()
  - [ ] Або додати trigger в messages route

---

## 7. Integrate Bandit Update with Metrics

### Module: `app/core/metrics/workflow.py` (update)

**References:**
- **EXISTING** Workflow: @backend/app/core/metrics/workflow.py (process_message_metrics на line 36)
- **EXISTING** Message routes: @backend/app/api/routes/messages.py

**Dependencies:**
- BanditAdapter (Task 4)
- compute_reward (Task 3)
- **EXISTING** Metric model (@backend/app/models/metric.py)

- [ ] Update `process_message_metrics()` в workflow.py
  - [ ] Після aggregate_metrics()
  - [ ] Check if recommendation_metadata містить bandit info
  - [ ] Якщо так:
    - [ ] Extract arm, context з metadata
    - [ ] Compute reward з metrics
    - [ ] Call BanditAdapter.update_from_feedback()

- [ ] Store bandit metadata в recommendation
  - [ ] В RecommendationService додати arm+context до metadata (task 5)

---

## 7. Configuration and Model Persistence

### Module: `app/config.py` (update)

**References:**
- **EXISTING** Config: @backend/app/config.py (вже має Settings class з BANDIT_ALPHA=1.5, BANDIT_MODEL_PATH на lines 36-37)

**ВЖЕ Є:**
- `BANDIT_ALPHA: float = 1.5` (line 36)
- `BANDIT_MODEL_PATH: str = "models/linucb_bandit.npz"` (line 37)

- [ ] Додати додаткові поля до Settings class:
  - [ ] `BANDIT_REWARD_WEIGHTS: str = '{"accuracy": 0.5, "time": 0.2, "hints": 0.15, "engagement": 0.15}'`
  - [ ] `BANDIT_UPDATE_FREQUENCY: int = 1`
  - [ ] `BANDIT_SAVE_FREQUENCY: int = 10`
  - [ ] `BANDIT_N_ARMS: int = 16`
  - [ ] `BANDIT_FEATURE_DIM: int = 17`

- [ ] Create model directory
  - [ ] `mkdir -p backend/models` (бо path вже `models/linucb_bandit.npz`)
  - [ ] Add `.gitignore` entry: `models/*.npz`

- [ ] Додати property для parsing BANDIT_REWARD_WEIGHTS (подібно до allowed_origins_list на line 48-56)

---

## 8. Adaptation Engine Integration

### Module: `app/core/adaptation/engine.py` (update)

**References:**
- **EXISTING** Adaptation engine: @backend/app/core/adaptation/engine.py

**ВЖЕ Є в engine.py:**
- AdaptationStrategy enum (line 28-38) з RULES, BANDIT, POLICY
- _initialize_strategies() method (line 106-123) з placeholder коментарем для BanditAdapter (line 117)
- _strategy_registry dict (line 99)
- get_recommendation вже робить routing через adapter (line 223-230)

**Dependencies:**
- BanditAdapter (Task 4)
- **EXISTING** settings.ADAPTATION_MODE в config.py (line 35)

- [ ] Оновити `_initialize_strategies()` method (line 106-123)
  - [ ] Розкоментувати/додати line 117: `from app.core.adaptation.bandit import BanditAdapter`
  - [ ] Додати після line 114:
    ```python
    if settings.ADAPTATION_MODE == "bandit":
        self._strategy_registry[AdaptationStrategy.BANDIT] = BanditAdapter(self.db, self.config)
    ```

- [ ] Опціонально: перевірити default_strategy в __init__ (line 84)
  - [ ] Якщо settings.ADAPTATION_MODE == "bandit", використати AdaptationStrategy.BANDIT

---

## 9. Basic Testing

### Module: `tests/unit/test_linucb.py`

**Dependencies:**
- LinUCBBandit (Task 1)
- NumPy
- pytest (already in dev dependencies)

- [ ] Create `tests/unit/test_linucb.py`

- [ ] Test LinUCBBandit initialization
  - [ ] Verify A matrices are identity
  - [ ] Verify b vectors are zeros
  - [ ] Verify n_arms, d, alpha stored correctly

- [ ] Test arm selection
  - [ ] Create synthetic context vector
  - [ ] Call select_arm(context)
  - [ ] Verify arm index in valid range (0 to n_arms-1)
  - [ ] Test exploration: high alpha should yield diverse arm selections
  - [ ] Test exploitation: low alpha + many updates should converge to best arm

- [ ] Test model update
  - [ ] Select arm, get reward
  - [ ] Call update(arm, context, reward)
  - [ ] Verify A and b matrices updated correctly
  - [ ] Verify theta recomputed

- [ ] Test save/load model
  - [ ] Train bandit with some data
  - [ ] Save model to temp file
  - [ ] Load model from temp file
  - [ ] Verify loaded model has same A, b, theta

- [ ] Run tests
  - [ ] `pytest tests/unit/test_linucb.py -v`

---

## 10. Integration Testing

### Module: `tests/integration/test_bandit_recommendation.py`

**Dependencies:**
- BanditAdapter (Task 4)
- Recommendation service (Task 5)
- Test database with user profile

- [ ] Create `tests/integration/test_bandit_recommendation.py`

- [ ] Test full recommendation flow
  - [ ] Create test user with profile
  - [ ] Seed profile with metrics (avg_accuracy, topic_mastery, etc.)
  - [ ] Call recommendation service with strategy="bandit"
  - [ ] Verify recommendation returned (difficulty, format)
  - [ ] Verify recommendation matches selected arm

- [ ] Test bandit update flow
  - [ ] Get recommendation (arm selected)
  - [ ] Simulate user interaction (create metric)
  - [ ] Trigger bandit update
  - [ ] Verify model updated (A, b changed)

- [ ] Test fallback to rules
  - [ ] Disable bandit or cause error
  - [ ] Call recommendation service
  - [ ] Verify rules adapter used as fallback

- [ ] Run integration tests
  - [ ] `pytest tests/integration/test_bandit_recommendation.py -v`

---

## Part B: Documentation and Tests

These tasks ensure the bandit implementation is well-documented, tested, and maintainable.

---

## 1. Code Documentation

### Module: All bandit modules

- [ ] Add docstrings to `LinUCBBandit` class
  - [ ] Class docstring explaining LinUCB algorithm
  - [ ] Reference to paper (Li et al., 2010)
  - [ ] Explain parameters: n_arms, d, alpha
  - [ ] Example usage in docstring

- [ ] Add docstrings to all methods
  - [ ] `select_arm`: Explain UCB computation, return value
  - [ ] `update`: Explain update rule, parameters
  - [ ] `save_model` / `load_model`: File format, versioning

- [ ] Add docstrings to `FeatureExtractor`
  - [ ] Explain 17 features and their sources
  - [ ] Normalization strategy
  - [ ] Handling of missing values

- [ ] Add docstrings to `compute_reward`
  - [ ] Explain reward formula
  - [ ] Component weights
  - [ ] Return value range

- [ ] Add docstrings to `BanditAdapter`
  - [ ] Explain integration with recommendation service
  - [ ] Arm encoding/decoding
  - [ ] Update mechanism

- [ ] Add inline comments for complex logic
  - [ ] Matrix inversion and regularization
  - [ ] UCB score computation
  - [ ] Feature normalization edge cases

---

## 2. Technical Documentation

### File: `docs/ml/contextual_bandit.md`

- [ ] Create `docs/ml/contextual_bandit.md`

- [ ] Document bandit architecture
  - [ ] Overview of LinUCB algorithm
  - [ ] Integration with recommendation service
  - [ ] Data flow diagram (context → bandit → arm → content)

- [ ] Document context features
  - [ ] List all 17 features with descriptions
  - [ ] Feature extraction logic
  - [ ] Normalization approach

- [ ] Document arms and actions
  - [ ] 16 arms (4 difficulties × 4 formats)
  - [ ] Arm encoding/decoding mapping
  - [ ] Example arm selections

- [ ] Document reward function
  - [ ] Formula and components
  - [ ] Weights rationale
  - [ ] Example reward calculations

- [ ] Document model persistence
  - [ ] File format (pickle)
  - [ ] Model versioning strategy
  - [ ] Backup and recovery

- [ ] Document configuration
  - [ ] Config parameters (alpha, weights, paths)
  - [ ] Recommended values and tuning guidance

- [ ] Document comparison to rules-based approach
  - [ ] How bandit differs from Level A rules
  - [ ] Expected benefits (learning, personalization)
  - [ ] When to use each strategy

---

## 3. Unit Tests

### Module: `tests/unit/test_rewards.py`

- [ ] Create `tests/unit/test_rewards.py`

- [ ] Test reward computation
  - [ ] Test with perfect metric (accuracy=1, fast time, no hints)
    - Verify reward close to 1.0
  - [ ] Test with poor metric (accuracy=0, slow time, many hints)
    - Verify reward close to 0.0
  - [ ] Test with mixed metric
    - Verify weighted sum correct
  - [ ] Test reward clamping (out of range values)
  - [ ] Test with missing metric fields
    - Verify graceful defaults

- [ ] Test normalization helpers
  - [ ] `normalize_time`: Test various response times
  - [ ] `normalize_hints`: Test hint counts

- [ ] Run tests
  - [ ] `pytest tests/unit/test_rewards.py -v`

### Module: `tests/unit/test_feature_extraction.py`

- [ ] Create `tests/unit/test_feature_extraction.py`

- [ ] Test feature extraction
  - [ ] Create mock UserProfile with all fields populated
  - [ ] Call FeatureExtractor.extract_context(profile)
  - [ ] Verify output shape (17,)
  - [ ] Verify all values in [0, 1]
  - [ ] Verify specific features (e.g., avg_accuracy matches)

- [ ] Test missing fields
  - [ ] Create UserProfile with some fields missing/null
  - [ ] Extract features
  - [ ] Verify missing fields filled with 0.5

- [ ] Test edge cases
  - [ ] Empty topic_mastery (new user)
  - [ ] Extreme values (very high time_spent)
  - [ ] Invalid categorical values

- [ ] Run tests
  - [ ] `pytest tests/unit/test_feature_extraction.py -v`

---

## 4. Algorithm Validation

### Module: `tests/validation/test_linucb_correctness.py`

- [ ] Create `tests/validation/test_linucb_correctness.py`

- [ ] Test against known bandit scenario
  - [ ] Implement simple 2-arm bandit problem with known optimal arm
  - [ ] Run LinUCB for 1000 iterations
  - [ ] Verify bandit converges to optimal arm (exploitation)
  - [ ] Verify exploration happens (all arms tried)

- [ ] Test regret (cumulative suboptimal reward)
  - [ ] Compare cumulative reward to optimal (always pick best arm)
  - [ ] Verify regret grows sublinearly (LinUCB property)

- [ ] Test UCB score computation
  - [ ] Manually compute UCB for simple case
  - [ ] Compare to LinUCB.select_arm output
  - [ ] Verify match

- [ ] Run validation tests
  - [ ] `pytest tests/validation/test_linucb_correctness.py -v`

---

## 5. Backend API Documentation

### File: API docs update

- [ ] Update Swagger/OpenAPI documentation
  - [ ] If new endpoints added for bandit (e.g., `/api/v1/bandit/status`), document them
  - [ ] Document recommendation request with `strategy=bandit` parameter
  - [ ] Document recommendation response including bandit-specific fields (arm, UCB scores)

- [ ] Update recommendation schema
  - [ ] In `@backend/app/schemas/recommendation.py`, add optional fields:
    - `arm: Optional[int]` - Selected arm index
    - `ucb_scores: Optional[List[float]]` - UCB scores for all arms (debugging)
    - `context: Optional[List[float]]` - Context vector used

- [ ] Document configuration endpoints (admin only)
  - [ ] `GET /api/v1/admin/bandit/config` - Get current bandit config
  - [ ] `PATCH /api/v1/admin/bandit/config` - Update alpha or weights
  - [ ] `POST /api/v1/admin/bandit/reset` - Reset model (clear A, b)

---

## Part C: Extended Features and Future Work

These tasks are **optional** enhancements and future-oriented improvements beyond the basic bandit implementation.

---

## 1. Offline Evaluation

### Module: `scripts/evaluate_bandit_offline.py`

**Purpose:** Replay historical user interactions to evaluate bandit performance without affecting live users.

- [ ] Create `scripts/evaluate_bandit_offline.py`

- [ ] Implement offline evaluation
  - [ ] Query all historical dialogs and metrics from database
  - [ ] For each interaction:
    - [ ] Extract user profile (state before interaction)
    - [ ] Extract context vector
    - [ ] Extract actual arm used (difficulty, format of content shown)
    - [ ] Extract actual reward (metric outcome)
  - [ ] Replay with bandit:
    - [ ] Initialize fresh LinUCB model
    - [ ] For each interaction:
      - [ ] Predict arm using bandit.select_arm(context)
      - [ ] Compare predicted arm to actual arm
      - [ ] If match: use actual reward, else: assume average reward (counterfactual)
      - [ ] Update bandit with (context, predicted_arm, reward)
  - [ ] Compute cumulative reward over all interactions
  - [ ] Compare to:
    - [ ] Actual cumulative reward (historical)
    - [ ] Random policy (random arm selection)
    - [ ] Rules-based policy

- [ ] Output evaluation metrics
  - [ ] Total reward (bandit vs baseline)
  - [ ] Average reward per interaction
  - [ ] Arm selection distribution
  - [ ] Convergence plot (reward over time)

- [ ] Run offline evaluation
  - [ ] `python scripts/evaluate_bandit_offline.py`
  - [ ] Save results to `results/bandit_offline_eval.json`

---

## 2. Alternative Bandit Algorithms

### Module: `app/core/adaptation/thompson_sampling.py`

**Purpose:** Implement Thompson Sampling as alternative to LinUCB for comparison.

- [ ] Implement Thompson Sampling bandit
  - [ ] Create `ThompsonSamplingBandit` class
  - [ ] Use Beta distributions for each arm (Bayesian approach)
  - [ ] Implement `select_arm`: Sample from each arm's Beta distribution, pick max
  - [ ] Implement `update`: Update Beta parameters (α, β) based on reward

- [ ] Integrate with BanditAdapter
  - [ ] Add config option: `BANDIT_ALGORITHM: str = "linucb" | "thompson"`
  - [ ] Initialize appropriate algorithm in BanditAdapter

- [ ] Compare LinUCB vs Thompson Sampling
  - [ ] Run offline evaluation with both
  - [ ] Compare cumulative reward, convergence speed

---

## 3. Advanced Reward Shaping

### Module: `app/core/adaptation/rewards.py` (extend)

**Purpose:** Experiment with alternative reward functions to improve learning signal.

- [ ] Implement time-decayed rewards
  - [ ] Reduce reward for old interactions (e.g., reward *= 0.9^days_ago)
  - [ ] Prioritize recent performance over historical

- [ ] Implement confidence-weighted rewards
  - [ ] If LLM provides confidence scores, weight reward by confidence
  - [ ] High confidence correct answer = higher reward
  - [ ] Low confidence correct answer = moderate reward

- [ ] Implement multi-step rewards
  - [ ] Consider not just immediate accuracy, but next N interactions
  - [ ] Reward arm selection that leads to long-term improvement

- [ ] A/B test reward functions
  - [ ] Run offline evaluation with different reward formulas
  - [ ] Identify best-performing reward function

---

## 4. Feature Engineering Enhancements

### Module: `app/core/ml/features/extractors.py` (extend)

**Purpose:** Add more sophisticated features to improve bandit performance.

- [ ] Add interaction-based features
  - [ ] Time since last interaction
  - [ ] Session count in last 7 days
  - [ ] Accuracy trend (improving vs declining)

- [ ] Add content-based features
  - [ ] Last N content types seen (sequence encoding)
  - [ ] Topic diversity (number of unique topics)

- [ ] Add temporal features
  - [ ] Time of day (morning, afternoon, evening)
  - [ ] Day of week (weekday vs weekend)

- [ ] Implement feature scaling
  - [ ] Use scikit-learn MinMaxScaler
  - [ ] Fit scaler on historical data, save scaler with model
  - [ ] Transform features using saved scaler

- [ ] Test new features
  - [ ] Extract features for test users
  - [ ] Run offline evaluation with extended feature set
  - [ ] Compare performance to baseline 17 features

---

## 5. Model Persistence Enhancements

### Module: `app/core/adaptation/bandit.py` (extend)

**Purpose:** Improve model persistence and versioning for production use.

- [ ] Implement model versioning
  - [ ] Save model with timestamp: `linucb_model_20250114_153045.pkl`
  - [ ] Keep last 10 versions in `models/archive/`
  - [ ] Load latest version on startup

- [ ] Add model metadata
  - [ ] Save metadata alongside model: `linucb_model_20250114_153045_meta.json`
  - [ ] Include: alpha, n_arms, d, update_count, created_at, accuracy metrics

- [ ] Implement database persistence (optional)
  - [ ] Store A, b matrices in PostgreSQL JSONB column
  - [ ] Store model metadata in `bandit_models` table
  - [ ] Enable quick rollback to previous version

- [ ] Implement model backup
  - [ ] Periodic backup to S3 or cloud storage
  - [ ] Automated backup on model save

---

## 6. Visualization of Bandit Decisions

### Module: `scripts/visualize_bandit.py`

**Purpose:** Create visualizations to understand bandit behavior and learning dynamics.

- [ ] Create visualization script
  - [ ] `scripts/visualize_bandit.py`

- [ ] Visualize arm selection over time
  - [ ] Line chart: arm selection count vs time
  - [ ] Show exploration (diverse arms) vs exploitation (concentrated arms)

- [ ] Visualize UCB scores
  - [ ] Heatmap: UCB score for each arm over time
  - [ ] Show how confidence bounds narrow with more data

- [ ] Visualize reward distribution
  - [ ] Box plot: reward distribution per arm
  - [ ] Identify best-performing arms

- [ ] Visualize theta weights
  - [ ] Bar chart: theta vector for each arm
  - [ ] Identify which features drive arm selection

- [ ] Export visualizations
  - [ ] Save as PNG to `results/bandit_visualizations/`
  - [ ] Optionally display in Jupyter notebook

- [ ] Run visualization
  - [ ] `python scripts/visualize_bandit.py`

---

## 7. Hyperparameter Tuning

### Module: `scripts/tune_bandit_alpha.py`

**Purpose:** Find optimal alpha (exploration parameter) for LinUCB.

- [ ] Implement grid search for alpha
  - [ ] Test alpha values: [0.1, 0.3, 0.5, 0.7, 1.0, 1.5, 2.0]
  - [ ] For each alpha:
    - [ ] Run offline evaluation
    - [ ] Compute cumulative reward
  - [ ] Identify alpha with highest cumulative reward

- [ ] Implement cross-validation
  - [ ] Split historical data into train/test sets
  - [ ] Train bandit on train set, evaluate on test set
  - [ ] Prevent overfitting to historical data

- [ ] Output tuning results
  - [ ] Table: alpha vs cumulative reward
  - [ ] Plot: reward vs alpha
  - [ ] Recommend optimal alpha

- [ ] Update config with optimal alpha
  - [ ] Update `BANDIT_ALPHA` in `app/config.py`

- [ ] Run tuning
  - [ ] `python scripts/tune_bandit_alpha.py`

---

## 8. A/B Testing Preparation

### Module: Backend setup for A/B testing

**Purpose:** Prepare infrastructure to A/B test bandit vs rules in production.

- [ ] Implement user assignment to test groups
  - [ ] Add `test_group` field to User model (or session metadata)
  - [ ] Randomly assign users to "bandit" or "rules" group (50/50 split)
  - [ ] Persist assignment (consistent experience per user)

- [ ] Route recommendations based on test group
  - [ ] In recommendation service, check user's test_group
  - [ ] If "bandit", use BanditAdapter
  - [ ] If "rules", use RulesAdapter

- [ ] Log test group in metrics
  - [ ] Add `test_group` field to Metric model or extra_data
  - [ ] Enable analysis: compare bandit group vs rules group

- [ ] Implement analytics endpoint
  - [ ] `GET /api/v1/admin/ab-test/results`
  - [ ] Return: avg_accuracy, avg_time, avg_engagement for each group
  - [ ] Enable statistical significance testing (t-test)

- [ ] Document A/B test setup
  - [ ] Write guide: `docs/ml/ab_testing.md`
  - [ ] Explain test groups, metrics, analysis

---

## 9. Numerical Stability Improvements

### Module: `app/core/adaptation/bandit.py` (extend)

**Purpose:** Improve numerical stability of matrix operations to prevent errors in production.

- [ ] Add regularization to matrix inversion
  - [ ] Before computing `A^-1`, add `λ * I` to diagonal (ridge regularization)
  - [ ] Default λ = 0.1, configurable
  - [ ] Prevents singular matrix errors

- [ ] Use pseudoinverse instead of inverse
  - [ ] Replace `np.linalg.inv(A)` with `np.linalg.pinv(A)`
  - [ ] More robust to near-singular matrices

- [ ] Implement condition number check
  - [ ] Compute `np.linalg.cond(A)`
  - [ ] If condition number > threshold (e.g., 1e10), log warning
  - [ ] Consider resetting arm's A matrix if too ill-conditioned

- [ ] Test numerical stability
  - [ ] Create test with extreme context vectors
  - [ ] Verify no NaN or Inf in theta
  - [ ] Verify model update doesn't crash

---

## 10. Contextual Feature Importance Analysis

### Module: `scripts/analyze_feature_importance.py`

**Purpose:** Understand which context features are most important for arm selection.

- [ ] Implement feature importance analysis
  - [ ] For each arm, extract theta vector (learned weights)
  - [ ] Feature importance = |theta_i| for feature i
  - [ ] Rank features by importance

- [ ] Visualize feature importance
  - [ ] Bar chart: feature importance for each arm
  - [ ] Heatmap: feature importance across all arms

- [ ] Identify redundant features
  - [ ] Features with consistently low importance
  - [ ] Consider removing to reduce dimensionality

- [ ] Output analysis
  - [ ] Save to `results/feature_importance.json`
  - [ ] Display top 5 features per arm

- [ ] Run analysis
  - [ ] `python scripts/analyze_feature_importance.py`

---

## 11. Exploration Strategy Variants

### Module: `app/core/adaptation/exploration.py`

**Purpose:** Implement alternative exploration strategies beyond UCB.

- [ ] Implement epsilon-greedy with context
  - [ ] With probability ε, select random arm
  - [ ] With probability 1-ε, select arm with highest θ^T * x
  - [ ] Decay ε over time (start high, decrease)

- [ ] Implement softmax exploration
  - [ ] Compute probabilities: `P(a) ∝ exp(θ_a^T * x / τ)`
  - [ ] τ (temperature) controls exploration
  - [ ] Sample arm according to probabilities

- [ ] Compare exploration strategies
  - [ ] Run offline evaluation with each strategy
  - [ ] Compare cumulative reward, arm diversity

---

## 12. Real-time Model Monitoring

### Module: `app/api/routes/bandit_admin.py`

**Purpose:** Admin endpoints to monitor bandit performance in production.

- [ ] Implement admin endpoints
  - [ ] `GET /api/v1/admin/bandit/status`
    - Return: update_count, model_version, alpha, last_update_time
  - [ ] `GET /api/v1/admin/bandit/arm-stats`
    - Return: selection count per arm, avg reward per arm
  - [ ] `GET /api/v1/admin/bandit/theta`
    - Return: theta vectors for all arms (debugging)

- [ ] Add authentication/authorization
  - [ ] Protect admin endpoints (require admin role)

- [ ] Create admin dashboard (frontend)
  - [ ] Display bandit status
  - [ ] Display arm selection distribution (pie chart)
  - [ ] Display reward trends (line chart)

---

## Deliverable

By the end of Week 7, you should have:

### Basic Minimum (Required):
✅ **LinUCB Algorithm**: Fully implemented with select_arm and update methods
✅ **Feature Extraction**: 17-feature context vector from UserProfile
✅ **Reward Computation**: Multi-component reward function
✅ **Bandit Adapter**: Integration with recommendation service
✅ **Recommendation Service Updated**: Bandit strategy option
✅ **Metrics Integration**: Automatic bandit updates on user feedback
✅ **Configuration**: Bandit config in app/config.py
✅ **Model Persistence**: Save/load bandit model
✅ **Basic Testing**: Unit tests for algorithm, integration test for flow

### Documentation and Tests (Required):
- Code documentation (docstrings, inline comments)
- Technical documentation (docs/ml/contextual_bandit.md)
- Unit tests (LinUCB, rewards, features)
- Algorithm validation tests
- Backend API documentation

### Extended Features (Optional):
- Offline evaluation with historical data
- Alternative bandit algorithms (Thompson Sampling)
- Advanced reward shaping (time-decay, confidence-weighted)
- Feature engineering enhancements
- Model versioning and backup
- Visualization of bandit decisions
- Hyperparameter tuning (alpha optimization)
- A/B testing infrastructure
- Numerical stability improvements
- Feature importance analysis
- Alternative exploration strategies
- Real-time monitoring dashboard

---

## Dependencies

**Must be completed before Week 7**:
- Week 6 deliverables:
  - ✅ Dashboard displaying user metrics
  - ✅ User profile with topic_mastery data
  - ✅ Metrics being tracked and stored
- Backend:
  - ✅ Metrics computation working
  - ✅ User profiles being updated
  - ✅ Recommendation service functional
  - ✅ Rules-based adapter working (Level A)

**Enables Week 8**:
- Week 8 (LLM Service Integration) depends on:
  - Bandit providing recommendations
  - Metrics being collected for LLM analysis
  - Adaptation engine supporting multiple strategies

---

## Notes

- **Start Simple**: Implement basic LinUCB first, optimize later
- **Numerical Stability**: Always regularize matrix inversions
- **Logging**: Log everything (arm selections, rewards, updates) for debugging
- **Testing**: Test with synthetic data before production
- **Fallback**: Always have rules-based fallback if bandit fails
- **Offline Eval**: Validate bandit performance before live deployment
- **Feature Engineering**: 17 features is a starting point, can expand
- **Exploration vs Exploitation**: Tune alpha based on offline evaluation
- **Model Persistence**: Save model frequently to avoid losing learning

**Bandit Philosophy:**
- Start with high exploration (high alpha), decrease over time
- Monitor arm selection distribution (avoid converging too early)
- Reward should be noisy but informative (accuracy + engagement)
- Update frequently (after every interaction) for fast learning
- Compare to baseline (random, rules) to validate improvement

---

## Estimated Time Breakdown

**Basic Minimum (Required)**: 3-4 days
- Day 1: LinUCB implementation + feature extraction (Tasks 1-2)
- Day 2: Reward computation + BanditAdapter (Tasks 3-4)
- Day 3: Integration with recommendation service + metrics (Tasks 5-6)
- Day 4: Configuration, persistence, basic testing (Tasks 7-10)

**Documentation and Tests**: 1 day
- Write documentation (Part B, Section 1-2)
- Write comprehensive tests (Part B, Section 3-4)

**Extended Features (Optional)**: 2-3 days (can be done later or in parallel with Week 8+)
- Offline evaluation: 1 day
- Alternative algorithms + reward shaping: 1 day
- Visualization + tuning: 1 day

---

## Troubleshooting

**Issue**: Matrix inversion fails (singular matrix)
- **Solution**: Add regularization (λ * I), use pseudoinverse (`np.linalg.pinv`)

**Issue**: Bandit always selects same arm (no exploration)
- **Solution**: Increase alpha, verify UCB computation, check if A matrices updating

**Issue**: Reward always zero or constant
- **Solution**: Verify reward computation logic, check metric extraction, ensure rewards vary

**Issue**: Features out of range or NaN
- **Solution**: Check normalization logic, handle missing values, clamp to [0, 1]

**Issue**: Model not saving/loading
- **Solution**: Verify file path exists, check pickle serialization, handle file permissions

**Issue**: Bandit performance worse than random
- **Solution**: Check reward function (may be inverted), verify feature extraction, tune alpha

**Issue**: Integration tests fail
- **Solution**: Verify BanditAdapter initialized correctly, check recommendation service routing, ensure metrics trigger update

**Issue**: High memory usage
- **Solution**: Model size is small (16 arms × 17×17 matrices), should be <1MB. Check for memory leaks in update loop.

---

**Good luck with Week 7!** 🤖

This week brings machine learning into the adaptive learning system. Focus on getting the core algorithm working correctly before optimizing performance.
