import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://root:98922678baboaA-40@localhost:5432/jiuspeak_db',
  max: 5,
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

export async function query(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result.rows;
}

export async function queryOne(text: string, params?: any[]) {
  const rows = await query(text, params);
  return rows[0] || null;
}

export { pool };
console.log('🐘 JiuSpeak AI conectado ao PostgreSQL do JiuSpeak');
