import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

export default async function handler(req, res) {
  const { business_id } = req.query;
  if (!business_id) {
    res.status(400).json({ error: 'business_id is required' });
    return;
  }
  try {
    const result = await pool.query(
      'SELECT * FROM get_business($1::bigint);',
      [business_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
