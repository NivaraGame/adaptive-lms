# ML Pipeline for Adaptive Learning System

## Overview

This document describes the Machine Learning pipeline that powers the adaptation engine. The pipeline combines three approaches with increasing complexity, allowing for incremental development from MVP to advanced implementation.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      User Interactions                           │
│            (Dialog events, answers, timestamps)                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Feature Extraction                            │
│  • Extract 17 metrics from raw events                           │
│  • Aggregate metrics per topic/session                          │
│  • Normalize and encode features                                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     User Profile Update                          │
│  • Update topic_mastery (EMA)                                   │
│  • Update error_patterns                                        │
│  • Update preferred_format                                      │
│  • Compute learning_pace                                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ML Adaptation Layers                          │
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  Level A (MVP) │  │  Level B (ML)  │  │ Level C (Adv.)   │  │
│  │  Rules + Score │  │  Contextual    │  │ IRT/BKT +        │  │
│  │                │  │  Bandit        │  │ Policy Learning  │  │
│  └────────┬───────┘  └────────┬───────┘  └─────────┬────────┘  │
│           │                   │                     │            │
│           └───────────────────┼─────────────────────┘            │
│                               ▼                                  │
│                      ┌─────────────────┐                         │
│                      │ Decision Merger │                         │
│                      └────────┬────────┘                         │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Adaptation Decision                           │
│  • next_difficulty: easy/normal/hard/challenge                  │
│  • next_format: text/visual/video/interactive                   │
│  • next_tempo: faster/slower/maintain                           │
│  • remediation_focus: [list of weak topics]                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Content Selection                             │
│  • Query content_items with filters                             │
│  • Rank by relevance to decision                                │
│  • Return top recommendation                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Feature Engineering

### Input Features (from 17 Metrics)

```python
features = {
    # Recent performance (last 3 interactions)
    "accuracy_last3": float,           # 0.0 - 1.0
    "accuracy_ema_topic": float,       # Exponential moving average for topic

    # Timing features
    "response_time_avg": float,        # seconds, normalized
    "response_time_last": float,       # seconds, normalized
    "interaction_time_avg": float,     # minutes, normalized

    # Engagement features
    "followups_count_last": int,       # 0-10+
    "hint_usage_last": int,            # 0-5+
    "satisfaction_last": float,        # 1-5, normalized to 0-1

    # Comprehension features
    "comprehension_last": float,       # 0-1 (LLM-evaluated or user-rated)
    "awareness_last": float,           # 0-1 (LLM-evaluated)
    "depth_last": float,               # 0-1 (explanation depth)
    "confidence_last": float,          # 0-1 (user confidence)

    # Error features
    "error_type_onehot": [bool, bool, bool],  # [logical, computational, grammatical]
    "error_pattern_flags": {           # Dict of common patterns
        "formula_misuse": bool,
        "sign_flip": bool,
        "skip_step": bool,
        "order_of_operations": bool,
    },

    # Difficulty alignment
    "difficulty_fit": float,           # accuracy - 0.75 (target accuracy)

    # Learning pace
    "learning_pace": float,            # avg time per item in topic

    # Preferences
    "preferred_format_onehot": [bool, bool, bool, bool],  # [text, visual, video, interactive]
    "current_difficulty_onehot": [bool, bool, bool, bool],  # [easy, normal, hard, challenge]

    # Context
    "attempts_count": int,             # for current exercise
    "topic_id": int,                   # encoded topic
    "session_length": int,             # items completed in session
}
```

### Feature Normalization

```python
def normalize_features(raw_features: dict) -> np.ndarray:
    """
    Normalize features to [0, 1] range or standardize
    """
    normalized = {}

    # Time features: log-scale normalization
    normalized["response_time_avg"] = min(1.0, raw_features["response_time_avg"] / 300.0)  # cap at 5min
    normalized["response_time_last"] = min(1.0, raw_features["response_time_last"] / 300.0)

    # Satisfaction: scale 1-5 to 0-1
    normalized["satisfaction_last"] = (raw_features["satisfaction_last"] - 1) / 4.0

    # Followups: cap at 10
    normalized["followups_count_last"] = min(1.0, raw_features["followups_count_last"] / 10.0)

    # Already in [0,1]: accuracy, awareness, depth, confidence, comprehension
    # → pass through

    return np.array([normalized[k] for k in sorted(normalized.keys())])
```

## Level A: Rules + Scoring (MVP)

### Simple Rule-Based Adaptation

```python
class RulesAdapter:
    """
    Level A: Simple threshold-based rules with soft scoring
    Fast, transparent, easy to debug
    """

    # Thresholds
    ACCURACY_HIGH = 0.8
    ACCURACY_LOW = 0.6
    RESPONSE_TIME_SLOW = 120.0  # seconds
    FOLLOWUPS_MANY = 5
    SATISFACTION_LOW = 3.0

    def decide(self, metrics: dict, user_profile: dict) -> dict:
        """
        Make adaptation decision based on rules
        """
        # Extract key metrics
        accuracy = metrics.get("accuracy_last3", 0.5)
        response_time = metrics.get("response_time_last", 60.0)
        followups = metrics.get("followups_count_last", 0)
        satisfaction = metrics.get("satisfaction_last", 3.0)
        current_difficulty = user_profile.get("current_difficulty", "normal")

        # Compute soft score for "gray zones"
        score = (
            0.6 * accuracy
            - 0.3 * min(1.0, response_time / 300.0)  # normalized
            - 0.1 * min(1.0, followups / 10.0)       # normalized
        )

        # Decision logic
        decision = {
            "next_difficulty": current_difficulty,
            "next_format": user_profile.get("preferred_format", "text"),
            "next_tempo": "maintain",
            "remediation_focus": []
        }

        # Adjust difficulty
        if accuracy >= self.ACCURACY_HIGH and response_time < self.RESPONSE_TIME_SLOW:
            decision["next_difficulty"] = self._increase_difficulty(current_difficulty)
        elif accuracy < self.ACCURACY_LOW or response_time > self.RESPONSE_TIME_SLOW:
            decision["next_difficulty"] = self._decrease_difficulty(current_difficulty)

        # Adjust format
        if followups >= self.FOLLOWUPS_MANY or satisfaction < self.SATISFACTION_LOW:
            # User struggles with current format → suggest visual
            if user_profile.get("preferred_format") != "visual":
                decision["next_format"] = "visual"

        # Adjust tempo
        if response_time > self.RESPONSE_TIME_SLOW:
            decision["next_tempo"] = "slower"  # break into smaller chunks

        # Identify weak topics for remediation
        topic_mastery = user_profile.get("topic_mastery", {})
        weak_topics = [topic for topic, mastery in topic_mastery.items() if mastery < 0.5]
        decision["remediation_focus"] = weak_topics[:3]  # top 3

        return decision

    def _increase_difficulty(self, current: str) -> str:
        levels = ["easy", "normal", "hard", "challenge"]
        idx = levels.index(current) if current in levels else 1
        return levels[min(idx + 1, len(levels) - 1)]

    def _decrease_difficulty(self, current: str) -> str:
        levels = ["easy", "normal", "hard", "challenge"]
        idx = levels.index(current) if current in levels else 1
        return levels[max(idx - 1, 0)]
```

### Pros and Cons

**Pros**:
- Fast (milliseconds)
- Transparent and explainable
- Easy to debug and tune
- No training required

**Cons**:
- Limited flexibility
- Doesn't learn from data
- Hard-coded thresholds may not suit all users

## Level B: Contextual Bandit (Recommended)

### Approach

Use a **Contextual Bandit** to adaptively select content format and difficulty as a multi-armed bandit problem:

- **Context**: User's current state (17 metrics + profile)
- **Actions (Arms)**: Content variants (format × difficulty combinations)
- **Reward**: User success on next interaction

### Algorithm: LinUCB (Linear Upper Confidence Bound)

```python
import numpy as np
from typing import List, Tuple

class LinUCBBandit:
    """
    Contextual bandit for content selection using LinUCB algorithm

    Reference: Li et al. (2010) "A Contextual-Bandit Approach to Personalized News Article Recommendation"
    """

    def __init__(self, n_features: int, n_arms: int, alpha: float = 1.0):
        """
        Args:
            n_features: Dimension of context vector
            n_arms: Number of actions (content variants)
            alpha: Exploration parameter (higher = more exploration)
        """
        self.n_features = n_features
        self.n_arms = n_arms
        self.alpha = alpha

        # Initialize parameters for each arm
        self.A = [np.identity(n_features) for _ in range(n_arms)]  # Design matrix
        self.b = [np.zeros(n_features) for _ in range(n_arms)]     # Response vector

    def select_arm(self, context: np.ndarray) -> int:
        """
        Select best arm (content variant) given context

        Returns:
            arm_id: Index of selected arm
        """
        context = context.reshape(-1, 1)  # column vector
        ucb_scores = []

        for arm_id in range(self.n_arms):
            # Solve ridge regression: theta = A^-1 * b
            A_inv = np.linalg.inv(self.A[arm_id])
            theta = A_inv @ self.b[arm_id]

            # Compute UCB score
            p = theta.T @ context
            ucb = self.alpha * np.sqrt(context.T @ A_inv @ context)
            score = p + ucb

            ucb_scores.append(score[0, 0])

        # Select arm with highest UCB score
        return int(np.argmax(ucb_scores))

    def update(self, arm_id: int, context: np.ndarray, reward: float):
        """
        Update model after observing reward

        Args:
            arm_id: Selected arm
            context: Context vector used for selection
            reward: Observed reward (0.0 - 1.0)
        """
        context = context.reshape(-1, 1)

        # Update A and b for selected arm
        self.A[arm_id] += context @ context.T
        self.b[arm_id] += reward * context.flatten()

    def save(self, path: str):
        """Save model parameters"""
        np.savez(path, A=self.A, b=self.b, alpha=self.alpha)

    def load(self, path: str):
        """Load model parameters"""
        data = np.load(path, allow_pickle=True)
        self.A = data["A"].tolist()
        self.b = data["b"].tolist()
        self.alpha = float(data["alpha"])
```

### Arms (Actions) Definition

```python
# Define content variant arms
# Each arm is a (format, difficulty) combination

ARMS = [
    {"format": "text", "difficulty": "easy"},
    {"format": "text", "difficulty": "normal"},
    {"format": "text", "difficulty": "hard"},

    {"format": "visual", "difficulty": "easy"},
    {"format": "visual", "difficulty": "normal"},
    {"format": "visual", "difficulty": "hard"},

    {"format": "video", "difficulty": "easy"},
    {"format": "video", "difficulty": "normal"},
    {"format": "video", "difficulty": "hard"},

    {"format": "interactive", "difficulty": "easy"},
    {"format": "interactive", "difficulty": "normal"},
    {"format": "interactive", "difficulty": "hard"},
]

# Total: 12 arms
```

### Reward Function

```python
def compute_reward(user_response: dict) -> float:
    """
    Compute reward based on user's next interaction

    Reward components:
    - Correctness: Did user answer correctly? (0.7 weight)
    - Engagement: Did user need hints? (0.2 weight)
    - Satisfaction: Was user satisfied? (0.1 weight)
    """
    correct = 1.0 if user_response["is_correct"] else 0.0
    hint_penalty = user_response.get("hints_used", 0) * 0.1
    satisfaction = (user_response.get("satisfaction", 3) - 1) / 4.0  # 1-5 → 0-1

    reward = (
        0.7 * correct
        - 0.2 * min(1.0, hint_penalty)
        + 0.1 * satisfaction
    )

    return max(0.0, min(1.0, reward))  # clip to [0, 1]
```

### Integration into Adaptation Engine

```python
class BanditAdapter:
    """
    Level B: Contextual bandit for adaptive content selection
    """

    def __init__(self, n_features: int = 20):
        self.bandit = LinUCBBandit(
            n_features=n_features,
            n_arms=len(ARMS),
            alpha=1.5  # exploration parameter
        )

    def decide(self, features: np.ndarray, user_profile: dict) -> dict:
        """
        Select content using bandit
        """
        # Select arm
        arm_id = self.bandit.select_arm(features)
        arm_config = ARMS[arm_id]

        decision = {
            "next_difficulty": arm_config["difficulty"],
            "next_format": arm_config["format"],
            "next_tempo": "maintain",
            "remediation_focus": [],
            "arm_id": arm_id  # store for later update
        }

        return decision

    def update_from_feedback(self, arm_id: int, context: np.ndarray,
                            user_response: dict):
        """
        Update bandit after user interaction
        """
        reward = compute_reward(user_response)
        self.bandit.update(arm_id, context, reward)
```

### Training Strategy

**Online Learning** (recommended):
- Start with uniform exploration (ε-greedy with ε=0.3 for first 100 interactions)
- Gradually shift to exploitation (reduce ε to 0.1)
- Continuously update model after each interaction
- No separate training/inference phases

**Offline Initialization** (optional):
- If historical data exists, pre-train bandit:
  - Extract (context, arm, reward) tuples from past dialogs
  - Replay data to initialize A and b matrices
  - Provides better starting point

## Level C: IRT/BKT + Policy Learning (Advanced)

### Approach

Combine psychometric models (IRT/BKT) with reinforcement learning for sophisticated adaptation:

1. **IRT (Item Response Theory)**: Model item difficulty and user ability
2. **BKT (Bayesian Knowledge Tracing)**: Track probability of skill mastery
3. **Policy Learning**: Decide which item to present next

### 1. Item Response Theory (IRT)

**1-Parameter Logistic Model (1PL / Rasch)**:

```
P(correct | θ, b) = 1 / (1 + exp(-(θ - b)))

where:
  θ = user ability (latent variable)
  b = item difficulty
```

**Implementation**:

```python
import numpy as np
from scipy.optimize import minimize

class IRTModel:
    """
    1-Parameter Logistic (Rasch) IRT Model
    """

    def __init__(self):
        self.item_difficulties = {}  # item_id → b
        self.user_abilities = {}     # user_id → θ

    def probability_correct(self, theta: float, b: float) -> float:
        """P(correct | θ, b)"""
        return 1.0 / (1.0 + np.exp(-(theta - b)))

    def estimate_ability(self, user_id: int, responses: List[Tuple[int, bool]]):
        """
        Estimate user ability θ from response pattern

        Args:
            responses: List of (item_id, correct) tuples
        """
        def log_likelihood(theta):
            ll = 0.0
            for item_id, correct in responses:
                b = self.item_difficulties.get(item_id, 0.0)
                p = self.probability_correct(theta, b)
                ll += correct * np.log(p + 1e-10) + (1 - correct) * np.log(1 - p + 1e-10)
            return -ll  # negative for minimization

        result = minimize(log_likelihood, x0=0.0, method="BFGS")
        self.user_abilities[user_id] = result.x[0]
        return result.x[0]

    def calibrate_items(self, data: List[Tuple[int, int, bool]]):
        """
        Calibrate item difficulties from historical data

        Args:
            data: List of (user_id, item_id, correct) tuples
        """
        # Simplified: use percentage correct as proxy for difficulty
        item_stats = {}
        for user_id, item_id, correct in data:
            if item_id not in item_stats:
                item_stats[item_id] = {"correct": 0, "total": 0}
            item_stats[item_id]["total"] += 1
            item_stats[item_id]["correct"] += int(correct)

        for item_id, stats in item_stats.items():
            p_correct = stats["correct"] / stats["total"]
            # Invert logistic: b = -log(p / (1-p))
            b = -np.log((p_correct + 0.01) / (1 - p_correct + 0.01))
            self.item_difficulties[item_id] = b
```

### 2. Bayesian Knowledge Tracing (BKT)

**Model**:
- `P(L_0)`: Prior probability of knowing skill
- `P(T)`: Probability of learning (transition)
- `P(S)`: Probability of slip (know but answer wrong)
- `P(G)`: Probability of guess (don't know but answer right)

**Update after observation**:

```python
class BKTModel:
    """
    Bayesian Knowledge Tracing for skill mastery
    """

    def __init__(self, p_L0=0.1, p_T=0.1, p_S=0.1, p_G=0.25):
        self.p_L0 = p_L0  # prior
        self.p_T = p_T    # learn
        self.p_S = p_S    # slip
        self.p_G = p_G    # guess

    def update(self, p_L_prev: float, correct: bool) -> float:
        """
        Update P(L_t | observation) using Bayes' rule

        Args:
            p_L_prev: P(L_{t-1}), probability of knowing before this observation
            correct: Whether user answered correctly

        Returns:
            p_L_curr: Updated P(L_t)
        """
        if correct:
            # P(L_t | correct) = P(correct | L_t) * P(L_t) / P(correct)
            p_correct_given_L = 1 - self.p_S
            p_correct_given_not_L = self.p_G
        else:
            # P(L_t | incorrect)
            p_correct_given_L = self.p_S
            p_correct_given_not_L = 1 - self.p_G

        # Bayes update
        numerator = p_correct_given_L * p_L_prev
        denominator = (p_correct_given_L * p_L_prev +
                      p_correct_given_not_L * (1 - p_L_prev))

        p_L_after_obs = numerator / (denominator + 1e-10)

        # Account for learning opportunity
        p_L_curr = p_L_after_obs + (1 - p_L_after_obs) * self.p_T

        return min(0.99, p_L_curr)  # cap at 0.99
```

### 3. Policy Learning

**Objective**: Learn policy π(s) → a that maximizes long-term learning gain

**State**: User's current knowledge state (θ from IRT + P(L) per skill from BKT)
**Action**: Which content item to present
**Reward**: Improvement in knowledge state

```python
class PolicyAdapter:
    """
    Level C: IRT/BKT + Policy learning
    """

    def __init__(self):
        self.irt = IRTModel()
        self.bkt = BKTModel()
        self.user_skill_mastery = {}  # {user_id: {skill_id: P(L)}}

    def decide(self, user_id: int, available_items: List[dict]) -> dict:
        """
        Select next item using IRT + BKT
        """
        # Get user ability
        theta = self.irt.user_abilities.get(user_id, 0.0)

        # Score each item
        scores = []
        for item in available_items:
            b = self.irt.item_difficulties.get(item["id"], 0.0)

            # Optimal difficulty: items slightly above user ability
            difficulty_score = self._difficulty_score(theta, b)

            # Check skill mastery
            skill_id = item["skill_id"]
            p_L = self.user_skill_mastery.get(user_id, {}).get(skill_id, 0.1)

            # Prioritize skills with low mastery
            mastery_score = 1.0 - p_L

            # Combined score
            score = 0.6 * difficulty_score + 0.4 * mastery_score
            scores.append((score, item))

        # Select item with highest score
        best_item = max(scores, key=lambda x: x[0])[1]

        return {
            "next_content_id": best_item["id"],
            "next_difficulty": best_item["difficulty"],
            "next_format": best_item["format"]
        }

    def _difficulty_score(self, theta: float, b: float) -> float:
        """
        Score item difficulty relative to user ability
        Target: P(correct) ≈ 0.75 (in ZPD)
        """
        p_correct = self.irt.probability_correct(theta, b)
        target = 0.75

        # Penalize items that are too easy or too hard
        return 1.0 - abs(p_correct - target)

    def update_from_response(self, user_id: int, item_id: int,
                            skill_id: int, correct: bool):
        """
        Update IRT and BKT after user response
        """
        # Update BKT for skill
        if user_id not in self.user_skill_mastery:
            self.user_skill_mastery[user_id] = {}

        p_L_prev = self.user_skill_mastery[user_id].get(skill_id, 0.1)
        p_L_curr = self.bkt.update(p_L_prev, correct)
        self.user_skill_mastery[user_id][skill_id] = p_L_curr

        # Re-estimate user ability (IRT)
        # (requires full response history - omitted for brevity)
```

### Pros and Cons

**Pros**:
- Theoretically grounded (psychometric models)
- Captures latent ability and skill mastery
- Suitable for academic thesis

**Cons**:
- More complex to implement
- Requires more data for calibration
- Higher computational cost

## Hybrid Approach (Recommended Implementation)

Combine all three levels:

```python
class HybridAdaptationEngine:
    """
    Combines rules, bandit, and IRT/BKT
    """

    def __init__(self):
        self.rules = RulesAdapter()
        self.bandit = BanditAdapter()
        self.policy = PolicyAdapter()  # optional

        self.mode = "bandit"  # "rules" | "bandit" | "policy"

    def decide(self, user_id: int, metrics: dict,
               user_profile: dict, features: np.ndarray) -> dict:
        """
        Make adaptation decision using active mode
        """
        if self.mode == "rules":
            return self.rules.decide(metrics, user_profile)

        elif self.mode == "bandit":
            return self.bandit.decide(features, user_profile)

        elif self.mode == "policy":
            # Get available items
            available_items = self._get_available_items(user_profile)
            return self.policy.decide(user_id, available_items)

        else:
            # Fallback to rules
            return self.rules.decide(metrics, user_profile)
```

## Model Update Strategy

### Online Learning Loop

```python
async def learning_loop():
    """
    Continuous learning loop for bandit/policy models
    """
    while True:
        # 1. Wait for new user interaction
        interaction = await queue.get_next_interaction()

        # 2. Extract features and reward
        features = extract_features(interaction["metrics"])
        reward = compute_reward(interaction["response"])

        # 3. Update model
        if interaction.get("arm_id") is not None:
            bandit_adapter.update_from_feedback(
                arm_id=interaction["arm_id"],
                context=features,
                user_response=interaction["response"]
            )

        # 4. Periodically save model
        if should_save_checkpoint():
            bandit_adapter.bandit.save("models/bandit_checkpoint.npz")
```

### Model Persistence

```python
# Save model periodically
bandit.save("models/linucb_bandit.npz")

# Load on startup
bandit.load("models/linucb_bandit.npz")
```

## Evaluation Metrics

### Online Metrics
- **CTR (Click-through rate)**: % of recommended content that user engages with
- **Completion rate**: % of started exercises that user completes
- **Average accuracy**: Overall correctness
- **Session length**: Time spent learning
- **Retention**: % of users returning next day/week

### Offline Metrics (for ML models)
- **AUC-ROC**: For predicting user success
- **RMSE**: For accuracy prediction
- **Regret**: Cumulative regret for bandit (vs. optimal policy)
- **Calibration**: How well predicted probabilities match actual outcomes

### A/B Testing
- **Control group**: Random content selection
- **Treatment group**: ML-based adaptation
- **Metrics**: Compare learning gains, engagement, satisfaction

## Implementation Roadmap

### Phase 1: MVP (Level A)
- Implement rules-based adapter
- Deploy and collect data
- Establish baseline metrics

### Phase 2: ML (Level B)
- Implement LinUCB bandit
- Train on collected data
- A/B test vs. rules

### Phase 3: Advanced (Level C - Optional)
- Implement IRT calibration
- Implement BKT tracking
- Develop policy learner
- Compare all approaches

## Tools and Libraries

```python
# requirements.txt
numpy>=1.21.0
scipy>=1.7.0
scikit-learn>=1.0.0
pandas>=1.3.0

# For deep RL (if extending to Level C+)
# torch>=1.9.0
# stable-baselines3>=1.0
```

## Summary

This ML pipeline provides three levels of sophistication:
1. **Level A (Rules)**: Fast, transparent, good baseline
2. **Level B (Bandit)**: Balance of simplicity and performance, **recommended**
3. **Level C (IRT/BKT)**: Advanced, academically rigorous, more complex

Start with Level A, transition to Level B for production, optionally explore Level C for research or thesis depth.
