import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET || 'agrisense-secret-key-2026';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { rows } = await pool.query("SELECT * FROM visits WHERE repId = $1 AND status != 'completed'", [decoded.id]);
    
    // Parse JSON nextBestAction from Postgres JSONB
    const visits = rows.map(r => ({ ...r, nextBestAction: typeof r.nextbestaction === 'string' ? JSON.parse(r.nextbestaction) : r.nextbestaction }));
    
    return res.status(200).json(visits);
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized or DB error', details: error.message });
  }
}
