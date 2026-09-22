from datasets import load_dataset

print("Downloading dataset...")

dataset = load_dataset("civil_comments")

print("Saving to CSV...")

dataset["train"].to_csv("toxic_data.csv")

print("Done ✅ File saved as toxic_data.csv")