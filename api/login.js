import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'agrisense-secret-key-2026';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, password } = req.body;
  try {
    const { rows } = await sql`SELECT * FROM users WHERE phone = ${phone}`;
    const user = rows[0];

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, name: user.name, territory: user.territory }, JWT_SECRET);
    return res.status(200).json({ token, user: { id: user.id, name: user.name, territory: user.territory } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
