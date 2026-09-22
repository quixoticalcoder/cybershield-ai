"""
cybershield-ai
Phase 4

Advanced Intent Detection Engine

This engine DOES NOT decide whether a message is bullying.

Its only responsibility is understanding the conversational
intent and returning rich metadata for the Context Engine.

Final moderation is performed later by text_service.py after
combining:

• Intent
• Context
• Conversation Memory
• Relationship Engine
• Toxicity Model
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Set
import re


# ==========================================================
# INTENT LABELS
# ==========================================================

QUESTION = "Question"

INSULT = "Insult"

THREAT = "Threat"

PRAISE = "Praise"

FRIENDLY = "Friendly"

JOKE = "Joke"

NARRATIVE = "Narrative"

THIRD_PERSON = "ThirdPerson"

NEUTRAL = "Neutral"


# ==========================================================
# SEVERITY
# ==========================================================

LOW = "LOW"

MEDIUM = "MEDIUM"

HIGH = "HIGH"

CRITICAL = "CRITICAL"


# ==========================================================
# THREAT WORDS
# ==========================================================

THREAT_WORDS: Set[str] = {

    "kill",
    "die",
    "destroy",
    "shoot",
    "burn",
    "murder",
    "finish you",
    "go die",
    "go kill yourself",
    "i'll kill you",
    "i will kill you"

}


# ==========================================================
# INSULT WORDS
# ==========================================================

INSULT_WORDS: Set[str] = {

    # English

    "idiot",
    "stupid",
    "moron",
    "loser",
    "worthless",
    "dumb",
    "useless",
    "pathetic",
    "trash",
    "garbage",
    "failure",
    "ugly",
    "disgusting",
    "fake",
    "retard",
    "crybaby",
    "clown",
    "noob",
    "dumbass",

    # Hindi / Hinglish

    "chutiya",
    "madarchod",
    "bhenchod",
    "gadha",
    "bewakoof",
    "bakwas",
    "bekar",
    "harami",
    "nalayak",
    "kamine",
    "pagal",
    "ullu",
    "jhatu",
    "lodu",
    "lund",
    "randi"

}


# ==========================================================
# POSITIVE WORDS
# ==========================================================

PRAISE_WORDS: Set[str] = {

    "great",
    "awesome",
    "excellent",
    "good job",
    "well done",
    "congratulations",
    "love it",
    "amazing",
    "brilliant",
    "nice work"

}


# ==========================================================
# FRIENDLY WORDS
# ==========================================================

FRIENDLY_WORDS: Set[str] = {

    "bro",
    "buddy",
    "bestie",
    "friend",

    "haha",
    "hehe",
    "lol",
    "lmao",

    "😂",
    "🤣",
    "😁",
    "😊",
    "❤",
    "❤️"

}


# ==========================================================
# TARGET WORDS
# ==========================================================

TARGET_WORDS: Set[str] = {

    "you",
    "your",
    "you're",
    "youre",
    "u",
    "ur",
    "@"

}


# ==========================================================
# REPORTED SPEECH VERBS
# ==========================================================

REPORTING_VERBS: Set[str] = {

    "said",
    "told",
    "asked",
    "called",
    "mentioned",
    "texted",
    "messaged",
    "replied",
    "wrote",
    "insulted",
    "abused",
    "bullied",
    "threatened",
    "mocked",
    "teased"

}
# ==========================================================
# RESULT OBJECT
# ==========================================================

@dataclass
class IntentResult:

    intent: str

    confidence: float

    explanation: str

    severity: str = LOW

    targeted: bool = False

    repeated: bool = False

    self_reference: bool = False

    third_person: bool = False

    reported_speech: bool = False

    keyword_hits: int = 0

    question: bool = False

    friendly: bool = False

    joke: bool = False

    threat: bool = False

    insult: bool = False




# ==========================================================
# INTENT ENGINE
# ==========================================================

class IntentEngine:

    def __init__(self):

        self.low_threshold = 1

        self.medium_threshold = 2

        self.high_threshold = 4

    # ------------------------------------------------------
    # BASIC HELPERS
    # ------------------------------------------------------

    def _contains_any(
        self,
        text: str,
        words: Set[str]
    ) -> bool:

        return any(
            word in text
            for word in words
        )

    # ------------------------------------------------------

    def _count_matches(
        self,
        text: str,
        words: Set[str]
    ) -> int:

        total = 0

        for word in words:

            total += text.count(word)

        return total

    # ------------------------------------------------------

    def _severity(
        self,
        hits: int
    ) -> str:

        if hits >= self.high_threshold:
            return CRITICAL

        if hits >= self.medium_threshold:
            return HIGH

        if hits >= self.low_threshold:
            return MEDIUM

        return LOW

    # ------------------------------------------------------
    # CONTEXT HELPERS
    # ------------------------------------------------------

    def _is_self_reference(
        self,
        text: str
    ) ->    bool:

        text = text.lower()

        return bool(
           re.search(
               r"\b(i|i'm|i’m|im|i am|me|my|myself|we|our|us)\b",
            text
        )
    )

    # ------------------------------------------------------

    def _is_receiver_targeted(
        self,
        text: str
    ) -> bool:

        return any(

            token in text

            for token in TARGET_WORDS

        )

    # ------------------------------------------------------

    def _is_third_person(
        self,
        text: str
    ) ->    bool:

        text = text.lower()

        return bool(
          re.search(
            r"\b(he|she|him|her|his|hers|they|them|their|theirs)\b",
          text
        )
    )
    # ------------------------------------------------------

    def _is_reported_speech(
        self,
        text: str
    ) -> bool:

        return any(

            verb in text

            for verb in REPORTING_VERBS

        )
        # ======================================================
    # MAIN ANALYSIS
    # ======================================================

    def analyse(
        self,
        text: str
    ) -> IntentResult:

        original = text.strip()

        lower = f" {original.lower()} "

        insult_hits = self._count_matches(
            lower,
            INSULT_WORDS
        )

        threat_hits = self._count_matches(
            lower,
            THREAT_WORDS
        )

        total_hits = insult_hits + threat_hits

        targeted = self._is_receiver_targeted(
            lower
        )

        self_reference = self._is_self_reference(
            lower
        )

        third_person = self._is_third_person(
            lower
        )
    # --------------------------------------------------
# Force obvious self / third-person detection
# --------------------------------------------------

        if re.search(r"\bi am\b|\bi'm\b|\bi’m\b", lower):
           self_reference = True

        if re.search(r"\b(he|she|they)\b", lower):
           third_person = True

        reported = self._is_reported_speech(
            lower
        )

        is_question = original.endswith("?")

        has_friendly = self._contains_any(
           lower,
           FRIENDLY_WORDS
        )

        has_joke = bool(
          re.search(
             r"(😂|🤣|lol|lmao|haha|hehe)",
             original,
             flags=re.IGNORECASE
    )
)

        severity = self._severity(
            total_hits
        )

        # ==========================================
        # THIRD PERSON DISCUSSION
        # ==========================================

        if third_person:

            return IntentResult(

                intent=THIRD_PERSON,

                confidence=0.98,

                explanation=(
                    "Conversation about another person."
                ),

                severity=LOW,

                targeted=False,

                self_reference=self_reference,

                third_person=True,

                reported_speech=reported,

                keyword_hits=total_hits

            )
        # ==========================================
        # DIRECT THREAT
        # ==========================================

        if threat_hits > 0:

         return IntentResult(

               intent=THREAT,

               confidence=0.99,

               explanation=(

                  "Threat detected."

           ),

            severity=severity,

             targeted=targeted,
 
             self_reference=False,

             third_person=False,

             reported_speech=reported,

             keyword_hits=total_hits,

              threat=True,

              repeated=total_hits >= 3

        )

        # ==========================================
        # SELF NARRATIVE
        # ==========================================

        if self_reference:

            return IntentResult(

                intent=NARRATIVE,

                confidence=0.99,

                explanation="Self reference detected.",

                severity=LOW,

                targeted=False,

                self_reference=True,

                third_person=False,

                reported_speech=reported,

                keyword_hits=total_hits
            )

        
 # ==========================================
        # QUESTION
        # ==========================================

        if is_question and threat_hits == 0:

            return IntentResult(

                intent=QUESTION,

                confidence=0.92,

                explanation="Question detected.",

                severity=LOW,

                targeted=targeted,

                self_reference=self_reference,

                third_person=third_person,

                reported_speech=reported,

                keyword_hits=total_hits

            )

        # ==========================================
        # DIRECT INSULT
        # ==========================================

        if (

            insult_hits > 0

            and targeted

            and not has_friendly

            and not has_joke

    ):

            return IntentResult(

                intent=INSULT,

                confidence=0.98,

                explanation=(

                     "Insult directed at receiver."

                ),

                severity=severity,

                targeted=True,

                self_reference=False,

                third_person=False,

                reported_speech=reported,

                keyword_hits=total_hits,

                insult=True,

                repeated=total_hits >= 3

        )
               

        # ==========================================
        # PRAISE
        # ==========================================

        if self._contains_any(
            lower,
            PRAISE_WORDS
        ):

            return IntentResult(

                intent=PRAISE,

                confidence=0.95,

                explanation="Positive appreciation detected.",

                severity=LOW,

                targeted=targeted,

                self_reference=self_reference,

                third_person=third_person,

                reported_speech=reported,

                keyword_hits=0

            )

        # ==========================================
        # FRIENDLY
        # ==========================================

        if self._contains_any(
            lower,
            FRIENDLY_WORDS
        ):

            return IntentResult(

               intent=FRIENDLY,

               confidence=0.90,

              explanation="Friendly conversation.",

             severity=LOW,

            targeted=targeted,

             self_reference=self_reference,

             third_person=third_person,

             reported_speech=reported,
 
             keyword_hits=0,
 
             friendly=True

)
        # ==========================================
        # JOKE
        # ==========================================

        if re.search(

            r"(😂|🤣|lol|lmao|haha|hehe)",

            original,

            flags=re.IGNORECASE

        ):

            return IntentResult(

              intent=JOKE,

             confidence=0.89,

             explanation="Humorous indicators detected.",

             severity=LOW,

             targeted=targeted,

             self_reference=self_reference,

             third_person=third_person,

             reported_speech=reported,

             keyword_hits=0,

             joke=True

)

        # ==========================================
        # NEUTRAL
        # ==========================================

        return IntentResult(

            intent=NEUTRAL,

            confidence=0.75,

            explanation="No strong conversational intent.",

            severity=LOW,

            targeted=targeted,

            self_reference=self_reference,

            third_person=third_person,

            reported_speech=reported,

            keyword_hits=0

        )
    # ==========================================================
# PUBLIC API
# ==========================================================

def analyze_intent(
    text: str
) -> IntentResult:
    """
    Public wrapper used by text_service.py
    and future moderation services.
    """

    return intent_engine.analyse(text)


# ==========================================================
# OPTIONAL HELPERS
# ==========================================================

def is_direct_attack(
    result: IntentResult
) -> bool:

    return (
        result.intent in {
            INSULT,
            THREAT
        }
        and result.targeted
    )


def is_safe_conversation(
    result: IntentResult
) -> bool:

    return result.intent in {
        FRIENDLY,
        PRAISE,
        QUESTION,
        JOKE,
        NEUTRAL,
        NARRATIVE,
        THIRD_PERSON
    }


# ==========================================================
# GLOBAL INSTANCE
# ==========================================================

intent_engine = IntentEngine()