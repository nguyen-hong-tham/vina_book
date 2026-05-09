'use client';

import { motion } from 'framer-motion';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      {/* Prev */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-xl border bg-white hover:bg-gray-100 disabled:opacity-40 transition"
      >
        &lt;
      </motion.button>

      {/* Page Numbers */}
      {[...Array(totalPages)].map((_, index) => {
        const page = index + 1;

        // chỉ hiện vài page
        if (
          page === 1 ||
          page === totalPages ||
          (page >= currentPage - 1 && page <= currentPage + 1)
        ) {
          return (
            <motion.button
              key={page}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-xl border transition font-medium ${
                currentPage === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              {page}
            </motion.button>
          );
        }

        // hiện ...
        if (page === currentPage - 2 || page === currentPage + 2) {
          return (
            <span key={page} className="px-1 text-gray-400">
              ...
            </span>
          );
        }

        return null;
      })}

      {/* Next */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-xl border bg-white hover:bg-gray-100 disabled:opacity-40 transition"
      >
        &gt;
      </motion.button>
    </div>
  );
}
