import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';

const fetchCurrentUser = async () => {
  const response = await axios.get('/api/auth/me');
  return response.data.user;
};

export default function ProfilePage() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['current-user'],
    queryFn: fetchCurrentUser,
    retry: false,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-slate-500">Đang tải hồ sơ...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="rounded-xl bg-white border border-slate-200 px-6 py-4 text-slate-700 shadow-sm">
          Bạn cần đăng nhập để xem hồ sơ.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-slate-200 rounded-3xl shadow-lg p-8 sm:p-10"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600 mb-3">Hồ sơ</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Xin chào, {user?.name}</h1>
          <p className="text-slate-600 mb-8">Thông tin tài khoản đang đăng nhập.</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
              <p className="text-sm text-slate-500 mb-1">Họ tên</p>
              <p className="font-semibold text-slate-900">{user?.name}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
              <p className="text-sm text-slate-500 mb-1">Email</p>
              <p className="font-semibold text-slate-900">{user?.email}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
