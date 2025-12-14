# Rules Adapter - Адаптер на основі правил (Рівень A)

## Загальний опис

**RulesAdapter** - це "мозок" системи адаптивного навчання, який аналізує як студент вчиться і приймає рішення про персоналізацію контенту. Це чистий Python-модуль без залежностей від бази даних чи FastAPI - тільки логіка прийняття рішень.

## Що він робить?

Адаптер аналізує поведінку студента і відповідає на 4 ключові питання:

1. **Яку складність дати наступний раз?**
   - `easy` (легкий)
   - `normal` (нормальний)
   - `hard` (важкий)
   - `challenge` (виклик)

2. **Який формат контенту підійде краще?**
   - `text` (текстовий)
   - `visual` (візуальний)
   - `video` (відео)
   - `interactive` (інтерактивний)

3. **Який темп навчання?**
   - `fast` (швидкий)
   - `normal` (нормальний)
   - `slow` (повільний)
   - `break` (перерва)

4. **Які теми потребують додаткового вивчення?**
   - Список слабких тем (з оволодінням < 40%)

## Архітектура

```
backend/app/core/adaptation/
├── __init__.py       # Експорти модуля
├── config.py         # Конфігурація порогових значень
└── rules.py          # Головна логіка RulesAdapter
```

## Конфігурація (config.py)

### Порогові значення точності

```python
ACCURACY_HIGH_THRESHOLD = 0.8      # > 80% → збільшити складність
ACCURACY_MEDIUM_THRESHOLD = 0.5    # 50-80% → залишити як є
ACCURACY_LOW_THRESHOLD = 0.5       # < 50% → зменшити складність
```

### Порогові значення часу відповіді (секунди)

```python
RESPONSE_TIME_FAST_THRESHOLD = 30.0       # < 30с → швидка відповідь
RESPONSE_TIME_NORMAL_MAX = 90.0           # 30-90с → нормальна
RESPONSE_TIME_SLOW_THRESHOLD = 120.0      # > 120с → повільна
```

### Порогові значення оволодіння темою

```python
MASTERY_HIGH_THRESHOLD = 0.7           # > 70% → тема засвоєна
MASTERY_MEDIUM_THRESHOLD = 0.4         # 40-70% → в процесі вивчення
MASTERY_STRUGGLING_THRESHOLD = 0.4     # < 40% → потрібна допомога
```

### Порогові значення залученості

```python
FOLLOWUPS_HIGH_THRESHOLD = 3      # > 3 додаткових питань → потрібна візуальна підтримка
FOLLOWUPS_LOW_THRESHOLD = 1       # 0-1 питань → достатньо текстового формату
```

### Порогові значення сесії

```python
SESSION_LENGTH_LONG_MINUTES = 60.0        # > 60 хв → запропонувати перерву
SESSION_INTERACTIONS_HIGH = 20            # > 20 взаємодій → сповільнити темп
SESSION_FATIGUE_RT_INCREASE_PERCENT = 0.3 # 30% збільшення часу → втома
```

**Всі порогові значення налаштовуються через змінні оточення!**

Приклад:
```bash
export ACCURACY_HIGH_THRESHOLD=0.85
export RESPONSE_TIME_SLOW_THRESHOLD=100
```

## Правила прийняття рішень

### Правило 1: Складність контенту

```
ЯКЩО точність ≥ 80% ТА час відповіді < 90с
  → Збільшити складність на 1 рівень
  → Пояснення: "Висока точність і швидкий час вказують на оволодіння матеріалом"

ЯКЩО точність < 50% АБО час відповіді > 120с
  → Зменшити складність на 1 рівень
  → Пояснення: "Низька точність або повільний час вказують на труднощі"

ІНАКШЕ
  → Залишити поточну складність
  → Пояснення: "Помірні результати, продовжуємо на поточному рівні"
```

**Приклад:**
```python
# Вхідні дані
user_profile = {
    "current_difficulty": "normal",
    "topic_mastery": {"algebra": 0.85}
}
recent_metrics = [
    {"metric_name": "accuracy", "metric_value_f": 0.9},
    {"metric_name": "response_time", "metric_value_f": 45.0},
    # ще 3-5 метрик...
]

# Вихід
recommendation.difficulty.recommended_difficulty = "hard"
recommendation.difficulty.reasoning =
    "Висока точність (0.90) і швидкий час відповіді (45.0с)
     вказують на оволодіння. Збільшую складність з normal до hard."
```

### Правило 2: Формат контенту

```
ЯКЩО є улюблений формат у профілі
  → Використати улюблений формат
  → Впевненість: 0.9

ЯКЩО додаткових питань > 3
  → Візуальний або інтерактивний формат
  → Пояснення: "Багато питань вказує на потребу візуальної підтримки"

ЯКЩО точність ≥ 80% ТА час відповіді < 30с
  → Текстовий формат
  → Пояснення: "Висока точність зі швидкими відповідями - ефективне текстове навчання"

ЯКЩО час відповіді > 120с
  → Відео формат
  → Пояснення: "Повільні відповіді вказують на потребу детальніших відео-пояснень"

ЯКЩО точність < 50%
  → Інтерактивний формат
  → Пояснення: "Помірна точність виграє від інтерактивної практики"

ІНАКШЕ
  → Текстовий формат
  → Пояснення: "Стандартний текстовий формат для збалансованих результатів"
```

**Приклад:**
```python
# Студент задає багато додаткових питань
recent_metrics = [
    {"metric_name": "followups_count", "metric_value_f": 5.0},
    # інші метрики...
]

# Вихід
recommendation.format.recommended_format = "visual"
recommendation.format.reasoning =
    "Велика кількість додаткових питань (5) вказує
     на потребу візуальної підтримки"
```

### Правило 3: Темп навчання

```
ЯКЩО тривалість сесії > 60 хвилин
  → Темп: "break"
  → Пояснення: "Тривалість сесії перевищує рекомендований час.
                Розгляньте перерву для підтримання ефективності"

ЯКЩО взаємодій у сесії > 20
  → Темп: "slow"
  → Пояснення: "Велика кількість взаємодій. Сповільнення для кращого запам'ятовування"

ЯКЩО час відповіді збільшується протягом сесії (> 30%)
  → Темп: "slow"
  → Пояснення: "Час відповіді збільшується, виявлена втома. Зменшуємо темп"

ЯКЩО learning_pace = "fast" ТА взаємодій < 10
  → Темп: "fast"
  → Пояснення: "Уподобання студента - швидкий темп, сесія ще свіжа"

ІНАКШЕ
  → Темп: "normal"
  → Пояснення: "Сесія йде добре"
```

**Виявлення втоми:**
```python
# Перша половина сесії: середній час 40с
# Друга половина сесії: середній час 60с
# Збільшення: (60 - 40) / 40 = 50% > 30% → ВТОМА!

recommendation.tempo.recommended_tempo = "slow"
recommendation.tempo.reasoning =
    "Час відповіді збільшується, виявлена втома. Зменшуємо темп"
```

### Правило 4: Додаткове вивчення тем

```
ДЛЯ кожної теми у topic_mastery:
  ЯКЩО оволодіння < 40%
    → Додати до списку слабких тем

Відсортувати теми від найнижчого оволодіння до найвищого

Повернути список тем для додаткового вивчення
```

**Приклад:**
```python
user_profile = {
    "topic_mastery": {
        "algebra": 0.85,      # ✅ Добре
        "calculus": 0.30,     # ❌ Потрібна допомога
        "geometry": 0.35,     # ❌ Потрібна допомога
        "trigonometry": 0.65  # ✅ Прийнятно
    }
}

# Вихід
recommendation.remediation.topics = ["calculus", "geometry"]
recommendation.remediation.mastery_scores = {
    "calculus": 0.30,
    "geometry": 0.35
}
recommendation.remediation.reasoning =
    "Виявлено 2 теми для додаткового вивчення:
     calculus (0.30), geometry (0.35).
     Зосередьтесь на зміцненні основ у цих областях."
```

## Джерела даних

### 1. Профіль користувача (UserProfile)

З таблиці `user_profile`, поля:

```python
{
    "topic_mastery": {           # JSONB: тема → оволодіння
        "algebra": 0.85,
        "calculus": 0.45
    },
    "current_difficulty": "normal",      # easy/normal/hard/challenge
    "preferred_format": "text",          # text/visual/video/interactive або None
    "learning_pace": "medium",           # slow/medium/fast
    "avg_accuracy": 0.75,                # Середня історична точність
    "avg_response_time": 65.0            # Середній історичний час відповіді
}
```

### 2. Останні метрики (Metric)

З таблиці `metrics`, створені **системою метрик Тижня 2**:

```python
[
    {
        "metric_name": "accuracy",          # Назва метрики
        "metric_value_f": 0.8,              # Значення (float)
        "timestamp": datetime(...)          # Час
    },
    {
        "metric_name": "response_time",
        "metric_value_f": 45.0,             # секунди
        "timestamp": datetime(...)
    },
    {
        "metric_name": "followups_count",
        "metric_value_f": 2.0,              # кількість
        "timestamp": datetime(...)
    },
    {
        "metric_name": "attempts_count",
        "metric_value_f": 1.0,              # кількість спроб
        "timestamp": datetime(...)
    }
    # Зазвичай 5-10 останніх метрик
]
```

### 3. Контекст сесії (опціонально)

Інформація про поточну сесію навчання:

```python
SessionContext(
    dialog_id=123,
    session_start_time=datetime.utcnow() - timedelta(minutes=45),
    messages_count=15,
    current_topic="algebra"
)
```

## Вихідні дані

### Структура рекомендації

```python
@dataclass
class AdaptationRecommendation:
    # Рішення про складність
    difficulty: DifficultyDecision {
        recommended_difficulty: "hard",
        confidence: 0.9,
        reasoning: "Висока точність (0.85)...",
        change_from_current: +1
    }

    # Рішення про формат
    format: FormatDecision {
        recommended_format: "visual",
        confidence: 0.7,
        reasoning: "Багато додаткових питань..."
    }

    # Рішення про темп
    tempo: TempoDecision {
        recommended_tempo: "normal",
        confidence: 0.8,
        reasoning: "Сесія йде добре..."
    }

    # Теми для додаткового вивчення
    remediation: RemediationTopics {
        topics: ["calculus", "geometry"],
        mastery_scores: {"calculus": 0.30, "geometry": 0.35},
        reasoning: "Виявлено 2 теми..."
    }

    # Загальна інформація
    overall_confidence: 0.8,
    overall_reasoning: "Підвищую до hard. Рекомендую visual. На основі 5 взаємодій.",

    # Метадані
    metadata: {
        "strategy": "rules",
        "config_version": "1.0",
        "metrics_sample_size": 5,
        "timestamp": "2025-11-28T..."
    }
```

### Формат для ML Pipeline

```python
recommendation.to_dict() = {
    "next_difficulty": "hard",
    "next_format": "visual",
    "next_tempo": "normal",
    "remediation_focus": ["calculus", "geometry"],
    "reasoning": "Підвищую до hard...",
    "confidence": 0.8,
    "metadata": {...}
}
```

## Розрахунок впевненості

Впевненість базується на кількості доступних метрик:

```python
ЯКЩО метрик ≥ 5
  → Впевненість: 0.9 (висока)

ЯКЩО метрик ≥ 3
  → Впевненість: 0.7 (середня)

ЯКЩО метрик > 0
  → Впевненість: 0.5 (низька)

ЯКЩО метрик = 0 (холодний старт)
  → Впевненість: 0.3 (дуже низька)
```

## Приклади використання

### Приклад 1: Високопродуктивний студент

```python
from app.core.adaptation.rules import RulesAdapter

# Профіль
user_profile = {
    "topic_mastery": {"algebra": 0.85},
    "current_difficulty": "normal",
    "preferred_format": None,
    "learning_pace": "medium"
}

# Метрики (останні 5 взаємодій)
recent_metrics = [
    {"metric_name": "accuracy", "metric_value_f": 1.0},
    {"metric_name": "response_time", "metric_value_f": 42.0},
    {"metric_name": "accuracy", "metric_value_f": 0.9},
    {"metric_name": "response_time", "metric_value_f": 38.0},
    {"metric_name": "accuracy", "metric_value_f": 1.0},
    {"metric_name": "response_time", "metric_value_f": 50.0},
]

# Отримати рекомендацію
adapter = RulesAdapter()
rec = adapter.get_recommendation(user_profile, recent_metrics)

# Результат
print(rec.difficulty.recommended_difficulty)  # "hard"
print(rec.difficulty.change_from_current)     # +1
print(rec.format.recommended_format)          # "text"
print(rec.overall_confidence)                 # 0.63
print(rec.overall_reasoning)
# "Підвищую складність до hard на основі останніх результатів.
#  Рекомендую текстовий формат. На основі 3 останніх взаємодій."
```

### Приклад 2: Студент з труднощами

```python
user_profile = {
    "topic_mastery": {"calculus": 0.25, "algebra": 0.35},
    "current_difficulty": "normal",
    "preferred_format": None,
    "learning_pace": "slow"
}

recent_metrics = [
    {"metric_name": "accuracy", "metric_value_f": 0.0},
    {"metric_name": "response_time", "metric_value_f": 145.0},
    {"metric_name": "accuracy", "metric_value_f": 0.0},
    {"metric_name": "response_time", "metric_value_f": 160.0},
    {"metric_name": "followups_count", "metric_value_f": 5.0},
]

rec = adapter.get_recommendation(user_profile, recent_metrics)

# Результат
print(rec.difficulty.recommended_difficulty)  # "easy"
print(rec.difficulty.change_from_current)     # -1
print(rec.format.recommended_format)          # "visual"
print(rec.remediation.topics)                 # ["calculus", "algebra"]
print(rec.remediation.mastery_scores)
# {"calculus": 0.25, "algebra": 0.35}
```

### Приклад 3: Холодний старт (новий користувач)

```python
user_profile = {
    "topic_mastery": {},           # Порожньо
    "current_difficulty": "normal",
    "preferred_format": None,
    "learning_pace": "medium",
    "avg_accuracy": None,          # Ще немає даних
    "avg_response_time": None
}

recent_metrics = []  # Немає метрик

rec = adapter.get_recommendation(user_profile, recent_metrics)

# Результат
print(rec.difficulty.recommended_difficulty)  # "normal" (за замовчуванням)
print(rec.difficulty.confidence)              # 0.3 (низька)
print(rec.format.recommended_format)          # "text" (за замовчуванням)
print(rec.overall_reasoning)
# "Початкова рекомендація (холодний старт)"
```

### Приклад 4: Виявлення втоми

```python
user_profile = {
    "topic_mastery": {"algebra": 0.65},
    "current_difficulty": "normal",
    "preferred_format": None,
    "learning_pace": "medium"
}

# Час відповіді збільшується (40с → 95с)
recent_metrics = [
    {"metric_name": "response_time", "metric_value_f": 40.0},
    {"metric_name": "response_time", "metric_value_f": 45.0},
    {"metric_name": "response_time", "metric_value_f": 55.0},
    {"metric_name": "response_time", "metric_value_f": 70.0},
    {"metric_name": "response_time", "metric_value_f": 85.0},
    {"metric_name": "response_time", "metric_value_f": 95.0},
]

# Контекст сесії
from app.core.adaptation.rules import SessionContext
from datetime import datetime, timedelta

session_context = SessionContext(
    dialog_id=100,
    session_start_time=datetime.utcnow() - timedelta(minutes=65),
    messages_count=25,
    current_topic="algebra"
)

rec = adapter.get_recommendation(user_profile, recent_metrics, session_context)

# Результат
print(rec.tempo.recommended_tempo)  # "break" або "slow"
print(rec.tempo.reasoning)
# "Тривалість сесії (65 хвилин) перевищує рекомендований час.
#  Розгляньте перерву для підтримання ефективності"
```

## Тестування

Всі тести виконуються з синтетичними даними (без бази даних):

```bash
cd backend
python3 -c "
from datetime import datetime, timedelta
from app.core.adaptation.rules import RulesAdapter, SessionContext

# Тест 1: Високопродуктивний користувач
adapter = RulesAdapter()
# ... (дані)
rec = adapter.get_recommendation(user_profile, recent_metrics)
assert rec.difficulty.recommended_difficulty == 'hard'
print('✅ Тест 1 пройдено')

# Тест 2: Студент з труднощами
# ...
assert rec.difficulty.recommended_difficulty == 'easy'
print('✅ Тест 2 пройдено')

# Тест 3: Холодний старт
# ...
assert rec.difficulty.confidence < 0.5
print('✅ Тест 3 пройдено')
"
```

**Результати тестування:**
```
✅ Високопродуктивний користувач → Збільшує складність до 'hard'
✅ Студент з труднощами → Зменшує до 'easy', пропонує візуальний формат
✅ Холодний старт → Стандартні налаштування, низька впевненість
✅ Втома в сесії → Виявляє збільшення часу відповіді
✅ Додаткове вивчення → Знаходить теми з оволодінням < 0.4
✅ Вихід у форматі dict → Сумісний з ML pipeline
```

## Переваги та обмеження

### Переваги ✅

1. **Швидкість** - рішення < 1мс (чистий Python, без I/O)
2. **Прозорість** - кожне рішення має пояснення
3. **Легко налаштовувати** - всі пороги в конфігурації
4. **Легко тестувати** - немає залежностей від БД
5. **Відсутність навчання** - не потрібні дані для тренування
6. **Передбачуваність** - завжди однакові рішення для однакових даних

### Обмеження ❌

1. **Не навчається** - не адаптується до даних
2. **Фіксовані пороги** - можуть не підходити всім користувачам
3. **Обмежена гнучкість** - тільки задані правила
4. **Немає персоналізації** - однакові правила для всіх

## Інтеграція з ML Pipeline

RulesAdapter - це **Рівень A (MVP)** з `ml_pipeline.md`:

```
Рівень A (Rules) ← ВИ ТУТ
    ↓
Рівень B (Contextual Bandit) ← Наступний крок
    ↓
Рівень C (IRT/BKT + Policy Learning) ← Просунутий
```

Адаптер готовий до:
- Інтеграції в `AdaptationEngine` (оркестратор стратегій)
- Порівняння з ML-адаптерами (A/B тестування)
- Використання як fallback для ML-моделей

## Наступні кроки

1. ✅ **Розділ 1 виконано** - Rules Adapter реалізовано
2. ⏭️ **Розділ 2** - Реалізувати AdaptationEngine (оркестратор)
3. ⏭️ **Розділ 3** - Реалізувати RecommendationService (бізнес-логіка)
4. ⏭️ **Розділ 4** - Створити API endpoints
5. ⏭️ **Розділ 5** - Інтегрувати повний workflow

## Файли

- `backend/app/core/adaptation/__init__.py` - Експорти модуля
- `backend/app/core/adaptation/config.py` - Конфігурація
- `backend/app/core/adaptation/rules.py` - RulesAdapter

**Документація:**
- `docs/weeks/week_3.md` - План Week 3 (Розділ 1 ✅)
- `docs/claude/ml_pipeline.md` - ML Pipeline архітектура
- `docs/claude/rules_adapter_ua.md` - Цей файл

---

**Статус:** ✅ Готово до інтеграції з вищого рівня сервісами!
