"""
cybershield-ai Phase 4

Toxicity Detection Engine

Purpose
-------
Detects whether a message contains
abusive, insulting, hateful or threatening
language.

Unlike the old implementation,
this engine produces

• toxicity score
• confidence
• explanation

instead of True / False.

Future upgrades
---------------
Perspective API
Detoxify
RoBERTa Toxicity
LLM reasoning
"""

from __future__ import annotations

from dataclasses import dataclass
import re


# ============================================================
# WORD LISTS
# ============================================================

LOW_TOXICITY = {

    "idiot",
    "stupid",
    "dumb",
    "loser",
    "moron",
    "useless",
    "trash",
    "pathetic",
    "shut up",
    "bekar",
    "bakwas",
    "gadha",
    "bewakoof"

}

HIGH_TOXICITY = {

    "kill yourself",

    "go die",

    "i'll kill you",

    "i will kill you",

    "die",

    "murder",

    "worthless",

    "nobody likes you",

    "i hate you"

}


# ============================================================
# RESULT
# ============================================================

@dataclass

class ToxicityResult:

    toxic: bool

    score: float

    confidence: float

    severity: str

    explanation: str


# ============================================================
# ENGINE
# ============================================================

class ToxicityEngine:

    def analyse(
        self,
        text: str
    ) -> ToxicityResult:

        lower = text.lower()

        score = 0

        evidence = []

        # ---------------------------------------

        for word in HIGH_TOXICITY:

            if word in lower:

                score += 6

                evidence.append(word)

        # ---------------------------------------

        for word in LOW_TOXICITY:

            if word in lower:

                score += 2

                evidence.append(word)

        # ---------------------------------------
        # Repeated insults
        # ---------------------------------------

        insults = re.findall(
            r"\b(idiot|stupid|loser|dumb|moron)\b",
            lower
        )

        if len(insults) >= 2:

            score += 2

            evidence.append(
                "repeated insults"
            )

        # ---------------------------------------
        # ALL CAPS aggression
        # ---------------------------------------

        words = text.split()

        capitals = sum(
            1
            for w in words
            if len(w) > 2 and w.isupper()
        )

        if capitals >= 3:

            score += 2

            evidence.append(
                "capital aggression"
            )

        # ---------------------------------------
        # Multiple exclamation marks
        # ---------------------------------------

        if "!!!" in text:

            score += 1

            evidence.append(
                "aggressive punctuation"
            )

        # ---------------------------------------

        if score >= 8:

            return ToxicityResult(

                toxic=True,

                score=score,

                confidence=0.99,

                severity="HIGH",

                explanation=", ".join(evidence)

            )

        if score >= 4:

            return ToxicityResult(

                toxic=True,

                score=score,

                confidence=0.90,

                severity="MEDIUM",

                explanation=", ".join(evidence)

            )

        if score >= 2:

            return ToxicityResult(

                toxic=True,

                score=score,

                confidence=0.75,

                severity="LOW",

                explanation=", ".join(evidence)

            )

        return ToxicityResult(

            toxic=False,

            score=0,

            confidence=0.95,

            severity="NONE",

            explanation="No toxic language detected."

        )


toxicity_engine = ToxicityEngine()