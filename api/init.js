import { Pool } from 'pg';
import bcrypt from 'bcrypt';

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

export default async function handler(request, response) {
  try {
    // 1. Create Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        phone VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        territory VARCHAR(255)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id VARCHAR(255) PRIMARY KEY,
        repId VARCHAR(255),
        type VARCHAR(255),
        name VARCHAR(255),
        location VARCHAR(255),
        priority VARCHAR(255),
        priorityScore INTEGER,
        reason TEXT,
        inventoryStatus VARCHAR(255),
        crop VARCHAR(255),
        nextBestAction JSONB,
        status VARCHAR(255),
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        lastVisit VARCHAR(255),
        FOREIGN KEY(repId) REFERENCES users(id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS outcomes (
        id SERIAL PRIMARY KEY,
        visitId VARCHAR(255),
        repId VARCHAR(255),
        status VARCHAR(255),
        feedback TEXT,
        timestamp VARCHAR(255)
      );
    `);

    // 2. Seed User if not exists
    const users = await pool.query(`SELECT count(*) as count FROM users`);
    
    if (parseInt(users.rows[0].count) === 0) {
      console.log('Seeding Database with Indian Data...');
      const hashedPw = await bcrypt.hash('123456', 10);
      
      await pool.query(
        `INSERT INTO users (id, name, phone, password, territory) VALUES ($1, $2, $3, $4, $5)`,
        ['REP-1', 'Rajesh Kumar', '9876543210', hashedPw, 'Guntur, AP']
      );

      const nextBestAction1 = JSON.stringify({ product: "Ampligo", action: "Early-stage spray", rationale: "High humidity, pest alert", talkingPoints: ["Spray within 3 days", "Focus on under-leaf coverage"] });
      await pool.query(
        `INSERT INTO visits (id, repId, type, name, location, priority, priorityScore, reason, inventoryStatus, crop, nextBestAction, status, lat, lng, lastVisit)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13, $14, $15)`,
        ['VISIT-1', 'REP-1', 'farmer', 'Venkat Rao', 'Amaravathi Village', 'High', 95, 'Pest risk up 30%, Rainfall spike', null, 'Cotton (45 days)', nextBestAction1, 'pending', 16.5745, 80.3556, '14 days']
      );

      const nextBestAction2 = JSON.stringify({ product: "Voliam Targo", action: "Pitch Bulk Discount", rationale: "Inventory down 60%", talkingPoints: ["Protect margins"] });
      await pool.query(
        `INSERT INTO visits (id, repId, type, name, location, priority, priorityScore, reason, inventoryStatus, crop, nextBestAction, status, lat, lng, lastVisit)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13, $14, $15)`,
        ['VISIT-2', 'REP-1', 'retailer', 'Kisan Seva Kendra', 'Tenali Market', 'Medium', 82, 'Competitor promo active', 'Low on Insecticides', null, nextBestAction2, 'pending', 16.2341, 80.6432, '7 days']
      );
    }

    return response.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
