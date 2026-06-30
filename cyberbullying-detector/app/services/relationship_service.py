"""
CyberShield Phase 4
Relationship Intelligence Engine

Determines whether two users appear to have a

- Friendly relationship
- Neutral relationship
- Hostile relationship

using previous conversations instead of
judging a single message.

Future upgrades:
- Graph Neural Networks
- Social interaction scoring
- Community modelling
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict

from app.services.conversation_memory import (
    conversation_memory,
)


# ==========================================================
# FRIENDLY SIGNALS
# ==========================================================

FRIENDLY_WORDS = {
    "bro",
    "buddy",
    "friend",
    "lol",
    "lmao",
    "haha",
    "hehe",
    "😂",
    "🤣",
    "❤️",
    "❤",
    "love",
    "nice",
    "congrats",
    "good job",
    "great",
    "awesome",
    "legend",
    "king",
    "queen",
}

HOSTILE_WORDS = {
    "idiot",
    "stupid",
    "loser",
    "worthless",
    "hate",
    "kill",
    "die",
    "moron",
    "dumb",
    "shut up",
    "chutiya",
    "bewakoof",
    "gadha",
    "bekar",
    "bakwas",
}


# ==========================================================
# DATA MODEL
# ==========================================================

@dataclass
class RelationshipResult:

    relationship: str

    score: float

    friendly_messages: int

    hostile_messages: int

    sarcasm_messages: int

    explanation: str


# ==========================================================
# ENGINE
# ==========================================================

class RelationshipEngine:

    def __init__(self):

        pass

    # ------------------------------------------------------

    def _friendly_score(self, text: str) -> int:

        text = text.lower()

        score = 0

        for word in FRIENDLY_WORDS:

            if word in text:
                score += 2

        return score

    # ------------------------------------------------------

    def _hostile_score(self, text: str) -> int:

        text = text.lower()

        score = 0

        for word in HOSTILE_WORDS:

            if word in text:
                score += 3

        return score

    # ------------------------------------------------------

    def analyse(
        self,
        sender: str,
        receiver: str,
    ) -> RelationshipResult:

        history = conversation_memory.get_recent_messages(
            sender,
            receiver,
            limit=50,
        )

        if not history:

            return RelationshipResult(
                relationship="Unknown",
                score=50.0,
                friendly_messages=0,
                hostile_messages=0,
                sarcasm_messages=0,
                explanation="No previous conversation available.",
            )

        friendly = 0
        hostile = 0
        sarcasm = 0

        relationship_score = 50.0

        for message in history:

                        # ---------------------------------------------
            # Keyword-based relationship score
            # ---------------------------------------------

            relationship_score += self._friendly_score(
                message.text
            )

            relationship_score -= self._hostile_score(
                message.text
            )

            # ---------------------------------------------
            # Intent-aware scoring
            # ---------------------------------------------

            if message.intent == "Friendly":
                relationship_score += 4
                friendly += 1

            elif message.intent == "Praise":
                relationship_score += 5
                friendly += 1

            elif message.intent == "Joke":
                relationship_score += 4

            elif message.intent == "Insult":
                relationship_score -= 6
                hostile += 1

            elif message.intent == "Threat":
                relationship_score -= 10
                hostile += 1

            if message.toxic:
                relationship_score -= 4

            if message.sarcasm:
               sarcasm += 1
               relationship_score += 1

               # Clamp relationship score

        relationship_score = max(
            0.0,
            min(
                100.0,
                relationship_score
            )
        )

        # --------------------------------------------------

        if relationship_score >= 65:

            relation = "Friendly"

            explanation = (
                "Conversation history indicates "
                "a friendly relationship."
            )

        elif relationship_score >= 30:

            relation = "Neutral"

            explanation = (
                "Conversation appears balanced "
                "without repeated hostility."
            )

        else:

            relation = "Hostile"

            explanation = (
                "Repeated hostile interactions "
                "have been detected."
            )

        return RelationshipResult(
            relationship=relation,
            score=relationship_score,
            friendly_messages=friendly,
            hostile_messages=hostile,
            sarcasm_messages=sarcasm,
            explanation=explanation,
        )


# ==========================================================
# GLOBAL ENGINE
# ==========================================================

relationship_engine = RelationshipEngine()