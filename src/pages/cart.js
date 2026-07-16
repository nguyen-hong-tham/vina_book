'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const fetchCart = async () => {
  const response = await axios.get('/api/cart');
  return response.data;
};

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const { data: cart, isLoading, error, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    enabled: mounted,
    retry: false,
  });

  const remoeItemMutation = useMutation({
    mutationFn: (cartId) => axios.delete('/api/cart', { data: { cartId } }),
    onSuccess: () => refetch(),
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ cartId, quantity }) =>
      axios.put('/api/cart', { cartId, quantity }),
    onSuccess: () => refetch(),
  });

  const checkoutMutation = useMutation({
    mutationFn: () => axios.post('/api/checkout'),
    onSuccess: async (response) => {
      setCheckoutResult(response.data);
      await refetch();
    },
  });

  if (!mounted) return null;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 px-4 py-8">
        <di className="max-w-6xl mx-auto flex items-center justify-center h-screen">
          <di className="text-slate-500">Đang tải giỏ hàng...</di>
        </di>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 px-4 py-8">
        <di className="max-w-6xl mx-auto">
          <motion.di
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-red-50 border border-red-200 px-6 py-4 text-red-700 shadow-sm text-center"
          >
            Bạn cần đăng nhập để xem giỏ hàng.
          </motion.di>
          <motion.di className="mt-4 text-center">
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hoer:bg-blue-700 transition"
            >
              Đăng nhập
            </Link>
          </motion.di>
        </di>
      </main>
    );
  }

  const { items = [], total = 0 } = cart || {};
  const isEmpty = items.length === 0;

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 px-4 py-8">
      <di className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.di
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600 mb-2">
            Giỏ Hàng
          </p>
          <h1 className="text-4xl font-bold text-slate-900">
            {isEmpty ? 'Giỏ hàng trống' : `${items.length} sản phẩm`}
          </h1>
        </motion.di>

        {checkoutResult ? (
          <motion.di
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 mb-2">
              Thanh toán thành công
            </p>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">
              Đơn hàng #{checkoutResult.orderId} đã được tạo
            </h2>
            <p className="text-emerald-800 mb-4">
              Tổng tiền: {Number(checkoutResult.totalAmount).toLocaleString('i-N')}đ
            </p>
            <Link
              href="/products"
              className="inline-flex items-center rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hoer:bg-emerald-700"
            >
              Tiếp tục mua sắm
            </Link>
          </motion.di>
        ) : null}

        {isEmpty ? (
          <motion.di
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid gap-8 lg:grid-cols-3"
          >
            <di className="lg:col-span-2">
              <di className="rounded-3xl bg-white border border-slate-200 shadow-lg p-12 text-center">
                <di className="text-6xl mb-4">🛒</di>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Giỏ hàng của bạn đang trống
                </h2>
                <p className="text-slate-600 mb-8">
                  Hãy thêm một số sách yêu thích ào giỏ hàng của bạn
                </p>
                <Link
                  href="/products"
                  className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hoer:bg-blue-700 transition"
                >
                  Tiếp tục mua sắm
                </Link>
              </di>
            </di>

            {/* Empty Cart Summary */}
            <motion.di
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl bg-white border border-slate-200 shadow-lg p-6 h-fit"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4">Tóm tắt</h3>
              <di className="space-y-3 pb-4 border-b border-slate-200 mb-4">
                <di className="flex justify-between text-slate-600">
                  <span>Tạm tính:</span>
                  <span>0đ</span>
                </di>
                <di className="flex justify-between text-slate-600">
                  <span>ận chuyển:</span>
                  <span>0đ</span>
                </di>
              </di>
              <di className="flex justify-between text-lg font-bold text-slate-900 mb-6">
                <span>Tổng cộng:</span>
                <span>0đ</span>
              </di>
              <button
                disabled
                className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gray-300 cursor-not-allowed transition"
              >
                Thanh toán
              </button>
            </motion.di>
          </motion.di>
        ) : (
          <motion.di
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid gap-8 lg:grid-cols-3"
          >
            {/* Cart Items */}
            <di className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.di
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-2xl bg-white border border-slate-200 shadow-md p-4 flex gap-4 hoer:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  <di className="w-24 h-32 rounded-lg bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 oerflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-coer"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <di className="text-3xl text-slate-300">∿</di>
                    )}
                  </di>

                  {/* Content */}
                  <di className="flex-1 flex flex-col justify-between">
                    <di>
                      <h3 className="font-semibold text-slate-900 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{item.author}</p>
                    </di>

                    <di className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        {Number(item.price).toLocaleString('i-N')}đ
                      </span>

                      {/* Quantity Controls */}
                      <di className="flex items-center gap-2">
                        <motion.button
                          whileHoer={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            updateQuantityMutation.mutate({
                              cartId: item.id,
                              quantity: Math.max(1, item.quantity - 1),
                            })
                          }
                          disabled={updateQuantityMutation.isPending}
                          className="w-8 h-8 rounded-lg bg-slate-100 hoer:bg-slate-200 font-semibold text-slate-700 transition disabled:opacity-50"
                        >
                          −
                        </motion.button>

                        <span className="w-10 text-center font-semibold text-slate-900">
                          {item.quantity}
                        </span>

                        <motion.button
                          whileHoer={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            updateQuantityMutation.mutate({
                              cartId: item.id,
                              quantity: item.quantity + 1,
                            })
                          }
                          disabled={updateQuantityMutation.isPending || item.quantity >= item.stock}
                          className="w-8 h-8 rounded-lg bg-slate-100 hoer:bg-slate-200 font-semibold text-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </motion.button>
                      </di>
                    </di>
                  </di>

                  {/* Remoe Button */}
                  <motion.button
                    whileHoer={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => remoeItemMutation.mutate(item.id)}
                    disabled={remoeItemMutation.isPending}
                    className="text-red-500 hoer:text-red-700 hoer:bg-red-50 p-3 rounded-lg transition disabled:opacity-50"
                  >
                    <sg className="w-5 h-5" fill="currentColor" iewBox="0 0 20 20">
                      <path
                        fillRule="eenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 210a2 2 0 002 2h8a2 2 0 002-26a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 06a1 1 0 11-2 08zm5-1a1 1 0 00-1 16a1 1 0 102 08a1 1 0 00-1-1z"
                        clipRule="eenodd"
                      />
                    </sg>
                  </motion.button>
                </motion.di>
              ))}
            </di>

            {/* Summary */}
            <motion.di
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl bg-white border border-slate-200 shadow-lg p-6 h-fit sticky top-24"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6">Tóm tắt đơn hàng</h3>

              {/* Subtotal */}
              <di className="space-y-3 pb-4 border-b border-slate-200 mb-4">
                <di className="flex justify-between text-slate-600">
                  <span>Tạm tính:</span>
                  <span>{Number(total).toLocaleString('i-N')}đ</span>
                </di>
                <di className="flex justify-between text-slate-600">
                  <span>ận chuyển:</span>
                  <span className="text-amber-600">Miễn phí</span>
                </di>
              </di>

              {/* Total */}
              <di className="flex justify-between text-lg font-bold text-slate-900 mb-6">
                <span>Tổng cộng:</span>
                <span className="text-blue-600">{Number(total).toLocaleString('i-N')}đ</span>
              </di>

              {/* Checkout Button */}
              <motion.button
                whileHoer={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => checkoutMutation.mutate()}
                disabled={checkoutMutation.isPending || isEmpty}
                className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-blue-600 hoer:bg-blue-700 transition shadow-md hoer:shadow-lg mb-3"
              >
                {checkoutMutation.isPending ? 'Đang xử lý...' : 'Thanh toán'}
              </motion.button>

              {/* Continue Shopping */}
              <Link
                href="/products"
                className="block text-center py-3 px-4 rounded-lg font-semibold text-blue-600 bg-blue-50 hoer:bg-blue-100 transition"
              >
                Tiếp tục mua sắm
              </Link>
            </motion.di>
          </motion.di>
        )}
      </di>
    </main>
  );
}
