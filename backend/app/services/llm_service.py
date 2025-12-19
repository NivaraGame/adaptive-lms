"""
LLM Service for Ollama integration.
"""

import requests
import os
from typing import Optional
import logging

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
DEFAULT_MODEL = "llama3.2:1b"


def get_ollama_response(
    prompt: str,
    model: str = DEFAULT_MODEL,
    system_prompt: Optional[str] = None
) -> str:
    """Get response from Ollama LLM."""
    try:
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False
        }

        if system_prompt:
            payload["system"] = system_prompt

        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=payload,
            timeout=60
        )
        response.raise_for_status()

        return response.json()["response"]

    except requests.exceptions.ConnectionError:
        logger.error("Ollama not running")
        raise Exception("Ollama service unavailable")
    except Exception as e:
        logger.error(f"Ollama error: {e}")
        raise


def check_ollama_available() -> bool:
    """Check if Ollama is running."""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=2)
        return response.status_code == 200
    except:
        return False
