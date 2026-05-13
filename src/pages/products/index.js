import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ProductCard, Pagination, FilterBar, Category } from "@/components";
import pool from "@/lib/db";

const EMPTY_BOOKS = [];

const HeroBanner = dynamic(() => import("@/components/HeroBanner"), {
  ssr: true,
});

export default function Products({ initialBooks = EMPTY_BOOKS }) {
  const router = useRouter();
  const categoryId = router.query.categoryId;
  const [mounted, setMounted] = useState(false);
  const [books, setBooks] = useState(initialBooks);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setBooks(initialBooks);
    setError(null);
    setIsLoading(false);
  }, [initialBooks]);

  // Fetch additional data when categoryId changes on client
  useEffect(() => {
    if (!router.isReady || !categoryId) return;
    
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/products?categoryId=${categoryId}`);
        const data = await response.json();
        setBooks(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [categoryId, router.isReady]);

  const [filteredBooks, setFilteredBooks] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [showInStock, setShowInStock] = useState(false);
  const [priceRange, setPriceRange] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Helper function to check if book price is in range
  const isPriceInRange = (price, range) => {
    if (!range) return true;
    if (range === "300001") return price > 300000;
    const [min, max] = range.split("-").map(Number);
    return price >= min && price <= max;
  };

  // Apply filters and sorting
  useEffect(() => {
    if (!mounted) return;
    
    let result = [...books];

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price range filter
    if (priceRange) {
      result = result.filter((book) => isPriceInRange(book.price, priceRange));
    }

    if (showInStock) {
      result = result.filter((book) => book.stock > 0);
    }

    // Sort
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }
    
    setFilteredBooks(result);
    setCurrentPage((page) => (page === 1 ? page : 1));
  }, [books, searchTerm, priceRange, sortBy, showInStock, mounted]);

  // Pagination logic
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBooks = filteredBooks.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">
          Đang tải...
        </div>
      </main>
    );
  }

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

  const banners = books.slice(0, 5);

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

              {/* Category Component */}
              <Category />
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
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
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
                    <div className="relative w-full h-64 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 overflow-hidden">
                      <motion.div
                        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ backgroundSize: "200% 100%" }}
                        className="w-full h-full bg-linear-to-r from-gray-200 via-white to-gray-200"
                      />
                    </div>
                    <div className="p-5 space-y-3">
                      <motion.div
                        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-5 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 rounded"
                      />
                      <motion.div
                        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 0.1,
                        }}
                        className="h-4 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-2/3"
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


export async function getServerSideProps({ query }) {
  try {
    const connection = await pool.getConnection();
    
    let q = `
      SELECT id, title, author, price, stock, image_url, 
             category_id, status
      FROM books 
      WHERE status IN ('AVAILABLE', 'OUT_OF_STOCK')
    `;
    
    if (query.categoryId) {
      q += ` AND category_id = ${parseInt(query.categoryId)}`;
    }
    
    q += ` ORDER BY created_at DESC`;
    
    const [books] = await connection.query(q);
    connection.release();
    
    return {
      props: {
        initialBooks: books || [],
      },
    };
  } catch (error) {
    console.error("getServerSideProps error:", error);
    return {
      props: {
        initialBooks: [],
      },
    };
  }
}
