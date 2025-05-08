import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

// Returns a single card per dish matching the query
export default async function handler(req, res) {
  const { q = '', limit = 20 } = req.query;
  if (!q || q.length < 2) {
    res.status(200).json([]);
    return;
  }
  try {
    const trimmed = q.trim();
    let sql, params;
    if (!trimmed.includes(' ')) {
      // Single word: match as a whole word anywhere in the noun_phrase
      sql = `
        SELECT DISTINCT ON (d.id) d.id AS dish_id, d.noun_phrase, b.name AS business_name,
          'https://www.johndimm.com/yelp_photos_2025/photos/' || p.yelp_photo_id || '.jpg' AS photo_url
        FROM dishes d
        JOIN dish_photo dp ON d.id = dp.dish_int_id
        JOIN photo p ON dp.photo_int_id = p.id
        JOIN business b ON p.business_int_id = b.id
        WHERE (
          lower(d.noun_phrase) LIKE $1 OR
          lower(d.noun_phrase) LIKE $2 OR
          lower(d.noun_phrase) LIKE $3 OR
          lower(d.noun_phrase) LIKE $4
        )
        ORDER BY d.id, d.noun_phrase, b.name, p.yelp_photo_id
      `;
      const word = trimmed.toLowerCase();
      params = [
        word,
        word + ' %',
        '% ' + word,
        '% ' + word + ' %'
      ].map(s => `%${s}%`);
    } else {
      // Multi-word: match the exact phrase
      sql = `
        SELECT DISTINCT ON (d.id) d.id AS dish_id, d.noun_phrase, b.name AS business_name,
          'https://www.johndimm.com/yelp_photos_2025/photos/' || p.yelp_photo_id || '.jpg' AS photo_url
        FROM dishes d
        JOIN dish_photo dp ON d.id = dp.dish_int_id
        JOIN photo p ON dp.photo_int_id = p.id
        JOIN business b ON p.business_int_id = b.id
        WHERE d.noun_phrase ILIKE $1
        ORDER BY d.id, d.noun_phrase, b.name, p.yelp_photo_id
      `;
      params = [`%${trimmed}%`];
    }
    const result = await pool.query(sql, params);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
