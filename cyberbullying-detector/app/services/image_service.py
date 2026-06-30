import cv2
import numpy as np
import pytesseract

from PIL import Image

from app.services.text_service import (
    analyze_text
)


# ==========================================================
# TESSERACT CONFIGURATION
# ==========================================================

pytesseract.pytesseract.tesseract_cmd = (
    "/opt/homebrew/bin/tesseract"
)


# ==========================================================
# IMAGE PREPROCESSING
# ==========================================================

def preprocess_image(
    img: Image.Image
):

    img_np = np.array(img)

    gray = cv2.cvtColor(
        img_np,
        cv2.COLOR_BGR2GRAY
    )

    gray = cv2.resize(
        gray,
        None,
        fx=3,
        fy=3,
        interpolation=cv2.INTER_CUBIC
    )

    _, thresh = cv2.threshold(
        gray,
        150,
        255,
        cv2.THRESH_BINARY
    )

    return thresh


# ==========================================================
# OCR
# ==========================================================

def extract_text(
    img: Image.Image
) -> str:

    processed = preprocess_image(img)

    text = pytesseract.image_to_string(
        processed,
        config="--psm 6"
    )

    return text.strip()


# ==========================================================
# IMAGE MODERATION
# ==========================================================

def analyze_image(
    img: Image.Image,
    sender,
    receiver
):

    try:

        extracted_text = extract_text(img)

        print(
            "OCR TEXT:",
            extracted_text
        )

        if not extracted_text:

            return {

                "success": False,

                "error": "No text detected"

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
        # Therefore, image moderation automatically benefits
        # from Gemini without making another API call.
        # ==================================================

        analysis = analyze_text(

            text=extracted_text,

            sender=sender,

            receiver=receiver

        )

        return {

            "success": True,

            "extracted_text": extracted_text,

            "analysis": analysis

        }

    except Exception as e:

        print(
            "IMAGE ERROR:",
            str(e)
        )

        return {

            "success": False,

            "error": str(e)

        }