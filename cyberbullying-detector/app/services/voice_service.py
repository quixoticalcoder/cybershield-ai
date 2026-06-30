import whisper

from app.services.text_service import (
    analyze_text
)

# ==========================================================
# LOAD WHISPER MODEL (Lazy Loading)
# ==========================================================

model = None


def get_model():
    global model

    if model is None:
        model = whisper.load_model("base")

    return model


# ==========================================================
# SPEECH TO TEXT
# ==========================================================

def transcribe_audio(
    file_path: str
) -> str:

    whisper_model = get_model()

    result = whisper_model.transcribe(
        file_path
    )

    return result.get(
        "text",
        ""
    ).strip()

# ==========================================================
# VOICE MODERATION
# ==========================================================

def analyze_voice(
    file_path,
    sender,
    receiver
):

    try:

        transcription = transcribe_audio(
            file_path
        )

        print(
            "VOICE TEXT:",
            transcription
        )

        if not transcription:

            return {

                "success": False,

                "error": "No speech detected"

            }

        # ==================================================
        # AI ANALYSIS
        # ==================================================
        #
        # analyze_text() already performs:
        #
        # • Translation
        # • Sentiment Analysis
        # • Emotion Detection
        # • Toxicity Detection
        # • Intent Detection
        # • Relationship Analysis
        # • Conversation Memory
        # • Context Engine
        # • Gemini Review
        #
        # Therefore, voice moderation automatically
        # benefits from Gemini without another API call.
        # ==================================================

        analysis = analyze_text(

            text=transcription,

            sender=sender,

            receiver=receiver

        )

        return {

            "success": True,

            "transcription": transcription,

            "analysis": analysis

        }

    except Exception as e:

        print(
            "VOICE ERROR:",
            str(e)
        )

        return {

            "success": False,

            "error": str(e)

        }