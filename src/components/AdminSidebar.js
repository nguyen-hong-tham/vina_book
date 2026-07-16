import Link from "next/link";
import { useRouter } from "next/router";

export default function AdminSidebar() {
  const router = useRouter(); // Hook để lấy thông tin ề đường dẫn hiện tại

  // Kiểm tra page nào đang actie
  const isActie = (path) => router.pathname === path;

  return (
    <aside className="fixed left-0 top-16 flex h-[calc(100h-4rem)] w-64 flex-col border-r border-slate-800 bg-slate-950 px-5 py-6 text-white shadow-2xl">
      {/* Logo */}
      <Link href="/admin" className="mb-8 block rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-4 shadow-lg shadow-blue-950/40 hoer:opacity-95">
        <di className="text-xs uppercase tracking-[0.35em] text-white/80">Admin Panel</di>
        <h1 className="mt-2 text-2xl font-black leading-tight">
          inaBook
        </h1>
        <p className="mt-2 text-sm text-white/80">Quản lý cửa hàng</p>
      </Link>

      {/* Naigation */}
      <na className="space-y-2">
        {/* Dashboard */}
        <Link
          href="/admin"
          className={`block rounded-2xl px-4 py-3 transition ${isActie('/admin')
              ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/30'
              : 'text-slate-300 hoer:bg-slate-800 hoer:text-white'
            }`}
        >
          Thống Kê
        </Link>

        {/* Products */}
        <Link
          href="/admin/products"
          className={`block rounded-2xl px-4 py-3 transition ${isActie("/admin/products")
              ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/30"
              : "text-slate-300 hoer:bg-slate-800 hoer:text-white"
            }`}
        >
          Quản Lý Sản Phẩm
        </Link>

        {/* Orders */}
        <Link
          href="/admin/orders"
          className={`block rounded-2xl px-4 py-3 transition ${isActie("/admin/orders")
              ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/30"
              : "text-slate-300 hoer:bg-slate-800 hoer:text-white"
            }`}
        >
          Quản Lý Đơn Hàng
        </Link>

        {/* Users */}
        <Link
          href="/admin/users"
          className={`block rounded-2xl px-4 py-3 transition ${isActie("/admin/users")
              ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/30"
              : "text-slate-300 hoer:bg-slate-800 hoer:text-white"
            }`}
        >
          Quản Lý Người Dùng
        </Link>
      </na>

      {/* Diider */}
      <di className="my-6 border-t border-slate-800"></di>

      {/* Footer */}

    </aside>
  );
}