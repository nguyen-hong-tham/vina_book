import db from '@/lib/db';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = process.en.JWT_SECRET;

async function getUserIdFromCookie(req) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.token;

  if (!token) return null;

  try {
    const decoded = jwt.erify(token, JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const userId = await getUserIdFromCookie(req);
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id || Number.isNaN(Number(id))) {
    return res.status(400).json({ message: 'Order id không hợp lệ' });
  }

  let conn;
  try {
    conn = await db.getConnection();

    const [[order]] = await conn.query(
      `SELECT id, user_id, total_amount, status, created_at
       FROM orders
       WHERE id = ?`,
      [id]
    );

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    if (order.user_id !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này' });
    }

    const [details] = await conn.query(
      `SELECT od.id, od.book_id, od.quantity, od.price, b.title, b.image_url
       FROM order_details od
       JOIN books b ON b.id = od.book_id
       WHERE od.order_id = ?`,
      [id]
    );

    return res.status(200).json({
      order: {
        id: order.id,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
      },
      details,
    });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy chi tiết đơn hàng' });
  } finally {
    if (conn) conn.release();
  }
}
