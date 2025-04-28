#!/bin/bash
set -e

# 1. Ingest raw business and photo TSVs into Postgres
bash ingest_tsv_to_postgres.sh

# 1b. Remove photo records for missing images (and clean up dependent records)
# bash check_and_remove_missing_photos.sh

# 2. Create and activate Python venv, install dependencies, extract noun phrases to TSV
bash setup_and_run_noun_phrases.sh

# 3. Bulk load captions.tsv into the captions table
bash copy_captions_to_db.sh

# 4. Create noun_phrases table (explode noun_phrase_array)
bash create_noun_phrases_table.sh

# 5. Create noun_phrase_stats table (aggregate stats)
bash create_noun_phrase_stats.sh

# 6. Create dishes table (filtered noun_phrase_stats with serial id)
bash create_dishes_table.sh

# 7. Create dish_photo table (dish-photo associations)
bash create_dish_photo_table.sh

# 8. Create dish_business table (dish-business associations)
bash create_dish_business_table.sh

# 9. Create or update stored procedures for API endpoints
bash create_stored_procedures.sh

echo "All steps completed!"

echo "\nReviewing dishes (see below):"
source .env
psql "$DATABASE_URL_GCE" -c "SELECT * FROM dishes order by num_solo + num_solo_embed + num_multi_embed desc;"

