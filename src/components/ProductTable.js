'use client';
import React, { useMemo } from 'react';
import Pagination from './Pagination';

export default function ProductTable({
  products = [], //danh sách sản phẩm
  categories = [], //danh sách danh mục từ page cha
  loading = false, //loading table
  error = null, //lỗi nếu có
  page = 1, //trang hiện tại
  totalPages = 1, // tổng số trang
  onPageChange = () => { },
  onEdit = () => { }, // hàm gọi khi click edit
  onDelete = () => { }, // hàm gọi khi click delete
  onHide = () => { }, // hàm gọi khi click hide
  onShow = () => { },// hàm gọi khi click show
}) {
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      if (!c) return;
      const id = c.id ?? c.category_id ?? c.value;
      const name = c.name || c.title || c.label || c.category_name;
      if (id != null) map[id] = name;
    });
    return map;
  }, [categories]);

  const getCategoryName = (categoryId) => {
    return categoryMap[categoryId] || 'N/A';
  };

  const renderStatusBadge = (status, stock) => {
    if (Number(stock) === 0) {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          Hết hàng
        </span>
      );
    }

    const statusConfig = {
      AVAILABLE: { text: 'Có sẵn', color: 'bg-green-100 text-green-800' },
      OUT_OF_STOCK: { text: 'Hết hàng', color: 'bg-yellow-100 text-yellow-800' },
      HIDDEN: { text: 'Đã ẩn', color: 'bg-gray-100 text-gray-800' },
      DELETED: { text: 'Đã xóa', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || statusConfig.AVAILABLE;
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  }
  // Render action buttons
  const renderActions = (product) => {
    const { id, status } = product;

    return (
      <div className="flex items-center gap-2 justify-center">
        {/* Edit - luôn show */}
        <button
          onClick={() => onEdit(product)}
          disabled={loading}
          title="Chỉnh sửa sản phẩm"
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 transition"
        >
          Chỉnh sửa
        </button>

        {/* Hide - show khi AVAILABLE hoặc OUT_OF_STOCK */}
        {(status === 'AVAILABLE' || status === 'OUT_OF_STOCK') && (
          <button
            onClick={() => onHide(id)}
            disabled={loading}
            title="Ẩn sản phẩm này"
            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg disabled:opacity-50 transition"
          >
            Ẩn
          </button>
        )}

        {/* Show - show khi HIDDEN */}
        {status === 'HIDDEN' && (
          <button
            onClick={() => onShow(id)}
            disabled={loading}
            title="Hiện sản phẩm này"
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50 transition"
          >
            Hiển thị
          </button>
        )}

        {/* Delete - luôn show */}
        <button
          onClick={() => {
            if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
              onDelete(id);
            }
          }}
          disabled={loading}
          title="Xóa sản phẩm này"
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition"
        >
          Xóa
        </button>
      </div>
    );
  };

  // Error
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p className="text-red-800 font-medium"> Lỗi: {error}</p>
      </div>
    );
  }

  // Empty
  if (!loading && products.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-600 text-lg font-medium mb-2"> Không có sản phẩm</p>
        <p className="text-gray-500 text-sm">Hãy tạo sản phẩm mới để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full border-collapse">
          {/* Header */}
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-12">ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tên Sách</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 w-24">Hình Ảnh</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-24">Thể Loại</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-32">Giá (VND)</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-20">Kho</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-40">Trạng Thái</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 w-48">Hành Động</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="border-b border-gray-200 animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-8" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-48" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="h-12 bg-gray-200 rounded w-12 inline-block" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-12" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-gray-200 rounded w-28" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                      <div className="h-8 bg-gray-200 rounded w-8" />
                      <div className="h-8 bg-gray-200 rounded w-8" />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              // Render products
              products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    #{product.id}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                    <span title={product.title} className="block truncate">
                      {product.title}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <img 
                      src={product.image_url} 
                      alt={product.title}
                      className="h-12 w-12 object-cover rounded border border-gray-200"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                      }}
                    />
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {getCategoryName(product.category_id)}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                    {new Intl.NumberFormat('vi-VN').format(product.price)}
                  </td>

                  <td className="px-6 py-4 text-sm text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${product.stock > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {product.stock}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {renderStatusBadge(product.status, product.stock)}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {renderActions(product)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );

};
   

