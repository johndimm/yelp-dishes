#!/bin/bash
set -e
source .env
psql "$DATABASE_URL_GCE" <<'EOSQL'
DROP TABLE IF EXISTS noun_phrases;
CREATE TABLE noun_phrases AS
SELECT
    photo_int_id,
    unnest(noun_phrase_array) AS noun_phrase,
    array_length(noun_phrase_array, 1) AS num_noun_phrases,
    num_words
FROM captions;
EOSQL
echo "noun_phrases table created and populated."
