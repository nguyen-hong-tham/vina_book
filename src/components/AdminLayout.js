"use client";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (fixed bên trái) */}
      <AdminSidebar />

      {/* Main content (có margin-left để không che sidebar) */}
      <main className="ml-64 w-full p-8">
        {children}
      </main>
    </div>
  );
}