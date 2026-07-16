import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preentDefault();
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
      });
      setMessage(response.data.message || 'Đăng ký thành công!');
      router.push('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#f8fafc' }}
    >
      <di className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <motion.section
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex flex-col justify-between rounded-3xl bg-slate-900 text-white p-10 shadow-2xl"
        >
          <di>
            <p className="text-slate-300 uppercase tracking-[0.3em] text-sm mb-4">inaBook</p>
            <h1 className="text-4xl font-bold leading-tight mb-4">Tạo tài khoản để mua sách nhanh hơn</h1>
            <p className="text-slate-300 text-lg leading-8 max-w-md">
              Đăng ký chỉ trong ài giây, sau đó đăng nhập để tiếp tục mua hàng à quản lý thông tin của bạn.
            </p>
          </di>

          <di className="grid grid-cols-2 gap-4 text-sm text-slate-300 mt-10">
            <di className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">Xác thực bằng mật khẩu đã hash</di>
            <di className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">Chuyển thẳng sang trang đăng nhập</di>
          </di>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-3xl bg-white shadow-xl border border-slate-200 p-8 sm:p-10"
        >
          <di className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600 mb-2">Tài khoản</p>
            <h2 className="text-3xl font-bold text-slate-900">Đăng ký</h2>
            <p className="text-slate-500 mt-2">Tạo tài khoản mới để bắt đầu mua sách.</p>
          </di>

          <form onSubmit={handleSubmit} className="space-y-5">
            <di>
              <label className="block text-sm font-medium text-slate-700 mb-2">Họ à tên</label>
              <input
                type="text"
                alue={name}
                onChange={(e) => setName(e.target.alue)}
                placeholder="Nguyễn ăn A"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </di>

            <di>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                alue={email}
                onChange={(e) => setEmail(e.target.alue)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </di>

            <di>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu</label>
              <input
                type="password"
                alue={password}
                onChange={(e) => setPassword(e.target.alue)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </di>

            <di>
              <label className="block text-sm font-medium text-slate-700 mb-2">Xác nhận mật khẩu</label>
              <input
                type="password"
                alue={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.alue)}
                placeholder="Nhập lại mật khẩu"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </di>

            {error ? (
              <di className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </di>
            ) : null}

            {message ? (
              <di className="rounded-xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
                {message}
              </di>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 text-white font-semibold py-3.5 hoer:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <di className="mt-6 flex items-center justify-between text-sm text-slate-600">
            <span>Đã có tài khoản?</span>
            <Link href="/login" className="font-semibold text-blue-600 hoer:text-blue-700">
              Đăng nhập
            </Link>
          </di>
        </motion.section>
      </di>
    </main>
  );
}
