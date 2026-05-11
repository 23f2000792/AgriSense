import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'agrisense-secret-key-2026';

export const login = async (req, res) => {
  const { phone, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    const user = rows[0];

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, name: user.name, territory: user.territory }, JWT_SECRET);
    return res.status(200).json({ token, user: { id: user.id, name: user.name, territory: user.territory } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
