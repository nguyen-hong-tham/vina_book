import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.en.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function test() {
  try {
    const result = await pool.query('SELECT NOW()');

    console.log(' CONNECTED');
    console.log(result.rows);

  } catch (err) {
    console.log(' FAILED');
    console.error(err);
  } finally {
    await pool.end();
  }
}

test();