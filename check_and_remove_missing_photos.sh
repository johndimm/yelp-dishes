#!/bin/bash
set -e

# Start Python virtual environment and run the Python version of the script
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate

# Install dependencies if not already present
pip install --upgrade pip > /dev/null
pip install psycopg2-binary requests python-dotenv > /dev/null

# Run the Python script to check and remove missing photos
python check_and_remove_missing_photos.py
else
  echo "No missing photos found."
fi
