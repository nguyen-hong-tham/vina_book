'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';

const fetchCurrentUser = async () => {
  const response = await axios.get('/api/auth/me');
  return response.data.user;
};

const fetchCart = async () => {
  const response = await axios.get('/api/cart');
  return response.data;
};

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  // Form State
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['current-user'],
    queryFn: fetchCurrentUser,
    enabled: mounted,
    retry: false,
  });

  const { data: cart, isLoading: cartLoading, error: cartError } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    enabled: mounted && !!user,
    retry: false,
  });

  // Pre-fill user name if available
  useEffect(() => {
    if (user?.name && !recipientName) {
      setRecipientName(user.name);
    }
  }, [user]);

  const checkoutMutation = useMutation({
    mutationFn: (orderData) => axios.post('/api/checkout', orderData),
    onMutate: () => {
      setFormError('');
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      const orderId = response.data.orderId;
      router.push(`/orders/${orderId}`);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra trong quá trình thanh toán.';
      setFormError(msg);
    },
  });

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setFormError('');

    if (!recipientName.trim()) {
      setFormError('Vui lòng nhập họ và tên người nhận.');
      return;
    }

    if (!phone.trim()) {
      setFormError('Vui lòng nhập số điện thoại nhận hàng.');
      return;
    }

    const phoneRegex = /^[0-9+() -]{8,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      setFormError('Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }

    if (!shippingAddress.trim()) {
      setFormError('Vui lòng nhập địa chỉ giao hàng chi tiết.');
      return;
    }

    checkoutMutation.mutate({
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      shippingAddress: shippingAddress.trim(),
      paymentMethod,
      notes: notes.trim(),
    });
  };

  if (!mounted || userLoading || cartLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-slate-500 font-medium">Đang tải thông tin thanh toán...</div>
      </main>
    );
  }

  if (userError || !user) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Bạn chưa đăng nhập</h2>
          <p className="text-slate-600 mb-6 text-sm">Vui lòng đăng nhập tài khoản để tiến hành thanh toán đơn hàng.</p>
          <Link
            href="/login"
            className="block w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </main>
    );
  }

  const { items = [], total = 0 } = cart || {};
  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="text-4xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Giỏ hàng đang trống</h2>
          <p className="text-slate-600 mb-6 text-sm">Hãy chọn những cuốn sách yêu thích trước khi thanh toán nhé!</p>
          <Link
            href="/products"
            className="block w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Khám phá sách ngay
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/cart" className="hover:text-blue-600 transition">
              Giỏ hàng
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Thanh toán đơn hàng</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Thông tin thanh toán & Đặt hàng</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Shipping & Payment Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer & Shipping Information */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  1
                </span>
                <h2 className="text-xl font-bold text-slate-900">Địa chỉ nhận hàng</h2>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Họ và tên người nhận <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Số điện thoại nhận hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ví dụ: 0912345678"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Địa chỉ nhận hàng chi tiết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ghi chú cho đơn hàng (không bắt buộc)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </form>
            </motion.div>

            {/* Step 2: Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  2
                </span>
                <h2 className="text-xl font-bold text-slate-900">Phương thức thanh toán</h2>
              </div>

              <div className="p-4.5 rounded-2xl border-2 border-blue-600 bg-blue-50/50 flex items-start gap-4">
                <div className="text-2xl mt-0.5"></div>
                <div>
                  <div className="font-bold text-slate-900">Thanh toán tiền mặt khi nhận hàng (COD)</div>
                  <p className="text-xs text-slate-600 mt-1">
                    Bạn thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng khi nhận được sách tại nhà.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Bill & Order Summary */}
          <div className="lg:col-span-5 sticky top-24">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-lg"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-5">Đơn hàng của bạn</h2>

              {/* Items List */}
              <div className="max-h-80 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                    <div className="w-14 h-18 bg-slate-100 rounded-lg shrink-0 overflow-hidden flex items-center justify-center border border-slate-200">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-slate-400 text-xs">∿</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{item.author}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-slate-600">SL: x{item.quantity}</span>
                        <span className="text-xs font-bold text-blue-600">
                          {Number(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Calculations */}
              <div className="space-y-2.5 py-4 border-t border-b border-slate-200 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính ({items.length} món):</span>
                  <span className="font-semibold text-slate-800">
                    {Number(total).toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phí vận chuyển:</span>
                  <span className="text-emerald-600 font-semibold">Miễn phí</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Hình thức:</span>
                  <span className="font-medium text-slate-800">
                    Thanh toán COD
                  </span>
                </div>
              </div>

              {/* Total Due */}
              <div className="flex justify-between items-center py-4 text-base font-bold text-slate-900">
                <span>Tổng thanh toán:</span>
                <span className="text-2xl font-extrabold text-blue-600">
                  {Number(total).toLocaleString('vi-VN')}đ
                </span>
              </div>

              {/* Form Error Banner */}
              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700 text-center"
                >
                  {formError}
                </motion.div>
              )}

              {/* Place Order Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={checkoutMutation.isPending}
                className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {checkoutMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Đang xử lý đặt hàng...</span>
                  </>
                ) : (
                  <span>Xác nhận Đặt Hàng →</span>
                )}
              </motion.button>

              <div className="mt-4 text-center">
                <Link
                  href="/cart"
                  className="text-xs text-slate-500 hover:text-blue-600 transition"
                >
                  ← Quay lại sửa giỏ hàng
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
