import os
import json
import csv
import re

# Adjust path to where your 'language-list/data/' folder is located
DATA_PATH = "/Users/benjaminsimmons/Downloads/language-list-master/data"
OUTPUT_CSV = "global_languages.csv"

# List of language codes supported by ChatGPT
chatgpt_supported_codes = {
    "af", "am", "ar", "az", "be", "bg", "bn", "bs", "ca", "ceb", "cs", "cy",
    "da", "de", "el", "en", "eo", "es", "et", "eu", "fa", "fi", "fil", "fr",
    "ga", "gl", "gu", "ha", "haw", "he", "hi", "hmn", "hr", "ht", "hu", "hy",
    "id", "ig", "is", "it", "ja", "jv", "ka", "kk", "km", "kn", "ko", "ku",
    "ky", "la", "lb", "lo", "lt", "lv", "mg", "mi", "mk", "ml", "mn", "mr",
    "ms", "mt", "my", "ne", "nl", "no", "ny", "pa", "pl", "ps", "pt", "ro",
    "ru", "rw", "sd", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "st",
    "su", "sv", "sw", "ta", "te", "tg", "th", "tk", "tl", "tr", "tt", "ug",
    "uk", "ur", "uz", "vi", "xh", "yi", "yo", "zh", "zu"
}

# Only keep folder names and keys that are exactly two lowercase letters
pattern = re.compile(r"^[a-z]{2}$")
rows = []

for folder in os.listdir(DATA_PATH):
    full_path = os.path.join(DATA_PATH, folder)
    if not os.path.isdir(full_path):
        continue
    
    json_path = os.path.join(DATA_PATH, folder, "language.json")

    with open(json_path, "r", encoding="utf-8") as f:
        try:
            translations = json.load(f)
            lang_name = translations[folder]
            if lang_name:
                rows.append({
                    "code": folder,
                    "name": lang_name,
                    "chatgpt_supported": folder in chatgpt_supported_codes
                })
        except Exception as e:
            print(f"❌ Failed reading {json_path}: {e}")

# Write results to CSV
with open(OUTPUT_CSV, "w", newline='', encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["code", "name", "chatgpt_supported"])
    writer.writeheader()
    writer.writerows(rows)

print(f"✅ Exported {len(rows)} rows to {OUTPUT_CSV}")

# ------------------------
# GENERATE TRANSLATION CSV
# ------------------------

TRANSLATION_CSV = "global_language_translations.csv"
translations = []

# Step 1: Load global_languages.csv as code → id map
lang_code_to_id = {}
with open(OUTPUT_CSV, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        lang_code_to_id[row["code"]] = int(row["id"]) if "id" in row else len(lang_code_to_id) + 1  # Fallback if no ID column

# Step 2: Loop through folders again and extract all valid base-code translations
for folder in os.listdir(DATA_PATH):
    if not pattern.match(folder):
        continue

    json_path = os.path.join(DATA_PATH, folder, "language.json")
    if not os.path.isfile(json_path):
        continue

    with open(json_path, "r", encoding="utf-8") as f:
        try:
            translations_json = json.load(f)
            for base_code, translated_name in translations_json.items():
                if not pattern.match(base_code):
                    continue
                if base_code in lang_code_to_id:
                    translations.append({
                        "language_id": lang_code_to_id[base_code],
                        "translation_code": folder,
                        "translated_name": translated_name
                    })
        except Exception as e:
            print(f"❌ Failed to process {json_path}: {e}")

# Step 3: Write translations to CSV
with open(TRANSLATION_CSV, "w", newline='', encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["language_id", "translation_code", "translated_name"])
    writer.writeheader()
    writer.writerows(translations)

print(f"✅ Exported {len(translations)} rows to {TRANSLATION_CSV}")
