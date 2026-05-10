import pool from '@/lib/db';

export default async function handler(req, res) {
  // Chỉ cho phép GET request
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { categoryId } = req.query;

  try {
    // Lấy connection từ pool
    const connection = await pool.getConnection();

    const params = [];
    // Lấy cả AVAILABLE (hiện + cho order) và OUT_OF_STOCK (hiện nhưng disable order)
    // Không lấy HIDDEN (ẩn hoàn toàn) và DELETED (xóa)
    let whereClause = `WHERE status IN ('AVAILABLE', 'OUT_OF_STOCK')`;

    if (categoryId) {
      whereClause += ' AND category_id = ?';
      params.push(categoryId);
    }
    
    // Query lấy tất cả sách có status = AVAILABLE hoặc OUT_OF_STOCK
    const [books] = await connection.query(
      `SELECT id, category_id, title, author, description, image_url, price, stock, status 
       FROM books 
       ${whereClause}
       ORDER BY created_at DESC`,
      params,
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
