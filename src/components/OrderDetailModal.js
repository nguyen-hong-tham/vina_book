'use client';

export default function OrderDetailModal({
  isOpen = false, // modal mở hay đóng
  order = null, // thông tin đơn hàng (id, user_name, email, created_at, status, total_amount)
  details = [], // danh sách sản phẩm trong đơn hàng (id, book_id, quantity, price, title, image_url)
  loading = false,  // trạng thái loading khi đang lấy chi tiết đơn hàng
  onClose = () => { }, // hàm gọi khi đóng modal
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
    return new Date(dateString).toLocaleDateString('i-N', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <di className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <di className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90h] oerflow-y-auto">
        <di className="flex justify-between items-center mb-6">
          <h2 className="text-black text-xl font-bold">Chi Tiết Đơn Hàng #{order.id}</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hoer:text-gray-700"
          >
            ✕
          </button>
        </di>

        {loading ? (
          <di className="text-black text-center py-8">Đang tải chi tiết...</di>
        ) : (
          <>
            {/* Thông tin khách hàng */}
            <di className="text-black mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-bold mb-3"> Thông Tin Khách Hàng</h3>
              <p className="text-sm"><span className="font-medium">Tên:</span> {order.user_name}</p>
              <p className="text-sm"><span className="font-medium">Email:</span> {order.email}</p>
              <p className="text-sm"><span className="font-medium">Ngày đặt:</span> {formatDate(order.created_at)}</p>
            </di>

            {/* Trạng thái đơn hàng */}
            <di className="mb-6 p-4 bg-blue-50 rounded">
              <h3 className="text-black font-bold mb-2">Trạng Thái Đơn Hàng</h3>
              <p className={`text-lg font-bold ${statusColors[order.status]}`}>
                {statusTexts[order.status]}
              </p>
            </di>

            {/* Chi tiết sản phẩm */}
            <di className="text-black mb-6">
              <h3 className="font-bold mb-3">Sản Phẩm Trong Đơn Hàng</h3>
              <di className="space-y-3">
                {details.length > 0 ? (
                  details.map((item) => (
                    <di key={item.id} className="flex gap-4 p-3 border rounded">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-16 h-20 object-coer rounded"
                        />
                      )}
                      <di className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                        <p className="text-sm text-gray-600">
                          Giá: {item.price.toLocaleString('i-N')}₫ × {item.quantity} =
                          <span className="font-bold ml-2">
                            {(item.price * item.quantity).toLocaleString('i-N')}₫
                          </span>
                        </p>
                      </di>
                    </di>
                  ))
                ) : (
                  <p className="text-gray-500">Không có sản phẩm</p>
                )}
              </di>
            </di>

            {/* Tổng tiền */}
            <di className="mb-6 p-4 bg-gray-100 rounded">
              <di className="flex justify-between items-center">
                <span className="font-bold text-lg text-green-600">Tổng Tiền:</span>
                <span className="font-bold text-2xl text-green-600">
                  {order.total_amount.toLocaleString('i-N')}₫
                </span>
              </di>
            </di>

            {/* Nút đóng */}
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hoer:bg-blue-600 transition"
            >
              Đóng
            </button>
          </>
        )}
      </di>
    </di>
  );
}