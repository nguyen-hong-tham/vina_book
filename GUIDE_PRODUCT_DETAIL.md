# 📖 Hướng Dẫn Tạo Trang Chi Tiết Sản Phẩm (Product Detail Page)

## 📋 Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Cấu Trúc File](#cấu-trúc-file)
3. [Backend - API Endpoint](#backend---api-endpoint)
4. [Frontend - Component](#frontend---component)
5. [Database Queries](#database-queries)
6. [CSS Styling](#css-styling)
7. [Testing](#testing)

---

## 🎯 Tổng Quan

Trang chi tiết sản phẩm (`/products/[id]`) hiển thị thông tin chi tiết về một cuốn sách cụ thể bao gồm:
- Hình ảnh sản phẩm
- Tiêu đề, tác giả, mô tả, danh mục
- Giá, khả dụng
- Nút thêm vào giỏ hàng

### 📦 Công Nghệ Sử Dụng
- **Framework**: Next.js 16.2
- **Data Fetching**: React Query (@tanstack/react-query)
- **HTTP Client**: Axios
- **Animation**: Framer Motion
- **Styling**: TailwindCSS
- **Database**: MySQL
- **Icons**: Lucide React

---

## 📂 Cấu Trúc File

### Hiện Tại
```
src/
├── pages/
│   ├── products/
│   │   ├── index.js          (Trang danh sách sản phẩm)
│   │   └── [id].js           (❌ Trống - cần implement)
│   └── api/
│       ├── products.js       (Lấy danh sách sản phẩm)
│       └── product/
│           └── [id].js       (❌ Cần tạo - lấy chi tiết sản phẩm)
├── components/
│   ├── ProductCard.js        (Component card sản phẩm)
│   └── ... (các component khác)
└── lib/
    ├── db.js                 (Database connection)
    └── utils.js              (Utility functions)
```

### Sau Khi Implement
```
✅ src/pages/products/[id].js              (Trang chi tiết)
✅ src/pages/api/product/[id].js           (API endpoint)
✅ src/components/ProductDetail.js         (Component chi tiết)
```

---

## 🔌 Backend - API Endpoint

### Tạo File: `src/pages/api/product/[id].js`

```javascript
import pool from "@/lib/db";

export default async function handler(req, res) {
  // Chỉ cho phép GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  // Validate id
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid product ID" });
  }

  try {
    const connection = await pool.getConnection();
    
    // Query chi tiết sản phẩm với JOIN để lấy tên category
    const [product] = await connection.query(
      `SELECT 
        b.id, 
        b.title, 
        b.author, 
        b.price, 
        b.description, 
        b.image_url, 
        b.stock, 
        b.status,
        b.created_at,
        b.category_id,
        c.name as category
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?`,
      [id]
    );

    connection.release();

    if (!product || product.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json(product[0]);

  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
```

### API Response Format
```json
{
  "id": 1,
  "title": "Lập Trình JavaScript",
  "author": "Kyle Simpson",
  "price": 299000,
  "description": "Cuốn sách toàn diện về JavaScript...",
  "category": "Lập trình",
  "image_url": "https://...",
  "stock": 15,
  "status": "AVAILABLE",
  "category_id": 5,
  "created_at": "2024-01-15"
}
```

---

## 💻 Frontend - Component

### Tạo File: `src/components/ProductDetail.js`

```javascript
"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";

const fetchProductDetail = async (id) => {
  const response = await axios.get(`/api/product/${id}`);
  return response.data;
};

export default function ProductDetail({ productId }) {
  const {
    data: productData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProductDetail(productId),
    enabled: !!productId,
  });

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Lỗi!</h2>
          <p className="text-gray-600">{error.message}</p>
          <Link href="/products" className="text-blue-600 hover:underline mt-4 inline-block">
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  const { product, relatedProducts } = productData;
  const isOutOfStock = product.stock === 0 || product.status === 'OUT_OF_STOCK';

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    // TODO: Thêm vào giỏ hàng
    console.log(`Thêm ${quantity} cuốn sách ${product.title} vào giỏ hàng`);
    
    // Có thể dispatch action để update giỏ hàng hoặc call API
    alert(`Đã thêm ${quantity} cuốn vào giỏ hàng!`);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2 text-sm text-gray-600 mb-8"
        >
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-blue-600">Sản phẩm</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.title}</span>
        </motion.nav>

        {/* Main Product Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-8"
            >
              <img
                src={product.image_url || "/placeholder-book.png"}
                alt={product.title}
                className="w-full max-w-sm h-auto object-cover rounded-lg shadow-md"
              />
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`mt-4 p-3 rounded-full transition-all ${
                  isFavorite
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </motion.div>

            {/* Right: Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>

              {/* Author */}
              <p className="text-lg text-gray-600 mb-4">
                <span className="font-semibold">Tác giả:</span> {product.author}
              </p>

              {/* Price */}
              <div className="mb-6">
                <p className="text-4xl font-bold text-blue-600">
                  ₫{product.price.toLocaleString("vi-VN")}
                </p>
              </div>

              {/* Stock Status */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p
                  className={`text-lg font-semibold ${
                    isOutOfStock ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {isOutOfStock
                    ? "❌ Hết hàng"
                    : `✅ Còn ${product.stock} cuốn`}
                </p>
              </div>

              {/* Category */}
              <div className="mb-6">
                <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                  {product.category || "Không xác định"}
                </span>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                    disabled={isOutOfStock}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-16 text-center border-l border-r border-gray-300 py-2"
                    disabled={isOutOfStock}
                  />
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(
                          product.stock,
                          quantity + 1
                        )
                      )
                    }
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                    disabled={isOutOfStock}
                  >
                    +
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-bold text-white transition-all ${
                    isOutOfStock
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <ShoppingCart size={20} />
                  <span>
                    {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Description Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô Tả Sản Phẩm</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>
        </motion.section>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Sản Phẩm Liên Quan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <motion.div
                  key={relatedProduct.id}
                  whileHover={{ scale: 1.05 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all"
                >
                  <Link href={`/products/${relatedProduct.id}`}>
                    <img
                      src={relatedProduct.image_url || "/placeholder-book.png"}
                      alt={relatedProduct.title}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold text-gray-900 truncate">
                      {relatedProduct.title}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {relatedProduct.author}
                    </p>
                    <p className="text-lg font-bold text-blue-600 mt-2">
                      ₫{relatedProduct.price.toLocaleString("vi-VN")}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </main>
  );
}
```

const fetchProductDetail = async (id) => {
  const response = await axios.get(`/api/product/${id}`);
  return response.data;
};

export default function ProductDetail({ productId }) {
  const {
    data: productData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProductDetail(productId),
    enabled: !!productId,
  });

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Lỗi!</h2>
          <p className="text-gray-600">{error.message}</p>
          <Link href="/products" className="text-blue-600 hover:underline mt-4 inline-block">
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  const { product, relatedProducts } = productData;
  const isOutOfStock = product.stock === 0 || product.status === 'OUT_OF_STOCK';

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    // TODO: Thêm vào giỏ hàng
    console.log(`Thêm ${quantity} cuốn sách ${product.title} vào giỏ hàng`);
    
    // Có thể dispatch action để update giỏ hàng hoặc call API
    alert(`Đã thêm ${quantity} cuốn vào giỏ hàng!`);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2 text-sm text-gray-600 mb-8"
        >
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-blue-600">Sản phẩm</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.title}</span>
        </motion.nav>

        {/* Main Product Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-8"
            >
              <img
                src={product.image_url || "/placeholder-book.png"}
                alt={product.title}
                className="w-full max-w-sm h-auto object-cover rounded-lg shadow-md"
              />
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`mt-4 p-3 rounded-full transition-all ${
                  isFavorite
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </motion.div>

            {/* Right: Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>

              {/* Author */}
              <p className="text-lg text-gray-600 mb-4">
                <span className="font-semibold">Tác giả:</span> {product.author}
              </p>



              {/* Price */}
              <div className="mb-6">
                <p className="text-4xl font-bold text-blue-600">
                  ₫{product.price.toLocaleString("vi-VN")}
                </p>
              </div>

              {/* Stock Status */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p
                  className={`text-lg font-semibold ${
                    isOutOfStock ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {isOutOfStock
                    ? "❌ Hết hàng"
                    : `✅ Còn ${product.stock} cuốn`}
                </p>
              </div>

              {/* Category */}
              <div className="mb-6">
                <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                  {product.category}
                </span>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                    disabled={isOutOfStock}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-16 text-center border-l border-r border-gray-300 py-2"
                    disabled={isOutOfStock}
                  />
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(
                          product.stock,
                          quantity + 1
                        )
                      )
                    }
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                    disabled={isOutOfStock}
                  >
                    +
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-bold text-white transition-all ${
                    isOutOfStock
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <ShoppingCart size={20} />
                  <span>
                    {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Description Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô Tả Sản Phẩm</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>
        </motion.section>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Sản Phẩm Liên Quan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <motion.div
                  key={relatedProduct.id}
                  whileHover={{ scale: 1.05 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all"
                >
                  <Link href={`/products/${relatedProduct.id}`}>
                    <img
                      src={relatedProduct.image_url || "/placeholder-book.png"}
                      alt={relatedProduct.title}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold text-gray-900 truncate">
                      {relatedProduct.title}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {relatedProduct.author}
                    </p>
                    <p className="text-lg font-bold text-blue-600 mt-2">
                      ₫{relatedProduct.price.toLocaleString("vi-VN")}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </main>
  );
}
```

### Tạo File: `src/pages/products/[id].js`

```javascript
"use client";
import { useRouter } from "next/router";
import ProductDetail from "@/components/ProductDetail";
import Navbar from "@/components/Navbar";

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) {
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  }

  return (
    <>
      <Navbar />
      <ProductDetail productId={id} />
    </>
  );
}
```

---

## 🗄️ Database Queries

### SQL Queries để Lấy Dữ Liệu

**Query 1: Lấy Chi Tiết Sản Phẩm (với JOIN categories)**
```sql
SELECT 
  b.id, 
  b.title, 
  b.author, 
  b.price, 
  b.description, 
  b.image_url, 
  b.stock, 
  b.status,
  b.created_at,
  c.name as category
FROM books b
LEFT JOIN categories c ON b.category_id = c.id
WHERE b.id = ?;
```



### Schema Database Hiện Tại

Bảng `books` có các cột:
- `id` - ID sản phẩm
- `category_id` - ID danh mục (FK)
- `title` - Tiêu đề
- `author` - Tác giả
- `description` - Mô tả
- `image_url` - URL ảnh
- `price` - Giá
- `stock` - Số lượng tồn
- `status` - Trạng thái (AVAILABLE, OUT_OF_STOCK, HIDDEN, DELETED)
- `created_at` - Ngày tạo

---

## 🎨 CSS Styling

Dự án sử dụng **TailwindCSS** nên styling đã được xử lý qua className. 

Một số class quan trọng:
- `bg-white` - Nền trắng
- `rounded-xl` - Góc bo tròn
- `shadow-lg` - Shadow lớn
- `grid grid-cols-2 md:grid-cols-4` - Responsive grid
- `transition-all` - Smooth animation
- `hover:scale-105` - Scale khi hover

> **Lưu ý**: Vì database chưa có rating/reviews, phần rating đã bị loại bỏ. Bạn có thể thêm sau khi có thêm cột trong database.

---

## ✅ Testing

### Test API Endpoint

Sử dụng Postman hoặc curl:

```bash
# Lấy chi tiết sản phẩm ID 1
curl http://localhost:3000/api/product/1

# Response: { "id": 1, "title": "...", ... }
```

### Test Pages

1. **Khởi động server dev:**
   ```bash
   npm run dev
   ```

2. **Truy cập trang:**
   - http://localhost:3000/products/1
   - http://localhost:3000/products/2
   - v.v...

3. **Kiểm tra:**
   - ✅ Tải đúng thông tin sản phẩm
   - ✅ Hiển thị giá, tác giả, mô tả
   - ✅ Nút thêm vào giỏ hàng hoạt động
   - ✅ Error handling khi sản phẩm không tồn tại

---

## 🐛 Xử Lý Lỗi

### Error Cases
| Trường Hợp | Response | Status |
|-----------|----------|--------|
| ID không hợp lệ | `{ error: "Invalid product ID" }` | 400 |
| Sản phẩm không tồn tại | `{ error: "Product not found" }` | 404 |
| Lỗi database | `{ error: "Internal server error" }` | 500 |

### Debugging
- Mở DevTools (F12)
- Kiểm tra Network tab để xem API response
- Kiểm tra Console tab cho lỗi JavaScript
- Dùng `console.log()` trong component

---

## 📝 Checklist Implementation

- [ ] Tạo file `src/pages/api/product/[id].js` (API endpoint)
- [ ] Tạo component `src/components/ProductDetail.js`
- [ ] Implement `src/pages/products/[id].js` (Page)
- [ ] Cập nhật `src/components/index.ts` để export ProductDetail
- [ ] Test API endpoint với curl/Postman
- [ ] Test trang trên browser
- [ ] Kiểm tra error handling
- [ ] Test responsive design trên mobile
- [ ] Kiểm tra loading state
- [ ] Verify sản phẩm liên quan hiển thị đúng
- [ ] Connect với giỏ hàng (sau này)

---

## 🚀 Bước Tiếp Theo

1. **Thêm Rating/Reviews**: Tạo bảng `reviews` để lưu đánh giá và bình luận
2. **Thêm Publisher/Published Year**: Thêm cột vào bảng books nếu cần
3. **Giỏ Hàng**: Implement logic thêm sản phẩm vào giỏ hàng
4. **Tìm Kiếm**: Tích hợp tìm kiếm sản phẩm
5. **Bộ Lọc**: Thêm filter theo giá, danh mục, etc.

---

## 💡 Tips & Tricks

1. **Optimize Images**: Dùng Next.js `<Image>` component thay vì `<img>`
2. **Caching**: React Query tự động cache data, giảm request API
3. **SEO**: Thêm `next/head` để set meta tags
4. **Loading State**: Luôn có loading state tốt cho UX
5. **Error Messages**: Hiển thị message rõ ràng khi lỗi

---

**Chúc bạn implement thành công! 🎉**
