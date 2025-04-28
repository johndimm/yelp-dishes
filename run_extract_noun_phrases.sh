#!/bin/bash
set -e

# Create venv if it doesn't exist
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

# Activate venv
source .venv/bin/activate

# Install dependencies (if requirements.txt exists)
if [ -f requirements.txt ]; then
  pip install -r requirements.txt
else
  pip install psycopg2-binary spacy
fi

# Run the noun phrase extraction script
python extract_noun_phrases_to_tsv.py
