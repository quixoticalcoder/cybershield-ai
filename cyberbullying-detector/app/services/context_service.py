"""
CyberShield Phase 4

Advanced Context Decision Engine

Combines

• Intent
• Relationship
• Conversation Memory
• Sentiment
• Emotion
• Sarcasm

into one explainable moderation decision.
"""
from __future__ import annotations
from dataclasses import dataclass

from app.services.relationship_service import (
    relationship_engine
)

from app.services.intent_service import (
    intent_engine
)

from app.services.sarcasm_service import (
    sarcasm_engine
)

from app.services.conversation_memory import (
    conversation_memory
)


# ==========================================================
# RESULT
# ==========================================================

@dataclass
class ContextResult:

    blocked: bool

    risk_level: str

    confidence: float

    relationship: str

    relationship_score: float

    intent: str

    sarcasm: bool

    explanation: str


# ==========================================================
# ENGINE
# ==========================================================

class ContextEngine:

    def analyse(

        self,

        sender: str,

        receiver: str,

        text: str,

        toxic: bool,

        sentiment: str,

        emotion: str

    ) -> ContextResult:

        relationship = relationship_engine.analyse(
            sender,
            receiver
        )

        intent = intent_engine.analyse(
            text
        )
        print("========== INTENT DEBUG ==========")
        print("Intent:", intent.intent)
        print("Self:", intent.self_reference)
        print("Third:", intent.third_person)
        print("Targeted:", intent.targeted)
        print("==================================")

        sarcasm = sarcasm_engine.analyse(
            text
        )

        previous_toxic = conversation_memory.toxic_count(
            sender,
            receiver
        )

        confidence = 0.0

        blocked = False

        explanation = []
                # =====================================================
        # SAFE CONVERSATIONS
        # =====================================================

        # ------------------------------------------
        # Self-reference
        # Example:
        # "I'm stupid."
        # ------------------------------------------

        if (

            intent.self_reference

            and not intent.targeted

            and intent.intent != "Threat"

        ):

            return ContextResult(

                blocked=False,

                risk_level="LOW",

                confidence=0.02,

                relationship=relationship.relationship,

                relationship_score=relationship.score,

                intent=intent.intent,

                sarcasm=sarcasm.sarcastic,

                explanation="Self-reference."

            )
        # ------------------------------------------
        # Third-person discussion
        # Example:
        # "He is stupid."
        # "She is an idiot."
        # ------------------------------------------

        if (

            intent.third_person

            and not intent.targeted

        ):

            return ContextResult(

                blocked=False,

                risk_level="LOW",

                confidence=0.03,

                relationship=relationship.relationship,

                relationship_score=relationship.score,

                intent=intent.intent,

                sarcasm=sarcasm.sarcastic,

                explanation="Third-person discussion."

            )

                # ------------------------------------------
        # Reported speech
        # Example:
        # She said you are stupid.
        # He told me you're dumb.
        # ------------------------------------------

        if intent.reported_speech:

            return ContextResult(

                blocked=False,

                risk_level="LOW",

                confidence=0.05,

                relationship=relationship.relationship,

                relationship_score=relationship.score,

                intent=intent.intent,

                sarcasm=sarcasm.sarcastic,

                explanation="Reported speech."

            )

        # ------------------------------------------
        # Friendly conversations
        # ------------------------------------------

        if intent.intent in [

            "Friendly",

            "Joke",

            "Praise"

        ]:

            return ContextResult(

                blocked=False,

                risk_level="LOW",

                confidence=0.08,

                relationship=relationship.relationship,

                relationship_score=relationship.score,

                intent=intent.intent,

                sarcasm=sarcasm.sarcastic,

                explanation="Friendly conversation."

            )

        # ------------------------------------------
        # Questions
        # ------------------------------------------

        if (

            intent.intent == "Question"

            and not toxic

            and not intent.threat

        ):

            return ContextResult(

                blocked=False,

                risk_level="LOW",

                confidence=0.05,

                relationship=relationship.relationship,

                relationship_score=relationship.score,

                intent=intent.intent,

                sarcasm=sarcasm.sarcastic,

                explanation="General question."

            )

        # ------------------------------------------
        # Friendly banter
        # Example:
        # "You're stupid 😂"
        # "You're an idiot bro"
        # ------------------------------------------

        if (

            intent.intent == "Insult"

            and relationship.relationship == "Friendly"

            and (

                sarcasm.sarcastic

                or intent.friendly

                or intent.joke

            )

            and previous_toxic < 3

        ):

            return ContextResult(

                blocked=False,

                risk_level="LOW",

                confidence=0.10,

                relationship=relationship.relationship,

                relationship_score=relationship.score,

                intent=intent.intent,

                sarcasm=sarcasm.sarcastic,

                explanation="Friendly banter detected."

            )
        
                # =====================================================
        # RISK SCORING
        # =====================================================

        # ------------------------------------------
        # Direct Threat
        # ------------------------------------------

        if intent.intent == "Threat":

            confidence += 0.75

            blocked = True

            explanation.append(
                "Direct threat detected."
            )

        # ------------------------------------------
        # Direct Insult
        # ------------------------------------------

        elif intent.intent == "Insult":

            confidence += 0.25

            explanation.append(
                "Direct insult detected."
            )

        # ------------------------------------------
        # Targeted message
        # ------------------------------------------

        if intent.targeted:

            confidence += 0.15

            explanation.append(
                "Receiver directly targeted."
            )

        # ------------------------------------------
        # Toxic language
        # ------------------------------------------

        if toxic:

            confidence += 0.20

            explanation.append(
                "Toxic language detected."
            )

        # ------------------------------------------
        # Emotion
        # ------------------------------------------

        if emotion.lower() in [

            "anger",

            "hostile",

            "disgust"

        ]:

            confidence += 0.10

            explanation.append(
                "Hostile emotional tone."
            )

        # ------------------------------------------
        # Severity
        # ------------------------------------------

        if intent.severity == "HIGH":

            confidence += 0.20

        elif intent.severity == "MEDIUM":

            confidence += 0.10

        # ------------------------------------------
        # Repeated abusive words
        # ------------------------------------------

        if intent.repeated:

            confidence += 0.15

            explanation.append(
                "Repeated abusive language."
            )
        # =====================================================
        # CONVERSATION MEMORY
        # =====================================================
        
        abusive_current_message = (
            toxic
            or intent.intent in ["Insult", "Threat", "Hate Speech"]
        )

        if previous_toxic >= 3:

            confidence += 0.15

            explanation.append(
                "Repeated toxic history."
            )

        if previous_toxic >= 5:

            confidence += 0.15

            explanation.append(
                "Persistent harassment pattern."
            )

        # =====================================================
        # RELATIONSHIP ENGINE
        # =====================================================

        if (

            relationship.relationship == "Hostile"

            and intent.intent in [

                "Insult",

                "Threat"

            ]

        ):

            confidence += 0.15

            explanation.append(
                "Hostile relationship detected."
            )

        elif relationship.relationship == "Neutral":

            confidence += 0.05

        elif relationship.relationship == "Friendly":

            if intent.intent != "Threat":

                confidence -= 0.10

                explanation.append(
                    "Friendly relationship lowers risk."
                )

        # =====================================================
        # SARCASM
        # =====================================================

            if (

                sarcasm.sarcastic

                and relationship.relationship == "Friendly"

         ):

                 confidence -= 0.05

                 explanation.append(
                  "Friendly sarcasm detected."
            )
        # =====================================================
        # FINAL CONFIDENCE
        # =====================================================

        confidence = max(
            0.0,
            min(confidence, 1.0)
        )

        # =====================================================
        # FINAL DECISION
        # =====================================================

        if (

            blocked

            or

            (

                confidence >= 0.70

                and intent.intent != "Question"

            )

        ):

            blocked = True

        else:

            blocked = False
            
        
        
        # =====================================================
        # RISK LEVEL
        # =====================================================

        if confidence >= 0.90:

            risk = "CRITICAL"

        elif confidence >= 0.70:

            risk = "HIGH"

        elif confidence >= 0.45:

            risk = "MEDIUM"

        else:

            risk = "LOW"

        return ContextResult(

            blocked=blocked,

            risk_level=risk,

            confidence=round(
                confidence,
                3
            ),

            relationship=relationship.relationship,

            relationship_score=relationship.score,

            intent=intent.intent,

            sarcasm=sarcasm.sarcastic,

            explanation=" | ".join(explanation)
            if explanation
            else "No significant cyberbullying indicators."

        )
    # ==========================================================
# GLOBAL INSTANCE
# ==========================================================

context_engine = ContextEngine()