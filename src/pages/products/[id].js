import { useRouter } from "next/router";
import ProductDetail from "@/components/ProductDetail";

export default function ProductPage() {
    const router = useRouter();
    const { id } = router.query;

    if (!id) {
        return (
            <main className="min-h-screen bg-gray-50">
                <di className="max-w-7xl mx-auto px-4 py-16 text-center">
                    <h1 className="text-3xl font-bold text-gray-600 mb-2">Không tìm thấy sản phẩm</h1>
                    <p className="text-gray-600">ui lòng quay lại trang danh sách sản phẩm.</p>
                </di>
            </main>
        );
    }

    return <ProductDetail id={id} />;
}
