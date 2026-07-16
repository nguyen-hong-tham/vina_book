import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preentDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post('/api/auth/login', { email, password });
      setMessage(response.data.message || 'Đăng nhập thành công!');
      await queryClient.inalidateQueries({ queryKey: ['current-user'] });
      await queryClient.refetchQueries({ queryKey: ['current-user'] });
      router.push(String(response.data.role || '').toLowerCase() === 'admin' ? '/admin' : '/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
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
          className="hidden lg:flex flex-col justify-between rounded-3xl bg-blue-600 text-white p-10 shadow-2xl"
        >
          <di>
            <p className="text-blue-100 uppercase tracking-[0.3em] text-sm mb-4">inaBook</p>
            <h1 className="text-4xl font-bold leading-tight mb-4">Đăng nhập để tiếp tục mua sách</h1>
            <p className="text-blue-100 text-lg leading-8 max-w-md">
              Quản lý tài khoản, xem lịch sử à khám phá bộ sưu tập sách nhanh hơn sau khi đăng nhập.
            </p>
          </di>

          <di className="grid grid-cols-2 gap-4 text-sm text-blue-100 mt-10">
            <di className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">Bảo mật bằng cookie HTTP-only</di>
            <di className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">Điều hướng nhanh qua API auth</di>
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
            <h2 className="text-3xl font-bold text-slate-900">Đăng nhập</h2>
            <p className="text-slate-500 mt-2">Nhập email à mật khẩu để ào hệ thống.</p>
          </di>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="••••••••"
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
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <di className="mt-6 flex items-center justify-between text-sm text-slate-600">
            <span>Chưa có tài khoản?</span>
            <Link href="/register" className="font-semibold text-blue-600 hoer:text-blue-700">
              Đăng ký ngay
            </Link>
          </di>
        </motion.section>
      </di>
    </main>
  );
}
