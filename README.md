# 📚 Vinabook Demo - Hệ Thống Bán Sách Trực Tuyến

Vinabook Demo là một ứng dụng web thương mại điện tử bán sách trực tuyến hoàn chỉnh, được lấy cảm hứng từ trang thương mại điện tử Vinabook. Dự án được phát triển bằng **Next.js (Pages Router)**, **React 19**, **Tailwind CSS v4**, **Supabase (PostgreSQL)**, và tích hợp trợ lý ảo thông minh **AI Chatbot (GPT-4o-mini)**.

---

## 🚀 Các Tính Năng Nổi Bật

### 👤 Dành Cho Khách Hàng (Customer Client)
- **Trang chủ & Danh sách sách**: Giao diện hiển thị trực quan các đầu sách, hỗ trợ phân trang (`Pagination`), thanh tìm kiếm (`FilterBar`) theo tên, lọc theo thể loại (`Category`) và sắp xếp theo giá tiền hoặc tên sách.
- **Chi tiết sản phẩm**: Xem chi tiết thông tin sách (tên sách, tác giả, giá, mô tả, tình trạng kho hàng).
- **Giỏ hàng trực tuyến**: Thêm sách vào giỏ, cập nhật số lượng, xóa sản phẩm và tự động tính tổng tiền theo thời gian thực.
- **Đặt hàng & Thanh toán**: Form checkout nhập thông tin giao hàng và lưu lịch sử đơn hàng vào database.
- **Hệ thống Tài khoản**: Đăng ký, Đăng nhập và xem thông tin trang cá nhân (`Profile`) bằng JWT cookie bảo mật.
- **Trợ Lý AI Chatbot**:
  - Hộp thoại trò chuyện ở góc màn hình (`ChatWidget.js`).
  - Hỗ trợ giải đáp nhanh thông tin sách có sẵn trong hệ thống (tác giả, giá cả, tồn kho, thể loại) sử dụng OpenAI API (`gpt-4o-mini`).
  - **Quy tắc an toàn (Safety Prompting)**: Chỉ trả lời các nội dung liên quan tới hệ thống sách của cửa hàng. Từ chối lịch sự đối với các câu hỏi ngoài lề (thời tiết, kiến thức chung, chính trị...) bằng câu trả lời tiêu chuẩn để tránh lạm dụng token.

### 🔑 Dành Cho Quản Trị Viên (Admin Panel)
- **Dashboard quản trị**: Xem nhanh các số liệu thống kê tổng quan của hệ thống.
- **Quản lý sản phẩm**: Danh sách sách dạng bảng (`ProductTable`), hỗ trợ thêm sách mới, chỉnh sửa thông tin hoặc xóa/ẩn sách. Tích hợp upload ảnh bìa trực tiếp lên **Cloudinary**.
- **Quản lý đơn hàng**:
  - Xem danh sách đơn hàng và thông tin khách hàng chi tiết (`OrderDetailModal`).
  - Quy trình xử lý trạng thái đơn hàng chặt chẽ (`OrderModal`):
    `PENDING` (Chờ xác nhận) ➔ `ACCEPT` (Đã xác nhận) ➔ `DONE` (Hoàn thành) hoặc `REJECT` (Từ chối).
- **Quản lý người dùng**: Xem danh sách thành viên, khóa/mở khóa tài khoản người dùng (`ACTIVE` / `LOCKED`).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Frontend
- **Framework**: [Next.js v16.2](https://nextjs.org/) (Pages Router) & [React v19.2](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Hiệu ứng & Chuyển động**: [Framer Motion](https://www.framer.com/motion/) & [Swiper](https://swiperjs.com/) (cho slide biểu diễn ảnh)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend & Database
- **API Routes**: Next.js Serverless Functions
- **Database**: **PostgreSQL** chạy trên nền tảng **Supabase**
- **Kết nối Database**: Thư viện `pg` (PostgreSQL Client) kết hợp một **MySQL-compatibility wrapper** tự viết (cho phép viết query có tham số dạng `?` thay vì `$1, $2` của PostgreSQL, giúp đồng bộ mã nguồn cũ).
- **Authentication**: `jsonwebtoken` (JWT) lưu trữ phía client bằng HTTP-Only Cookie & `bcryptjs` để hash mật khẩu.
- **Lưu trữ hình ảnh**: [Cloudinary SDK](https://cloudinary.com/)
- **Trí tuệ nhân tạo (AI)**: `openai` client (GPT-4o-mini)

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
vinabook-demo/
├── public/                 # Các tài nguyên tĩnh (images, icons...)
├── src/
│   ├── components/         # Các React components dùng chung
│   │   ├── ui/             # shadcn/ui components
│   │   ├── AdminLayout.js  # Layout trang quản trị
│   │   ├── ChatWidget.js   # Giao diện Chatbot AI ở góc màn hình
│   │   └── ...
│   ├── lib/                # Cấu hình database và utilities
│   │   ├── db.js           # Kết nối PostgreSQL client + MySQL wrapper
│   │   ├── db.sql          # Script khởi tạo database & bảng (MySQL syntax)
│   │   └── seed.sql        # Dữ liệu mẫu (mẫu sách, tài khoản, thể loại)
│   ├── pages/              # Routing của Next.js (Pages Router)
│   │   ├── admin/          # Các trang dành cho Admin (/admin/products, /admin/orders...)
│   │   ├── api/            # API endpoints (/api/auth, /api/products, /api/chat...)
│   │   ├── orders/         # Trang quản lý đơn đặt hàng của User
│   │   ├── products/       # Trang danh sách sản phẩm & chi tiết sản phẩm
│   │   ├── cart.js         # Giao diện giỏ hàng
│   │   ├── profile.js      # Thông tin cá nhân người dùng
│   │   └── ...
│   └── styles/             # Cấu hình CSS (globals.css...)
├── .env.example            # Bản mẫu cấu hình môi trường
└── package.json            # Định nghĩa dependencies và scripts
```

---

## ⚙️ Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Chuẩn bị môi trường
- Máy tính đã cài đặt **Node.js** (Khuyên dùng phiên bản LTS v18 trở lên).
- Một tài khoản/dự án cơ sở dữ liệu **Supabase (PostgreSQL)**.
- Tài khoản **Cloudinary** (để upload ảnh sản phẩm).
- API Key của **OpenAI** (cho chatbot).

### 2. Cài đặt các gói phụ thuộc
Di chuyển vào thư mục dự án và cài đặt dependencies bằng npm:
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo tệp `.env` ở thư mục gốc bằng cách sao chép tệp ví dụ:
```bash
cp .env.example .env
```
Mở tệp `.env` mới tạo và điền các thông tin kết nối của bạn:
- `DATABASE_URL`: Đường dẫn kết nối PostgreSQL của Supabase.
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Thông tin kết nối Supabase client.
- `SUPABASE_SECRET_KEY`: Khóa bí mật Supabase server.
- `JWT_SECRET`: Chuỗi ngẫu nhiên dùng để mã hóa mã JWT token của phiên đăng nhập.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` & `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: Cấu hình Cloudinary để tải ảnh lên.
- `OPENAI_API_KEY`: API Key của OpenAI dùng cho tính năng Chatbot.

### 4. Thiết lập Cơ sở dữ liệu & Dữ liệu mẫu
1. Truy cập vào **SQL Editor** trên trang quản trị dự án Supabase của bạn.
2. Sao chép nội dung tệp [db.sql](file:///d:/WEB_SACH-%20CAC%20CONG%20NGHE%20HIEN%20DAI/vinabook-demo/src/lib/db.sql) và chạy để khởi tạo các bảng (`users`, `categories`, `books`, `cart`, `orders`, `order_details`).
3. Tiếp tục chạy nội dung tệp [seed.sql](file:///d:/WEB_SACH-%20CAC%20CONG%20NGHE%20HIEN%20DAI/vinabook-demo/src/lib/seed.sql) để nạp các bản ghi thể loại, sách mẫu và các tài khoản demo.
*(Lưu ý: Mật khẩu mặc định của các tài khoản mẫu trong tệp seed.sql cần được mã hóa bcrypt trong database thì mới đăng nhập được).*

### 5. Khởi động chế độ phát triển (Development)
Chạy ứng dụng Next.js trên local:
```bash
npm run dev
```
Ứng dụng sẽ chạy tại địa chỉ: [http://localhost:3000](http://localhost:3000).

*Tài khoản Admin dùng thử để trải nghiệm:*
- **Email:** `admin@gmail.com`
- **Mật khẩu:** `123456`

*Tài khoản Người dùng dùng thử:*
- **Email:** `tham@gmail.com` hoặc `an@gmail.com`
- **Mật khẩu:** `123456`

---

## ⚡ Điểm Nhấn Kỹ Thuật (Architectural Details)

### PostgreSQL & MySQL Query Wrapper
Để giải quyết bài toán chuyển từ cơ sở dữ liệu MySQL sang PostgreSQL (Supabase) nhưng không muốn viết lại toàn bộ mã nguồn chứa các truy vấn SQL chuẩn MySQL, dự án sử dụng tệp [db.js](file:///d:/WEB_SACH-%20CAC%20CONG%20NGHE%20HIEN%20DAI/vinabook-demo/src/lib/db.js) làm lớp trung gian:
- Nó tự động chuyển đổi các ký tự giữ chỗ `?` (của MySQL) thành dạng số tự tăng `$1, $2, $3...` (của PostgreSQL).
- Trả về dữ liệu bọc trong mảng `[rows]` để duy trì tính tương thích với cú pháp của thư viện `mysql2`.

### Quy trình xử lý trạng thái đơn hàng (Order State Flow)
Quy trình chuyển đổi trạng thái đơn hàng được kiểm soát nghiêm ngặt phía backend và frontend:
```text
               ┌───────────┐
               │  PENDING  │
               └─────┬─────┘
                     │
            ┌────────┴────────┐
            ▼                 ▼
       ┌─────────┐       ┌─────────┐
       │ ACCEPT  │       │ REJECT  │
       └────┬────┘       └─────────┘
            │
      ┌─────┴─────┐
      ▼           ▼
  ┌──────┐   ┌─────────┐
  │ DONE │   │ REJECT  │
  └──────┘   └─────────┘
```
- Trạng thái `REJECT` và `DONE` là trạng thái kết thúc, không thể thay đổi thêm.
- Giao diện Admin chỉ hiển thị các nút xử lý khả dụng tương ứng với trạng thái hiện tại của đơn hàng.
