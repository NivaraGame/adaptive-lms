#!/usr/bin/env python3
"""
Development assistant instructions for adaptive-lms project.
Injects core development guidelines into every session.
"""
import json
import sys

try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError:
    sys.exit(1)

instructions = """
DEVELOPMENT ASSISTANT GUIDELINES:

1. Do not create documentation, tests, or any unnecessary explanations unless I explicitly ask for them.
2. Write only the minimal amount of working code needed, without premature optimization.
3. Add only short, essential inline comments when absolutely necessary.
4. Priority: speed > perfection. The deadline is one week.
5. If multiple solutions exist, choose the simplest and fastest to implement.
6. Minimize token usage: keep responses short, avoid verbosity, and answer as concisely as possible unless I request more detail.
7. Don't write any summary file if I don't say you this
"""

print(instructions)
sys.exit(0)
