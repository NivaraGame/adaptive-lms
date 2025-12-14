# Цикл адаптації навчального процесу

## Рис. 3.4 – Adaptation Loop (5 етапів)

```mermaid
graph TB
    subgraph "Етап 1: Виконання завдання"
        User[Користувач виконує завдання]
        Events[Фіксація подій взаємодії]
    end

    subgraph "Етап 2: Обробка метрик"
        MetricsProc[Metrics Processor:<br/>- Агрегація значень<br/>- EMA згладжування<br/>- Оновлення профілю]
    end

    subgraph "Етап 3: Прийняття рішень"
        Engine[Adaptation Engine]
        D1[next_difficulty<br/>рівень складності]
        D2[next_format<br/>формат подачі]
        D3[next_tempo<br/>швидкість навчання]
        D4[remediation_focus<br/>проблемні теми]
    end

    subgraph "Етап 4: Відбір контенту"
        ContentSvc[Content Service:<br/>- Фільтрація за складністю<br/>- Фільтрація за форматом<br/>- Ранжування за потребами]
    end

    subgraph "Етап 5: Представлення"
        Present[Представлення<br/>наступного завдання]
    end

    User --> Events
    Events --> MetricsProc
    MetricsProc --> Engine

    Engine --> D1
    Engine --> D2
    Engine --> D3
    Engine --> D4

    D1 --> ContentSvc
    D2 --> ContentSvc
    D3 --> ContentSvc
    D4 --> ContentSvc

    ContentSvc --> Present
    Present --> User

    classDef stage1 fill:#4f46e5,stroke:#312e81,color:#fff
    classDef stage2 fill:#10b981,stroke:#047857,color:#fff
    classDef stage3 fill:#f59e0b,stroke:#d97706,color:#fff
    classDef stage4 fill:#8b5cf6,stroke:#6d28d9,color:#fff
    classDef stage5 fill:#06b6d4,stroke:#0e7490,color:#fff

    class User,Events stage1
    class MetricsProc stage2
    class Engine,D1,D2,D3,D4 stage3
    class ContentSvc stage4
    class Present stage5
```

## П'ять етапів циклу адаптації

### Етап 1: Виконання завдання
- Користувач виконує навчальне завдання
- Фіксація подій взаємодії
- Обчислення первинних метрик

### Етап 2: Обробка метрик (Metrics Processor)
- Агрегація отриманих значень
- Застосування експоненційних середніх (EMA)
- Інтерпретація поведінкових патернів
- Оновлення профілю користувача

### Етап 3: Прийняття рішень (Adaptation Engine)
Чотири ключові педагогічні рішення:
- **next_difficulty**: рівень складності наступного завдання
- **next_format**: формат подачі (текст/візуал/відео/інтерактив)
- **next_tempo**: швидкість та обсяг матеріалу
- **remediation_focus**: теми для додаткового опрацювання

### Етап 4: Відбір контенту (Content Service)
- Фільтрація за рівнем складності
- Фільтрація за форматом подачі
- Фільтрація за темою та вимогами
- Ранжування за специфічними потребами користувача

### Етап 5: Представлення
- Представлення рекомендованого завдання користувачу
- Запуск нового циклу взаємодії

## Педагогічний фундамент

**Принцип Зони Найближчого Розвитку (ЗНР):**
- Завдання є посильними, але потребують зусиль
- Уникнення надто легкого або складного матеріалу
- Оптимальне навантаження для стійкого засвоєння знань
