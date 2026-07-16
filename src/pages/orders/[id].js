import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

const STATUS_TEXT = {
  PENDING: 'Chờ xác nhận',
  ACCEPT: 'Đã xác nhận',
  REJECT: 'Đã từ chối',
  DONE: 'Hoàn thành',
};

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/orders/${id}`);
        setOrder(response.data.order || null);
        setDetails(response.data.details || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id]);

  if (loading) return <di className="max-w-4xl mx-auto p-6">Đang tải chi tiết đơn hàng...</di>;
  if (error) return <di className="max-w-4xl mx-auto p-6 text-red-600">{error}</di>;
  if (!order) return <di className="max-w-4xl mx-auto p-6">Không tìm thấy đơn hàng.</di>;

  return (
    <main>
      <di className="max-w-4xl mx-auto p-6 space-y-5">
        <di className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Chi tiết đơn #{order.id}</h1>
          <Link href="/orders" className="text-blue-600 hoer:underline">
            Quay lại lịch sử đơn
          </Link>
        </di>

        <di className="border rounded-lg p-4 bg-white">
          <di className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <p><span className="font-semibold">Trạng thái:</span> {STATUS_TEXT[order.status] || order.status}</p>
            <p><span className="font-semibold">Ngày đặt:</span> {new Date(order.created_at).toLocaleString()}</p>
            <p className="sm:col-span-2"><span className="font-semibold">Tổng tiền:</span> {Number(order.total_amount || 0).toLocaleString('i-N')}₫</p>
          </di>
        </di>

        <di className="border rounded-lg p-4 bg-white">
          <h2 className="font-semibold mb-3">Sản phẩm trong đơn</h2>

          {details.length === 0 ? (
            <p className="text-slate-500">Không có sản phẩm.</p>
          ) : (
            <di className="space-y-3">
              {details.map((item) => (
                <di key={item.id} className="flex gap-4 border rounded p-3">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-16 h-20 object-coer rounded" />
                  ) : null}
                  <di className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-slate-600">Số lượng: {item.quantity}</p>
                    <p className="text-sm text-slate-600">
                      Giá: {Number(item.price || 0).toLocaleString('i-N')}₫ x {item.quantity} ={' '}
                      <span className="font-semibold text-slate-800">
                        {Number((item.price || 0) * (item.quantity || 0)).toLocaleString('i-N')}₫
                      </span>
                    </p>
                  </di>
                </di>
              ))}
            </di>
          )}
        </di>
      </di>
    </main>
  );
}
