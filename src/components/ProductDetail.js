"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { ShoppingCart } from "lucide-react";

const fetchProduct = async (id) => {
    const response = await axios.get(`/api/products/${id}`);
    return response.data;
}

export default function ProductDetail({ id }) {
    const { data: product, isLoading, isError, error } = useQuery({
        queryKey: ["product", id],
        queryFn: () => fetchProduct(id),
    });

    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                    <h1 className="text-3xl font-bold text-gray-600 mb-2">Đang tải...</h1>
                </div>
            </main>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Lỗi!</h2>
                    <p className="text-gray-600">{error?.message || "Không thể tải sản phẩm"}</p>
                    <Link href="/products" className="text-blue-600 hover:underline mt-4 inline-block">
                        Quay lại danh sách sản phẩm
                    </Link>
                </div>
            </div>
        );
    }

    if (!product) return null;

    const isOutOfStock = product.stock === 0 || product.status === "OUT_OF_STOCK";

    const handleAddToCart = () => {
        if (isOutOfStock) {
            alert("Sản phẩm này hiện đang hết hàng!");
            return;
        }

        (async () => {
            try {
                setAdding(true);
                await axios.post('/api/cart', { bookId: product.id, quantity });
                try { queryClient.invalidateQueries(['cart']); } catch (e) {}
                alert(`Đã thêm ${quantity} x ${product.title} vào giỏ hàng!`);
            } catch (err) {
                const status = err?.response?.status;
                if (status === 401) {
                    alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
                    router.push('/login');
                    return;
                }
                if (status === 403) {
                    alert(err.response?.data?.message || 'Bạn không có quyền thực hiện thao tác này');
                    return;
                }
                console.error('Add to cart error', err);
                alert(err?.response?.data?.message || 'Có lỗi khi thêm vào giỏ hàng');
            } finally {
                setAdding(false);
            }
        })();
    };



    // ================= UI =================

    return(

        // Container chính
        <main className="min-h-screen bg-gray-50">

            <div className="max-w-7xl mx-auto px-4 py-16">

                {/* Grid chia 2 cột */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* ================= ẢNH ================= */}
                    <div>

                        <img
                            // Nếu không có ảnh thì dùng placeholder
                            src={product.image_url || "/placeholder-book.png"}

                            alt={product.title}

                            className="w-full h-96 object-cover rounded-lg"
                        />

                    </div>



                    {/* ================= THÔNG TIN ================= */}
                    <div>

                        {/* Tên sách */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {product.title}
                        </h1>

                        {/* Tác giả */}
                        <p className="text-lg text-gray-600 mb-4">
                            Tác giả: {product.author}
                        </p>

                        {/* Mô tả ngắn */}
                        <p className="text-sm text-gray-500 mb-4">
                            {product.description}
                        </p>

                        {/* Giá */}
                        <p className="text-2xl font-bold text-blue-600 mb-4">

                            ₫{product.price.toLocaleString("vi-VN")}

                        </p>


                        {/* ================= TRẠNG THÁI KHO ================= */}

                        <div className="mb-6">

                            <p className={`text-lg font-semibold ${
                                isOutOfStock
                                    ? "text-red-600"
                                    : "text-green-600"
                            }`}>

                                {isOutOfStock
                                    ? " Hết hàng"
                                    : ` Còn ${product.stock} cuốn`}

                            </p>

                        </div>


                        {/* ================= CHỌN SỐ LƯỢNG ================= */}

                        <div className="flex items-center space-x-4 mb-6">

                            <label className="block text-sm font-medium text-gray-700">
                                Số lượng:
                            </label>
                            {/* Box quantity */}
                            <div className="text-black flex items-center border border-gray-300 rounded-lg">
                                {/* Nút giảm */}
                                <button

                                    // quantity không nhỏ hơn 1
                                    onClick={() =>
                                        setQuantity(
                                            Math.max(1, quantity - 1)
                                        )
                                    }

                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"

                                    disabled={isOutOfStock}
                                >
                                    −
                                </button>
                                {/* Input số lượng */}
                                <input

                                    type="number"
                                    value={quantity}
                                    onChange={(e) =>

                                        setQuantity(

                                            Math.max(
                                                1,
                                                parseInt(e.target.value) || 1
                                            )

                                        )
                                    }

                                    className="w-16 text-center border-l border-r border-gray-300 py-2"

                                    disabled={isOutOfStock}
                                />
                                {/* Nút tăng */}
                                <button

                                    onClick={() =>

                                        setQuantity(

                                            // Không vượt quá stock
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

                        </div>


                        {/* ================= NÚT GIỎ HÀNG ================= */}

                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock || adding}
                            className={`px-6 py-3 rounded-md font-medium text-white flex items-center gap-2 ${
                                isOutOfStock || adding
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {/* Icon */}
                            <ShoppingCart size={20} />

                            {/* Text */}
                            {isOutOfStock
                                ? "Hết hàng"
                                : adding
                                ? 'Đang thêm...'
                                : "Thêm vào giỏ"}

                        </button>

                    </div>
                </div>


                {/* ================= MÔ TẢ CHI TIẾT ================= */}

                {/* Chỉ hiện nếu có description */}
                {product.description && (

                    <div className="mt-12">

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Mô Tả Chi Tiết
                        </h2>

                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">

                            {product.description}

                        </p>

                    </div>

                )}

            </div>
        </main>
    );
}