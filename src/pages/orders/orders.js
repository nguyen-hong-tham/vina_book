import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

const statusText = {
  PENDING: 'Chờ xác nhận',
  ACCEPT: 'Đã xác nhận',
  DONE: 'Hoàn thành',
  REJECT: 'Đã từ chối',
};

const statusClass = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  ACCEPT: 'bg-blue-100 text-blue-700 border-blue-300',
  DONE: 'bg-green-100 text-green-700 border-green-300',
  REJECT: 'bg-red-100 text-red-700 border-red-300',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/orders');
        setOrders(res.data.orders || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Lỗi khi lấy đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="p-6">Đang tải đơn hàng...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <main>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Lịch sử đơn hàng</h1>

        {orders.length === 0 ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">Bạn chưa có đơn hàng nào.</div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="border rounded p-4 flex justify-between items-center">
                <div>
                  <div className="font-semibold">Đơn #{o.id}</div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                        statusClass[o.status] || 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      {statusText[o.status] || o.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 mt-2">{o.item_count} mặt hàng</div>
                  <div className="text-sm text-slate-500">{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{o.total_amount?.toLocaleString?.() || o.total_amount}₫</div>
                  <Link href={`/orders/${o.id}`} className="mt-2 inline-block text-sm text-blue-600">
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
