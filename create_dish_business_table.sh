#!/bin/bash
set -e
source .env
psql "$DATABASE_URL_GCE" <<'EOSQL'
DROP TABLE IF EXISTS dish_business;
CREATE TABLE dish_business AS
SELECT
  dp.dish_int_id,
  p.business_int_id,
  MIN(dp.photo_int_id) AS example_photo_id
FROM dish_photo dp
JOIN photo p ON dp.photo_int_id = p.id
GROUP BY dp.dish_int_id, p.business_int_id;
EOSQL
echo "dish_business table created and populated."
