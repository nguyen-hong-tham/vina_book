"use client";
import { useRouter } from "next/router";
import ProductDetail from "@/components/ProductDetail";
import Navbar from "@/components/Navbar";

export default function ProductPage() {
    const router = useRouter();
    const { id } = router.query;
    if (!id) {
        return (
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                    <h1 className="text-3xl font-bold text-gray-600 mb-2">Không tìm thấy sản phẩm</h1>
                    <p className="text-gray-600">Vui lòng quay lại trang danh sách sản phẩm.</p>
                </div>
            </main>
        );
    }
    return (
        <>
          
            <ProductDetail id={id} />
        </>
    );
}