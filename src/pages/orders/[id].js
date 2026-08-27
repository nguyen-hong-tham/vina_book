'use client';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';

const STATUS_CONFIG = {
  PENDING: { text: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: '' },
  ACCEPT: { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '📦' },
  DONE: { text: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: '✅' },
  REJECT: { text: 'Đã từ chối', color: 'bg-red-100 text-red-800 border-red-300', icon: '❌' },
};

const PAYMENT_TEXT = {
  COD: 'Thanh toán tiền mặt khi nhận hàng (COD)',
};

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/orders/${id}`);
        setOrder(response.data.order || null);
        setDetails(response.data.details || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Không thể tải chi tiết hoá đơn đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-slate-500 font-medium">Đang tải hoá đơn đơn hàng...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-3xl shadow-sm border border-red-200">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Không thể tải đơn hàng</h2>
          <p className="text-slate-600 mb-6 text-sm">{error}</p>
          <Link
            href="/orders"
            className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Quay lại lịch sử đơn hàng
          </Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy đơn hàng</h2>
          <Link
            href="/orders"
            className="inline-block mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Về trang lịch sử đơn
          </Link>
        </div>
      </main>
    );
  }

  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto">
        {/* Navigation & Action Bar (Hidden when printing) */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition"
          >
            ← Danh sách đơn hàng
          </Link>
          <div className="flex items-center gap-3">

            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm transition"
            >
              Tiếp tục mua sách
            </Link>
          </div>
        </div>

        {/* Invoice / Bill Paper Container */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none"
        >
          {/* Bill Top Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-black tracking-wider">VINABOOK</span>
                  <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-medium">HOÁ ĐƠN BÁN HÀNG</span>
                </div>
                <p className="text-blue-100 text-xs sm:text-sm">Cảm ơn bạn đã tin tưởng và mua sách tại VinaBook!</p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xs text-blue-200">Mã đơn hàng</div>
                <div className="text-2xl font-extrabold font-mono">#{order.id}</div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Status & Date Bar */}
            <div className="flex flex-wrap justify-between items-center gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-500 block">Thời gian đặt hàng:</span>
                <span className="text-sm font-semibold text-slate-800">
                  {new Date(order.created_at).toLocaleString('vi-VN', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${status.color}`}>
                  <span>{status.icon}</span>
                  <span>{status.text}</span>
                </span>
              </div>
            </div>

            {/* Customer & Delivery Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Thông tin người nhận
                </h3>
                <p className="text-base font-bold text-slate-900">
                  {order.recipient_name || 'Khách hàng'}
                </p>
                <p className="text-sm text-slate-700 flex items-center gap-2">
                  <span></span> <span className="font-semibold">{order.phone || 'Chưa cập nhật'}</span>
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Địa chỉ & Thanh toán
                </h3>
                <p className="text-sm text-slate-700 flex items-start gap-2">
                  <span></span>
                  <span>{order.shipping_address || 'Địa chỉ mặc định'}</span>
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <span></span>
                  <span>{PAYMENT_TEXT[order.payment_method] || order.payment_method || 'Thanh toán tiền mặt khi nhận hàng (COD)'}</span>
                </p>
                {order.notes && (
                  <p className="text-xs text-slate-500 italic pt-1">
                    Ghi chú: "{order.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Purchased Items Table */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span></span> Danh sách sản phẩm đã đặt
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-2">Sản phẩm</th>
                      <th className="py-3 px-2 text-center">SL</th>
                      <th className="py-3 px-2 text-right">Đơn giá</th>
                      <th className="py-3 px-2 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {details.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-12 h-16 object-cover rounded-lg shrink-0 border border-slate-200"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : null}
                            <div>
                              <div className="font-bold text-slate-900 line-clamp-1">{item.title}</div>
                              {item.author && <div className="text-xs text-slate-500">{item.author}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-center font-medium text-slate-700">
                          x{item.quantity}
                        </td>
                        <td className="py-4 px-2 text-right text-slate-600">
                          {Number(item.price || 0).toLocaleString('vi-VN')}₫
                        </td>
                        <td className="py-4 px-2 text-right font-bold text-slate-900">
                          {Number((item.price || 0) * (item.quantity || 0)).toLocaleString('vi-VN')}₫
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bill Summary Calculations */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <div className="w-full sm:w-80 space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính tiền sách:</span>
                  <span className="font-semibold text-slate-800">
                    {Number(order.total_amount || 0).toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phí vận chuyển:</span>
                  <span className="text-emerald-600 font-semibold">Miễn phí</span>
                </div>
                <div className="flex justify-between items-center text-base pt-3 border-t border-slate-200 font-bold text-slate-900">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="text-2xl font-black text-blue-600">
                    {Number(order.total_amount || 0).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note on Bill */}
          <div className="bg-slate-50 p-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Nếu có bất kỳ thắc mắc nào về đơn hàng, vui lòng liên hệ hotline hỗ trợ: <span className="font-semibold text-slate-700">12345678</span>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
