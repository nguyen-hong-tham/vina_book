"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ProductCard, Pagination, FilterBar, HeroBanner } from "@/components";

// hàm này gọi api để lấy sách từ BE
const fetchBooks = async () => {
  const response = await axios.get("/api/products");
  return response.data;
};

export default function Products() {
  const {
    data: books = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
  });

  const [filteredBooks, setFilteredBooks] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [showInStock, setShowInStock] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // TODO: Logic xử lý filter/search/sort sẽ được implement sau
  // - Lọc theo danh mục (showInStock)
  // - Tìm kiếm theo tiêu đề hoặc tác giả (searchTerm)
  // - Sắp xếp: mới nhất, giá cao-thấp, phổ biến (sortBy)
  useEffect(() => {
    // Placeholder: Tạm thời render tất cả sách không filter
    let result = [...books];
    
    setFilteredBooks(result);
    setCurrentPage(1);
  }, [books, sortBy, searchTerm, showInStock]);

  // Pagination logic
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBooks = filteredBooks.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-2">Lỗi!</h1>
          <p className="text-gray-700">{error.message}</p>
        </div>
      </main>
    );
  }

  const banners = books.sort(() => 0.5 - Math.random()).slice(0, 5);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Cửa Hàng Sách</h1>
          <p className="text-gray-600 text-sm mt-1">
            Khám phá bộ sưu tập sách tuyệt vời
          </p>
        </div>
      </motion.div>

      {/* Main Content - Sidebar + Content Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT SIDEBAR - Category Placeholder */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit hover:shadow-md transition-shadow">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Danh Mục</h2>

              {/* Category Placeholder */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 hover:bg-gray-50 transition-all">
                <div className="text-gray-400 mb-3 text-3xl font-light">∿</div>
                <p className="text-sm font-medium text-gray-700">
                  Category component
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  will be added later
                </p>
              </div>

              {/* Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  Tính Năng
                </p>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    Lọc danh mục
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    Sắp xếp giá
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    Lọc tồn kho
                  </li>
                </ul>
              </div>
            </div>
          </motion.aside>

          {/* RIGHT CONTENT AREA */}
          <div className="lg:col-span-3 space-y-6">
            {/* Hero Banner */}
            <HeroBanner banners={banners} isLoading={isLoading} />

            {/* Filter Bar */}
            {/* Filter Bar - UI Only */}
            {!isLoading && (
              <FilterBar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortBy={sortBy}
                onSortChange={setSortBy}
                showInStock={showInStock}
                onStockFilterChange={setShowInStock}
              />
            )}

            {/* Product Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl overflow-hidden border border-gray-200"
                  >
                    <div className="relative w-full h-64 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 overflow-hidden">
                      <motion.div
                        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ backgroundSize: "200% 100%" }}
                        className="w-full h-full bg-gradient-to-r from-gray-200 via-white to-gray-200"
                      />
                    </div>
                    <div className="p-5 space-y-3">
                      <motion.div
                        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded"
                      />
                      <motion.div
                        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 0.1,
                        }}
                        className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-2/3"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredBooks.length > 0 ? (
              <>
                <motion.div layout  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 min-h-96">
                  {paginatedBooks.map((book, index) => (
                    <ProductCard key={book.id} book={book} index={index} />
                  ))}
                </motion.div>

                {/* Pagination */}
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={setCurrentPage} 
                />
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl border border-gray-200 p-16 text-center"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="mb-6 text-6xl font-light text-gray-300"
                >
                  ∿
                </motion.div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Không tìm thấy sách
                </h3>
                <p className="text-gray-600 mb-6">
                  Xin lỗi, chúng tôi không tìm thấy kết quả phù hợp. Vui lòng
                  thử lại.
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearchTerm("");
                    setSortBy("newest");
                    setShowInStock(false);
                  }}
                  className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Xem Tất Cả Sách
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
