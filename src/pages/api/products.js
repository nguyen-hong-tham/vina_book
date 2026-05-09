import pool from '@/lib/db';

export default async function handler(req, res) {
  // Chỉ cho phép GET request
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Lấy connection từ pool
    const connection = await pool.getConnection();
    
    // Query lấy tất cả sách có status = AVAILABLE
    const [books] = await connection.query(
      `SELECT id, title, author, description, image_url, price, stock 
       FROM books 
       WHERE status = 'AVAILABLE' 
       ORDER BY created_at DESC`
    );
    
    // Trả lại connection cho pool
    connection.release();
    
    // Phản hồi với danh sách sách
    return res.status(200).json(books);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}
