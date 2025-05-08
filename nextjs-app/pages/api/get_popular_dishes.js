import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

export default async function handler(req, res) {
  const { page_size = 10, page_offset = 0 } = req.query;
  try {
    const result = await pool.query(
      'SELECT * FROM get_popular_dishes($1::integer, $2::integer);',
      [parseInt(page_size), parseInt(page_offset)]
    );
    // Map photo_url to the new static path
    const mapped = result.rows.map(row => {
      if (row.photo_url) {
        // If it's already a full URL, use as is
        if (row.photo_url.startsWith('http')) {
          // do nothing
        } else {
          // If it's just an ID, prepend the johndimm.com URL
          row.photo_url = `https://www.johndimm.com/yelp_photos_2025/photos/${row.photo_url}.jpg`;
        }
      }
      return row;
    });
    res.status(200).json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
