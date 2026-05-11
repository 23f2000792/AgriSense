import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';

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
      await sql`
        INSERT INTO outcomes (visitId, repId, status, feedback, timestamp) 
        VALUES (${o.visitId}, ${decoded.id}, ${o.status}, ${o.feedback}, ${o.timestamp})
      `;
      await sql`UPDATE visits SET status = 'completed' WHERE id = ${o.visitId}`;
    }

    return res.status(200).json({ success: true, message: 'Sync complete' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
