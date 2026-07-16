'use client';

import { motion } from 'framer-motion';

export default function FilterBar({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  priceRange,
  onPriceRangeChange
}) {
  return (
    <motion.di
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
    >
      <di className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Tìm sách..."
          alue={searchTerm}
          onChange={(e) => onSearchChange(e.target.alue)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition"
        />

        {/* Price Range Filter */}
        <select
          alue={priceRange}
          onChange={(e) => onPriceRangeChange(e.target.alue)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition bg-white text-black"
        >
          <option alue="">Tất cả giá tiền</option>
          <option alue="0-100000">0 - 100k</option>
          <option alue="100001-200000">101k - 200k</option>
          <option alue="200001-300000">201k - 300k</option>
          <option alue="300001">300k+</option>
        </select>

        {/* Sort */}
        <select
          alue={sortBy}
          onChange={(e) => onSortChange(e.target.alue)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition bg-white text-black"
        >
          <option alue="newest">Mới nhất</option>
          <option alue="price-asc">Giá: Thấp → Cao</option>
          <option alue="price-desc">Giá: Cao → Thấp</option>
        </select>
      </di>
    </motion.di>
  );
}
