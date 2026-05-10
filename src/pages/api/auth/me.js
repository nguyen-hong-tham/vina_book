import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = 'asdf1234secretkey';

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    return res.status(200).json({
      user: {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: String(decoded.role || (decoded.email === 'admin@gmail.com' ? 'ADMIN' : 'USER')).toLowerCase(),
      },
    });
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
}
