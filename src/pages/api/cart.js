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
  const userId = await getUserIdFromCookie(req);

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const conn = await db.getConnection();

  try {
    if (req.method === 'GET') {
      // Get user's cart items with book details
      const [items] = await conn.query(
        `SELECT c.id, c.quantity, b.id as book_id, b.title, b.author, b.price, b.image_url, b.stock
         FROM cart c
         JOIN books b ON c.book_id = b.id
         WHERE c.user_id = ?`,
        [userId]
      );

      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      return res.status(200).json({ items, total });
    } else if (req.method === 'POST') {
      // Add item to cart or update quantity
      const { bookId, quantity = 1 } = req.body;

      if (!bookId || quantity < 1) {
        return res.status(400).json({ message: 'Invalid bookId or quantity' });
      }

      // Check if item already in cart
      const [existing] = await conn.query(
        'SELECT id, quantity FROM cart WHERE user_id = ? AND book_id = ?',
        [userId, bookId]
      );

      if (existing.length > 0) {
        // Update quantity
        const newQuantity = existing[0].quantity + quantity;
        await conn.query(
          'UPDATE cart SET quantity = ? WHERE id = ?',
          [newQuantity, existing[0].id]
        );
      } else {
        // Insert new cart item
        await conn.query(
          'INSERT INTO cart (user_id, book_id, quantity) VALUES (?, ?, ?)',
          [userId, bookId, quantity]
        );
      }

      return res.status(201).json({ message: 'Item added to cart' });
    } else if (req.method === 'DELETE') {
      // Remove item from cart
      const { cartId } = req.body;

      if (!cartId) {
        return res.status(400).json({ message: 'Invalid cartId' });
      }

      await conn.query(
        'DELETE FROM cart WHERE id = ? AND user_id = ?',
        [cartId, userId]
      );

      return res.status(200).json({ message: 'Item removed from cart' });
    } else if (req.method === 'PUT') {
      // Update item quantity
      const { cartId, quantity } = req.body;

      if (!cartId || quantity < 0) {
        return res.status(400).json({ message: 'Invalid cartId or quantity' });
      }

      if (quantity === 0) {
        // Delete if quantity is 0
        await conn.query(
          'DELETE FROM cart WHERE id = ? AND user_id = ?',
          [cartId, userId]
        );
      } else {
        await conn.query(
          'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
          [quantity, cartId, userId]
        );
      }

      return res.status(200).json({ message: 'Quantity updated' });
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Cart API error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  } finally {
    conn.release();
  }
}
