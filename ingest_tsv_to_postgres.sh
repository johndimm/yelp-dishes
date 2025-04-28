#!/bin/bash
set -e

# Load environment variables
source .env

# Create tables with integer PK and FK
psql "$DATABASE_URL_GCE" <<'EOSQL'
DROP TABLE IF EXISTS photo cascade;
DROP TABLE IF EXISTS business cascade;

CREATE TABLE business (
    id SERIAL PRIMARY KEY,
    yelp_business_id TEXT UNIQUE,
    name TEXT,
    stars REAL,
    review_count INTEGER,
    address TEXT,
    city TEXT,
    state TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    categories TEXT
);

CREATE TABLE photo (
    id SERIAL PRIMARY KEY,
    yelp_photo_id TEXT UNIQUE,
    yelp_business_id TEXT,
    label TEXT,
    caption TEXT
);
EOSQL

# Import data from TSV files
psql "$DATABASE_URL_GCE" -c "\COPY business(yelp_business_id, name, stars, review_count, address, city, state, latitude, longitude, categories) FROM 'data/business.tsv' WITH (FORMAT csv, DELIMITER E'\t', HEADER true, NULL '')"
psql "$DATABASE_URL_GCE" -c "\COPY photo(yelp_photo_id, yelp_business_id, label, caption) FROM 'data/photo.tsv' WITH (FORMAT csv, DELIMITER E'\t', HEADER true, NULL '')"

# Add integer FK to photo table and populate it
psql "$DATABASE_URL_GCE" <<'EOSQL'
ALTER TABLE photo ADD COLUMN business_int_id INTEGER;

UPDATE photo
SET business_int_id = business.id
FROM business
WHERE photo.yelp_business_id = business.yelp_business_id;

ALTER TABLE photo
    ADD CONSTRAINT photo_business_fk FOREIGN KEY (business_int_id) REFERENCES business(id);

ALTER TABLE photo DROP COLUMN yelp_business_id;
EOSQL

echo "TSV ingestion complete. Tables are ready!"
