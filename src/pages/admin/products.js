'use client';
import { useState, useEffect } from "react";
import { AdminLayout, ProductTable, ProductModal } from "@/components";
import axios from "axios"; // gọi api

export default function AdminProducts() {
  const [products, setProducts] = useState([]);// lưu danh sách sản phẩm
  const [categories, setCategories] = useState([]); // danh sách danh mục hiện có
  const [page, setPage] = useState(1); // trang hiện tại
  const [totalPages, setTotalPages] = useState(1); // tổng số trang
  const [limit] = useState(10); // số sản phẩm trên mỗi trang

  //searchInput => ext user đang gõ || search => keyword thật dùng gọi API.
  const [search, setSearch] = useState(''); // từ khóa tìm kiếm
  const [searchInput, setSearchInput] = useState(''); // giá trị input tìm kiếm
  const [modalOpen, setModalOpen] = useState(false); //Modal mở hay đóng.
  const [modalMode, setModalMode] = useState('create'); // 'create' hoặc 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null); // sản phẩm đang được chọn để edit
  const [categoryModalOpen, setCategoryModalOpen] = useState(false); // modal tạo danh mục
  const [loading, setLoading] = useState(false); // trạng thái loading khi gọi API
  const [submitting, setSubmitting] = useState(false); // trạng thái loading khi submit form
  const [categoryInput, setCategoryInput] = useState(''); // input tạo danh mục nhanh
  const [creatingCategory, setCreatingCategory] = useState(false); // trạng thái tạo danh mục
  const [categoryMessage, setCategoryMessage] = useState(''); // thông báo danh mục
  const [error, setError] = useState(''); // lỗi nếu có


  // page đổi  || search thay đổi => gọi API
  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  useEffect(() => {
    fetchCategories();
  }, []);


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

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/category');
      setCategories(response.data || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
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

  const handleOpenCategoryModal = () => {
    setCategoryMessage('');
    setCategoryInput('');
    setCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setCategoryModalOpen(false);
    setCategoryMessage('');
    setCategoryInput('');
  };

  const handleCreateCategory = async () => {
    const trimmedName = categoryInput.trim();

    if (!trimmedName) {
      setCategoryMessage('Vui lòng nhập tên danh mục');
      return;
    }

    setCreatingCategory(true);
    setCategoryMessage('');

    try {
      const response = await axios.post('/api/category', { name: trimmedName });
      const createdCategory = response.data?.data;

      if (createdCategory) {
        setCategories((prev) =>
          [...prev, createdCategory].sort((a, b) => String(a.name).localeCompare(String(b.name)))
        );
      }

      setCategoryInput('');
      setCategoryMessage('Tạo danh mục thành công');
    } catch (err) {
      setCategoryMessage(err.response?.data?.error || 'Tạo danh mục thất bại');
    } finally {
      setCreatingCategory(false);
    }
  };

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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Sản Phẩm</h1>
            <p className="text-gray-600 mt-1">Quản lý danh sách sách trong cửa hàng</p>
          </div>

          <div className="w-full lg:max-w-3xl space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                onClick={handleCreate}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition flex items-center justify-center gap-2"
              >
                Tạo Sản Phẩm
              </button>

              <button
                type="button"
                onClick={handleOpenCategoryModal}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition flex items-center justify-center gap-2"
              >
                Tạo Danh Mục
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm theo tên sách..."
              className="text-black flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            categories={categories}
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
        categories={categories}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      {categoryModalOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={handleCloseCategoryModal}
          />

          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Tạo Danh Mục</h2>
                <p className="text-sm text-gray-500 mt-1">Tạo nhanh danh mục mới cho sản phẩm</p>
              </div>
              <button
                type="button"
                onClick={handleCloseCategoryModal}
                className="text-2xl text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên danh mục mới
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    disabled={creatingCategory}
                    placeholder="Nhập tên danh mục..."
                    className="text-black flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={creatingCategory}
                    className="px-5 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium transition flex items-center gap-2"
                  >
                    {creatingCategory && (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    Tạo Danh Mục
                  </button>
                </div>

                {categoryMessage && (
                  <p className={`mt-2 text-sm ${categoryMessage.includes('thành công') ? 'text-emerald-600' : 'text-red-600'}`}>
                    {categoryMessage}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Danh mục hiện có</h3>
                  <button
                    type="button"
                    onClick={fetchCategories}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Làm mới
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <span
                        key={category.id}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700"
                      >
                        {category.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">Chưa có danh mục nào.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );

}