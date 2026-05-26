import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET;

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
  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    const connection = await pool.getConnection();

    if (req.method === 'GET') {
      const [users] = await connection.query(
        `SELECT
           u.id,
           u.name,
           u.email,
           LOWER(u.role) AS role,
           u.status,
           u.created_at,
           COUNT(DISTINCT o.id) AS order_count
         FROM users u
         LEFT JOIN orders o ON o.user_id = u.id
         GROUP BY u.id, u.name, u.email, u.role, u.status, u.created_at
         ORDER BY u.created_at DESC`
      );

      connection.release();
      return res.status(200).json({ users });
    }

    if (req.method === 'PUT') {
      const { userId, role, name, email } = req.body;

      if (!userId) {
        connection.release();
        return res.status(400).json({ message: 'userId là bắt buộc' });
      }

      const updates = [];
      const params = [];

      if (role) {
        const normalizedRole = String(role || '').toUpperCase();
        if (!['USER', 'ADMIN'].includes(normalizedRole)) {
          connection.release();
          return res.status(400).json({ message: 'Role không hợp lệ' });
        }

        // Prevent admin from demoting themself
        if (String(admin.id) === String(userId) && normalizedRole !== 'ADMIN') {
          connection.release();
          return res.status(400).json({ message: 'Không thể hạ quyền chính mình' });
        }

        updates.push('role = ?');
        params.push(normalizedRole);
      }

      if (name) {
        updates.push('name = ?');
        params.push(name);
      }

      if (email) {
        updates.push('email = ?');
        params.push(email);
      }

      if (req.body.status) {
        const s = String(req.body.status || '').toUpperCase();
        if (!['ACTIVE', 'LOCKED'].includes(s)) {
          connection.release();
          return res.status(400).json({ message: 'Status không hợp lệ' });
        }

        // Prevent admin from locking themself
        if (String(admin.id) === String(userId) && s === 'LOCKED') {
          connection.release();
          return res.status(400).json({ message: 'Không thể khóa chính mình' });
        }

        updates.push('status = ?');
        params.push(s);
      }

      if (updates.length === 0) {
        connection.release();
        return res.status(400).json({ message: 'Không có gì để cập nhật' });
      }

      params.push(userId);
      const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      await connection.query(sql, params);
      connection.release();

      return res.status(200).json({ message: 'Cập nhật người dùng thành công' });
    }

    connection.release();
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi xử lý người dùng' });
  }
}