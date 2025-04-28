import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

export default async function handler(req, res) {
  const { q = '' } = req.query;
  if (!q || q.length < 2) {
    res.status(200).json([]);
    return;
  }
  try {
    // Simple ILIKE search for dish names
    const search = `%${q.trim().replace(/\s+/g, '%')}%`;
    const result = await pool.query(
      `SELECT id, noun_phrase FROM dishes WHERE noun_phrase ILIKE $1 ORDER BY noun_phrase LIMIT 10`,
      [search]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
