# Hướng Dẫn Xây Dựng Trang Admin Orders Chi Tiết

## 📋 Tổng Quan

Trang admin orders cho phép quản lý các đơn hàng từ khách hàng với các tính năng:
- Xem danh sách đơn hàng với phân trang
- Xem chi tiết đơn hàng (sản phẩm, số lượng, giá)
- Thay đổi trạng thái đơn hàng (PENDING → ACCEPT → DONE hoặc REJECT)
- Popup để xử lý trạng thái

## 📊 Trạng Thái Đơn Hàng

| Trạng Thái | Ý Nghĩa | Hành Động Tiếp Theo |
|-----------|--------|-------------------|
| **PENDING** | Đơn hàng mới, chờ xác nhận | ACCEPT hoặc REJECT |
| **ACCEPT** | Đã xác nhận, chuẩn bị giao | DONE hoặc REJECT |
| **REJECT** | Từ chối đơn hàng | ❌ Không thay đổi được |
| **DONE** | Hoàn thành đơn hàng | ❌ Không thay đổi được |

## 🗂️ Cấu Trúc Tệp

```
src/
├── pages/
│   ├── admin/
│   │   └── orders.js (trang chính admin orders)
│   └── api/
│       └── admin/
│           └── orders.js (API endpoint)
├── components/
│   ├── OrderTable.js (bảng hiển thị đơn hàng)
│   ├── OrderModal.js (popup xử lý trạng thái)
│   └── OrderDetailModal.js (popup xem chi tiết)
└── lib/
    └── db.js (kết nối database)
```

## 🔌 Database Schema (Đã Có)

### Bảng orders
```sql
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_amount INT NOT NULL,
    status ENUM('PENDING', 'ACCEPT', 'REJECT', 'DONE') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Bảng order_details
```sql
CREATE TABLE order_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    book_id INT,
    quantity INT NOT NULL,
    price INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
```

## 🚀 Bước 1: Tạo API Endpoint

**File: `src/pages/api/admin/orders.js`**

### Hàm 1: Lấy danh sách đơn hàng
```javascript
export async function getOrders(req, res) {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const connection = await pool.getConnection();
    
    // Lấy tổng số đơn hàng
    const [[{ total }]] = await connection.query(
      'SELECT COUNT(*) as total FROM orders'
    );
    
    // Lấy danh sách đơn hàng
    const [orders] = await connection.query(
      `SELECT o.*, u.name as user_name, u.email 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC 
       LIMIT ? OFFSET ?`,
      [parseInt(limit), offset]
    );
    
    connection.release();
    
    return res.status(200).json({
      data: orders,
      total,
      totalPages: Math.ceil(total / limit),
      page: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Lỗi khi lấy danh sách đơn hàng' });
  }
}
```

### Hàm 2: Lấy chi tiết đơn hàng
```javascript
export async function getOrderDetail(req, res) {
  const { orderId } = req.query;

  try {
    const connection = await pool.getConnection();
    
    // Lấy thông tin đơn hàng
    const [[order]] = await connection.query(
      `SELECT o.*, u.name as user_name, u.email 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       WHERE o.id = ?`,
      [orderId]
    );
    
    // Lấy chi tiết sản phẩm trong đơn hàng
    const [orderDetails] = await connection.query(
      `SELECT od.*, b.title, b.image_url 
       FROM order_details od 
       JOIN books b ON od.book_id = b.id 
       WHERE od.order_id = ?`,
      [orderId]
    );
    
    connection.release();
    
    return res.status(200).json({
      order,
      details: orderDetails
    });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    return res.status(500).json({ error: 'Lỗi khi lấy chi tiết đơn hàng' });
  }
}
```

### Hàm 3: Cập nhật trạng thái đơn hàng
```javascript
export async function updateOrderStatus(req, res) {
  const { orderId, status } = req.body;
  
  // Kiểm tra trạng thái hợp lệ
  const validStatuses = ['PENDING', 'ACCEPT', 'REJECT', 'DONE'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
  }

  try {
    const connection = await pool.getConnection();
    
    // Cập nhật trạng thái
    const result = await connection.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );
    
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }
    
    return res.status(200).json({ 
      message: 'Cập nhật trạng thái thành công',
      orderId,
      newStatus: status
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái' });
  }
}
```

### Route Handler
```javascript
import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    if (req.query.orderId) {
      return getOrderDetail(req, res);
    }
    return getOrders(req, res);
  }
  
  if (req.method === 'PUT') {
    return updateOrderStatus(req, res);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
```

## 🎨 Bước 2: Tạo Component OrderTable

**File: `src/components/OrderTable.js`**

```javascript
'use client';
import { useState } from 'react';
import Pagination from './Pagination';

export default function OrderTable({
  orders = [],
  loading = false,
  page = 1,
  totalPages = 1,
  onPageChange = () => {},
  onViewDetail = () => {},
  onUpdateStatus = () => {},
}) {
  const statusConfig = {
    PENDING: { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', badge: '' },
    ACCEPT: { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800', badge: '✓' },
    REJECT: { text: 'Đã từ chối', color: 'bg-red-100 text-red-800', badge: '✗' },
    DONE: { text: 'Hoàn thành', color: 'bg-green-100 text-green-800', badge: '✓✓' }
  };

  const getStatusColor = (status) => {
    return statusConfig[status] || statusConfig.PENDING;
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

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (orders.length === 0) {
    return <div className="text-center py-8 text-gray-500">Không có đơn hàng nào</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">ID Đơn Hàng</th>
            <th className="p-3 text-left">Khách Hàng</th>
            <th className="p-3 text-right">Tổng Tiền</th>
            <th className="p-3 text-center">Trạng Thái</th>
            <th className="p-3 text-left">Ngày Tạo</th>
            <th className="p-3 text-center">Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const statusInfo = getStatusColor(order.status);
            return (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-bold">#{order.id}</td>
                <td className="p-3">
                  <div className="font-medium">{order.user_name}</div>
                  <div className="text-sm text-gray-500">{order.email}</div>
                </td>
                <td className="p-3 text-right font-bold">{order.total_amount.toLocaleString('vi-VN')}₫</td>
                <td className="p-3 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.badge} {statusInfo.text}
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-600">{formatDate(order.created_at)}</td>
                <td className="p-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => onViewDetail(order.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Chi tiết
                    </button>
                    {(order.status === 'PENDING' || order.status === 'ACCEPT') && (
                      <button
                        onClick={() => onUpdateStatus(order.id, order.status)}
                        className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                      >
                        Xử lý
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
```

## 🎭 Bước 3: Tạo Component OrderModal (Popup Xử Lý Trạng Thái)

**File: `src/components/OrderModal.js`**

```javascript
'use client';
import { useState } from 'react';

export default function OrderModal({
  isOpen = false,
  orderId = null,
  currentStatus = 'PENDING',
  onClose = () => {},
  onConfirm = () => {},
  loading = false,
}) {
  const [selectedStatus, setSelectedStatus] = useState(null);

  if (!isOpen) return null;

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

  const handleConfirm = async () => {
    if (!selectedStatus) {
      alert('Vui lòng chọn trạng thái');
      return;
    }
    await onConfirm(orderId, selectedStatus);
    setSelectedStatus(null);
  };

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
            ℹ️ Không thể thay đổi trạng thái từ <strong>{statusTexts[currentStatus]}</strong>
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
```

## 📦 Bước 4: Tạo Component OrderDetailModal (Xem Chi Tiết)

**File: `src/components/OrderDetailModal.js`**

```javascript
'use client';

export default function OrderDetailModal({
  isOpen = false,
  order = null,
  details = [],
  loading = false,
  onClose = () => {},
}) {
  if (!isOpen || !order) return null;

  const statusTexts = {
    PENDING: ' Chờ xác nhận',
    ACCEPT: '✓ Đã xác nhận',
    REJECT: '✗ Đã từ chối',
    DONE: '✓✓ Hoàn thành'
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Chi Tiết Đơn Hàng #{order.id}</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Đang tải chi tiết...</div>
        ) : (
          <>
            {/* Thông tin khách hàng */}
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-bold mb-3"> Thông Tin Khách Hàng</h3>
              <p className="text-sm"><span className="font-medium">Tên:</span> {order.user_name}</p>
              <p className="text-sm"><span className="font-medium">Email:</span> {order.email}</p>
              <p className="text-sm"><span className="font-medium">Ngày đặt:</span> {formatDate(order.created_at)}</p>
            </div>

            {/* Trạng thái đơn hàng */}
            <div className="mb-6 p-4 bg-blue-50 rounded">
              <h3 className="font-bold mb-2">📊 Trạng Thái Đơn Hàng</h3>
              <p className={`text-lg font-bold ${statusColors[order.status]}`}>
                {statusTexts[order.status]}
              </p>
            </div>

            {/* Chi tiết sản phẩm */}
            <div className="mb-6">
              <h3 className="font-bold mb-3"> Sản Phẩm Trong Đơn Hàng</h3>
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
                <span className="font-bold text-lg">Tổng Tiền:</span>
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
```

## 📄 Bước 5: Tạo Trang Admin Orders

**File: `src/pages/admin/orders.js`**

```javascript
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
  const handleViewDetail = async (orderId) => {
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
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Quản Lý Đơn Hàng</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Bảng đơn hàng */}
        <div className="bg-white rounded-lg shadow">
          <OrderTable
            orders={orders}
            loading={loading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onViewDetail={handleViewDetail}
            onUpdateStatus={handleUpdateStatus}
          />
        </div>

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
      </div>
    </AdminLayout>
  );
}
```

## 🎯 Lưu Ý Quan Trọng

### 1. **Flow Xử Lý Trạng Thái**
```
PENDING ──→ ACCEPT ──→ DONE
  │           │
  └─→ REJECT  └─→ REJECT
  
REJECT và DONE là trạng thái kết thúc
```

### 2. **API Security**
- Kiểm tra quyền admin trước khi trả về dữ liệu
- Validate dữ liệu đầu vào
- Sử dụng HTTPS trong production

### 3. **Error Handling**
- Bắt tất cả exception
- Trả về error messages rõ ràng
- Log errors để debug

### 4. **Performance**
- Phân trang danh sách đơn hàng
- Cache dữ liệu nếu cần
- Tối ưu query database (JOIN, index)

### 5. **UX Best Practices**
- Hiện loading state
- Confirm trước khi cập nhật trạng thái
- Toast/Alert feedback
- Responsive design

## 📝 Checklist Hoàn Thiện

- [ ] Tạo API endpoint `/api/admin/orders.js`
- [ ] Tạo component `OrderTable.js`
- [ ] Tạo component `OrderModal.js` (popup xử lý trạng thái)
- [ ] Tạo component `OrderDetailModal.js` (xem chi tiết)
- [ ] Tạo trang `pages/admin/orders.js`
- [ ] Thêm route vào `AdminSidebar.js`
- [ ] Test tất cả tính năng
- [ ] Thêm loading state
- [ ] Thêm error handling
- [ ] Responsive design cho mobile

## 🔗 Cấu Hình AdminSidebar

Thêm menu item vào `src/components/AdminSidebar.js`:
```javascript
<Link href="/admin/orders">
  <a className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700">
    📋 Quản Lý Đơn Hàng
  </a>
</Link>
```

---

**Bây giờ bạn đã có hướng dẫn đầy đủ để xây dựng trang Admin Orders! 🚀**
