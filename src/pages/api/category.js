import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const connection = await pool.getConnection();
    
    // Query lấy tất cả sách có status = AVAILABLE
    const [category] = await connection.query(
      `SELECT id, name
       FROM categories`
    );
    
    // Trả lại connection cho pool
    connection.release();
    
    // Phản hồi với danh sách sách
    return res.status(200).json(category);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}
