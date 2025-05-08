import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

export default async function handler(req, res) {
  const { business_id } = req.query;
  if (!business_id) {
    res.status(400).json({ error: 'business_id is required' });
    return;
  }
  try {
    // Fetch all dishes served by this business, with all photos/captions
    const result = await pool.query(
      `SELECT d.id AS dish_id, d.noun_phrase, p.yelp_photo_id, p.caption, 
              'https://www.johndimm.com/yelp_photos_2025/photos/' || p.yelp_photo_id || '.jpg' AS photo_url
       FROM dishes d
       JOIN dish_photo dp ON d.id = dp.dish_int_id
       JOIN photo p ON dp.photo_int_id = p.id
       WHERE p.business_int_id = $1
       ORDER BY d.noun_phrase, p.yelp_photo_id`,
      [business_id]
    );
    // Group by dish_id in the frontend
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
