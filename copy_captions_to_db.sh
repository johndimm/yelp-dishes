#!/bin/bash
set -e
source .env
psql "$DATABASE_URL_GCE" <<'EOSQL'
DROP TABLE IF EXISTS captions;
CREATE TABLE captions (
    photo_int_id INTEGER PRIMARY KEY REFERENCES photo(id),
    caption TEXT,
    noun_phrase_array TEXT[],
    num_words INTEGER
);
EOSQL
psql "$DATABASE_URL_GCE" -c "\COPY captions(photo_int_id, caption, noun_phrase_array, num_words) FROM 'data/captions.tsv' WITH (FORMAT csv, DELIMITER E'\t', HEADER true, NULL '')"
echo "Captions TSV ingested to database."
