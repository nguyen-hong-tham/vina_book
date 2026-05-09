# 📚 Hướng Dẫn Chi Tiết - Xây Dựng Trang Products

## 1. 🔌 Tạo Database Connection (`src/lib/db.js`)

**Mục đích**: Tạo pool kết nối MySQL để sử dụng trong tất cả API endpoint

```javascript
// src/lib/db.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Đổi theo mật khẩu của bạn
  database: 'bookstore_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
```

**Giải thích**:
- `mysql.createPool()`: Tạo một pool (nhóm) kết nối để tái sử dụng
- `host`: Địa chỉ server MySQL (localhost nếu local)
- `user/password`: Thông tin đăng nhập MySQL
- `database`: Tên database (bookstore_db)

---

## 2. 📡 Tạo API Endpoint - Lấy Danh Sách Sách

**File**: `src/pages/api/products.js`

```javascript
// src/pages/api/products.js
import pool from '@/lib/db';

export default async function handler(req, res) {
  // Chỉ cho phép GET request
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Lấy connection từ pool
    const connection = await pool.getConnection();
    
    // Query lấy tất cả sách có status = AVAILABLE
    const [books] = await connection.query(
      `SELECT id, title, author, description, image_url, price, stock 
       FROM books 
       WHERE status = 'AVAILABLE' 
       ORDER BY created_at DESC`
    );
    
    // Trả lại connection cho pool
    connection.release();
    
    // Phản hồi với danh sách sách
    return res.status(200).json(books);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}
```

**Giải thích từng dòng**:
- `pool.getConnection()`: Lấy 1 connection từ pool
- `connection.query()`: Thực thi SQL query
- `[books]`: Destructure - `books` là mảng kết quả, phần tử thứ 2 là metadata
- `connection.release()`: Trả connection về pool để tái sử dụng
- `WHERE status = 'AVAILABLE'`: Chỉ lấy sách có sẵn
- `ORDER BY created_at DESC`: Sắp xếp mới nhất lên trước

---

## 3. 📡 Tạo API Endpoint - Chi Tiết Sách Theo ID

**File**: `src/pages/api/products/[id].js`

```javascript
// src/pages/api/products/[id].js
import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query; // Lấy ID từ URL

  try {
    const connection = await pool.getConnection();
    
    // Query lấy 1 sách theo ID
    const [books] = await connection.query(
      `SELECT * FROM books WHERE id = ? AND status = 'AVAILABLE'`,
      [id]
    );
    
    connection.release();
    
    // Nếu không tìm thấy
    if (books.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    return res.status(200).json(books[0]); // Trả lại sách đầu tiên
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}
```

**Giải thích**:
- `req.query`: Lấy query parameters từ URL (ví dụ `/api/products/5` → `id = 5`)
- `?`: Placeholder để tránh SQL injection
- `[id]`: Mảng giá trị để thay vào placeholder
- `books[0]`: Lấy sách đầu tiên (vì ID là PRIMARY KEY, chỉ có 1 kết quả)

---

## 4. 🖥️ Tạo Trang Danh Sách Sách

**File**: `src/pages/products/index.js`

```javascript
// src/pages/products/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Products() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chạy khi component mount
  useEffect(() => {
    fetchBooks();
  }, []);

  // Hàm lấy danh sách sách từ API
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      
      const data = await response.json();
      setBooks(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">Lỗi: {error}</div>;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Danh Sách Sách</h1>

      {/* Layout 2 cột: Sidebar + Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* SIDEBAR TRÁI - Để trống cho CATEGORY COMPONENT */}
        <aside className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="font-bold text-lg mb-4">Danh Mục</h2>
            
            {/* BOX RỖ NG - TẠM THỜI CHỚI COMPONENT CATEGORY */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400">
              <p className="text-sm">📁 Chỗ để component Category</p>
              <p className="text-xs mt-2">(Sẽ hoàn thành sau)</p>
            </div>
          </div>
        </aside>

        {/* CONTENT CHÍNH - GRID SÁCH */}
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Link href={`/products/${book.id}`} key={book.id}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-4">
                  
                  {/* Hình ảnh sách */}
                  {book.image_url && (
                    <img
                      src={book.image_url}
                      alt={book.title}
                      className="w-full h-48 object-cover rounded mb-4"
                    />
                  )}

                  {/* Thông tin sách */}
                  <h2 className="font-bold text-lg line-clamp-2">{book.title}</h2>
                  <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                  
                  {/* Giá */}
                  <p className="text-xl font-bold text-blue-600 mb-2">
                    {book.price.toLocaleString()}đ
                  </p>

                  {/* Trạng thái tồn kho */}
                  <p className={`text-sm ${book.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {book.stock > 0 ? `Còn ${book.stock}` : 'Hết hàng'}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {books.length === 0 && (
            <div className="text-center py-10 text-gray-500">Không có sách nào</div>
          )}
        </div>
      </div>
    </main>
  );
}
```

**Giải thích**:
- `grid grid-cols-1 md:grid-cols-4`: Layout responsive - 1 cột mobile, 4 cột desktop
- `md:col-span-1`: Sidebar chiếm 1 cột trên desktop
- `md:col-span-3`: Content chiếm 3 cột trên desktop
- `sticky top-20`: Sidebar dính vào top khi scroll
- **BOX RỖ NG**: Để chỗ trống cho component Category (sẽ thêm sau)
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`: Sách hiển thị 3 cột thay vì 4
- `line-clamp-2`: Giới hạn text 2 dòng với dấu "..."
- `toLocaleString()`: Format số tiền (thêm dấu phân cách)

---

## 5. 🖥️ Tạo Trang Chi Tiết Sách

**File**: `src/pages/products/[id].js`

```javascript
// src/pages/products/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return; // Chờ ID từ router
    
    fetchBook();
  }, [id]);

  // Hàm lấy chi tiết sách
  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${id}`);
      
      if (!response.ok) {
        throw new Error('Book not found');
      }
      
      const data = await response.json();
      setBook(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  // Hàm thêm vào giỏ hàng
  const handleAddToCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: id,
          quantity: quantity,
        }),
      });

      if (response.ok) {
        alert('Đã thêm vào giỏ hàng!');
      } else {
        alert('Thêm giỏ hàng thất bại!');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  if (error || !book) {
    return <div className="text-center py-10 text-red-600">Lỗi: {error || 'Sách không tồn tại'}</div>;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Hình ảnh sách */}
          {book.image_url && (
            <div>
              <img
                src={book.image_url}
                alt={book.title}
                className="w-full rounded-lg"
              />
            </div>
          )}

          {/* Thông tin sách */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            <p className="text-xl text-gray-600 mb-4">{book.author}</p>

            {/* Giá */}
            <p className="text-3xl font-bold text-blue-600 mb-4">
              {book.price.toLocaleString()}đ
            </p>

            {/* Mô tả */}
            <p className="text-gray-700 mb-6 leading-relaxed">
              {book.description || 'Không có mô tả'}
            </p>

            {/* Trạng thái tồn kho */}
            <p className={`text-lg font-bold mb-6 ${book.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {book.stock > 0 ? `Còn ${book.stock} cuốn` : 'Hết hàng'}
            </p>

            {/* Chọn số lượng */}
            {book.stock > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2">Số lượng:</label>
                <input
                  type="number"
                  min="1"
                  max={book.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="border rounded px-3 py-2 w-20"
                />
              </div>
            )}

            {/* Nút thêm vào giỏ */}
            <button
              onClick={handleAddToCart}
              disabled={book.stock === 0}
              className={`w-full py-3 px-4 rounded-lg font-bold text-white ${
                book.stock > 0
                  ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {book.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
```

**Giải thích**:
- `useRouter()`: Lấy thông tin route (ID từ URL)
- `[id]` trong URL → `router.query.id`
- `useEffect(..., [id])`: Chỉ chạy khi ID thay đổi
- `fetch('/api/products/{id}')`: Gửi GET request tới API chi tiết
- `handleAddToCart()`: POST request tới `/api/cart` để thêm vào giỏ
- `disabled={book.stock === 0}`: Vô hiệu hóa nút nếu hết hàng

---

## 6. 📊 Sơ Đồ Luồng Dữ Liệu

```
┌─────────────────────────────────────────────────────┐
│         Trình Duyệt (Frontend)                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  /products/index.js ────→ /api/products             │
│   (Danh sách sách)        (Lấy tất cả sách)        │
│          ↓                     ↓                     │
│      Hiển thị              Query DB:                │
│      Grid sách            SELECT books              │
│          ↓                 WHERE status=AVAILABLE   │
│    Click sách                  ↓                     │
│          ↓                  Return JSON             │
│                                                     │
│  /products/[id].js ────→ /api/products/[id]        │
│  (Chi tiết sách)         (Lấy 1 sách theo ID)      │
│          ↓                     ↓                     │
│      Hiển thị              Query DB:                │
│      Chi tiết            SELECT book                │
│      + Nút Mua           WHERE id=? AND             │
│          ↓                status=AVAILABLE          │
│                               ↓                     │
│                           Return JSON              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 7. 📋 Checklist Để Hoàn Thành

- [ ] **Bước 1**: Tạo `src/lib/db.js` (kết nối database)
- [ ] **Bước 2**: Tạo `src/pages/api/products.js` (API danh sách)
- [ ] **Bước 3**: Tạo `src/pages/api/products/[id].js` (API chi tiết)
- [ ] **Bước 4**: Tạo `src/pages/products/index.js` (Trang danh sách)
- [ ] **Bước 5**: Tạo `src/pages/products/[id].js` (Trang chi tiết)
- [ ] **Bước 6**: Chạy database script (`db.sql`)
- [ ] **Bước 7**: Test với `npm run dev`

---

## 8. 🧪 Cách Test

### 1️⃣ Test API - Danh Sách Sách
```
GET http://localhost:3000/api/products
```
Sẽ trả về JSON với mảng sách

### 2️⃣ Test API - Chi Tiết Sách
```
GET http://localhost:3000/api/products/1
```
Sẽ trả về 1 sách có id = 1

### 3️⃣ Test Trang - Danh Sách
```
http://localhost:3000/products
```
Sẽ hiển thị grid sách

### 4️⃣ Test Trang - Chi Tiết
```
http://localhost:3000/products/1
```
Sẽ hiển thị chi tiết sách có id = 1

---

## 9. ⚠️ Lỗi Thường Gặp & Cách Sửa

| Lỗi | Nguyên Nhân | Cách Sửa |
|-----|-----------|---------|
| `Cannot find module '@/lib/db'` | Import path sai | Kiểm tra `jsconfig.json` có `"@": "./src"` không |
| `ECONNREFUSED` | MySQL chưa chạy | Khởi động MySQL server |
| `Access denied for user` | Sai user/password | Kiểm tra thông tin trong `db.js` |
| `books is not iterable` | API không trả mảng | Thêm `return []` nếu error |
| `undefined is not an object` | Data chưa load xong | Thêm `loading` check |

---

## 10. 📚 Tài Liệu Tham Khảo

- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Hooks](https://react.dev/reference/react)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [mysql2/promise](https://github.com/sidorares/node-mysql2)

---

## 11. 🔄 Cách Thêm Component Category (Sau)

Khi leader hoàn thành component Category, thay thế box rỗng bằng:

```javascript
// Thay vào chỗ BOX RỖ NG trong src/pages/products/index.js

import Category from '@/components/Category'; // Import component

// Trong JSX:
<aside className="md:col-span-1">
  <div className="sticky top-20">
    <Category onCategorySelect={handleCategorySelect} />
  </div>
</aside>

// Thêm state để xử lý filter theo category:
const [selectedCategory, setSelectedCategory] = useState(null);

// Hàm xử lý khi chọn category:
const handleCategorySelect = (categoryId) => {
  setSelectedCategory(categoryId);
  // Có thể gọi lại fetchBooks() hoặc filter dữ liệu
};
```

**Khi đó, trang sẽ:**
1. ✅ Hiển thị sidebar bên trái với category
2. ✅ Hiển thị grid sách bên phải
3. ✅ Click category → Filter sách theo danh mục
