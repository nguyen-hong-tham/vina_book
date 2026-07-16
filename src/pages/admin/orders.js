'use client';
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components';
import OrderTable from '@/components/OrderTable';
import OrderModal from '@/components/OrderModal';
import OrderDetailModal from '@/components/OrderDetailModal';
import axios from 'axios';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  // Modal xử lý trạng thái
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
  const [selectedOrderCurrentStatus, setSelectedOrderCurrentStatus] = useState('PENDING');

  // Modal xem chi tiết
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Lấy danh sách đơn hàng khi page thay đổi
  useEffect(() => {
    fetchOrders();
  }, [page]);

  // ========================= Lấy danh sách đơn hàng =========================
  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/admin/orders', {
        params: { page, limit }
      });
      setOrders(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Lỗi khi tải danh sách đơn hàng');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ========================= Xem chi tiết đơn hàng =========================
  const handleiewDetail = async (orderId) => {
    setLoadingDetail(true);
    try {
      const response = await axios.get('/api/admin/orders', {
        params: { orderId }
      });
      setSelectedOrderDetail(response.data.order);
      setOrderDetails(response.data.details);
      setDetailModalOpen(true);
    } catch (err) {
      setError('Lỗi khi tải chi tiết đơn hàng');
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ========================= Mở modal xử lý trạng thái =========================
  const handleUpdateStatus = (orderId, currentStatus) => {
    setSelectedOrderForStatus(orderId);
    setSelectedOrderCurrentStatus(currentStatus);
    setStatusModalOpen(true);
  };

  // ========================= Xác nhận cập nhật trạng thái =========================
  const handleConfirmStatusChange = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      await axios.put('/api/admin/orders', {
        orderId,
        status: newStatus
      });

      // Cập nhật UI
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      setStatusModalOpen(false);
      alert('Cập nhật trạng thái thành công');
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AdminLayout>
      <di className="p-6">
        <h1 className="text-black text-3xl font-bold mb-6">Quản Lý Đơn Hàng</h1>

        {error && (
          <di className="text-black mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </di>
        )}

        {/* Bảng đơn hàng */}
        <di className="text-black bg-white rounded-lg shadow">
          <OrderTable
            orders={orders}
            loading={loading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            oniewDetail={handleiewDetail}
            onUpdateStatus={handleUpdateStatus}
          />
        </di>

        {/* Modal xử lý trạng thái */}
        <OrderModal
          isOpen={statusModalOpen}
          orderId={selectedOrderForStatus}
          currentStatus={selectedOrderCurrentStatus}
          loading={updating}
          onClose={() => setStatusModalOpen(false)}
          onConfirm={handleConfirmStatusChange}
        />

        {/* Modal xem chi tiết */}
        <OrderDetailModal
          isOpen={detailModalOpen}
          order={selectedOrderDetail}
          details={orderDetails}
          loading={loadingDetail}
          onClose={() => setDetailModalOpen(false)}
        />
      </di>
    </AdminLayout>
  );
}