import json
import time
import requests
import os

from dotenv import load_dotenv

load_dotenv()

# ==========================================================
# GEMINI SERVICE
# ==========================================================

class GeminiService:

    def __init__(self):

        # --------------------------------------------------
        # CONFIGURATION
        # --------------------------------------------------

        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()

        self.url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            "gemini-2.5-flash:generateContent"
        )

        # --------------------------------------------------
        # PERFORMANCE
        # --------------------------------------------------
        # Maximum time to wait before falling back to the
        # Context Engine.
        # --------------------------------------------------

        self.timeout = 15

    # ======================================================
    # API KEY
    # ======================================================

    def configure(
        self,
        api_key: str
    ):

        self.api_key = api_key.strip()

    def available(
    self
) -> bool:

     return bool(self.api_key and self.api_key.strip())

    # ======================================================
    # RESPONSE CLEANER
    # ======================================================

    def clean_response(
        self,
        response: str
    ) -> str:

        response = response.strip()

        if response.startswith("```json"):

            response = response[7:]

        elif response.startswith("```"):

            response = response[3:]

        if response.endswith("```"):

            response = response[:-3]

        return response.strip()
        # ======================================================
    # PROMPT BUILDER
    # ======================================================

    def build_prompt(

        self,

        current_message: str,

        conversation_history: list,

        metadata: dict

    ) -> str:

        # --------------------------------------------------
        # PERFORMANCE
        # --------------------------------------------------
        # Only the latest messages are usually needed for
        # contextual cyberbullying detection.
        # --------------------------------------------------

        recent_history = conversation_history[-10:]

        history = "\n".join(recent_history)

        compact_metadata = {

            "intent": metadata["intent"],

            "relationship": metadata["relationship"],

            "emotion": metadata["emotion"],

            "sarcasm": metadata["sarcasm"],

            "toxic": metadata["toxicity"]["toxic"],

            "toxicity": metadata["toxicity"]["severity"],

            "risk": metadata["context_engine"]["risk_level"]

        }

        metadata_text = json.dumps(
            compact_metadata,
            separators=(",", ":")
        )

        return f"""
You are cybershield-ai.

Your task is to determine whether ONLY the CURRENT MESSAGE is cyberbullying.

Before making your decision, ALWAYS read and understand the COMPLETE conversation history.

Never judge the CURRENT MESSAGE in isolation.

Your goal is to understand conversational intent, emotional tone, relationship dynamics and the likelihood of emotional harm.

Cyberbullying is determined by intentional emotional harm, NOT by offensive vocabulary alone.

Conversation History:
{history}

Current Message:
{current_message}

Existing AI Analysis:
{metadata_text}
Use the Existing AI Analysis as supporting information only. Your final decision must be based primarily on the COMPLETE conversation and the CURRENT MESSAGE.
Rules:

• Focus on conversational intent rather than individual words.

• The same message can have different meanings depending on context.
Examples:
- "Don't be stupid."
- "You idiot."
- "You dumbass."
These may be reassurance, humour, playful teasing or genuine abuse depending on the conversation.

• Offensive words such as stupid, idiot, dumb, crazy, fuck, fucking, shit, bitch, loser, useless, etc. are NOT automatically cyberbullying.

• Friends, couples and family members naturally joke, tease, argue, use sarcasm and even swear affectionately. Do NOT classify these as cyberbullying unless there is clear malicious intent.

• However, friendship, relationships or previous positive conversations NEVER excuse genuine abuse. Friends can bully friends and partners can emotionally abuse each other.

• Repeated greetings (hey, hello, hi, good morning, good night, etc.) are NOT cyberbullying.

• Repeated emojis, stickers, reactions and GIFs are NOT cyberbullying by themselves.

• Friendly spam between users is NOT cyberbullying.

• Spam should only be considered harassment when it is clearly intended to intimidate, threaten, abuse, stalk or repeatedly target another person.

• Emojis, greetings, stickers, punctuation and filler messages may contribute to context, but they are NEVER sufficient by themselves to prove that a conversation is friendly or hostile.

• Evaluate the COMPLETE conversation before making your decision.

• Do not rely only on offensive words.

• Do not rely only on emojis.

• Do not rely only on previous friendly messages.

• Always determine WHY the CURRENT MESSAGE was sent.

• Always consider:
  - conversational context
  - conversational flow
  - emotional progression
  - relationship dynamics
  - reassurance
  - sarcasm
  - friendly banter
  - playful teasing
  - temporary disagreements
  - constructive criticism
  - targeted abuse
  - repeated harassment
  - emotional abuse
  - intimidation
  - threats
  - hate speech
  - discrimination

• If the CURRENT MESSAGE is clearly intended to threaten, humiliate, intimidate, repeatedly target or emotionally harm another person, classify it as cyberbullying even if emojis or previous friendly messages are present.

• Return ONLY valid JSON.

{{
  "bullying": true,
  "confidence": 95,
  "severity": "HIGH",
  "reason": "...",
  "explanation": "...",
  "summary": "..."
}}
"""
        # ======================================================
    # SEND REQUEST
    # ======================================================

    def send_request(
        self,
        prompt: str
    ):

        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ]
        }

        headers = {
            "Content-Type": "application/json"
        }

        try:

            start = time.perf_counter()

            response = requests.post(

                f"{self.url}?key={self.api_key}",

                headers=headers,

                json=payload,

                timeout=self.timeout

            )

            elapsed = time.perf_counter() - start

            print("\n========== GEMINI PERFORMANCE ==========")
            print(f"API Response Time : {elapsed:.2f} seconds")
            print("========================================\n")

            print("\n========== GEMINI HTTP ==========")
            print("Status:", response.status_code)
            print("=================================\n")

            response.raise_for_status()

            data = response.json()

            if (
                "candidates" not in data
                or
                len(data["candidates"]) == 0
            ):

                return {
                    "success": False,
                    "reason": "No Gemini candidates returned."
                }

            text = data["candidates"][0]["content"]["parts"][0]["text"]

            return {

                "success": True,

                "text": text

            }

        except requests.exceptions.Timeout:

            print("\n========== GEMINI TIMEOUT ==========")
            print("Gemini exceeded timeout.")
            print("====================================\n")

            return {

                "success": False,

                "reason": "Gemini request timed out."

            }

        except requests.exceptions.RequestException as e:

            print("\n========== GEMINI REQUEST ERROR ==========")
            print(e)
            print("==========================================\n")

            return {

                "success": False,

                "reason": str(e)

            }

        except Exception as e:

            print("\n========== GEMINI ERROR ==========")
            print(e)
            print("==================================\n")

            return {

                "success": False,

                "reason": str(e)

            }
            # ======================================================
    # PARSE RESPONSE
    # ======================================================

    def parse_response(
        self,
        text: str
    ):

        text = self.clean_response(text)

        try:

            parsed = json.loads(text)

            return {

                "success": True,

                "response": parsed,

                "raw_response": text

            }

        except json.JSONDecodeError:

            start_json = text.find("{")

            end_json = text.rfind("}")

            if (

                start_json != -1

                and

                end_json != -1

            ):

                try:

                    parsed = json.loads(

                        text[start_json:end_json + 1]

                    )

                    print(

                        "\nRecovered Gemini JSON successfully.\n"

                    )

                    return {

                        "success": True,

                        "response": parsed,

                        "raw_response": text

                    }

                except Exception as e:

                    print("\n========== GEMINI JSON ERROR ==========")

                    print(e)

                    print(text)

                    print("=======================================\n")

                    return {

                        "success": False,

                        "reason": f"Recovered JSON failed: {e}",

                        "raw_response": text

                    }

            print("\n========== GEMINI RAW RESPONSE ==========")

            print(text)

            print("=========================================\n")

            return {

                "success": False,

                "reason": "No JSON object found.",

                "raw_response": text

            }
            # ======================================================
    # ANALYSIS
    # ======================================================

    def analyse(
        self,
        current_message: str,
        conversation_history: list,
        metadata: dict,
    ):

        if not self.available():

            return {
                "success": False,
                "reason": "Gemini API key not configured."
            }

        prompt = self.build_prompt(
            current_message=current_message,
            conversation_history=conversation_history,
            metadata=metadata
        )

        print("\n========== GEMINI HISTORY ==========")
        print(
            f"Messages Sent To Gemini: {min(len(conversation_history), 10)}"
        )

        for index, message in enumerate(
            conversation_history[-10:],
            start=1
        ):

            print(f"{index}. {message}")

        print("====================================\n")

        request_result = self.send_request(prompt)

        if not request_result.get("success"):

            return request_result

        return self.parse_response(
            request_result["text"]
        )
# ==========================================================
# GLOBAL INSTANCE
# ==========================================================

gemini_service = GeminiService()