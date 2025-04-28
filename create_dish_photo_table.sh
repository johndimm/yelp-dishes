#!/bin/bash
set -e
source .env
psql "$DATABASE_URL_GCE" <<'EOSQL'
DROP TABLE IF EXISTS dish_photo;
CREATE TABLE dish_photo AS
SELECT
  d.id AS dish_int_id,
  np.photo_int_id
FROM dishes d
JOIN noun_phrases np ON d.noun_phrase = np.noun_phrase
GROUP BY 1,2;
EOSQL
echo "dish_photo table created and populated."

