"""
Content generator for realistic lesson/exercise/quiz data

Generates schema-complete, realistic content aligned with README specifications:
- All content is TEXT-BASED (even for visual/video/interactive formats)
- Answers are included in description field for easy demo verification
- Generates: subtopic, skills, prerequisites, hints, explanations, reference_answer
"""

import re


def slugify(text):
    """Convert text to snake_case subtopic identifier"""
    # Remove special chars, convert to lowercase, replace spaces with underscores
    slug = re.sub(r'[^\w\s-]', '', text.lower())
    slug = re.sub(r'[-\s]+', '_', slug)
    return slug


def derive_subtopic(title, topic):
    """Automatically derive subtopic from title"""
    # Use slugified title as subtopic for consistency
    return slugify(title)


def derive_skills(title, topic, content_type):
    """Generate realistic skill tags"""
    base_slug = slugify(title)
    topic_slug = slugify(topic)

    skills = []

    # General skill based on topic
    skills.append(topic_slug)

    # Specific skill based on title
    skills.append(base_slug)

    # Type-specific skills
    if content_type == "lesson":
        skills.append(f"{base_slug}_theory")
    elif content_type == "exercise":
        skills.append(f"{base_slug}_practice")
    elif content_type == "quiz":
        skills.append(f"{base_slug}_assessment")

    return skills[:3]  # Limit to 3 skills for clarity


def derive_prerequisites(difficulty, topic, title):
    """Infer prerequisites based on difficulty and context"""
    if difficulty == "easy":
        # Easy content has minimal or no prerequisites
        return []

    topic_slug = slugify(topic)

    if difficulty == "normal":
        # Normal requires basic understanding
        return [f"{topic_slug}_basics"]
    elif difficulty == "hard":
        # Hard requires normal-level understanding
        return [f"{topic_slug}_basics", f"{topic_slug}_intermediate"]
    elif difficulty == "challenge":
        # Challenge requires comprehensive understanding
        return [f"{topic_slug}_basics", f"{topic_slug}_intermediate", f"{topic_slug}_advanced"]

    return []


def get_lesson_content(title, topic, description):
    """Generate full lesson content with schema-complete fields"""
    lessons = {
        "HTTP Protocol Basics": {
            "introduction": "HTTP (Hypertext Transfer Protocol) is the foundation of data communication on the web.",
            "sections": [
                {"heading": "HTTP Methods", "content": "GET retrieves data, POST submits data, PUT updates resources, DELETE removes resources."},
                {"heading": "Status Codes", "content": "200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Internal Server Error."},
                {"heading": "Headers", "content": "Content-Type, Authorization, Accept headers control request/response behavior."}
            ],
            "key_points": ["HTTP is stateless", "Methods define operations", "Status codes indicate results"]
        },
        "HTML5 Semantic Elements": {
            "introduction": "Semantic HTML elements clearly describe their meaning to browsers and developers.",
            "sections": [
                {"heading": "Structure Elements", "content": "<header>, <nav>, <main>, <footer> define page structure."},
                {"heading": "Content Elements", "content": "<article>, <section>, <aside> organize content meaningfully."},
                {"heading": "Benefits", "content": "Better SEO, accessibility, and code readability."}
            ],
            "key_points": ["Use semantic tags over <div>", "Improves accessibility", "Search engines understand structure"]
        },
        "Variables: let, const, var": {
            "introduction": "JavaScript has three ways to declare variables, each with different scoping rules.",
            "sections": [
                {"heading": "let", "content": "Block-scoped, can be reassigned, not hoisted to top."},
                {"heading": "const", "content": "Block-scoped, cannot be reassigned, must be initialized."},
                {"heading": "var", "content": "Function-scoped, hoisted, avoid in modern code."}
            ],
            "key_points": ["Prefer const by default", "Use let when reassignment needed", "Avoid var"]
        },
        "React Components Basics": {
            "introduction": "Components are the building blocks of React applications.",
            "sections": [
                {"heading": "Functional Components", "content": "JavaScript functions that return JSX, recommended approach."},
                {"heading": "Props", "content": "Data passed from parent to child components, read-only."},
                {"heading": "Component Composition", "content": "Build complex UIs from simple, reusable components."}
            ],
            "key_points": ["Components are reusable", "Props flow down", "Composition over inheritance"]
        },
        "Radio Wave Propagation": {
            "introduction": "Understanding how radio waves travel is essential for military communications.",
            "sections": [
                {"heading": "Wave Characteristics", "content": "Frequency, wavelength, amplitude determine propagation behavior."},
                {"heading": "Propagation Modes", "content": "Ground wave, sky wave, line-of-sight transmission."},
                {"heading": "Environmental Factors", "content": "Terrain, weather, time of day affect signal strength."}
            ],
            "key_points": ["Higher frequency = shorter range", "Obstacles block signals", "Atmospheric conditions matter"]
        },
        "COMSEC Fundamentals": {
            "introduction": "Communications Security (COMSEC) protects classified information transmitted via telecommunications.",
            "sections": [
                {"heading": "COMSEC Principles", "content": "Protect transmission content, sender/receiver identity, and traffic patterns."},
                {"heading": "Physical Security", "content": "Secure cryptographic materials, equipment, and key distribution."},
                {"heading": "Transmission Security", "content": "Minimize intercept probability through proper procedures."}
            ],
            "key_points": ["Protect equipment and keys", "Follow procedures strictly", "Maintain radio discipline"]
        },
        "Communication Plan Development": {
            "introduction": "A communication plan (COMPLAN) ensures reliable tactical communications.",
            "sections": [
                {"heading": "Planning Factors", "content": "Mission requirements, terrain, available equipment, and security."},
                {"heading": "Frequency Management", "content": "Allocate frequencies to avoid interference and enable coordination."},
                {"heading": "Backup Plans", "content": "Primary, alternate, contingency, and emergency (PACE) communications."}
            ],
            "key_points": ["Plan for mission success", "Redundancy is critical", "Test before operations"]
        }
    }

    default = {
        "introduction": description,
        "sections": [
            {"heading": "Overview", "content": f"This lesson covers {title.lower()}."},
            {"heading": "Key Concepts", "content": f"Essential principles of {topic.replace('_', ' ').lower()}."},
            {"heading": "Applications", "content": f"How to apply {title.lower()} in practice."}
        ],
        "key_points": [f"Understand {title}", f"Apply concepts", "Practice regularly"]
    }

    return lessons.get(title, default)


def get_exercise_content(title, topic, description):
    """Generate exercise problem with schema-complete fields"""
    exercises = {
        "CSS Box Model": {
            "question": "Create a div with: 20px margin, 15px padding, 2px solid border, 300px width",
            "starter_code": "<div class=\"box\">Content</div>\n\n<style>\n.box {\n  /* Your CSS here */\n}\n</style>",
            "solution": ".box {\n  margin: 20px;\n  padding: 15px;\n  border: 2px solid black;\n  width: 300px;\n}",
            "test_cases": ["Check computed width", "Verify spacing", "Inspect border"],
            "hints": ["Remember: total width = width + padding + border + margin", "Use browser DevTools to inspect"],
            "explanations": [
                "The box model consists of content, padding, border, and margin in that order from inside out.",
                "Total element space = content width + left/right padding + left/right border + left/right margin."
            ]
        },
        "Flexbox Layout": {
            "question": "Create a horizontal navbar with space-between alignment using flexbox",
            "starter_code": "<nav>\n  <div>Logo</div>\n  <div>Menu</div>\n  <div>Profile</div>\n</nav>",
            "solution": "nav {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}",
            "test_cases": ["Items spread across", "Vertical centering", "Responsive behavior"],
            "hints": ["Use display: flex on parent container", "justify-content controls horizontal spacing"],
            "explanations": [
                "Flexbox is a one-dimensional layout model for arranging items in rows or columns.",
                "justify-content: space-between distributes items evenly with first item at start, last at end."
            ]
        },
        "Arrow Functions": {
            "question": "Convert this function to arrow syntax: function double(x) { return x * 2; }",
            "starter_code": "const double = ",
            "solution": "const double = (x) => x * 2;",
            "test_cases": ["double(5) === 10", "double(0) === 0", "Works with negatives"],
            "hints": ["Arrow functions use => syntax", "Single expression can omit return and braces"],
            "explanations": [
                "Arrow functions provide concise syntax for function expressions.",
                "For single-expression functions, you can omit curly braces and the return keyword."
            ]
        },
        "Array Methods: map, filter, reduce": {
            "question": "Given [1,2,3,4,5], filter evens, double them, sum the result",
            "starter_code": "const nums = [1,2,3,4,5];\nconst result = ",
            "solution": "const result = nums.filter(n => n % 2 === 0).map(n => n * 2).reduce((a,b) => a + b, 0);",
            "test_cases": ["Result is 12", "Uses filter, map, reduce", "No loops"],
            "hints": ["Chain methods: filter -> map -> reduce", "filter evens: n % 2 === 0"],
            "explanations": [
                "filter() creates new array with elements passing a test. map() transforms each element. reduce() combines them.",
                "Method chaining allows functional composition: output of one method becomes input of next."
            ]
        },
        "JSX Syntax": {
            "question": "Create a component that renders <h1>Hello {name}</h1> where name is a prop",
            "starter_code": "function Greeting(props) {\n  return (\n    // Your JSX here\n  );\n}",
            "solution": "function Greeting(props) {\n  return <h1>Hello {props.name}</h1>;\n}",
            "test_cases": ["Renders h1", "Uses prop correctly", "No errors"],
            "hints": ["Access props using props.name", "Use curly braces {} for JavaScript expressions in JSX"],
            "explanations": [
                "JSX allows you to write HTML-like syntax in JavaScript, which React converts to React.createElement calls.",
                "Curly braces {} let you embed any JavaScript expression within JSX markup."
            ]
        },
        "State with useState Hook": {
            "question": "Create a counter component with increment/decrement buttons using useState",
            "starter_code": "import { useState } from 'react';\n\nfunction Counter() {\n  // Your code\n}",
            "solution": "const [count, setCount] = useState(0);\nreturn (\n  <div>\n    <button onClick={() => setCount(count - 1)}>-</button>\n    <span>{count}</span>\n    <button onClick={() => setCount(count + 1)}>+</button>\n  </div>\n);",
            "test_cases": ["Initial count is 0", "Buttons work", "State updates"],
            "hints": ["useState returns [value, setValue]", "Call setValue to update state"],
            "explanations": [
                "useState is a React Hook that adds state to functional components.",
                "Calling the setter function (setCount) triggers a re-render with the new state value."
            ]
        },
        "Radio Set Operation": {
            "question": "List the 5-step procedure to establish voice communication on a tactical radio",
            "starter_code": "1. ___\n2. ___\n3. ___\n4. ___\n5. ___",
            "solution": "1. Power on radio and check battery\n2. Set to assigned frequency\n3. Adjust squelch and volume\n4. Perform radio check\n5. Begin transmission using proper procedures",
            "test_cases": ["All steps present", "Correct order", "Proper terminology"],
            "hints": ["Start with power and battery check", "Always perform radio check before operations"],
            "explanations": [
                "Proper radio startup prevents communication failures in tactical situations.",
                "Radio checks verify signal quality before critical transmissions."
            ]
        },
        "Crypto Key Management": {
            "question": "Describe the procedure for loading new crypto keys into a tactical radio",
            "starter_code": "Procedure:\n",
            "solution": "1. Verify authorization for key change\n2. Connect fill device to radio\n3. Enter authentication code\n4. Select correct key set\n5. Initiate transfer\n6. Verify successful load\n7. Secure fill device\n8. Document key change",
            "test_cases": ["Security steps included", "Proper sequence", "Documentation mentioned"],
            "hints": ["Always verify authorization first", "Document all key changes"],
            "explanations": [
                "Key management procedures prevent unauthorized access to encrypted communications.",
                "Documentation creates audit trail for security compliance."
            ]
        },
        "Frequency Allocation": {
            "question": "Given 3 platoons and 1 command net, allocate frequencies avoiding interference",
            "starter_code": "Available: 30.000-30.500 MHz\nCommand Net: ___\nPlatoon 1: ___\nPlatoon 2: ___\nPlatoon 3: ___",
            "solution": "Command Net: 30.000 MHz\nPlatoon 1: 30.100 MHz\nPlatoon 2: 30.200 MHz\nPlatoon 3: 30.300 MHz\n(Minimum 50 kHz separation)",
            "test_cases": ["Adequate separation", "Within band", "No conflicts"],
            "hints": ["Maintain minimum 50 kHz separation", "Assign command net first"],
            "explanations": [
                "Adequate frequency separation prevents adjacent channel interference.",
                "Command net gets priority allocation to ensure C2 communications."
            ]
        }
    }

    default = {
        "question": f"Complete the following task: {description}",
        "starter_code": f"// {title}\n// Your solution here",
        "solution": f"// Sample solution for {title}",
        "test_cases": ["Correct output", "Follows best practices", "No errors"],
        "hints": ["Read the requirements carefully", "Test your solution"],
        "explanations": [
            f"This exercise tests your understanding of {title.lower()}.",
            "Break down the problem into smaller steps for easier solving."
        ]
    }

    return exercises.get(title, default)


def get_quiz_content(title, topic, description):
    """Generate quiz question with schema-complete fields"""
    quizzes = {
        "HTTP Protocol Basics": {
            "question": "Which HTTP status code indicates a successful request?",
            "options": ["200 OK", "404 Not Found", "500 Internal Server Error", "301 Moved Permanently"],
            "correct_answer": "200 OK",
            "explanation": "200 OK indicates the request succeeded. 404 means not found, 500 is server error, 301 is redirect.",
            "hints": ["2xx codes indicate success", "4xx codes indicate client errors"],
            "explanations": [
                "HTTP status codes are grouped: 2xx (success), 3xx (redirect), 4xx (client error), 5xx (server error).",
                "200 OK is the most common success code, meaning the request was processed successfully."
            ]
        },
        "Variables: let, const, var": {
            "question": "Which keyword should you use for a value that won't change?",
            "options": ["const", "let", "var", "static"],
            "correct_answer": "const",
            "explanation": "const declares constants that cannot be reassigned. Use let for variables that change.",
            "hints": ["const means constant (unchanging)", "let allows reassignment"],
            "explanations": [
                "const creates a read-only reference to a value, preventing reassignment.",
                "Using const by default makes code more predictable and prevents accidental mutations."
            ]
        },
        "React Components Basics": {
            "question": "What do React functional components return?",
            "options": ["JSX", "HTML", "JavaScript", "CSS"],
            "correct_answer": "JSX",
            "explanation": "Functional components return JSX (JavaScript XML), which describes the UI.",
            "hints": ["JSX looks like HTML but is JavaScript", "React converts JSX to createElement calls"],
            "explanations": [
                "JSX is a syntax extension that allows writing HTML-like code in JavaScript.",
                "React transforms JSX into React.createElement() calls during compilation."
            ]
        },
        "Radio Wave Propagation": {
            "question": "Which propagation mode bounces signals off the ionosphere?",
            "options": ["Sky wave", "Ground wave", "Line-of-sight", "Direct wave"],
            "correct_answer": "Sky wave",
            "explanation": "Sky wave propagation uses ionospheric reflection for long-distance HF communications.",
            "hints": ["Think about long-distance HF communications", "The ionosphere is in the sky"],
            "explanations": [
                "Sky wave propagation reflects radio waves off ionospheric layers, enabling beyond-horizon communication.",
                "This mode is most effective for HF frequencies (3-30 MHz) and varies with time of day."
            ]
        },
        "COMSEC Fundamentals": {
            "question": "What does COMSEC protect?",
            "options": ["All of the above", "Transmission content", "Crypto equipment", "Communication patterns"],
            "correct_answer": "All of the above",
            "explanation": "COMSEC protects transmission content, equipment, and traffic analysis indicators.",
            "hints": ["COMSEC is comprehensive security", "Consider content, equipment, and patterns"],
            "explanations": [
                "COMSEC encompasses protection of classified/sensitive information on telecommunications systems.",
                "Effective COMSEC prevents adversaries from gaining intelligence through interception or traffic analysis."
            ]
        }
    }

    default = {
        "question": f"What is the main concept of {title}?",
        "options": [description[:50], "Unrelated option A", "Unrelated option B", "Unrelated option C"],
        "correct_answer": description[:50],
        "explanation": f"{title} involves understanding {description.lower()}.",
        "hints": ["Review the lesson material", "Eliminate obviously wrong answers"],
        "explanations": [
            f"This question tests your understanding of {title.lower()}.",
            "Multiple-choice questions often have distractor options that seem plausible but are incorrect."
        ]
    }

    return quizzes.get(title, default)


def generate_hints(content_type, title):
    """Generate generic hints based on content type"""
    if content_type == "lesson":
        return [
            "Take notes on key concepts",
            "Review examples carefully"
        ]
    elif content_type == "exercise":
        return [
            "Break the problem into smaller steps",
            "Test your solution incrementally"
        ]
    elif content_type == "quiz":
        return [
            "Eliminate obviously wrong answers first",
            "Read the question carefully"
        ]
    return ["Review related material", "Take your time"]


def generate_explanations(content_type, title, topic):
    """Generate generic explanations based on content type"""
    if content_type == "lesson":
        return [
            f"This lesson introduces fundamental concepts in {topic.replace('_', ' ').lower()}.",
            f"Understanding {title.lower()} is essential for progressing to advanced topics."
        ]
    elif content_type == "exercise":
        return [
            f"This exercise applies concepts from {title.lower()} in a practical scenario.",
            "Practice exercises reinforce learning and build problem-solving skills."
        ]
    elif content_type == "quiz":
        return [
            f"This quiz assesses your comprehension of {title.lower()}.",
            "Quiz questions help identify knowledge gaps and reinforce key concepts."
        ]
    return [f"Content related to {title}", "Complete to progress"]
