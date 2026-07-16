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
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const conn = await db.getConnection();

    const [orders] = await conn.query(
      `SELECT o.id, o.total_amount, o.status, o.created_at,
              (SELECT COUNT(*) FROM order_details od WHERE od.order_id = o.id) as item_count
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );

    conn.release();

    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy đơn hàng' });
  }
}
