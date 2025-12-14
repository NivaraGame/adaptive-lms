#!/usr/bin/env python3
"""
API-based Production Seeding Script for Adaptive LMS Thesis Demo

Uses REST API endpoints to ensure all business logic runs correctly.
Creates realistic data for two educational programs:
1. IT Course (Web Programming, JavaScript, React)
2. Military Communications Course (Radio Operations, Signal Procedures, Tactical Communications)

Single user: username='user', password='password'
"""

import sys
import os
import requests
from datetime import datetime, timedelta
from random import randint, choice, uniform, sample
from time import sleep

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.db.session import Base
from content_generator import (
    get_lesson_content, get_exercise_content, get_quiz_content,
    derive_subtopic, derive_skills, derive_prerequisites,
    generate_hints, generate_explanations
)

BASE_URL = "http://localhost:8000/api/v1"


# Real IT Course Content
IT_DISCIPLINES = {
    "Web_Programming_Fundamentals": [
        ("HTTP Protocol Basics", "easy", "lesson", "Understanding GET, POST, PUT, DELETE methods and status codes"),
        ("HTML5 Semantic Elements", "easy", "lesson", "Learn semantic tags like header, nav, article, section, footer"),
        ("CSS Box Model", "easy", "exercise", "Practice margin, padding, border, content in CSS"),
        ("Flexbox Layout", "normal", "exercise", "Build responsive layouts using flexbox properties"),
        ("Grid Layout System", "normal", "exercise", "Create complex layouts with CSS Grid"),
        ("Form Validation", "normal", "exercise", "Implement client-side form validation"),
        ("REST API Design Principles", "normal", "lesson", "Learn RESTful architecture and endpoint design"),
        ("AJAX and Fetch API", "normal", "exercise", "Make asynchronous HTTP requests"),
        ("CORS and Security", "hard", "lesson", "Understand Cross-Origin Resource Sharing"),
        ("WebSockets Basics", "hard", "lesson", "Real-time bidirectional communication"),
        ("Session vs Token Auth", "hard", "lesson", "Compare session-based and JWT authentication"),
        ("OAuth 2.0 Flow", "hard", "exercise", "Implement OAuth authentication flow"),
        ("SQL Injection Prevention", "hard", "exercise", "Secure database queries against injection"),
        ("XSS Attack Prevention", "hard", "exercise", "Prevent cross-site scripting vulnerabilities"),
        ("HTTPS and TLS", "normal", "lesson", "Understanding SSL/TLS certificates"),
        ("Browser DevTools", "easy", "exercise", "Master Chrome DevTools for debugging"),
        ("Responsive Design", "normal", "exercise", "Build mobile-first responsive websites"),
        ("CSS Animations", "normal", "exercise", "Create smooth CSS transitions and keyframe animations"),
        ("Local Storage API", "easy", "exercise", "Store data in browser localStorage"),
        ("Service Workers", "challenge", "lesson", "Build offline-capable web apps with service workers"),
        ("Progressive Web Apps", "challenge", "lesson", "Convert web apps to PWAs"),
        ("Web Performance Optimization", "hard", "lesson", "Optimize page load time and rendering"),
        ("Lazy Loading Images", "normal", "exercise", "Implement intersection observer for lazy loading"),
        ("Code Splitting", "hard", "exercise", "Split JavaScript bundles for faster loading"),
        ("Browser Caching Strategies", "normal", "lesson", "Leverage HTTP caching headers"),
        ("CDN Integration", "normal", "lesson", "Use Content Delivery Networks effectively"),
        ("SEO Fundamentals", "easy", "lesson", "Optimize websites for search engines"),
        ("Accessibility (a11y)", "normal", "lesson", "Build accessible web applications (WCAG)"),
        ("Cookie Management", "easy", "exercise", "Work with HTTP cookies securely"),
        ("Error Handling Patterns", "normal", "exercise", "Implement proper error handling in web apps"),
    ],
    "JavaScript_Programming": [
        ("Variables: let, const, var", "easy", "lesson", "Understand scoping rules and variable declarations"),
        ("Data Types and Type Coercion", "easy", "lesson", "Learn primitive and reference types"),
        ("Arrow Functions", "easy", "exercise", "Write concise function syntax with arrow functions"),
        ("Array Methods: map, filter, reduce", "normal", "exercise", "Transform arrays with functional methods"),
        ("Destructuring Assignment", "normal", "exercise", "Extract values from arrays and objects"),
        ("Spread and Rest Operators", "normal", "exercise", "Use ... operator for arrays and function parameters"),
        ("Template Literals", "easy", "exercise", "Create strings with embedded expressions"),
        ("Promises and Async/Await", "normal", "lesson", "Handle asynchronous operations"),
        ("Fetch API Practical Use", "normal", "exercise", "Make HTTP requests with fetch"),
        ("Error Handling with try/catch", "normal", "exercise", "Handle errors in async code"),
        ("Closures and Scope", "hard", "lesson", "Understand lexical scoping and closures"),
        ("Prototype and Inheritance", "hard", "lesson", "Learn JavaScript's prototypal inheritance"),
        ("ES6 Classes", "normal", "lesson", "Work with class syntax and constructors"),
        ("Modules: import/export", "normal", "exercise", "Organize code with ES6 modules"),
        ("Event Loop and Callbacks", "hard", "lesson", "Understand JavaScript concurrency model"),
        ("DOM Manipulation", "easy", "exercise", "Select and modify DOM elements"),
        ("Event Listeners", "easy", "exercise", "Handle user interactions with events"),
        ("Local Storage and Session Storage", "easy", "exercise", "Persist data in browser storage"),
        ("JSON Parsing and Stringify", "easy", "exercise", "Convert between JSON and JavaScript objects"),
        ("Regular Expressions", "normal", "exercise", "Pattern matching with regex"),
        ("Higher-Order Functions", "normal", "lesson", "Functions that take or return functions"),
        ("Currying and Partial Application", "hard", "lesson", "Advanced function composition"),
        ("Debounce and Throttle", "normal", "exercise", "Optimize event handler performance"),
        ("Memory Leaks Prevention", "hard", "lesson", "Identify and fix memory leaks"),
        ("Generator Functions", "hard", "lesson", "Use function* and yield for iterators"),
        ("Proxy and Reflect API", "challenge", "lesson", "Meta-programming with Proxy objects"),
        ("WeakMap and WeakSet", "hard", "lesson", "Garbage collection friendly collections"),
        ("Symbol Type", "hard", "lesson", "Unique identifiers and meta-properties"),
        ("TypedArrays and Buffers", "hard", "lesson", "Work with binary data efficiently"),
        ("Testing with Jest", "normal", "exercise", "Write unit tests for JavaScript code"),
    ],
    "React_Framework": [
        ("React Components Basics", "easy", "lesson", "Understand functional and class components"),
        ("JSX Syntax", "easy", "exercise", "Write HTML-like syntax in JavaScript"),
        ("Props and Component Composition", "easy", "exercise", "Pass data between components"),
        ("State with useState Hook", "normal", "exercise", "Manage component state"),
        ("Event Handling in React", "easy", "exercise", "Handle click, submit, and change events"),
        ("Conditional Rendering", "easy", "exercise", "Render components based on conditions"),
        ("Lists and Keys", "normal", "exercise", "Render dynamic lists of components"),
        ("Forms in React", "normal", "exercise", "Controlled vs uncontrolled components"),
        ("useEffect Hook", "normal", "lesson", "Handle side effects and lifecycle"),
        ("Data Fetching with useEffect", "normal", "exercise", "Fetch data from APIs in components"),
        ("useContext Hook", "normal", "lesson", "Share state without prop drilling"),
        ("React Router Basics", "normal", "exercise", "Implement client-side routing"),
        ("Protected Routes", "hard", "exercise", "Implement authentication-based routing"),
        ("useReducer Hook", "hard", "lesson", "Manage complex state with reducers"),
        ("Custom Hooks", "hard", "exercise", "Extract reusable stateful logic"),
        ("Performance: useMemo", "hard", "lesson", "Memoize expensive computations"),
        ("Performance: useCallback", "hard", "lesson", "Memoize callback functions"),
        ("React.memo for Components", "normal", "lesson", "Prevent unnecessary re-renders"),
        ("Error Boundaries", "normal", "exercise", "Catch JavaScript errors in component tree"),
        ("Portals", "normal", "lesson", "Render children outside parent DOM hierarchy"),
        ("Refs with useRef", "normal", "exercise", "Access DOM nodes and persist values"),
        ("Forwarding Refs", "hard", "lesson", "Pass refs through components"),
        ("Code Splitting with React.lazy", "hard", "exercise", "Load components on demand"),
        ("Suspense for Data Fetching", "hard", "lesson", "Handle loading states declaratively"),
        ("Redux Basics", "hard", "lesson", "Centralized state management with Redux"),
        ("Redux Toolkit", "hard", "exercise", "Modern Redux with RTK"),
        ("Context API vs Redux", "hard", "lesson", "Choose the right state management"),
        ("React Testing Library", "normal", "exercise", "Test React components"),
        ("CSS-in-JS with Styled Components", "normal", "exercise", "Style components with CSS-in-JS"),
        ("React Hook Form", "normal", "exercise", "Build performant forms with validation"),
    ]
}

# Real Military Communications Course Content
MILITARY_DISCIPLINES = {
    "Radio_Communications_Operations": [
        ("Radio Wave Propagation", "easy", "lesson", "Understand how radio waves travel through atmosphere"),
        ("Frequency Spectrum Allocation", "easy", "lesson", "Military frequency bands: HF, VHF, UHF"),
        ("Antenna Theory Basics", "easy", "lesson", "Dipole, monopole, and directional antennas"),
        ("Radio Set R-123M Operation", "normal", "exercise", "Operate portable HF/VHF radio transceiver"),
        ("Radio Set R-159 Setup", "normal", "exercise", "Deploy and configure manpack radio station"),
        ("VHF Radio Net Establishment", "normal", "exercise", "Establish tactical VHF communication network"),
        ("Radio Check Procedures", "easy", "exercise", "Conduct signal strength and readability checks"),
        ("Phonetic Alphabet Usage", "easy", "exercise", "Master NATO phonetic alphabet for clarity"),
        ("Call Signs and Authentication", "normal", "exercise", "Use tactical call signs and authentication codes"),
        ("Radio Operating Instructions (ROI)", "normal", "lesson", "Follow standardized radio procedures"),
        ("Frequency Hopping Techniques", "hard", "lesson", "Implement frequency-hopping spread spectrum"),
        ("Electronic Counter-Countermeasures", "hard", "lesson", "Overcome enemy jamming attempts"),
        ("Tactical Communication Planning", "hard", "exercise", "Plan communication architecture for operations"),
        ("Radio Relay Operations", "normal", "exercise", "Extend communication range using relay stations"),
        ("HF NVIS Communications", "normal", "lesson", "Near Vertical Incidence Skywave for tactical HF"),
        ("Radio Discipline", "easy", "lesson", "Maintain operational security on radio nets"),
        ("Emergency Communications", "normal", "exercise", "Establish comms in degraded conditions"),
        ("Field Expedient Antennas", "normal", "exercise", "Build antennas from available materials"),
        ("Radio Troubleshooting", "hard", "exercise", "Diagnose and fix common radio failures"),
        ("Battery Management", "easy", "exercise", "Maximize radio battery life in field conditions"),
        ("Antenna Tuning Procedures", "normal", "exercise", "Tune antennas for optimal VSWR"),
        ("Signal Strength Measurement", "easy", "exercise", "Use signal meters to assess link quality"),
        ("Atmospheric Noise and Interference", "normal", "lesson", "Identify and mitigate radio interference"),
        ("Long-Range HF Communications", "hard", "lesson", "Establish beyond-line-of-sight HF links"),
        ("Tactical Data Links", "hard", "lesson", "Digital tactical communication systems"),
        ("Software-Defined Radio (SDR)", "challenge", "lesson", "Modern SDR principles for military use"),
        ("Satellite Communications Basics", "hard", "lesson", "Military SATCOM systems overview"),
        ("Burst Transmission Techniques", "hard", "exercise", "Minimize transmission time for security"),
        ("Radio Direction Finding", "hard", "exercise", "Locate enemy transmitters using RDF"),
        ("Multi-Channel Operations", "normal", "exercise", "Monitor and operate multiple radio nets"),
    ],
    "Signal_Security_Procedures": [
        ("COMSEC Fundamentals", "easy", "lesson", "Communications Security principles and policies"),
        ("Emission Security (EMSEC)", "normal", "lesson", "Prevent intelligence from electromagnetic emissions"),
        ("Transmission Security (TRANSEC)", "normal", "lesson", "Protect transmissions from interception"),
        ("Physical Security of Crypto", "easy", "lesson", "Safeguard cryptographic materials and devices"),
        ("Crypto Key Management", "normal", "exercise", "Distribute and manage encryption keys securely"),
        ("Authentication Protocols", "normal", "exercise", "Verify identity of communicating parties"),
        ("Secure Voice Procedures", "normal", "exercise", "Operate encrypted voice communication systems"),
        ("Classified Information Handling", "easy", "lesson", "Handle classified material on radio nets"),
        ("Compromised Procedures", "normal", "exercise", "Respond to suspected security compromise"),
        ("Fill Device Operation", "normal", "exercise", "Load cryptographic keys into radio equipment"),
        ("Zeroization Procedures", "normal", "exercise", "Emergency erasure of cryptographic material"),
        ("Secure TTY Operations", "hard", "exercise", "Operate encrypted teletype systems"),
        ("Over-the-Air Rekeying (OTAR)", "hard", "lesson", "Remote key distribution techniques"),
        ("Traffic Flow Security", "hard", "lesson", "Conceal communication patterns from adversary"),
        ("Low Probability of Intercept (LPI)", "hard", "lesson", "Design signals resistant to detection"),
        ("Signal Masking Techniques", "hard", "exercise", "Hide tactical signals in noise or clutter"),
        ("Directional Antenna Usage", "normal", "exercise", "Reduce signal footprint with directional antennas"),
        ("Terrain Masking", "normal", "exercise", "Use terrain to shield communications"),
        ("Electronic Warfare Awareness", "hard", "lesson", "Recognize and respond to EW threats"),
        ("Jamming Recognition", "normal", "exercise", "Identify deliberate vs. natural interference"),
        ("Anti-Jamming Procedures", "hard", "exercise", "Maintain communications under jamming"),
        ("Frequency Management", "normal", "lesson", "Coordinate spectrum use to avoid conflicts"),
        ("Spread Spectrum Communications", "hard", "lesson", "FHSS and DSSS for secure communications"),
        ("Radio Silence Procedures", "easy", "exercise", "Maintain emissions control (EMCON)"),
        ("Minimizing Transmission Time", "normal", "exercise", "Reduce intercept probability through brevity"),
        ("Deception Techniques", "hard", "lesson", "Mislead adversary SIGINT capabilities"),
        ("TEMPEST Countermeasures", "challenge", "lesson", "Prevent compromising emanations"),
        ("Secure Mobile Communications", "normal", "exercise", "Operate encrypted tactical mobile systems"),
        ("Red/Black Separation", "normal", "lesson", "Isolate classified and unclassified circuits"),
        ("COMSEC Monitoring", "hard", "exercise", "Audit friendly communications for security violations"),
    ],
    "Tactical_Communications_Planning": [
        ("Communication Plan Development", "normal", "lesson", "Create COMPLAN for military operations"),
        ("Signal Operating Instructions (SOI)", "normal", "exercise", "Prepare and use SOI documents"),
        ("Frequency Allocation", "normal", "exercise", "Assign frequencies to tactical units"),
        ("Net Structure Design", "normal", "exercise", "Design radio net architecture for formations"),
        ("Call Sign Assignment", "easy", "exercise", "Allocate tactical call signs systematically"),
        ("Communication Window Planning", "normal", "exercise", "Schedule communication periods"),
        ("Redundancy and Backup Plans", "normal", "lesson", "Ensure communication continuity"),
        ("PACE Planning", "normal", "exercise", "Primary, Alternate, Contingency, Emergency comms"),
        ("Communication Security Planning", "hard", "lesson", "Integrate COMSEC into operational plans"),
        ("Electronic Warfare Integration", "hard", "lesson", "Coordinate comms with EW operations"),
        ("Liaison Communications", "normal", "exercise", "Establish comms with adjacent/higher units"),
        ("Joint Communications", "hard", "lesson", "Interoperability with other service branches"),
        ("Coalition Communications", "hard", "lesson", "Communicate with allied forces"),
        ("Civil-Military Cooperation Comms", "normal", "lesson", "Coordinate with civilian authorities"),
        ("Communication Timeline", "normal", "exercise", "Synchronize communications with operation phases"),
        ("Radio Range Estimation", "normal", "exercise", "Calculate expected communication ranges"),
        ("Terrain Analysis for Comms", "normal", "exercise", "Assess terrain impact on signal propagation"),
        ("Retransmission Sites", "normal", "exercise", "Plan relay station locations for coverage"),
        ("Mobile Command Post Comms", "hard", "exercise", "Design communications for mobile HQ"),
        ("Dismounted Operations Comms", "normal", "exercise", "Plan comms for infantry operations"),
        ("Armored Formation Comms", "normal", "exercise", "Communication architecture for mechanized units"),
        ("Artillery Fire Support Comms", "hard", "exercise", "Coordinate fire missions via radio"),
        ("Air-Ground Coordination", "hard", "exercise", "Establish comms with aviation assets"),
        ("Medevac Request Procedures", "normal", "exercise", "Use 9-line MEDEVAC format on radio"),
        ("Situation Report (SITREP)", "easy", "exercise", "Format and transmit tactical reports"),
        ("Fragmentary Order (FRAGO)", "normal", "exercise", "Communicate mission changes via radio"),
        ("Communication Load Planning", "normal", "exercise", "Distribute radio equipment among unit"),
        ("Spare Equipment Planning", "easy", "lesson", "Calculate required backup communication gear"),
        ("Communication Rehearsal", "normal", "exercise", "Test communication plan before operations"),
        ("After-Action Communication Review", "normal", "lesson", "Analyze communication effectiveness post-mission"),
    ]
}


class ThesisSeeder:
    def __init__(self, engine):
        self.engine = engine
        self.user_id = None
        self.all_content = []

    def drop_all_data(self):
        print("🗑️  Dropping all existing data...")
        tables = ['metrics', 'messages', 'dialogs', 'experiments', 'content_items', 'user_profiles', 'users']
        with self.engine.connect() as conn:
            for table in tables:
                conn.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE"))
                conn.commit()
        print("✓ All data dropped with IDs reset")

    def create_user(self):
        print("\n👤 Creating user via API...")
        try:
            resp = requests.post(f"{BASE_URL}/users", json={
                "username": "user",
                "email": "user@example.com",
                "password": "password"
            })

            if resp.status_code == 400:
                print("✓ User exists, fetching...")
                users = requests.get(f"{BASE_URL}/users").json()
                user = [u for u in users if u["username"] == "user"][0]
                self.user_id = user["user_id"]
            else:
                resp.raise_for_status()
                user = resp.json()
                self.user_id = user["user_id"]
                print(f"✓ Created user: user_id={self.user_id} (profile auto-created)")
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            raise

    def create_content(self):
        print("\n📚 Creating course content via API...")

        for topic, tasks in {**IT_DISCIPLINES, **MILITARY_DISCIPLINES}.items():
            for title, difficulty, ctype, description in tasks:
                try:
                    # Derive schema-complete fields
                    subtopic = derive_subtopic(title, topic)
                    skills = derive_skills(title, topic, ctype)
                    prerequisites = derive_prerequisites(difficulty, topic, title)

                    # Generate rich content based on type
                    if ctype == "lesson":
                        lesson_data = get_lesson_content(title, topic, description)
                        content_data = lesson_data
                        reference_answer = None
                        hints = lesson_data.get("hints", generate_hints(ctype, title))
                        explanations = lesson_data.get("explanations", generate_explanations(ctype, title, topic))

                    elif ctype == "exercise":
                        exercise_data = get_exercise_content(title, topic, description)
                        # Per README: Answers included in description for demo
                        content_data = {
                            "description": f"{description}. Answer: {exercise_data['solution']}",
                            "question": exercise_data["question"],
                            "starter_code": exercise_data.get("starter_code"),
                            "test_cases": exercise_data.get("test_cases", [])
                        }
                        reference_answer = {
                            "code": exercise_data["solution"],
                            "output": "Expected solution output"
                        }
                        hints = exercise_data.get("hints", generate_hints(ctype, title))
                        explanations = exercise_data.get("explanations", generate_explanations(ctype, title, topic))

                    else:  # quiz
                        quiz_data = get_quiz_content(title, topic, description)
                        # Per README: Correct answer included in description for demo
                        content_data = {
                            "description": f"{description}. Correct: {quiz_data['correct_answer']}",
                            "question": quiz_data["question"],
                            "options": quiz_data["options"]
                        }
                        reference_answer = {
                            "correct_answer": quiz_data["correct_answer"],
                            "explanation": quiz_data["explanation"]
                        }
                        hints = quiz_data.get("hints", generate_hints(ctype, title))
                        explanations = quiz_data.get("explanations", generate_explanations(ctype, title, topic))

                    # Add generator metadata to extra_data
                    extra_data = {
                        "generator_version": "2.0",
                        "schema_complete": True,
                        "generated_at": "2024-01-15"
                    }

                    resp = requests.post(f"{BASE_URL}/content", json={
                        "title": title,
                        "topic": topic,
                        "subtopic": subtopic,
                        "difficulty_level": difficulty,
                        "format": choice(["text", "interactive", "visual"]),
                        "content_type": ctype,
                        "content_data": content_data,
                        "reference_answer": reference_answer,
                        "hints": hints,
                        "explanations": explanations,
                        "skills": skills,
                        "prerequisites": prerequisites,
                        "extra_data": extra_data
                    })

                    if resp.status_code != 201:
                        print(f"❌ Error creating '{title}': HTTP {resp.status_code}")
                        print(f"   Response: {resp.text}")
                        continue

                    resp.raise_for_status()
                    self.all_content.append(resp.json())

                except requests.exceptions.RequestException as e:
                    print(f"❌ Request error creating content '{title}': {e}")
                    if hasattr(e.response, 'text'):
                        print(f"   Response body: {e.response.text[:200]}")
                except Exception as e:
                    print(f"❌ Unexpected error creating content '{title}': {e}")

        print(f"✓ Created {len(self.all_content)} content items")

    def create_dialogs_and_messages(self):
        print("\n💬 Creating dialogs and messages via API...")

        topics = list(IT_DISCIPLINES.keys()) + list(MILITARY_DISCIPLINES.keys())

        for dialog_idx in range(5):
            topic = topics[dialog_idx % len(topics)]

            try:
                resp = requests.post(f"{BASE_URL}/dialogs", json={
                    "user_id": self.user_id,
                    "dialog_type": choice(["educational", "test", "assessment"]),
                    "topic": topic
                })
                resp.raise_for_status()
                dialog = resp.json()
                dialog_id = dialog["dialog_id"]

                for msg_idx in range(30):
                    sender = "system" if msg_idx % 2 == 0 else "user"
                    is_question = sender == "system" and msg_idx % 4 == 0

                    if sender == "system":
                        if is_question:
                            content = f"Question {msg_idx//2 + 1}"
                        else:
                            content = choice(["Correct!", "Good work", "Try again", "Hint..."])
                    else:
                        content = choice(["Solution", "I think...", "Let me try", "Based on lesson..."])

                    requests.post(f"{BASE_URL}/dialogs/{dialog_id}/messages", json={
                        "sender_type": sender,
                        "content": content,
                        "is_question": is_question
                    })

                print(f"  ✓ Dialog {dialog_idx+1}: {topic[:30]}...")

            except Exception as e:
                print(f"Error creating dialog: {e}")

        print(f"✓ Created 5 dialogs with 30 messages each")

    def create_metrics(self):
        print("\n📈 Generating metrics via API...")

        difficulty_ranges = {
            "easy": (0.70, 0.95),
            "normal": (0.55, 0.85),
            "hard": (0.40, 0.75),
            "challenge": (0.25, 0.65)
        }

        metric_count = 0
        for content in self.all_content[:60]:  # Subset for speed
            acc_range = difficulty_ranges[content["difficulty_level"]]

            for attempt in range(3):
                accuracy = round(uniform(acc_range[0], acc_range[1]) + (attempt * 0.06), 2)
                accuracy = min(accuracy, 1.0)
                response_time = round(uniform(25, 110) - (attempt * 8), 1)
                response_time = max(response_time, 12.0)

                try:
                    requests.post(f"{BASE_URL}/metrics", json={
                        "user_id": self.user_id,
                        "metric_name": "accuracy",
                        "metric_value_f": accuracy,
                        "context": {"content_id": content["content_id"], "topic": content["topic"], "attempt": attempt + 1}
                    })

                    requests.post(f"{BASE_URL}/metrics", json={
                        "user_id": self.user_id,
                        "metric_name": "response_time",
                        "metric_value_f": response_time,
                        "context": {"content_id": content["content_id"], "unit": "seconds", "attempt": attempt + 1}
                    })

                    metric_count += 2
                except Exception as e:
                    print(f"Error creating metrics: {e}")

        print(f"✓ Generated {metric_count} metrics")

    def verify_content_sample(self):
        """Fetch and display sample content to verify schema completeness"""
        print("\n🔍 Verifying content schema...")

        try:
            # Fetch first content item
            resp = requests.get(f"{BASE_URL}/content?limit=1")
            resp.raise_for_status()
            data = resp.json()

            if data.get("items"):
                sample = data["items"][0]
                print(f"\n📝 Sample Content Item (ID={sample.get('content_id')}):")
                print(f"   Title: {sample.get('title')}")
                print(f"   Topic: {sample.get('topic')}")
                print(f"   Subtopic: {sample.get('subtopic')}")
                print(f"   Type: {sample.get('content_type')} | Difficulty: {sample.get('difficulty_level')} | Format: {sample.get('format')}")
                print(f"   Skills: {sample.get('skills', [])}")
                print(f"   Prerequisites: {sample.get('prerequisites', [])}")
                print(f"   Hints: {len(sample.get('hints', []))} items")
                print(f"   Explanations: {len(sample.get('explanations', []))} items")
                print(f"   Has reference_answer: {sample.get('reference_answer') is not None}")
                print(f"   Extra data keys: {list(sample.get('extra_data', {}).keys())}")
                print("✓ Schema verification complete")
            else:
                print("⚠️  No content items found")

        except Exception as e:
            print(f"⚠️  Could not verify content: {e}")

    def run(self):
        print("=" * 70)
        print("🌱 ADAPTIVE LMS - API-BASED SEEDING")
        print("=" * 70)

        self.drop_all_data()
        self.create_user()
        self.create_content()
        self.create_dialogs_and_messages()
        self.create_metrics()
        self.verify_content_sample()

        print("\n" + "=" * 70)
        print("✅ SEEDING COMPLETED SUCCESSFULLY")
        print("=" * 70)
        print("\n📊 Summary:")
        print(f"  👤 User: username='user', password='password'")
        print(f"  📚 Total Content: {len(self.all_content)} tasks")
        print(f"  💬 Dialogs: 5 (30 messages each)")
        print("\n🔐 Login: user / password")
        print("=" * 70)


def main():
    db_url = settings.DATABASE_URL
    print(f"🔗 Connecting to database...")

    try:
        engine = create_engine(db_url, pool_pre_ping=True)

        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            print(f"✓ Connected: PostgreSQL")

        Base.metadata.create_all(bind=engine)

        seeder = ThesisSeeder(engine)
        seeder.run()

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
