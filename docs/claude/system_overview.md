# Схема роботи адаптивної системи навчання

## Загальна архітектура системи

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
graph TB
    subgraph "Frontend (React)"
        A[Студент] --> B[Dashboard]
        A --> C[Learning Interface]
        A --> D[Profile Page]
    end

    subgraph "Backend (FastAPI)"
        E[API Layer] --> F[Services Layer]
        F --> G[Adaptation Engine]
        F --> H[Metrics Processor]
        F --> I[Content Service]

        G --> J[Rules Adapter - Level A]
        G --> K[Bandit Adapter - Level B]
        G --> L[IRT/BKT - Level C]
    end

    subgraph "Data Layer"
        M[(PostgreSQL)]
        N[LLM Service]
    end

    subgraph "Storage"
        M --> O[users]
        M --> P[dialogs]
        M --> Q[messages]
        M --> R[metrics]
        M --> S[user_profiles]
        M --> T[content_items]
    end

    C --> E
    H --> N
    F --> M

    style G fill:#ff9999
    style H fill:#99ccff
    style I fill:#99ff99
```

## Повний цикл взаємодії користувача

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
sequenceDiagram
    participant Student as Студент
    participant Frontend as React UI
    participant API as FastAPI
    participant Metrics as Metrics Service
    participant Adaptation as Adaptation Engine
    participant Content as Content Service
    participant DB as Database
    participant LLM as LLM Service

    Student->>Frontend: Відповідає на завдання
    Frontend->>API: POST /messages (відповідь)
    API->>DB: Зберегти message

    API->>Metrics: Обчислити метрики

    par Синхронні метрики
        Metrics->>Metrics: accuracy, response_time
        Metrics->>Metrics: attempts_count
    and Асинхронні метрики (10-20%)
        Metrics->>LLM: Оцінити awareness
        LLM-->>Metrics: awareness_score
    end

    Metrics->>DB: Зберегти metrics
    Metrics->>DB: Оновити user_profile

    API->>Adaptation: Запит рекомендації
    Adaptation->>DB: Отримати user_profile
    Adaptation->>Adaptation: Прийняти рішення

    Adaptation->>Content: Запит контенту<br/>(difficulty, format, topic)
    Content->>DB: Знайти контент
    Content-->>Adaptation: content_item

    Adaptation-->>API: Рекомендація
    API-->>Frontend: Наступне завдання
    Frontend-->>Student: Показати контент
```

## Процес обчислення метрик

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
flowchart TD
    A[Подія користувача] --> B{Тип події}

    B -->|Відповідь на питання| C[Обчислити accuracy]
    B -->|Відправлення повідомлення| D[Обчислити response_time]
    B -->|Запит підказки| E[Збільшити hints_used]
    B -->|Оцінка задоволення| F[Зафіксувати satisfaction]

    C --> G[Синхронні метрики]
    D --> G
    E --> G
    F --> G

    G --> H{Потрібні<br/>LLM метрики?}

    H -->|Так 10-20%| I[Асинхронна обробка]
    H -->|Ні 80-90%| J[Зберегти метрики]

    I --> K[LLM: awareness_score]
    I --> L[LLM: error_pattern]
    I --> M[LLM: explanation_depth]

    K --> J
    L --> J
    M --> J

    J --> N[Оновити user_profile]
    N --> O[EMA для topic_mastery]
    N --> P[Оновити error_patterns]
    N --> Q[Оновити preferred_format]

    style G fill:#99ccff
    style I fill:#ffcc99
    style N fill:#99ff99
```

## Адаптаційний механізм: 3 рівні

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
graph TB
    subgraph Input["Вхідні дані"]
        A[User Profile]
        B[17 Metrics]
        C[Recent History]
    end

    A --> D[Feature Extraction]
    B --> D
    C --> D

    D --> E{Режим адаптації}

    E -->|Level A| F[Rules Adapter]
    E -->|Level B| G[Contextual Bandit]
    E -->|Level C| H[IRT/BKT + Policy]

    F --> I[Прості пороги]
    I --> J{accuracy > 0.8?}
    J -->|Так| K[Збільшити складність]
    J -->|Ні| L[Зменшити складність]

    G --> M[LinUCB Algorithm]
    M --> N[12 arms<br/>format × difficulty]
    N --> O[Обрати arm<br/>UCB score]

    H --> P[IRT: оцінка здібностей]
    H --> Q[BKT: ймовірність знання]
    P --> R[Оптимальна складність]
    Q --> R

    K --> S[Adaptation Decision]
    L --> S
    O --> S
    R --> S

    S --> T[next_difficulty]
    S --> U[next_format]
    S --> V[next_tempo]
    S --> W[remediation_focus]

    style F fill:#ffcccc
    style G fill:#ccffcc
    style H fill:#ccccff
    style S fill:#ffffcc
```

## 17 метрик системи

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
graph TB
    A[17 Метрик] --> B[Educational - 3]
    A --> C[Test - 4]
    A --> D[Assessment - 5]
    A --> E[Reflective - 4]
    A --> F[General - 1]

    B --> B1[interaction_time]
    B --> B2[followups_count]
    B --> B3[satisfaction_score]

    C --> C1[accuracy]
    C --> C2[attempts_count]
    C --> C3[response_time]
    C --> C4[difficulty_result]

    D --> D1[preferred_format]
    D --> D2[error_type]
    D --> D3[satisfaction_score]
    D --> D4[learning_pace]
    D --> D5[difficulty_feedback]

    E --> E1[awareness_score]
    E --> E2[explanation_depth]
    E --> E3[confidence_level]
    E --> E4[error_pattern]

    F --> F1[difficulty_level]

    style A fill:#ffffcc
    style B fill:#ccffcc
    style C fill:#ffcccc
    style D fill:#ccccff
    style E fill:#ffccff
```

## Механізм контекстного бандита (Level B)

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
flowchart TD
    A[Поточний стан користувача] --> B[Екстракція ознак]
    B --> C[Feature Vector<br/>17 normalized metrics]

    C --> D[LinUCB Model]

    D --> E{Для кожного arm}

    E --> F[Arm 1: text + easy]
    E --> G[Arm 2: text + normal]
    E --> H[...]
    E --> I[Arm 12: interactive + hard]

    F --> J[Обчислити UCB score]
    G --> J
    H --> J
    I --> J

    J --> K[UCB Formula:<br/>theta_T * x + alpha * sqrt]
    K --> L{Вибрати MAX}

    L --> M[Рекомендувати контент]

    M --> N[Користувач взаємодіє]
    N --> O[Спостерегти результат]

    O --> P[Обчислити reward<br/>r = 0.7*correct - 0.2*hints + 0.1*satisfaction]

    P --> Q[Оновити модель<br/>A = A + xx_T<br/>b = b + rx]

    Q --> D

    style D fill:#ffccff
    style K fill:#ccffff
    style P fill:#ffffcc
```

## Типи діалогів та їх цілі

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
graph TB
    A[Типи діалогів] --> B[Educational]
    A --> C[Test]
    A --> D[Assessment]
    A --> E[Reflective]

    B --> B1[Мета: Передати знання]
    B --> B2[Метрики: interaction_time,<br/>followups_count, satisfaction]

    C --> C1[Мета: Перевірити знання]
    C --> C2[Метрики: accuracy,<br/>response_time, attempts_count]

    D --> D1[Мета: Зібрати дані<br/>про ефективність]
    D --> D2[Метрики: preferred_format,<br/>error_type, learning_pace]

    E --> E1[Мета: Розвинути<br/>критичне мислення]
    E --> E2[Метрики: awareness_score,<br/>explanation_depth, confidence]

    style B fill:#ccffcc
    style C fill:#ffcccc
    style D fill:#ccccff
    style E fill:#ffffcc
```

## Оновлення профілю користувача

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
flowchart LR
    A[Нові метрики] --> B{Тип метрики}

    B -->|accuracy| C[Оновити topic_mastery]
    B -->|error_pattern| D[Додати до error_patterns]
    B -->|satisfaction| E[Оновити preferred_format?]
    B -->|response_time| F[Оновити learning_pace]

    C --> G[EMA Formula:<br/>new = alpha * current + rest * old]

    G --> H{new > 0.8}
    H -->|Так| I[Тема освоєна]
    H -->|Ні| J[Продовжити навчання]

    D --> K[Аналіз патернів]
    K --> L{Рекурентна помилка?}
    L -->|Так| M[Додати remediation_focus]
    L -->|Ні| N[Відслідковувати далі]

    E --> O{followups > 5<br/>AND satisfaction < 3}
    O -->|Так| P[Змінити формат на visual]
    O -->|Ні| Q[Залишити поточний]

    F --> R[avg_response_time]
    R --> S{Темп}
    S --> T[slow < 60s < medium < 120s < fast]

    style G fill:#ffcccc
    style K fill:#ccffcc
    style O fill:#ccccff
    style R fill:#ffffcc
```

## Вибір контенту на основі адаптації

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
flowchart TD
    A[Adaptation Decision] --> B[next_difficulty: hard]
    A --> C[next_format: visual]
    A --> D[next_tempo: maintain]
    A --> E[remediation_focus: algebra, derivatives]

    B --> F[Content Filter]
    C --> F
    E --> F

    F --> G[Query Database]
    G --> H[SELECT * FROM content_items<br/>WHERE difficulty = 'hard'<br/>AND format = 'visual'<br/>AND topic IN remediation_focus]

    H --> I{Знайдено контент?}

    I -->|Так| J[Ранжування]
    I -->|Ні| K[Розширити критерії]

    J --> L[Score 1: новизна]
    J --> M[Score 2: відповідність навичкам]
    J --> N[Score 3: популярність]

    L --> O[Комбінований score]
    M --> O
    N --> O

    O --> P[TOP 1 content_item]

    K --> Q[Видалити format constraint]
    Q --> G

    P --> R[Повернути користувачу]

    style F fill:#ffccff
    style J fill:#ccffff
    style P fill:#ccffcc
```

## Зона найближчого розвитку (ZPD)

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
graph TB
    A[Рівень складності] --> B[Too Easy<br/>P_correct > 0.9]
    A --> C[Zone of Proximal Development<br/>0.6 < P_correct < 0.85]
    A --> D[Too Hard<br/>P_correct < 0.5]

    B --> E[Нудьга<br/>Низька мотивація]
    C --> F[Оптимальне навчання<br/>Максимальний прогрес]
    D --> G[Фрустрація<br/>Відмова від навчання]

    E --> H[Adaptation: Збільшити difficulty]
    F --> I[Adaptation: Підтримати рівень]
    G --> J[Adaptation: Зменшити difficulty]

    H --> K[Наступне завдання]
    I --> K
    J --> K

    K --> L[Спостерегти результат]
    L --> A

    style C fill:#ccffcc
    style F fill:#ccffcc
    style I fill:#ccffcc
```

## ML Pipeline: Від даних до рішення

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
flowchart TD
    A[User Interactions] --> B[Raw Events]

    B --> C[Feature Extraction]
    C --> D[17 Metrics]
    C --> E[Historical Context]
    C --> F[User Profile State]

    D --> G[Feature Vector]
    E --> G
    F --> G

    G --> H[Normalization]
    H --> I[Normalized Features<br/>20-30 dimensions]

    I --> J{Model Type}

    J -->|Level A| K[Rules Engine]
    J -->|Level B| L[LinUCB Bandit]
    J -->|Level C| M[IRT/BKT + Policy]

    K --> N[Threshold Logic]
    N --> O[If-Then Rules]

    L --> P[UCB Selection]
    P --> Q[Exploration vs Exploitation]

    M --> R[Ability Estimation theta]
    M --> S[Knowledge State P_L]
    R --> T[Optimal Item Selection]
    S --> T

    O --> U[Action]
    Q --> U
    T --> U

    U --> V[Present Content]
    V --> W[Observe Reward]
    W --> X[Update Model]

    X --> Y{Model Type}
    Y -->|Level A| Z1[No update]
    Y -->|Level B| Z2[Update A and b matrices]
    Y -->|Level C| Z3[Update theta and P_L]

    Z2 --> AA[Next Interaction]
    Z3 --> AA
    Z1 --> AA
    AA --> A

    style I fill:#ccffff
    style U fill:#ffffcc
    style W fill:#ffccff
```

## Архітектура deployment

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
graph TB
    subgraph "Client"
        A[Browser]
    end

    subgraph "Load Balancer"
        B[Nginx]
    end

    subgraph "Frontend Cluster"
        C1[React App 1]
        C2[React App 2]
    end

    subgraph "Backend Cluster"
        D1[FastAPI 1]
        D2[FastAPI 2]
        D3[FastAPI 3]
    end

    subgraph "Background Workers"
        E1[Celery Worker 1]
        E2[Celery Worker 2]
    end

    subgraph "Data Layer"
        F[(PostgreSQL)]
        G[(Redis Cache)]
        H[RabbitMQ]
    end

    subgraph "ML Services"
        I[LLM Service<br/>Ollama/DeepSeek]
        J[Bandit Model Storage]
    end

    A --> B
    B --> C1
    B --> C2

    C1 --> D1
    C2 --> D2
    C1 --> D3

    D1 --> F
    D2 --> F
    D3 --> F

    D1 --> G
    D2 --> G
    D3 --> G

    D1 --> H
    D2 --> H

    E1 --> H
    E2 --> H

    E1 --> I
    E2 --> I

    D1 --> J
    D2 --> J
    D3 --> J

    style F fill:#ffcccc
    style G fill:#ccffcc
    style I fill:#ccccff
    style J fill:#ffffcc
```

## Інтеграція з LLM

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
sequenceDiagram
    participant System as Backend System
    participant Queue as Task Queue
    participant Worker as Celery Worker
    participant LLM as LLM Service
    participant DB as Database

    System->>System: User submits explanation
    System->>DB: Store message

    System->>System: Random(0-1) < 0.2?

    alt Sample for LLM evaluation (20%)
        System->>Queue: Queue async task
        Queue->>Worker: Pick task

        Worker->>LLM: evaluate_awareness(text)
        LLM-->>Worker: awareness_score: 0.75

        Worker->>LLM: analyze_depth(text)
        LLM-->>Worker: depth: 0.6

        Worker->>LLM: classify_error(answer, reference)
        LLM-->>Worker: error_type: "logical"

        Worker->>DB: Store LLM metrics
        Worker->>DB: Update user_profile
    else Skip LLM (80%)
        System->>DB: Store sync metrics only
    end

    System->>System: Continue with adaptation
```

## Експериментальна система (A/B Testing)

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
flowchart LR
    A[New User] --> B{A/B Split}

    B -->|50%| C[Control Group]
    B -->|50%| D[Treatment Group]

    C --> E[Rules Adapter<br/>Level A]
    D --> F[Bandit Adapter<br/>Level B]

    E --> G[Log decisions]
    F --> H[Log decisions]

    G --> I[Experiment Table]
    H --> I

    I --> J[After 2 weeks]

    J --> K[Compare Metrics]

    K --> L[Accuracy]
    K --> M[Engagement]
    K --> N[Satisfaction]
    K --> O[Learning Gain]

    L --> P[Statistical Test]
    M --> P
    N --> P
    O --> P

    P --> Q{Treatment better?}

    Q -->|Так| R[Roll out to 100%]
    Q -->|Ні| S[Keep control]
    Q -->|Neutral| T[Need more data]

    style E fill:#ffcccc
    style F fill:#ccffcc
    style Q fill:#ffffcc
```

## Ключові метрики успіху

```mermaid
graph TD
    A[System Success Metrics] --> B[Learning Outcomes]
    A --> C[User Engagement]
    A --> D[System Performance]

    B --> B1[Knowledge Gain<br/>pre-test vs post-test]
    B --> B2[Topic Mastery Growth<br/>Delta mastery over time]
    B --> B3[Accuracy Improvement<br/>trend]

    C --> C1[Session Duration<br/>optimal: 20-40 min]
    C --> C2[Retention Rate<br/>daily/weekly return]
    C --> C3[Completion Rate<br/>% finished exercises]

    D --> D1[API Response Time<br/>< 200ms p95]
    D --> D2[Adaptation Quality<br/>keep user in ZPD]
    D --> D3[LLM Cost<br/>per evaluation]

    style B fill:#ccffcc
    style C fill:#ffcccc
    style D fill:#ccccff
```

## Резюме: Адаптивний цикл

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
graph LR
    A[1. Користувач<br/>виконує завдання] --> B[2. Система<br/>збирає метрики]

    B --> C[3. Обчислює<br/>17 показників]

    C --> D[4. Оновлює<br/>user_profile]

    D --> E[5. Adaptation Engine<br/>приймає рішення]

    E --> F[6. Вибирає<br/>наступний контент]

    F --> G[7. Представляє<br/>користувачу]

    G --> A

    style E fill:#ffffcc
    style C fill:#ccffff
    style D fill:#ffccff
```

## Bayesian Knowledge Tracing (BKT) - Level C

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
flowchart TD
    A[Початок: Навичка] --> B[Ініціалізація<br/>P_L = P_L0]

    B --> C{Користувач<br/>виконує завдання}

    C --> D[Спостереження:<br/>correct або incorrect]

    D --> E{Результат}

    E -->|Correct| F[P_correct_given_L = 1 - P_S]
    E -->|Incorrect| G[P_incorrect_given_L = P_S]

    E -->|Correct| H[P_correct_given_notL = P_G]
    E -->|Incorrect| I[P_incorrect_given_notL = 1 - P_G]

    F --> J[Bayes Update]
    G --> J
    H --> J
    I --> J

    J --> K[P_L_new = numerator / denominator]

    K --> L[Врахувати learning opportunity:<br/>P_L_final = P_L_new + rest * P_T]

    L --> M{P_L_final > 0.95?}

    M -->|Так| N[Навичка освоєна!]
    M -->|Ні| O[Продовжити навчання]

    O --> C

    N --> P[Перейти до наступної навички]

    subgraph Parameters["BKT Параметри"]
        Q[P_L0 = 0.1 - Prior knowledge]
        R[P_T = 0.1 - Learn probability]
        S[P_S = 0.1 - Slip probability]
        T[P_G = 0.25 - Guess probability]
    end

    style B fill:#ccffff
    style J fill:#ffffcc
    style L fill:#ffccff
    style N fill:#ccffcc
```

## BKT: Формули та стани

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
stateDiagram-v2
    [*] --> NotKnown: P_L0 = 0.1

    NotKnown --> Known: Learn (P_T)
    NotKnown --> NotKnown: No learn (1-P_T)

    Known --> Known: Retain (always)

    state NotKnown {
        [*] --> CanGuess
        CanGuess --> Correct: Guess (P_G)
        CanGuess --> Incorrect: No guess (1-P_G)
    }

    state Known {
        [*] --> CanSlip
        CanSlip --> Incorrect: Slip (P_S)
        CanSlip --> Correct: No slip (1-P_S)
    }

    note right of NotKnown
        User doesn't know skill
        Can answer correctly by guessing
    end note

    note right of Known
        User knows skill
        Can answer incorrectly by mistake
    end note
```

## Rule-Based Adaptation (Level A) - Детальна схема

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
flowchart TD
    A[Отримати метрики користувача] --> B[Витягти ключові показники]

    B --> C[accuracy_last3]
    B --> D[response_time_last]
    B --> E[followups_count]
    B --> F[satisfaction_score]

    C --> G{Difficulty Decision}
    D --> G

    G --> H{accuracy >= 0.8<br/>AND<br/>response_time < 120s?}

    H -->|Так| I[Підвищити difficulty]
    H -->|Ні| J{accuracy < 0.6<br/>OR<br/>response_time > 120s?}

    J -->|Так| K[Знизити difficulty]
    J -->|Ні| L[Залишити difficulty]

    E --> M{Format Decision}
    F --> M

    M --> N{followups >= 5<br/>OR<br/>satisfaction < 3?}

    N -->|Так| O[Змінити format на visual]
    N -->|Ні| P[Залишити поточний format]

    D --> Q{Tempo Decision}

    Q --> R{response_time > 120s?}

    R -->|Так| S[Уповільнити tempo<br/>Менше завдань за раз]
    R -->|Ні| T[Підтримати tempo]

    C --> U{Remediation Decision}

    U --> V[Перевірити topic_mastery]

    V --> W{mastery < 0.5<br/>для якихось тем?}

    W -->|Так| X[Додати теми в<br/>remediation_focus]
    W -->|Ні| Y[Remediation не потрібна]

    I --> Z[Створити Adaptation Decision]
    K --> Z
    L --> Z
    O --> Z
    P --> Z
    S --> Z
    T --> Z
    X --> Z
    Y --> Z

    Z --> AA[Return Decision Object]

    subgraph Thresholds["Пороги системи"]
        TH1[ACCURACY_HIGH = 0.8]
        TH2[ACCURACY_LOW = 0.6]
        TH3[RESPONSE_TIME_SLOW = 120s]
        TH4[FOLLOWUPS_MANY = 5]
        TH5[SATISFACTION_LOW = 3.0]
        TH6[MASTERY_THRESHOLD = 0.5]
    end

    style G fill:#ffcccc
    style M fill:#ccffcc
    style Q fill:#ccccff
    style U fill:#ffffcc
    style Z fill:#ffccff
```

## Rule-Based: Soft Scoring для Gray Zones

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
flowchart LR
    A[Metrics Input] --> B[Normalize Values]

    B --> C[accuracy: 0-1]
    B --> D[response_time: 0-1<br/>normalized to 300s max]
    B --> E[followups: 0-1<br/>normalized to 10 max]

    C --> F[Weight: 0.6]
    D --> G[Weight: -0.3]
    E --> H[Weight: -0.1]

    F --> I[Compute Score]
    G --> I
    H --> I

    I --> J[Score = 0.6*acc - 0.3*time - 0.1*follow]

    J --> K{Score Threshold}

    K -->|Score > 0.5| L[High Performance<br/>Increase difficulty]
    K -->|0.3 < Score <= 0.5| M[Medium Performance<br/>Maintain level]
    K -->|Score <= 0.3| N[Low Performance<br/>Decrease difficulty]

    L --> O[Additional Check:<br/>consistency]
    M --> O
    N --> O

    O --> P{Last 3 scores<br/>consistent?}

    P -->|Так| Q[Apply decision]
    P -->|Ні| R[Wait for more data<br/>Maintain current]

    style I fill:#ffffcc
    style K fill:#ccffff
    style Q fill:#ccffcc
```

## Rules vs Bandit vs BKT: Порівняння

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
graph TB
    A[Adaptation Approaches] --> B[Level A: Rules]
    A --> C[Level B: Bandit]
    A --> D[Level C: BKT/IRT]

    B --> B1[Pros]
    B1 --> B1a[Швидко - milliseconds]
    B1 --> B1b[Прозоро - легко зрозуміти]
    B1 --> B1c[Не потрібні дані для навчання]
    B1 --> B1d[Легко налаштувати]

    B --> B2[Cons]
    B2 --> B2a[Не адаптується до даних]
    B2 --> B2b[Фіксовані пороги]
    B2 --> B2c[Не враховує індивідуальність]

    C --> C1[Pros]
    C1 --> C1a[Онлайн навчання]
    C1 --> C1b[Баланс exploration/exploitation]
    C1 --> C1c[Адаптується до користувача]
    C1 --> C1d[Швидко збігається]

    C --> C2[Cons]
    C2 --> C2a[Потрібні дані для навчання]
    C2 --> C2b[Складніше налагодити]
    C2 --> C2c[Може застрягти в локальних оптимумах]

    D --> D1[Pros]
    D1 --> D1a[Науково обгрунтовано]
    D1 --> D1b[Психометричні моделі]
    D1 --> D1c[Точна оцінка знань]
    D1 --> D1d[Довгострокове планування]

    D --> D2[Cons]
    D2 --> D2a[Складна імплементація]
    D2 --> D2b[Потрібно багато даних]
    D2 --> D2c[Вища обчислювальна вартість]
    D2 --> D2d[Складна калібрування]

    B --> E1[Use Case:<br/>MVP, прототип]
    C --> E2[Use Case:<br/>Production система]
    D --> E3[Use Case:<br/>Дослідження, академія]

    style B fill:#ffcccc
    style C fill:#ccffcc
    style D fill:#ccccff
```

## Приклад роботи Rule-Based системи

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontSize':'20px'}}}%%
sequenceDiagram
    participant U as User
    participant S as System
    participant R as Rules Engine
    participant DB as Database

    U->>S: Відповідає на завдання
    S->>DB: Зберегти відповідь
    S->>S: Обчислити метрики

    Note over S: accuracy = 0.85<br/>response_time = 45s<br/>followups = 2<br/>satisfaction = 4

    S->>R: Запит адаптації

    R->>R: Перевірка accuracy >= 0.8? YES
    R->>R: Перевірка response_time < 120s? YES
    R->>R: Рішення: INCREASE difficulty

    R->>R: Перевірка followups >= 5? NO
    R->>R: Перевірка satisfaction < 3? NO
    R->>R: Рішення: MAINTAIN format

    R->>R: Перевірка response_time > 120s? NO
    R->>R: Рішення: MAINTAIN tempo

    R->>DB: Отримати topic_mastery
    DB-->>R: algebra: 0.45, geometry: 0.75

    R->>R: algebra < 0.5? YES
    R->>R: Рішення: remediation = [algebra]

    R->>S: Decision:<br/>difficulty: hard<br/>format: text<br/>tempo: maintain<br/>remediation: [algebra]

    S->>DB: Знайти контент<br/>WHERE difficulty=hard<br/>AND topic=algebra

    DB-->>S: content_item

    S->>U: Представити складніше завдання з алгебри

    Note over U,S: Користувач добре справився,<br/>тому система підвищила складність<br/>і фокусується на слабкій темі
```

---

## Пояснення компонентів

### Frontend (React)
- **Dashboard**: Огляд прогресу, рекомендації
- **Learning Interface**: Основний екран навчання з чатом і контентом
- **Profile**: Налаштування та статистика користувача

### Backend (FastAPI)
- **API Layer**: REST endpoints для CRUD операцій
- **Services Layer**: Бізнес-логіка (UserService, DialogService, MetricsService)
- **Adaptation Engine**: Мозок системи - приймає рішення про адаптацію
- **Metrics Processor**: Обчислює 17 метрик і оновлює профілі

### Database (PostgreSQL)
- **users**: Облікові записи
- **dialogs**: Сесії навчання
- **messages**: Повідомлення в діалогах
- **content_items**: Навчальні матеріали з метаданими
- **metrics**: Часові ряди метрик
- **user_profiles**: Агреговані дані про користувачів

### Adaptation Levels
- **Level A (Rules)**: Прості пороги - швидко, прозоро, MVP
- **Level B (Bandit)**: Контекстний бандит - баланс простоти та продуктивності
- **Level C (IRT/BKT)**: Психометричні моделі - науково обґрунтовано

### LLM Integration
- **Асинхронне обчислення** складних метрик (awareness, depth, error patterns)
- **Вибіркова обробка**: 10-20% взаємодій для оптимізації вартості
- **Генерація контенту**: Підказки, перефразування

### Ключові принципи
1. **Зона найближчого розвитку**: Утримання P(correct) ≈ 0.65-0.75
2. **Персоналізація**: Адаптація складності, формату, темпу
3. **Онлайн навчання**: Модель покращується з кожною взаємодією
4. **Метрики**: 17 різних вимірів для повної картини
5. **Модульність**: Легко замінювати компоненти

---

Ця схема демонструє повний цикл роботи адаптивної системи навчання від взаємодії користувача до прийняття рішень про наступний контент.
