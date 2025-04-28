#!/bin/bash
set -e
source .env
psql "$DATABASE_URL_GCE" <<'EOSQL'
DROP TABLE IF EXISTS noun_phrase_stats;
CREATE TABLE noun_phrase_stats AS
SELECT
  np.noun_phrase,
  SUM(CASE WHEN np.num_noun_phrases = 1 AND np.num_words = array_length(string_to_array(np.noun_phrase, ' '), 1) THEN 1 ELSE 0 END) AS num_solo,
  SUM(CASE WHEN np.num_noun_phrases = 1 AND np.num_words > array_length(string_to_array(np.noun_phrase, ' '), 1) THEN 1 ELSE 0 END) AS num_solo_embed,
  SUM(CASE WHEN np.num_noun_phrases >= 2 THEN 1 ELSE 0 END) AS num_multi_embed
FROM noun_phrases np
GROUP BY np.noun_phrase;
EOSQL
echo "noun_phrase_stats table created and populated."
