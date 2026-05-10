'use client';

import { motion } from 'framer-motion';

export default function FilterBar({ 
  searchTerm, 
  onSearchChange, 
  sortBy, 
  onSortChange, 
  showInStock, 
  onStockFilterChange,
  priceRange,
  onPriceRangeChange
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
          className="px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition"
        />    

        {/* Price Range Filter */}
        <select
          value={priceRange}
          onChange={(e) => onPriceRangeChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition bg-white text-black"
        >
          <option value="">Tất cả giá tiền</option>
          <option value="0-100000">0 - 100k</option>
          <option value="100001-200000">101k - 200k</option>
          <option value="200001-300000">201k - 300k</option>
          <option value="300001">300k+</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition bg-white text-black"
        >
          <option value="newest">Mới nhất</option>
          <option value="price-asc">Giá: Thấp → Cao</option>
          <option value="price-desc">Giá: Cao → Thấp</option>
        </select>
      </div>
    </motion.div>
  );
}
