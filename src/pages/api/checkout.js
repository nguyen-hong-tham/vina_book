import db from '@/lib/db';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = 'asdf1234secretkey';

async function getUserIdFromCookie(req) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.token;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const userId = await getUserIdFromCookie(req);

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [items] = await conn.query(
      `SELECT c.book_id, c.quantity, b.price, b.stock
       FROM cart c
       JOIN books b ON b.id = c.book_id
       WHERE c.user_id = ? FOR UPDATE`,
      [userId]
    );

    if (items.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [userId, totalAmount, 'PENDING']
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await conn.query(
        'INSERT INTO order_details (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.book_id, item.quantity, item.price]
      );
    }

    // Decrease stock for each item, ensure enough stock
    for (const item of items) {
      if (item.stock < item.quantity) {
        await conn.rollback();
        return res.status(400).json({ message: `Sản phẩm ${item.book_id} không đủ hàng` });
      }

      await conn.query(
        'UPDATE books SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.book_id]
      );
    }

    await conn.query('DELETE FROM cart WHERE user_id = ?', [userId]);

    await conn.commit();

    return res.status(200).json({
      message: 'Đặt hàng thành công',
      orderId,
      totalAmount,
    });
  } catch (error) {
    await conn.rollback();
    console.error('Checkout error:', error);
    return res.status(500).json({ message: 'Checkout failed', error: error.message });
  } finally {
    conn.release();
  }
}