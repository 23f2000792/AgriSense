import { Pool } from 'pg';

let connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_URL || '';
try {
  const url = new URL(connectionString);
  url.searchParams.delete('sslmode');
  connectionString = url.toString();
} catch (e) {}

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});
