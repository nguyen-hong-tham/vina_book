'use client';
import { useState, useEffect } from "react";
import { AdminLayout, ProductTable, ProductModal } from "@/components";
import axios from "axios"; // gọi api

export default function AdminProducts() {
  const [products, setProducts] = useState([]);// lưu danh sách sản phẩm
  const [page, setPage] = useState(1); // trang hiện tại
  const [totalPages, setTotalPages] = useState(1); // tổng số trang
  const [limit] = useState(10); // số sản phẩm trên mỗi trang

  //searchInput => ext user đang gõ || search => keyword thật dùng gọi API.
  const [search, setSearch] = useState(''); // từ khóa tìm kiếm
  const [searchInput, setSearchInput] = useState(''); // giá trị input tìm kiếm
  const [modalOpen, setModalOpen] = useState(false); //Modal mở hay đóng.
  const [modalMode, setModalMode] = useState('create'); // 'create' hoặc 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null); // sản phẩm đang được chọn để edit
  const [loading, setLoading] = useState(false); // trạng thái loading khi gọi API
  const [submitting, setSubmitting] = useState(false); // trạng thái loading khi submit form
  const [error, setError] = useState(''); // lỗi nếu có


  // page đổi  || search thay đổi => gọi API
  useEffect(() => {
    fetchProducts();
  }, [page, search]);


  // ========================= Lấy danh sách sản phẩm từ API =========================
  const fetchProducts = async () => {
    setLoading(true); //Bắt đầu loading.
    setError('');
    try {
      const response = await axios.get('/api/admin/products', {
        params: {
          page,
          limit,
          search
        } // Tạo query:  /api/admin/products?page=1&limit=10&search=harry
      });
      setProducts(response.data.data); //Lưu products vào state.
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // ========================= Xử lý tìm kiếm =========================
  const handleSearchSubmit = (e) => {
    e.preventDefault();  //Do: <form> => reload page => preventDefault() để ngăn reload
    setPage(1); // Reset về trang 1 khi tìm kiếm
    setSearch(searchInput); // Cập nhật search để gọi API
  };

  // ========================== Xử lý reset tìm kiếm =========================
  const handleResetSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  }

  // ========================= Xử lý mở modal tạo sản phẩm =========================
  const handleCreate = () => {
    setSelectedProduct(null); //Không có sản phẩm nào được chọn
    setModalMode('create'); //Chế độ tạo mới
    setModalOpen(true); //Mở modal
  };


  // ========================= Xử lý mở modal chỉnh sửa sản phẩm =========================
  const handleEdit = (product) => {
    setSelectedProduct(product); //Lưu sản phẩm được chọn vào state
    setModalMode('edit'); //Chế độ chỉnh sửa
    setModalOpen(true); //Mở modal
  };


  // ========================= Xử lý submit form tạo/chỉnh sửa sản phẩm =========================
  const handleModalSubmit = async (productData, productId) => {
    setSubmitting(true);
    setError('');
    try {
      if (modalMode === 'create') {
        // Gọi API tạo sản phẩm mới
        await axios.post('/api/admin/products', productData);
      } else {
        // Gọi API cập nhật sản phẩm
        await axios.put(`/api/admin/products?id=${productId}`, productData);
      }
      // Đóng modal + reload list
      setModalOpen(false);
      await fetchProducts();
    } catch (err) {
      setError('Failed to submit product');
    } finally {
      setSubmitting(false);
    }
  };


  // ========================= Xử lý xóa sản phẩm =========================
  const handleDelete = async (
    productId
  ) => {

    try {

      const response = await axios.delete(
        `/api/admin/products?id=${productId}`
      );

      if (response.data.success) {

        await fetchProducts();

      } else {

        alert('Không thể xóa');

      }

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.error
      );

    }

  };

  // ========================= Xử lý ẩn sản phẩm =========================
  const handleHide = async (productId) => {
    try {
      const response = await axios.patch(
        `/api/admin/products?id=${productId}`,
        { status: 'HIDDEN' }
      );
      if (response.data.success) {
        await fetchProducts();
      }
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.error
      );
    }
  };

  // ========================= Xử lý hiện sản phẩm =========================
  const handleShow = async (productId) => {
    try {
      const response = await axios.patch(
        `/api/admin/products?id=${productId}`,
        { status: 'AVAILABLE' }
      );
      if (response.data.success) {
        await fetchProducts();
      }
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.error
      );
    }
  };

  // ========================= Xử lý chuyển trang =========================
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Sản Phẩm</h1>
            <p className="text-gray-600 mt-1">Quản lý danh sách sách trong cửa hàng</p>
          </div>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition flex items-center gap-2"
          >
            
            Tạo Sản Phẩm
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm theo tên sách..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
               Tìm
            </button>
            {search && (
              <button
                type="button"
                onClick={handleResetSearch}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Reset
              </button>
            )}
          </div>
        </form>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <ProductTable
            products={products}
            loading={loading}
            error={error}
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onHide={handleHide}
            onShow={handleShow}
          />
        </div>
      </div>

      {/* Modal */}
      <ProductModal
        isOpen={modalOpen}
        mode={modalMode}
        initialData={selectedProduct}
        loading={submitting}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </AdminLayout>
  );

}