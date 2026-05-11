import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

let connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_URL || '';
try {
  const url = new URL(connectionString);
  url.searchParams.delete('sslmode');
  connectionString = url.toString();
} catch (e) {}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET || 'agrisense-secret-key-2026';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const outcomes = req.body.outcomes;
    
    if (!outcomes || !outcomes.length) return res.status(200).json({ success: true });

    for (const o of outcomes) {
      await pool.query(
        `INSERT INTO outcomes (visitId, repId, status, feedback, timestamp) VALUES ($1, $2, $3, $4, $5)`,
        [o.visitId, decoded.id, o.status, o.feedback, o.timestamp]
      );
      await pool.query(`UPDATE visits SET status = 'completed' WHERE id = $1`, [o.visitId]);
    }

    return res.status(200).json({ success: true, message: 'Sync complete' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
