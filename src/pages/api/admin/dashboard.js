import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import pool from '@/lib/db';

const JWT_SECRET = 'asdf1234secretkey';

function requireAdmin(req, res) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.token;

  if (!token) {
    res.status(401).json({ message: 'Chưa đăng nhập' });
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (String(decoded.role || '').toLowerCase() !== 'admin') {
      res.status(403).json({ message: 'Không có quyền truy cập' });
      return null;
    }
    return decoded;
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    const connection = await pool.getConnection();

    const [[userCountRow]] = await connection.query('SELECT COUNT(*) AS total FROM users');
    const [[productCountRow]] = await connection.query("SELECT COUNT(*) AS total FROM books WHERE status != 'DELETED'");
    const [[orderCountRow]] = await connection.query('SELECT COUNT(*) AS total FROM orders');
    const [[revenueRow]] = await connection.query("SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE status IN ('ACCEPT', 'DONE')");

    const [recentOrders] = await connection.query(
      `SELECT o.id, o.total_amount, o.status, o.created_at, u.name AS user_name, u.email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 5`
    );

    connection.release();

    return res.status(200).json({
      stats: {
        users: userCountRow.total,
        products: productCountRow.total,
        orders: orderCountRow.total,
        revenue: revenueRow.total,
      },
      recentOrders,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi tải thống kê' });
  }
}