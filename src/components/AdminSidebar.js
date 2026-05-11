import Link from "next/link";
import { useRouter } from "next/router";

export default function AdminSidebar() {
  const router = useRouter(); // Hook để lấy thông tin về đường dẫn hiện tại

  // Kiểm tra page nào đang active
  const isActive = (path) => router.pathname === path;

  return (
    <aside className="fixed left-0 top-16 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-slate-800 bg-slate-950 px-5 py-6 text-white shadow-2xl">
      {/* Logo */}
      <Link href="/admin" className="mb-8 block rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-4 shadow-lg shadow-blue-950/40 hover:opacity-95">
        <div className="text-xs uppercase tracking-[0.35em] text-white/80">Admin Panel</div>
        <h1 className="mt-2 text-2xl font-black leading-tight">
          VinaBook
        </h1>
        <p className="mt-2 text-sm text-white/80">Quản lý cửa hàng</p>
      </Link>

      {/* Navigation */}
      <nav className="space-y-2">
        {/* Dashboard */}
        <Link
          href="/admin"
          className={`block rounded-2xl px-4 py-3 transition ${
            isActive('/admin')
              ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          Thống Kê
        </Link>

        {/* Products */}
        <Link
          href="/admin/products"
          className={`block rounded-2xl px-4 py-3 transition ${
            isActive("/admin/products")
              ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/30"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          Quản Lý Sản Phẩm
        </Link>

        {/* Orders */}
        <Link
          href="/admin/orders"
          className={`block rounded-2xl px-4 py-3 transition ${
            isActive("/admin/orders")
              ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/30"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          Quản Lý Đơn Hàng
        </Link>

        {/* Users */}
        <Link
          href="/admin/users"
          className={`block rounded-2xl px-4 py-3 transition ${
            isActive("/admin/users")
              ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/30"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          Quản Lý Người Dùng
        </Link>
      </nav>

      {/* Divider */}
      <div className="my-6 border-t border-slate-800"></div>

      {/* Footer */}

    </aside>
  );
}