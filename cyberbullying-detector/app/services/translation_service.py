from langdetect import detect
from googletrans import Translator

translator = Translator()

def translate(text):
    try:
        lang = detect(text)
        if lang != "en":
            return translator.translate(text, dest="en").text
    except:
        pass
    return text