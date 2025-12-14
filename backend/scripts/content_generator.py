"""
Content generator for realistic lesson/exercise/quiz data
"""

def get_lesson_content(title, topic, description):
    """Generate full lesson content"""
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
    """Generate exercise problem"""
    exercises = {
        "CSS Box Model": {
            "question": "Create a div with: 20px margin, 15px padding, 2px solid border, 300px width",
            "starter_code": "<div class=\"box\">Content</div>\n\n<style>\n.box {\n  /* Your CSS here */\n}\n</style>",
            "solution": ".box {\n  margin: 20px;\n  padding: 15px;\n  border: 2px solid black;\n  width: 300px;\n}",
            "test_cases": ["Check computed width", "Verify spacing", "Inspect border"]
        },
        "Flexbox Layout": {
            "question": "Create a horizontal navbar with space-between alignment using flexbox",
            "starter_code": "<nav>\n  <div>Logo</div>\n  <div>Menu</div>\n  <div>Profile</div>\n</nav>",
            "solution": "nav {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}",
            "test_cases": ["Items spread across", "Vertical centering", "Responsive behavior"]
        },
        "Arrow Functions": {
            "question": "Convert this function to arrow syntax: function double(x) { return x * 2; }",
            "starter_code": "const double = ",
            "solution": "const double = (x) => x * 2;",
            "test_cases": ["double(5) === 10", "double(0) === 0", "Works with negatives"]
        },
        "Array Methods: map, filter, reduce": {
            "question": "Given [1,2,3,4,5], filter evens, double them, sum the result",
            "starter_code": "const nums = [1,2,3,4,5];\nconst result = ",
            "solution": "const result = nums.filter(n => n % 2 === 0).map(n => n * 2).reduce((a,b) => a + b, 0);",
            "test_cases": ["Result is 12", "Uses filter, map, reduce", "No loops"]
        },
        "JSX Syntax": {
            "question": "Create a component that renders <h1>Hello {name}</h1> where name is a prop",
            "starter_code": "function Greeting(props) {\n  return (\n    // Your JSX here\n  );\n}",
            "solution": "function Greeting(props) {\n  return <h1>Hello {props.name}</h1>;\n}",
            "test_cases": ["Renders h1", "Uses prop correctly", "No errors"]
        },
        "State with useState Hook": {
            "question": "Create a counter component with increment/decrement buttons using useState",
            "starter_code": "import { useState } from 'react';\n\nfunction Counter() {\n  // Your code\n}",
            "solution": "const [count, setCount] = useState(0);\nreturn (\n  <div>\n    <button onClick={() => setCount(count - 1)}>-</button>\n    <span>{count}</span>\n    <button onClick={() => setCount(count + 1)}>+</button>\n  </div>\n);",
            "test_cases": ["Initial count is 0", "Buttons work", "State updates"]
        },
        "Radio Set Operation": {
            "question": "List the 5-step procedure to establish voice communication on a tactical radio",
            "starter_code": "1. ___\n2. ___\n3. ___\n4. ___\n5. ___",
            "solution": "1. Power on radio and check battery\n2. Set to assigned frequency\n3. Adjust squelch and volume\n4. Perform radio check\n5. Begin transmission using proper procedures",
            "test_cases": ["All steps present", "Correct order", "Proper terminology"]
        },
        "Crypto Key Management": {
            "question": "Describe the procedure for loading new crypto keys into a tactical radio",
            "starter_code": "Procedure:\n",
            "solution": "1. Verify authorization for key change\n2. Connect fill device to radio\n3. Enter authentication code\n4. Select correct key set\n5. Initiate transfer\n6. Verify successful load\n7. Secure fill device\n8. Document key change",
            "test_cases": ["Security steps included", "Proper sequence", "Documentation mentioned"]
        },
        "Frequency Allocation": {
            "question": "Given 3 platoons and 1 command net, allocate frequencies avoiding interference",
            "starter_code": "Available: 30.000-30.500 MHz\nCommand Net: ___\nPlatoon 1: ___\nPlatoon 2: ___\nPlatoon 3: ___",
            "solution": "Command Net: 30.000 MHz\nPlatoon 1: 30.100 MHz\nPlatoon 2: 30.200 MHz\nPlatoon 3: 30.300 MHz\n(Minimum 50 kHz separation)",
            "test_cases": ["Adequate separation", "Within band", "No conflicts"]
        }
    }

    default = {
        "question": f"Complete the following task: {description}",
        "starter_code": f"// {title}\n// Your solution here",
        "solution": f"// Sample solution for {title}",
        "test_cases": ["Correct output", "Follows best practices", "No errors"]
    }

    return exercises.get(title, default)


def get_quiz_content(title, topic, description):
    """Generate quiz question"""
    quizzes = {
        "HTTP Protocol Basics": {
            "question": "Which HTTP status code indicates a successful request?",
            "options": ["200 OK", "404 Not Found", "500 Internal Server Error", "301 Moved Permanently"],
            "correct_answer": "200 OK",
            "explanation": "200 OK indicates the request succeeded. 404 means not found, 500 is server error, 301 is redirect."
        },
        "Variables: let, const, var": {
            "question": "Which keyword should you use for a value that won't change?",
            "options": ["const", "let", "var", "static"],
            "correct_answer": "const",
            "explanation": "const declares constants that cannot be reassigned. Use let for variables that change."
        },
        "React Components Basics": {
            "question": "What do React functional components return?",
            "options": ["JSX", "HTML", "JavaScript", "CSS"],
            "correct_answer": "JSX",
            "explanation": "Functional components return JSX (JavaScript XML), which describes the UI."
        },
        "Radio Wave Propagation": {
            "question": "Which propagation mode bounces signals off the ionosphere?",
            "options": ["Sky wave", "Ground wave", "Line-of-sight", "Direct wave"],
            "correct_answer": "Sky wave",
            "explanation": "Sky wave propagation uses ionospheric reflection for long-distance HF communications."
        },
        "COMSEC Fundamentals": {
            "question": "What does COMSEC protect?",
            "options": ["All of the above", "Transmission content", "Crypto equipment", "Communication patterns"],
            "correct_answer": "All of the above",
            "explanation": "COMSEC protects transmission content, equipment, and traffic analysis indicators."
        }
    }

    default = {
        "question": f"What is the main concept of {title}?",
        "options": [description, "Unrelated option A", "Unrelated option B", "Unrelated option C"],
        "correct_answer": description,
        "explanation": f"{title} involves understanding {description.lower()}."
    }

    return quizzes.get(title, default)
