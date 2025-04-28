#!/bin/bash
set -e
source .env
psql "$DATABASE_URL_GCE" <<'EOSQL'
DROP FUNCTION IF EXISTS get_popular_dishes(integer, integer);
CREATE OR REPLACE FUNCTION get_popular_dishes(page_size integer, page_offset integer)
RETURNS TABLE (
    dish_id bigint,
    noun_phrase text,
    num_solo integer,
    num_solo_embed integer,
    num_multi_embed integer,
    photo_url text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.noun_phrase,
        d.num_solo::integer,
        d.num_solo_embed::integer,
        d.num_multi_embed::integer,
        (
            SELECT
                'http://localhost/projects/yelp-dishes/data/Yelp Photos/yelp_photos/photos/' || p.yelp_photo_id || '.jpg'
            FROM dish_photo dp
            JOIN photo p ON dp.photo_int_id = p.id
            WHERE dp.dish_int_id = d.id
            LIMIT 1
        ) AS photo_url
    FROM dishes d
    ORDER BY (d.num_solo + d.num_solo_embed + d.num_multi_embed) DESC
    LIMIT page_size OFFSET page_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Drop and create get_dish
DROP FUNCTION IF EXISTS get_dish(bigint, integer, integer);
CREATE OR REPLACE FUNCTION get_dish(
    in_dish_id bigint,
    in_page_size integer,
    in_page_offset integer
)
RETURNS TABLE (
    business_id bigint,
    business_name text,
    photo_url text,
    caption text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id::bigint AS business_id,
        b.name AS business_name,
        'http://localhost/projects/yelp-dishes/data/Yelp Photos/yelp_photos/photos/' || p.yelp_photo_id || '.jpg' AS photo_url,
        c.caption
    FROM dish_business db
    JOIN business b ON b.id = db.business_int_id
    JOIN photo p ON p.id = db.example_photo_id
    LEFT JOIN captions c ON c.photo_int_id = p.id
    WHERE db.dish_int_id = in_dish_id
    ORDER BY b.name
    LIMIT in_page_size OFFSET in_page_offset;
END;
$$ LANGUAGE plpgsql STABLE;
EOSQL
echo "Stored procedures created/updated."

# Test the get_popular_dishes procedure
psql "$DATABASE_URL_GCE" -c "SELECT * FROM get_popular_dishes(5, 0);"

# Test the get_dish procedure with dish_id 1 (change as needed)
echo "\nTesting get_dish for dish_id 1 (first 5 businesses):"
psql "$DATABASE_URL_GCE" -c "SELECT * FROM get_dish(1, 5, 0);"

# Create get_restaurant stored procedure
psql "$DATABASE_URL_GCE" <<'EOSQL2'
DROP FUNCTION IF EXISTS get_business(bigint);
CREATE OR REPLACE FUNCTION get_business(
    in_business_id bigint
)
RETURNS TABLE (
    business_id bigint,
    yelp_business_id text,
    name text,
    stars real,
    review_count integer,
    address text,
    city text,
    state text,
    latitude double precision,
    longitude double precision,
    categories text,
    dish_id bigint,
    noun_phrase text,
    photo_url text,
    caption text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id::bigint AS business_id,
        b.yelp_business_id,
        b.name,
        b.stars,
        b.review_count,
        b.address,
        b.city,
        b.state,
        b.latitude,
        b.longitude,
        b.categories,
        d.id AS dish_id,
        d.noun_phrase,
        'http://localhost/projects/yelp-dishes/data/Yelp Photos/yelp_photos/photos/' || p.yelp_photo_id || '.jpg' AS photo_url,
        c.caption
    FROM (
        SELECT
            db.dish_int_id,
            MIN(dp.photo_int_id) AS example_photo_id
        FROM dish_business db
        JOIN dish_photo dp ON dp.dish_int_id = db.dish_int_id AND db.business_int_id = in_business_id
        WHERE db.business_int_id = in_business_id
        GROUP BY db.dish_int_id
    ) x
    JOIN dishes d ON d.id = x.dish_int_id
    JOIN photo p ON p.id = x.example_photo_id
    LEFT JOIN captions c ON c.photo_int_id = p.id
    JOIN business b ON b.id = in_business_id;
END;
$$ LANGUAGE plpgsql STABLE;
EOSQL2

echo "\nTesting get_business for business_id 3 (all dishes):"
psql "$DATABASE_URL_GCE" -c "SELECT * FROM get_business(3);"
