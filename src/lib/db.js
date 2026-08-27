import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

function formatQueryResult(result) {
  const rows = result.rows || [];
  // Gán metadata tương thích với MySQL (insertId, affectedRows, rowCount)
  const meta = {
    insertId: rows.length > 0 && rows[0]?.id !== undefined ? rows[0].id : undefined,
    affectedRows: result.rowCount || 0,
    rowCount: result.rowCount || 0,
  };
  Object.assign(rows, meta);
  return [rows, meta];
}

function convertSql(sql) {
  let pgSql = sql;
  let paramIndex = 1;
  pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
  
  // Tự động thêm RETURNING id nếu là lệnh INSERT để lấy insertId
  if (/^\s*INSERT\s+INTO\s+/i.test(pgSql) && !/\bRETURNING\b/i.test(pgSql)) {
    pgSql = `${pgSql} RETURNING id`;
  }
  return pgSql;
}

// Wrapper để tương thích hoàn toàn với code cũ sử dụng mysql2 (hỗ trợ transaction, insertId, affectedRows)
const wrappedPool = {
  async getConnection() {
    const client = await pool.connect();
    return {
      query: async (sql, params = []) => {
        try {
          const pgSql = convertSql(sql);
          const result = await client.query(pgSql, params);
          return formatQueryResult(result);
        } catch (err) {
          console.error('Query error:', sql, err);
          throw err;
        }
      },
      beginTransaction: async () => {
        await client.query('BEGIN');
      },
      commit: async () => {
        await client.query('COMMIT');
      },
      rollback: async () => {
        try {
          await client.query('ROLLBACK');
        } catch (e) {
          // ignore rollback error
        }
      },
      release: () => client.release(),
    };
  },
  
  async query(sql, params = []) {
    const client = await pool.connect();
    try {
      const pgSql = convertSql(sql);
      const result = await client.query(pgSql, params);
      return formatQueryResult(result);
    } catch (err) {
      console.error('Database query error:', sql, err);
      throw err;
    } finally {
      client.release();
    }
  },
};

export default wrappedPool;