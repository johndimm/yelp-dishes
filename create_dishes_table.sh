#!/bin/bash
set -e
source .env
psql "$DATABASE_URL_GCE" <<'EOSQL'
DROP TABLE IF EXISTS dishes;
CREATE TABLE dishes AS
SELECT
  nextval('dishes_id_seq') AS id,
  nps.*
FROM (
  SELECT *
  FROM noun_phrase_stats
  WHERE (num_solo_embed > 0 OR num_multi_embed > 0)
    AND num_solo > 3
  ORDER BY noun_phrase
) nps;
-- Add serial sequence if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'dishes_id_seq') THEN
        CREATE SEQUENCE dishes_id_seq;
    END IF;
END$$;
ALTER TABLE dishes ALTER COLUMN id SET DEFAULT nextval('dishes_id_seq');
ALTER TABLE dishes ADD PRIMARY KEY (id);
EOSQL
echo "dishes table created and populated."
