import os
import psycopg2
import spacy
from dotenv import load_dotenv
import csv
import ast

# Load environment variables from .env
load_dotenv()
DB_URL = os.getenv('DATABASE_URL_GCE')

nlp = spacy.load('en_core_web_sm')
import re
import string

def clean_noun_phrase(phrase):
    # Remove price patterns (e.g., $12.99, 15.00, 9, $9)
    phrase = re.sub(r'(\$\d+(?:\.\d{2})?)|(\b\d+(?:\.\d{2})?\b)', '', phrase)
    # Remove terminal punctuation (., !, ?, etc.)
    return phrase.strip().rstrip(string.punctuation).lower()

def extract_noun_phrases(text):
    doc = nlp(text)
    EXCLUDE = {"yum", "yummy", "yumm", "yummm", "mmm", "wow", "delicious", "so delicious", "so good", "so yummy", "s", "menuu", "menu"}
    noun_phrases = [clean_noun_phrase(chunk.text) for chunk in doc.noun_chunks]
    # If the full caption is a noun phrase, ensure it's included
    full_caption_clean = clean_noun_phrase(text.strip())
    if len(noun_phrases) == 1 and noun_phrases[0] == full_caption_clean:
        filtered = [np for np in noun_phrases if np not in EXCLUDE and np]
        return filtered
    if full_caption_clean not in noun_phrases:
        for chunk in doc.noun_chunks:
            if chunk.start == 0 and chunk.end == len(doc):
                if clean_noun_phrase(chunk.text) == full_caption_clean:
                    filtered = [np for np in noun_phrases if np not in EXCLUDE and np]
                    return filtered
        noun_phrases.append(full_caption_clean)
    # Remove excluded and empty noun phrases
    return [np for np in noun_phrases if np not in EXCLUDE and np]

def main():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    cur.execute("SELECT id, caption FROM photo WHERE caption IS NOT NULL AND caption != ''; ")
    rows = cur.fetchall()
    out_path = 'data/captions.tsv'
    with open(out_path, 'w', newline='') as f:
        writer = csv.writer(f, delimiter='\t', quoting=csv.QUOTE_MINIMAL)
        writer.writerow(['photo_int_id', 'caption', 'noun_phrase_array', 'num_words'])
        for photo_id, caption in rows:
            noun_phrases = extract_noun_phrases(caption)
            num_words = len(caption.split())
            # Write as a postgres array literal
            writer.writerow([
                photo_id,
                caption,
                '{' + ','.join('"' + np.replace('"', '\"') + '"' for np in noun_phrases) + '}',
                num_words
            ])
    cur.close()
    conn.close()
    print(f"Wrote TSV to {out_path}")

if __name__ == '__main__':
    main()
