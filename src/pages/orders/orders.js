'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';

const statusText = {
  PENDING: 'Chờ xác nhận',
  ACCEPT: 'Đã xác nhận',
  DONE: 'Hoàn thành',
  REJECT: 'Đã từ chối',
};

const statusClass = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-300',
  ACCEPT: 'bg-blue-100 text-blue-800 border-blue-300',
  DONE: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  REJECT: 'bg-red-100 text-red-800 border-red-300',
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
        setError(err?.response?.data?.message || 'Lỗi khi lấy danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-slate-500 font-medium">Đang tải lịch sử đơn hàng...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-3xl shadow-sm border border-red-200">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Có lỗi xảy ra</h2>
          <p className="text-slate-600 mb-6 text-sm">{error}</p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Đăng nhập lại
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Lịch sử đơn hàng</h1>
            <p className="text-sm text-slate-500 mt-1">Theo dõi trạng thái và xem hoá đơn các đơn hàng của bạn</p>
          </div>
          <Link
            href="/products"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm"
          >
            + Mua sách thêm
          </Link>
        </div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm"
          >
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Bạn chưa có đơn hàng nào</h3>
            <p className="text-slate-600 text-sm mb-6 max-w-md mx-auto">
              Hãy dạo qua cửa hàng và chọn những cuốn sách hay để trải nghiệm mua sắm nhé!
            </p>
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              Khám phá sách ngay
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((o, idx) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row justify-between sm:items-center gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-slate-900">Đơn hàng #{o.id}</span>
                    <span
                      className={`inline-flex rounded-full border px-3 py-0.5 text-xs font-bold ${statusClass[o.status] || 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                    >
                      {statusText[o.status] || o.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                    <span> {new Date(o.created_at).toLocaleString('vi-VN')}</span>
                    <span>•</span>
                    <span> {o.item_count} mặt hàng</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-lg font-extrabold text-blue-600">
                    {Number(o.total_amount || 0).toLocaleString('vi-VN')}₫
                  </div>
                  <Link
                    href={`/orders/${o.id}`}
                    className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
                  >
                    Xem hoá đơn (Bill) →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
