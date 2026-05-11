'use client';
import { useState } from 'react';

export default function OrderModal({
  isOpen = false, // modal mở hay đóng
  orderId = null, // id đơn hàng đang xử lý
  currentStatus = 'PENDING', // trạng thái hiện tại của đơn hàng
  onClose = () => {}, // hàm gọi khi đóng modal
  onConfirm = () => {}, // hàm gọi khi xác nhận thay đổi trạng thái, nhận vào orderId và newStatus
  loading = false, // trạng thái loading khi cập nhật trạng thái
}) {
  const [selectedStatus, setSelectedStatus] = useState(null); // trạng thái mới được chọn trong modal

  if (!isOpen) return null;
 

  // Lấy trạng thái tiếp theo có thể chuyển đến dựa trên trạng thái hiện tại
  const getNextStatuses = (current) => {
    const nextMap = {
      PENDING: ['ACCEPT', 'REJECT'],
      ACCEPT: ['DONE', 'REJECT'],
      REJECT: [],
      DONE: []
    };
    return nextMap[current] || [];
  };

  const nextStatuses = getNextStatuses(currentStatus);
  const statusTexts = {
    PENDING: 'Chờ xác nhận',
    ACCEPT: 'Đã xác nhận',
    REJECT: 'Từ chối',
    DONE: 'Hoàn thành'
  };

  const statusColors = {
    ACCEPT: 'bg-green-500 hover:bg-green-600',
    REJECT: 'bg-red-500 hover:bg-red-600',
    DONE: 'bg-blue-500 hover:bg-blue-600'
  };

    // Xử lý khi click xác nhận
  const handleConfirm = async () => {
    if (!selectedStatus) {
      alert('Vui lòng chọn trạng thái');
      return;
    }
    await onConfirm(orderId, selectedStatus);
    setSelectedStatus(null);
  };

  // Xử lý khi đóng modal
  const handleClose = () => {
    setSelectedStatus(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-full">
        <h2 className="text-xl font-bold mb-4">Xử Lý Trạng Thái Đơn Hàng</h2>
        
        {/* Thông tin đơn hàng */}
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">Đơn hàng #<span className="font-bold">{orderId}</span></p>
          <p className="text-sm text-gray-600">
            Trạng thái hiện tại: 
            <span className="font-bold ml-2">{statusTexts[currentStatus]}</span>
          </p>
        </div>

        {/* Danh sách trạng thái khả dụng */}
        {nextStatuses.length > 0 ? (
          <div>
            <p className="text-sm font-medium mb-3">Chọn trạng thái tiếp theo:</p>
            <div className="space-y-2 mb-6">
              {nextStatuses.map((status) => (
                <label key={status} className="flex items-center p-3 border-2 rounded cursor-pointer transition"
                  style={{
                    borderColor: selectedStatus === status ? '#3b82f6' : '#e5e7eb',
                    backgroundColor: selectedStatus === status ? '#eff6ff' : 'transparent'
                  }}>
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={selectedStatus === status}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="mr-3"
                  />
                  <span className="font-medium">{statusTexts[status]}</span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-100 text-gray-600 rounded text-sm">
            Không thể thay đổi trạng thái từ <strong>{statusTexts[currentStatus]}</strong>
          </div>
        )}

        {/* Nút hành động */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50 transition"
          >
            Hủy
          </button>
          {nextStatuses.length > 0 && (
            <button
              onClick={handleConfirm}
              disabled={loading || !selectedStatus}
              className={`flex-1 px-4 py-2 text-white rounded transition disabled:opacity-50 ${
                statusColors[selectedStatus] || 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {loading ? 'Đang xử lý...' : 'Xác Nhận'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}