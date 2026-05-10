'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

const fetchCart = async () => {
  const response = await axios.get('/api/cart');
  return response.data;
};

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: cart, isLoading, error, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    enabled: mounted,
    retry: false,
  });

  const removeItemMutation = useMutation({
    mutationFn: (cartId) => axios.delete('/api/cart', { data: { cartId } }),
    onSuccess: () => refetch(),
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ cartId, quantity }) =>
      axios.put('/api/cart', { cartId, quantity }),
    onSuccess: () => refetch(),
  });

  if (!mounted) return null;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-center h-screen">
          <div className="text-slate-500">Đang tải giỏ hàng...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-red-50 border border-red-200 px-6 py-4 text-red-700 shadow-sm text-center"
          >
            Bạn cần đăng nhập để xem giỏ hàng.
          </motion.div>
          <motion.div className="mt-4 text-center">
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Đăng nhập
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  const { items = [], total = 0 } = cart || {};
  const isEmpty = items.length === 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
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
        </motion.div>

        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid gap-8 lg:grid-cols-3"
          >
            <div className="lg:col-span-2">
              <div className="rounded-3xl bg-white border border-slate-200 shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Giỏ hàng của bạn đang trống
                </h2>
                <p className="text-slate-600 mb-8">
                  Hãy thêm một số sách yêu thích vào giỏ hàng của bạn
                </p>
                <Link
                  href="/products"
                  className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>

            {/* Empty Cart Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl bg-white border border-slate-200 shadow-lg p-6 h-fit"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4">Tóm tắt</h3>
              <div className="space-y-3 pb-4 border-b border-slate-200 mb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính:</span>
                  <span>0đ</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Vận chuyển:</span>
                  <span>0đ</span>
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 mb-6">
                <span>Tổng cộng:</span>
                <span>0đ</span>
              </div>
              <button
                disabled
                className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gray-300 cursor-not-allowed transition"
              >
                Thanh toán
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid gap-8 lg:grid-cols-3"
          >
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-2xl bg-white border border-slate-200 shadow-md p-4 flex gap-4 hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  <div className="w-24 h-32 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                      <div className="text-3xl text-slate-300">∿</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{item.author}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        {Number(item.price).toLocaleString('vi-VN')}đ
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            updateQuantityMutation.mutate({
                              cartId: item.id,
                              quantity: Math.max(1, item.quantity - 1),
                            })
                          }
                          disabled={updateQuantityMutation.isPending}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 transition disabled:opacity-50"
                        >
                          −
                        </motion.button>

                        <span className="w-10 text-center font-semibold text-slate-900">
                          {item.quantity}
                        </span>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            updateQuantityMutation.mutate({
                              cartId: item.id,
                              quantity: item.quantity + 1,
                            })
                          }
                          disabled={updateQuantityMutation.isPending || item.quantity >= item.stock}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => removeItemMutation.mutate(item.id)}
                    disabled={removeItemMutation.isPending}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-3 rounded-lg transition disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.button>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl bg-white border border-slate-200 shadow-lg p-6 h-fit sticky top-24"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6">Tóm tắt đơn hàng</h3>

              {/* Subtotal */}
              <div className="space-y-3 pb-4 border-b border-slate-200 mb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính:</span>
                  <span>{Number(total).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Vận chuyển:</span>
                  <span className="text-amber-600">Miễn phí</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between text-lg font-bold text-slate-900 mb-6">
                <span>Tổng cộng:</span>
                <span className="text-blue-600">{Number(total).toLocaleString('vi-VN')}đ</span>
              </div>

              {/* Checkout Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-md hover:shadow-lg mb-3"
              >
                Thanh toán
              </motion.button>

              {/* Continue Shopping */}
              <Link
                href="/products"
                className="block text-center py-3 px-4 rounded-lg font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
              >
                Tiếp tục mua sắm
              </Link>
            </motion.div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
