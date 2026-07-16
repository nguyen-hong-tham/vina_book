'use client';

export default function OrderDetailModal({
  isOpen = false, // modal mở hay đóng
  order = null, // thông tin đơn hàng (id, user_name, email, created_at, status, total_amount)
  details = [], // danh sách sản phẩm trong đơn hàng (id, book_id, quantity, price, title, image_url)
  loading = false,  // trạng thái loading khi đang lấy chi tiết đơn hàng
  onClose = () => {}, // hàm gọi khi đóng modal
}) {
  if (!isOpen || !order) return null;

  const statusTexts = {
    PENDING: ' Chờ xác nhận',
    ACCEPT: ' Đã xác nhận',
    REJECT: ' Đã từ chối',
    DONE: ' Hoàn thành'
  };

  const statusColors = {
    PENDING: 'text-yellow-600',
    ACCEPT: 'text-blue-600',
    REJECT: 'text-red-600',
    DONE: 'text-green-600'
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-black text-xl font-bold">Chi Tiết Đơn Hàng #{order.id}</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-black text-center py-8">Đang tải chi tiết...</div>
        ) : (
          <>
            {/* Thông tin khách hàng */}
            <div className="text-black mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-bold mb-3"> Thông Tin Khách Hàng</h3>
              <p className="text-sm"><span className="font-medium">Tên:</span> {order.user_name}</p>
              <p className="text-sm"><span className="font-medium">Email:</span> {order.email}</p>
              <p className="text-sm"><span className="font-medium">Ngày đặt:</span> {formatDate(order.created_at)}</p>
            </div>

            {/* Trạng thái đơn hàng */}
            <div className="mb-6 p-4 bg-blue-50 rounded">
              <h3 className="text-black font-bold mb-2">Trạng Thái Đơn Hàng</h3>
              <p className={`text-lg font-bold ${statusColors[order.status]}`}>
                {statusTexts[order.status]}
              </p>
            </div>

            {/* Chi tiết sản phẩm */}
            <div className="text-black mb-6">
              <h3 className="font-bold mb-3">Sản Phẩm Trong Đơn Hàng</h3>
              <div className="space-y-3">
                {details.length > 0 ? (
                  details.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 border rounded">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-16 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                        <p className="text-sm text-gray-600">
                          Giá: {item.price.toLocaleString('vi-VN')}₫ × {item.quantity} = 
                          <span className="font-bold ml-2">
                            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                          </span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Không có sản phẩm</p>
                )}
              </div>
            </div>

            {/* Tổng tiền */}
            <div className="mb-6 p-4 bg-gray-100 rounded">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-green-600">Tổng Tiền:</span>
                <span className="font-bold text-2xl text-green-600">
                  {order.total_amount.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>

            {/* Nút đóng */}
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Đóng
            </button>
          </>
        )}
      </div>
    </div>
  );
}