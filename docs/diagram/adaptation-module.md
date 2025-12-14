# Алгоритмічна структура адаптаційного модуля

## Рис. 3.3 – Багаторівнева адаптація

```mermaid
graph TB
    subgraph "Вхідні дані"
        Metrics[17 метрик<br/>користувача]
        Profile[Профіль<br/>користувача]
    end

    subgraph "Рівень A: Rules-based"
        Rules[Порогові правила:<br/>точність > поріг → складність↑<br/>точність < поріг → складність↓<br/>багато спроб → формат↔]
    end

    subgraph "Рівень B: Contextual Bandit"
        Context[Контекст:<br/>метрики + профіль]
        LinUCB[LinUCB алгоритм]
        Actions[Дії arms:<br/>text/normal<br/>visual/easy<br/>interactive/hard]
        Reward[Винагорода:<br/>точність + підказки<br/>+ задоволеність]
    end

    subgraph "Рівень C: Психометричні моделі"
        IRT[IRT<br/>латентна здібність]
        BKT[BKT<br/>засвоєння навичок]
        Future[Перспективний<br/>напрямок]
    end

    subgraph "LLM сервіс"
        LLM[Асинхронна обробка:<br/>- усвідомленість<br/>- глибина пояснення<br/>- класифікація помилок<br/>- підказки]
    end

    subgraph "Вихід"
        Decision[Рішення адаптації:<br/>формат + складність]
    end

    Metrics --> Rules
    Profile --> Rules

    Metrics --> Context
    Profile --> Context
    Context --> LinUCB
    LinUCB --> Actions
    Actions --> Reward
    Reward --> LinUCB

    Metrics --> IRT
    Profile --> BKT
    IRT --> Future
    BKT --> Future

    Metrics --> LLM
    LLM --> Metrics

    Rules --> Decision
    Actions --> Decision
    Future -.-> Decision

    classDef input fill:#4f46e5,stroke:#312e81,color:#fff
    classDef levelA fill:#10b981,stroke:#047857,color:#fff
    classDef levelB fill:#f59e0b,stroke:#d97706,color:#fff
    classDef levelC fill:#8b5cf6,stroke:#6d28d9,color:#fff
    classDef llm fill:#06b6d4,stroke:#0e7490,color:#fff
    classDef output fill:#ef4444,stroke:#b91c1c,color:#fff

    class Metrics,Profile input
    class Rules levelA
    class Context,LinUCB,Actions,Reward levelB
    class IRT,BKT,Future levelC
    class LLM llm
    class Decision output
```

## Опис рівнів адаптації

### Рівень A: Rules-based адаптація
- Порогові значення ключових метрик
- Прозорі правила зміни складності
- Працює без попереднього навчання
- Базовий механізм адаптації

### Рівень B: Contextual Bandit (LinUCB)
- Контекст: 17 метрик + профіль користувача
- Дії (arms): комбінації формату та складності
- Винагорода: точність + підказки + задоволеність
- Балансує exploration vs exploitation

### Рівень C: Психометричні моделі (перспектива)
- **IRT**: оцінка латентної здібності
- **BKT**: відстеження засвоєння навичок
- Закладено в архітектурі
- Не реалізовано в поточному прототипі

### LLM сервіс
- Асинхронна обробка складних метрик
- Оцінка усвідомленості та глибини пояснень
- Класифікація типів помилок
- Генерація контекстних підказок
