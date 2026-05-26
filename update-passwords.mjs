import 'dotenv/config.js';
import bcrypt from 'bcryptjs';
import pool from './src/lib/db.js';

async function updatePasswords() {
  try {
    // Hash the password "123456"
    const plainPassword = '123456';
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);
    
    console.log('Hashed password:', hashedPassword);
    console.log('DB_HOST:', process.env.DB_HOST, '| DB_PORT:', process.env.DB_PORT);
    
    // Update all users with plain text password to hashed version
    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE password = ?',
      [hashedPassword, plainPassword]
    );
    
    console.log('✅ Updated', result.affectedRows, 'users');
    
    // Verify the update
    const [users] = await pool.query('SELECT id, email, password FROM users LIMIT 3');
    console.log('Sample users:', users);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

updatePasswords();
