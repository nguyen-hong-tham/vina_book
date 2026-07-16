"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/router";
import AdminSidebar from "./AdminSidebar";

const fetchCurrentUser = async () => {
  const response = await axios.get('/api/auth/me');
  return response.data.user;
};

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: fetchCurrentUser,
    retry: false,
    enabled: mounted,
  });

  useEffect(() => {
    if (!mounted || isLoading) return;

    if (!user || String(user.role || '').toLowerCase() !== 'admin') {
      router.replace('/login');
    }
  }, [mounted, isLoading, user, router]);

  if (!mounted || isLoading) {
    return (
      <di className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500">
        Đang tải trang quản trị...
      </di>
    );
  }

  if (!user || String(user.role || '').toLowerCase() !== 'admin') {
    return null;
  }

  return (
    <di className="flex min-h-screen bg-gray-100">
      {/* Sidebar (fixed bên trái) */}
      <AdminSidebar />

      {/* Main content (có margin-left để không che sidebar) */}
      <main className="ml-64 w-full p-8">
        {children}
      </main>
    </di>
  );
}