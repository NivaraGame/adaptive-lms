# Схема збору та агрегування метрик користувача

## Рис. 3.2 – Конвеєр обробки метрик

```mermaid
graph LR
    subgraph "Взаємодія"
        User[Користувач]
        Dialog[Діалог]
    end

    subgraph "Типи діалогів"
        Educational[Освітній<br/>Educational]
        Test[Тестовий<br/>Test]
        Assessment[Оціночний<br/>Assessment]
        Reflective[Рефлективний<br/>Reflective]
    end

    subgraph "Збір даних"
        Messages[(Messages<br/>Таблиця)]
    end

    subgraph "Обчислення метрик"
        Sync[Синхронні метрики:<br/>точність, час,<br/>спроби, запити]
        Async[Асинхронні метрики:<br/>усвідомленість,<br/>помилки, патерни]
        LLM[LLM сервіс]
    end

    subgraph "Агрегація"
        MetricsTable[(Metrics<br/>Таблиця)]
        EMA[EMA<br/>агрегатори]
    end

    subgraph "Профіль"
        Profile[(User Profile<br/>JSONB)]
    end

    User --> Dialog
    Dialog --> Educational
    Dialog --> Test
    Dialog --> Assessment
    Dialog --> Reflective

    Educational --> Messages
    Test --> Messages
    Assessment --> Messages
    Reflective --> Messages

    Messages --> Sync
    Messages --> Async
    Async --> LLM

    Sync --> MetricsTable
    LLM --> MetricsTable

    MetricsTable --> EMA
    EMA --> Profile

    classDef interaction fill:#4f46e5,stroke:#312e81,color:#fff
    classDef dialogType fill:#10b981,stroke:#047857,color:#fff
    classDef storage fill:#f59e0b,stroke:#d97706,color:#fff
    classDef processing fill:#8b5cf6,stroke:#6d28d9,color:#fff
    classDef aggregation fill:#06b6d4,stroke:#0e7490,color:#fff

    class User,Dialog interaction
    class Educational,Test,Assessment,Reflective dialogType
    class Messages,MetricsTable,Profile storage
    class Sync,Async,LLM processing
    class EMA aggregation
```

## 17 навчальних метрик (4 категорії)

**Освітні (Educational):**
- Тривалість взаємодії
- Кількість уточнювальних запитів
- Суб'єктивна зрозумілість

**Тестові (Test):**
- Точність відповідей
- Час реагування
- Кількість спроб
- Рівень складності завдання

**Оціночні (Assessment):**
- Переваги формату подачі
- Типові помилки
- Задоволеність процесом
- Темп навчання

**Рефлективні (Reflective):**
- Рівень усвідомленості
- Глибина пояснень
- Впевненість у відповідях
