#!/bin/bash
set -e

# Create and activate Python3 virtual environment
echo "Creating Python3 virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "Installing dependencies with pip3..."
pip3 install --upgrade pip
pip3 install psycopg2-binary python-dotenv spacy
python3 -m spacy download en_core_web_sm

echo "Running noun phrase extraction script..."
python3 extract_noun_phrases_to_tsv.py

echo "Done!"
