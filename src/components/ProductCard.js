'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ProductCard({ book, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
    >
      <Link href={`/products/${book.id}`}>
        <motion.div
          whileHover={{ boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15)' }}
          className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 transition-all h-full flex flex-col cursor-pointer"
        >
          {/* Image */}
          <div className="relative w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex items-center justify-center">
            {book.image_url ? (
              <motion.img
                src={book.image_url}
                alt={book.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-5xl font-light">
              ∿
            </div>

            {/* Badge */}
            {book.stock > 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md"
              >
                Còn {book.stock}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md"
              >
                Hết hàng
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            <motion.h3
              className="text-base font-bold text-gray-900 line-clamp-2 mb-2"
              whileHover={{ color: '#2563eb' }}
            >
              {book.title}
            </motion.h3>

            <p className="text-sm text-gray-600 mb-3 line-clamp-1">
              {book.author}
            </p>

            <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">
              {book.description || 'Không có mô tả'}
            </p>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  {Number(book.price).toLocaleString('vi-VN')}đ
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={book.stock === 0}
                className={`w-full py-2.5 px-3 rounded-lg font-semibold text-sm transition ${
                  book.stock > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {book.stock > 0 ? 'Xem Chi Tiết' : 'Hết Hàng'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
