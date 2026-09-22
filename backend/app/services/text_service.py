from transformers import pipeline
from googletrans import Translator
import re

from app.services.toxicity_service import (
    toxicity_engine
)

from app.services.intent_service import (
    intent_engine
)

from app.services.relationship_service import (
    relationship_engine
)

from app.services.sarcasm_service import (
    sarcasm_engine
)

from app.services.context_service import (
    context_engine
)

from app.services.conversation_memory import (
    conversation_memory
)

from app.services.gemini_services import (
    gemini_service
)

from app.database import (
    cursor
)

# ==========================================================
# MODELS
# ==========================================================

translator = Translator()

sentiment_model = pipeline(
    "sentiment-analysis"
)

emotion_model = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base"
)

# ==========================================================
# HELPERS
# ==========================================================

# Detect messages that already appear to be English.
# This avoids unnecessary Google Translate API calls.

ENGLISH_REGEX = re.compile(
    r"^[A-Za-z0-9\s.,!?@#$%^&*()_\-+=:;\"'\\/]*$"
)


def preprocess_text(
    text: str
) -> str:

    if not text:
        return ""

    text = text.strip()

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text


def translate_text(
    text: str
) -> str:

    if not text:
        return ""

    # ------------------------------------------------------
    # PERFORMANCE OPTIMISATION
    #
    # Skip Google Translate if the text is already English.
    # This removes one unnecessary network request.
    # ------------------------------------------------------

    if ENGLISH_REGEX.fullmatch(text):
        return text

    try:

        translated = translator.translate(
            text,
            dest="en"
        )

        if translated and translated.text:
            return translated.text

        return text

    except Exception:

        return text


def is_empty_message(
    text: str
) -> bool:

    cleaned = re.sub(
        r"[^a-zA-Z0-9\s]",
        "",
        text
    ).strip()

    return cleaned == ""


# ==========================================================
# GEMINI HELPERS
# ==========================================================
def get_recent_conversation(

    sender: str,

    receiver: str,

    limit: int = 20

):

    # ------------------------------------------------------
    # STEP 1
    # Fast in-memory conversation history
    # ------------------------------------------------------

    memory_history = conversation_memory.get_recent_messages(

        sender,

        receiver,

        limit

    )

    history = [

        f"{message.sender}: {message.text}"

        for message in memory_history

    ]

    # ------------------------------------------------------
    # PERFORMANCE
    #
    # If memory already contains enough history,
    # skip the SQLite query completely.
    # ------------------------------------------------------

    if len(history) >= limit:

        return history

    # ------------------------------------------------------
    # STEP 2
    # Load remaining conversation from SQLite
    # ------------------------------------------------------

    cursor.execute(
        """
        SELECT
            sender,
            message
        FROM messages

    WHERE

    (

        (

            sender = ?

            AND receiver = ?

        )

        OR

        (

            sender = ?

            AND receiver = ?

        )

    )

    ORDER BY id DESC

    LIMIT ?

    """,

    (

        sender,

        receiver,

        receiver,

        sender,

        limit

    )

)
    rows = cursor.fetchall()

    database_history = [

        f"{row[0]}: {row[1]}"

        for row in reversed(rows)

    ]

    # ------------------------------------------------------
    # Merge memory + database
    # Remove duplicates
    # Preserve chronological order
    # ------------------------------------------------------

    merged = []

    seen = set()

    for message in database_history + history:

        if message not in seen:

            merged.append(message)

            seen.add(message)

    return merged[-limit:]


def get_gemini_review(

    current_message: str,

    conversation_history: list,

    metadata: dict

):

    return gemini_service.analyse(

        current_message=current_message,

        conversation_history=conversation_history,

        metadata=metadata

    )


# ==========================================================
# MAIN ENGINE
# ==========================================================
def analyze_text(

    text: str,

    sender: str = "local_user",

    receiver: str = "local_receiver"

):

    original_text = text

    # ------------------------------------------------------
    # PREPROCESS
    # ------------------------------------------------------

    text = preprocess_text(text)

    if is_empty_message(text):

        return {

            "original_text": original_text,

            "translated_text": text,

            "bullying": "No bullying detected",

            "blocked": False,

            "risk_level": "LOW",

            "confidence": 0.0,

            "sentiment": "NEUTRAL",

            "emotion": "neutral",

            "intent": "Neutral",

            "severity": "LOW",

            "relationship": "Unknown",

            "relationship_score": 0,

            "sarcasm_detected": False,

            "toxicity": {},

            "explanation": "Empty message.",

            "gemini_summary": "",

            "gemini_used": False

        }

    # ------------------------------------------------------
    # TRANSLATION
    # ------------------------------------------------------

    translated_text = translate_text(text)

    translated_text = translated_text[:1500]

    # ------------------------------------------------------
    # RECENT CONVERSATION
    # ------------------------------------------------------

    conversation_history = get_recent_conversation(

        sender,

        receiver,

        limit=20

    )

    conversation_history.append(

        f"{sender}: {translated_text}"

    )

    # ------------------------------------------------------
    # NLP MODELS
    # ------------------------------------------------------

    sentiment = sentiment_model(

        translated_text[:512]

    )[0]

    emotion = emotion_model(

        translated_text[:512]

    )[0]

    sentiment_label = sentiment["label"]

    sentiment_score = sentiment["score"]

    emotion_label = emotion["label"]

    # ------------------------------------------------------
    # TOXICITY
    # ------------------------------------------------------

    toxicity = toxicity_engine.analyse(

        translated_text

    )

    is_toxic = toxicity.toxic

    # ------------------------------------------------------
    # INTENT
    # ------------------------------------------------------

    intent = intent_engine.analyse(

        translated_text

    )

    # ------------------------------------------------------
    # SARCASM
    # ------------------------------------------------------

    sarcasm = sarcasm_engine.analyse(

        original_text

    )

    # ------------------------------------------------------
    # RELATIONSHIP
    # ------------------------------------------------------

    relationship = relationship_engine.analyse(

        sender,

        receiver

    )

    # ------------------------------------------------------
    # STORE MESSAGE IN MEMORY
    # ------------------------------------------------------

    conversation_memory.add_message(

        sender=sender,

        receiver=receiver,

        text=translated_text,

        toxic=is_toxic,

        intent=intent.intent,

        sentiment=sentiment_label,

        emotion=emotion_label,

        sarcasm=sarcasm.sarcastic

    )

    # ------------------------------------------------------
    # CONTEXT ENGINE
    # ------------------------------------------------------

    context = context_engine.analyse(

        sender=sender,

        receiver=receiver,

        text=translated_text,

        toxic=is_toxic,

        sentiment=sentiment_label,

        emotion=emotion_label

    )

    # ------------------------------------------------------
    # STRUCTURED AI METADATA
    # ------------------------------------------------------

    metadata = {

        "intent": context.intent,

        "intent_confidence": intent.confidence,

        "severity": intent.severity,

        "relationship": context.relationship,

        "relationship_score": context.relationship_score,

        "sentiment": sentiment_label,

        "sentiment_score": round(

            sentiment_score,

            3

        ),

        "emotion": emotion_label,

        "sarcasm": sarcasm.sarcastic,

        "toxicity": {

            "toxic": toxicity.toxic,

            "severity": toxicity.severity,

            "score": toxicity.score,

            "confidence": toxicity.confidence,

            "explanation": toxicity.explanation

        },

        "context_engine": {

            "blocked": context.blocked,

            "risk_level": context.risk_level,

            "confidence": context.confidence,

            "explanation": context.explanation

        }

    }
        # ------------------------------------------------------
    # GEMINI REVIEW
    # ------------------------------------------------------

    gemini_available = gemini_service.available()

    gemini_result = get_gemini_review(

        current_message=translated_text,

        conversation_history=conversation_history,

        metadata=metadata

    )

    print("\n========== GEMINI RESPONSE ==========")

    if gemini_result is None:

        print("Gemini returned None.")

    else:

        print(gemini_result)

    print("=====================================\n")

    # ------------------------------------------------------
    # FINAL MODERATION DECISION
    # ------------------------------------------------------

    gemini_used = (

        gemini_result is not None

        and

        gemini_result.get(

            "success",

            False

        )

    )

    print("\n========== GEMINI STATUS ==========")

    print(

        "Gemini Used:",

        gemini_used

    )

    print("===================================\n")

    if gemini_used:

        response = gemini_result.get(

            "response",

            {}

        )

        bullying_detected = bool(

            response.get(

                "bullying",

                context.blocked

            )

        )

        confidence = float(

            response.get(

                "confidence",

                round(

                    context.confidence * 100

                )

            )

        )

        severity = str(

            response.get(

                "severity",

                context.risk_level

            )

        ).upper()

        explanation = response.get(

            "explanation",

            context.explanation

        )

        gemini_summary = response.get(

            "summary",

            ""

        )

    else:

        print("\n========== GEMINI FALLBACK ==========")

        if gemini_available:

            print(

                "Gemini unavailable or timed out."

            )

        else:

            print(

                "Gemini API key not configured."

            )

        print(

            "Using Context Engine."

        )

        print(

            "=====================================\n"

        )

        bullying_detected = context.blocked

        confidence = round(

            context.confidence * 100

        )

        severity = context.risk_level

        explanation = context.explanation

        if bullying_detected:

            gemini_summary = (

                f"{context.intent}. "

                f"{context.explanation}"

            )

        else:

            gemini_summary = (

                f"{context.intent}. "

                f"No cyberbullying detected."

            )

    blocked = bullying_detected

    bullying = (

        "⚠️ Bullying detected"

        if bullying_detected

        else "No bullying detected"

    )
        # ------------------------------------------------------
    # FINAL RESPONSE
    # ------------------------------------------------------

    return {

        "original_text": original_text,

        "translated_text": translated_text,

        "bullying": bullying,

        "blocked": blocked,

        "risk_level": severity,

        "confidence": confidence,

        "sentiment": sentiment_label,

        "sentiment_score": round(

            sentiment_score,

            3

        ),

        "emotion": emotion_label,

        "intent": context.intent,

        "severity": severity,

        "relationship": context.relationship,

        "relationship_score": context.relationship_score,

        "sarcasm_detected": sarcasm.sarcastic,

        "toxicity": {

            "toxic": toxicity.toxic,

            "severity": toxicity.severity,

            "score": toxicity.score,

            "confidence": toxicity.confidence,

            "explanation": toxicity.explanation

        },

        "context_engine": {

            "blocked": context.blocked,

            "risk_level": context.risk_level,

            "confidence": context.confidence,

            "explanation": context.explanation

        },

        "gemini_summary": gemini_summary,

        "gemini_used": gemini_used,

        "explanation": explanation

    }