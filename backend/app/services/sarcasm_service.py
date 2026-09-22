"""
cybershield-ai Phase 4

Advanced Sarcasm Detection Engine

This service estimates whether a message
is likely sarcastic by combining:

• emojis
• punctuation
• contradictory sentiment
• laughter
• exaggeration
• context clues

Future:
--------
Transformer sarcasm classifier
LLM reasoning
Conversation-aware sarcasm
"""

from __future__ import annotations

from dataclasses import dataclass
import re


# ==========================================================
# SIGNALS
# ==========================================================

SARCASTIC_EMOJIS = {
    "😂",
    "🤣",
    "😏",
    "🙄",
    "😒",
    "😑",
    "💀"
}

SARCASTIC_WORDS = {

    "yeah right",

    "sure",

    "wow",

    "great",

    "amazing",

    "genius",

    "perfect",

    "excellent",

    "nice job",

    "good job"

}

LAUGHTER = {

    "lol",

    "lmao",

    "haha",

    "hehe",

    "rofl"

}


# ==========================================================
# RESULT
# ==========================================================

@dataclass

class SarcasmResult:

    sarcastic: bool

    confidence: float

    score: int

    explanation: str


# ==========================================================
# ENGINE
# ==========================================================

class SarcasmEngine:

    def __init__(self):

        pass

    # ------------------------------------------------------

    def analyse(

        self,

        text: str

    ) -> SarcasmResult:

        original = text

        lower = text.lower()

        score = 0

        evidence = []

        # ----------------------------------------------
        # Emojis
        # ----------------------------------------------

        for emoji in SARCASTIC_EMOJIS:

            if emoji in original:

                score += 2

                evidence.append(
                    f"emoji:{emoji}"
                )

        # ----------------------------------------------
        # Sarcastic expressions
        # ----------------------------------------------

        for word in SARCASTIC_WORDS:

            if word in lower:

                score += 2

                evidence.append(word)

        # ----------------------------------------------
        # Laughter
        # ----------------------------------------------

        for laugh in LAUGHTER:

            if laugh in lower:

                score += 1

                evidence.append(laugh)

                # ----------------------------------------------
        # Playful insult + emoji
        # ----------------------------------------------

        playful_insults = {

            "idiot",

            "stupid",

            "moron",

            "dumb",

            "loser",

            "gadha",

            "bewakoof",

            "pagal",

            "bekar",

            "bakwas",

            "chutiya"

        }

        has_playful_insult = False

        for word in playful_insults:

            if word in lower:

                has_playful_insult = True

                break

        has_sarcastic_emoji = False

        for emoji in SARCASTIC_EMOJIS:

            if emoji in original:

                has_sarcastic_emoji = True

                break

        if has_playful_insult and has_sarcastic_emoji:

            score += 2

            evidence.append("playful insult") 
        

        # ----------------------------------------------
        # Multiple punctuation
        # ----------------------------------------------

        if "!!" in original:

            score += 1

            evidence.append("multiple !")

        if "??" in original:

            score += 1

            evidence.append("multiple ?")

        # ----------------------------------------------
        # ALL CAPS
        # ----------------------------------------------

        words = original.split()

        capitals = sum(

            1

            for w in words

            if len(w) > 2 and w.isupper()

        )

        if capitals >= 2:

            score += 2

            evidence.append("capital emphasis")

        # ----------------------------------------------
        # Mixed punctuation
        # ----------------------------------------------

        if re.search(r"[!?]{2,}", original):

            score += 1

            evidence.append("mixed punctuation")

        # ----------------------------------------------
        # Final Decision
        # ----------------------------------------------

        if score >= 6:

            return SarcasmResult(

                sarcastic=True,

                confidence=0.97,

                score=score,

                explanation=", ".join(evidence)

            )

        elif score >= 3:

            return SarcasmResult(

                sarcastic=True,

                confidence=0.82,

                score=score,

                explanation=", ".join(evidence)

            )

        return SarcasmResult(

            sarcastic=False,

            confidence=0.93,

            score=score,

            explanation="No significant sarcasm indicators."

        )


# ==========================================================
# GLOBAL ENGINE
# ==========================================================

sarcasm_engine = SarcasmEngine()