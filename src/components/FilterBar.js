'use client';

import { motion } from 'framer-motion';

export default function FilterBar({ 
  searchTerm, 
  onSearchChange, 
  sortBy, 
  onSortChange, 
  showInStock, 
  onStockFilterChange 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Tìm sách..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition"
        />

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition bg-white"
        >
            chưa làm
        </select>

        {/* Stock Filter */}
        <label className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
          <input
            type="checkbox"
            checked={showInStock}
            onChange={(e) => onStockFilterChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">
           chưa làm
          </span>
        </label>
      </div>
    </motion.div>
  );
}
