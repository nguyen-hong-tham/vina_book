import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;

  try {

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
    }

    const role = String(user.role || (user.email === 'admin@gmail.com' ? 'ADMIN' : 'USER')).toLowerCase();

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role },
      'asdf1234secretkey',
      { expiresIn: '1d' }
    );

    res.setHeader('Set-Cookie', serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 ngày
      path: '/'
    }));

    res.status(200).json({
      message: 'Đăng nhập thành công!',
      role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi Server' });
  }
}