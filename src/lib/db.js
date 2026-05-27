import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Wrapper để tương thích với code cũ sử dụng mysql2
const wrappedPool = {
  async getConnection() {
    const client = await pool.connect();
    return {
      query: async (sql, params = []) => {
        try {
          // Convert ? placeholders to $1, $2, etc. for PostgreSQL
          let pgSql = sql;
          let paramIndex = 1;
          pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
          
          const result = await client.query(pgSql, params);
          return [result.rows];
        } catch (err) {
          console.error('Query error:', sql, err);
          throw err;
        }
      },
      release: () => client.release(),
    };
  },
  
  async query(sql, params = []) {
    const client = await pool.connect();
    try {
      // Convert ? placeholders to $1, $2, etc. for PostgreSQL
      let pgSql = sql;
      let paramIndex = 1;
      pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
      
      const result = await client.query(pgSql, params);
      return [result.rows];
    } catch (err) {
      console.error('Database query error:', sql, err);
      throw err;
    } finally {
      client.release();
    }
  },
};

export default wrappedPool;