import Link from "next/link";
import { useRouter } from "next/router";

export default function AdminSidebar() {
  const router = useRouter(); // Hook để lấy thông tin về đường dẫn hiện tại

  // Kiểm tra page nào đang active
  const isActive = (path) => router.pathname === path;

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 fixed left-0 top-0">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
           VinaBook Admin
        </h1>
        <p className="text-gray-400 text-sm mt-2">Quản lý cửa hàng</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-3">
        {/* Products */}
        <Link
          href="/admin/products"
          className={`block px-4 py-3 rounded-lg transition ${
            isActive("/admin/products")
              ? "bg-blue-600 text-white font-semibold shadow-lg"
              : "hover:bg-gray-700 text-gray-300"
          }`}
        >
          Quản Lý Sản Phẩm
        </Link>

        {/* Orders */}
        <Link
          href="/admin/orders"
          className={`block px-4 py-3 rounded-lg transition ${
            isActive("/admin/orders")
              ? "bg-blue-600 text-white font-semibold shadow-lg"
              : "hover:bg-gray-700 text-gray-300"
          }`}
        >
          Quản Lý Đơn Hàng
        </Link>

        {/* Users */}
        <Link
          href="/admin/users"
          className={`block px-4 py-3 rounded-lg transition ${
            isActive("/admin/users")
              ? "bg-blue-600 text-white font-semibold shadow-lg"
              : "hover:bg-gray-700 text-gray-300"
          }`}
        >
          Quản Lý Người Dùng
        </Link>
      </nav>

      {/* Divider */}
      <div className="border-t border-gray-700 my-6"></div>

      {/* Footer */}
      
    </aside>
  );
}