import os
import psycopg2
import requests

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL_GCE")
PHOTO_URL_BASE = "nextjs-app/public/yelp-photos/train/train/{}.jpg"

# Connect to the database
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# Get all photo ids and yelp_photo_ids
cur.execute("SELECT id, yelp_photo_id FROM photo ORDER BY id;")
photos = cur.fetchall()

missing_photo_ids = []

for photo_id, yelp_photo_id in photos:
    if not yelp_photo_id or not str(yelp_photo_id).strip():
        print(f"{photo_id} has no yelp_photo_id")
        continue
    local_path = PHOTO_URL_BASE.format(yelp_photo_id.strip())
    if os.path.exists(local_path):
        print(f"Checked: {local_path} (photo.id={photo_id}) EXISTS")
    else:
        print(f"Checked: {local_path} (photo.id={photo_id}) MISSING")
        missing_photo_ids.append(photo_id)

if missing_photo_ids:
    print("Deleting missing photo records from DB...")
    ids_csv = ','.join(str(i) for i in missing_photo_ids)
    cur.execute(f"DELETE FROM photo WHERE id IN ({ids_csv});")
    conn.commit()
    print("Deleted photo records with missing images.")
else:
    print("No missing photos found.")

cur.close()
conn.close()
