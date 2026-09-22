def analyze_emojis(text):
    return {
        "sarcasm": any(e in text for e in ["😂", "😏", "🙄"]),
        "anger": any(e in text for e in ["😡", "🤬"])
    }