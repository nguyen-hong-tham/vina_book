import db from '@/lib/db';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET;

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
    return res.status(405).json({ message: 'Phương thức không được hỗ trợ' });
  }

  const userId = await getUserIdFromCookie(req);

  if (!userId) {
    return res.status(401).json({ message: 'Vui lòng đăng nhập để thanh toán' });
  }

  const {
    recipientName,
    phone,
    shippingAddress,
    paymentMethod = 'COD',
    notes = '',
  } = req.body || {};

  if (!recipientName || !recipientName.trim()) {
    return res.status(400).json({ message: 'Vui lòng nhập họ tên người nhận' });
  }

  if (!phone || !phone.trim()) {
    return res.status(400).json({ message: 'Vui lòng nhập số điện thoại nhận hàng' });
  }

  if (!shippingAddress || !shippingAddress.trim()) {
    return res.status(400).json({ message: 'Vui lòng nhập địa chỉ giao hàng' });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [items] = await conn.query(
      `SELECT c.book_id, c.quantity, b.title, b.price, b.stock
       FROM cart c
       JOIN books b ON b.id = c.book_id
       WHERE c.user_id = ? FOR UPDATE`,
      [userId]
    );

    if (items.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Giỏ hàng đang trống' });
    }

    // Check stock for each item before placing order
    for (const item of items) {
      if (item.stock < item.quantity) {
        await conn.rollback();
        return res.status(400).json({
          message: `Sản phẩm "${item.title || 'Mã #' + item.book_id}" không đủ hàng trong kho (chỉ còn ${item.stock})`,
        });
      }
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, total_amount, status, recipient_name, phone, shipping_address, payment_method, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        totalAmount,
        'PENDING',
        recipientName.trim(),
        phone.trim(),
        shippingAddress.trim(),
        paymentMethod,
        notes.trim(),
      ]
    );

    const orderId = orderResult.insertId || orderResult[0]?.id;

    for (const item of items) {
      await conn.query(
        'INSERT INTO order_details (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.book_id, item.quantity, item.price]
      );
    }

    // Decrease stock for each item and update status if out of stock
    for (const item of items) {
      const nextStock = Math.max(0, item.stock - item.quantity);
      const nextStatus = nextStock === 0 ? 'OUT_OF_STOCK' : 'AVAILABLE';
      await conn.query(
        'UPDATE books SET stock = ?, status = ? WHERE id = ?',
        [nextStock, nextStatus, item.book_id]
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
    return res.status(500).json({ message: 'Thanh toán thất bại', error: error.message });
  } finally {
    conn.release();
  }
}