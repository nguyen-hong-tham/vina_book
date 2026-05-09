const mysql = require('mysql2/promise');

async function checkPrices() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '123456',
    database: 'bookstore_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT id, title, price FROM books ORDER BY id');
    connection.release();

    console.log('\n=== DATABASE PRICES ===\n');
    rows.forEach(book => {
      console.log(`ID: ${book.id} | ${book.title} | Price: ${book.price} (${book.price / 1000}K)`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPrices();
