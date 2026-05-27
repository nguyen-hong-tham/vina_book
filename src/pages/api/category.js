import pool from '@/lib/db';

export default async function handler(req, res) {
  const connection = await pool.getConnection();

  try {
    if (req.method === 'GET') {
      const [categories] = await connection.query(
        `SELECT id, name
         FROM categories
         ORDER BY name ASC`
      );

      connection.release();

      return res.status(200).json(categories);
    }

    if (req.method === 'POST') {
      const { name } = req.body || {};

      if (!name || !name.trim()) {
        connection.release();
        return res.status(400).json({ error: 'Tên danh mục không được để trống' });
      }

      const categoryName = name.trim();
      const [result] = await connection.query(
        `INSERT INTO categories (name) VALUES (?)`,
        [categoryName]
      );

      connection.release();

      return res.status(201).json({
        success: true,
        data: {
          id: result.insertId,
          name: categoryName,
        },
        message: 'Tạo danh mục thành công',
      });
    }

    connection.release();
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    connection.release();
    console.error('Error:', error);
    return res.status(500).json({ error: error.message || 'Database error' });
  }
}
