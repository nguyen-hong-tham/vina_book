"use client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchCate = async () => {
  const response = await axios.get("/api/category"); 
  return response.data;
};

export default function Category() {
  const router = useRouter();
  const { categoryId } = router.query;

  const {
    data: cates = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["category"],
    queryFn: fetchCate,
  });

  if (isLoading) return <div className="text-gray-500 italic p-4">Đang tải danh mục...</div>;
  
  if (error) return <div className="text-red-500 p-4">Lỗi tải dữ liệu!</div>;

  return (
    <ul className="space-y-2 mt-2">
      <li>
        <Link
          href="/products"
          className={`block p-2 rounded-md transition ${
            !categoryId ? 'bg-blue-100 text-blue-700 font-bold' : 'text-black hover:bg-gray-50'
          }`}
        >
          Tất cả sách
        </Link>
      </li>
      
      {/* Vòng lặp in ra từng danh mục */}
      {cates.map((cat) => (
        <li key={cat.id}>
          <Link
            href={`/products?categoryId=${cat.id}`}
            className={`block p-2 rounded-md transition ${
              categoryId == cat.id ? 'bg-blue-100 text-blue-700 font-bold' : 'text-black hover:bg-gray-50'
            }`}
          >
            {cat.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}