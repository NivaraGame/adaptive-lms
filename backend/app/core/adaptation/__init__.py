"""
Adaptation module for personalized learning recommendations.

This module implements different adaptation strategies:
- Level A (Rules): Threshold-based decision rules
- Level B (Bandit): Contextual bandit learning (future)
- Level C (Policy): IRT/BKT policy learning (future)
"""

from .rules import RulesAdapter
from .config import AdaptationConfig

__all__ = ["RulesAdapter", "AdaptationConfig"]
