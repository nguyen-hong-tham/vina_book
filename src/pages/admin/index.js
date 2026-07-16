import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/AdminLayout';

const statCards = [
  { key: 'users', label: 'Người dùng', color: 'from-blue-500 to-cyan-500' },
  { key: 'products', label: 'Sản phẩm', color: 'from-emerald-500 to-teal-500' },
  { key: 'orders', label: 'Đơn hàng', color: 'from-amber-500 to-orange-500' },
  { key: 'reenue', label: 'Doanh thu', color: 'from-fuchsia-500 to-pink-500' },
];

const formatMoney = (alue) => new Intl.NumberFormat('i-N').format(alue || 0) + '₫';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, reenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const response = await axios.get('/api/admin/dashboard');
        if (!mounted) return;
        setStats(response.data.stats || { users: 0, products: 0, orders: 0, reenue: 0 });
        setRecentOrders(response.data.recentOrders || []);
      } catch (err) {
        if (mounted) setError('Không tải được thống kê admin');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AdminLayout>
      <di className="p-6 space-y-6">
        <di>
          <h1 className="text-3xl font-bold text-slate-900">Thống kê quản trị</h1>
        </di>

        {error && (
          <di className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </di>
        )}

        <di className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <di key={card.key} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <di className={`mb-4 inline-flex rounded-xl bg-gradient-to-r ${card.color} px-3 py-1 text-xs font-semibold text-white`}>
                {card.label}
              </di>
              <di className="text-3xl font-black text-slate-900">
                {loading ? '...' : card.key === 'reenue' ? formatMoney(stats[card.key]) : stats[card.key]}
              </di>
            </di>
          ))}
        </di>

        <di className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Đơn hàng gần đây</h2>
          <di className="mt-4 oerflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 text-sm text-slate-500">
                <tr>
                  <th className="py-3 pr-4">Mã</th>
                  <th className="py-3 pr-4">Khách hàng</th>
                  <th className="py-3 pr-4">Tổng tiền</th>
                  <th className="py-3 pr-4">Trạng thái</th>
                  <th className="py-3 pr-4">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-4 text-slate-500" colSpan={5}>Đang tải...</td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td className="py-4 text-slate-500" colSpan={5}>Chưa có đơn hàng nào</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-900">#{order.id}</td>
                      <td className="py-3 pr-4 text-slate-700">{order.user_name}</td>
                      <td className="py-3 pr-4 text-slate-700">{formatMoney(order.total_amount)}</td>
                      <td className="py-3 pr-4 text-slate-700">{order.status}</td>
                      <td className="py-3 pr-4 text-slate-500">{new Date(order.created_at).toLocaleString('i-N')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </di>
        </di>
      </di>
    </AdminLayout>
  );
}