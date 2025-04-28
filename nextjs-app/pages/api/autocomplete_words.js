import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

// Returns unique single words from dish names that match the query
export default async function handler(req, res) {
  const { q = '' } = req.query;
  if (!q || q.length < 1) {
    res.status(200).json([]);
    return;
  }
  try {
    // Lowercase and remove non-word chars for consistency
    const search = q.trim().toLowerCase();
    // Get unique words from all dish names that start with the query
    const result = await pool.query(`
      SELECT DISTINCT word FROM (
        SELECT unnest(string_to_array(lower(noun_phrase), ' ')) AS word
        FROM dishes
      ) AS words
      WHERE word LIKE $1
      ORDER BY word
      LIMIT 15
    `, ['%' + search + '%']);
    res.status(200).json(result.rows.map(r => r.word));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
