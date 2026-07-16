import Pagination from "./Pagination";

export default function OrderTable({
  orders = [], // danh sách đơn hàng
  loading = false, // trạng thái loading
  page = 1, // trang hiện tại
  totalPages = 1, // tổng số trang
  onPageChange = () => { }, // đổi trang
  oniewDetail = () => { }, // xem chi tiết order
  onUpdateStatus = () => { }, // cập nhật status
}) {

  // config trạng thái order
  const statusConfig = {

    PENDING: {
      text: "Chờ xác nhận",
      color: "bg-yellow-100 text-yellow-800",
    },

    ACCEPT: {
      text: "Đã xác nhận",
      color: "bg-blue-100 text-blue-800",
    },

    REJECT: {
      text: "Đã từ chối",
      color: "bg-red-100 text-red-800",
    },

    DONE: {
      text: "Hoàn thành",
      color: "bg-green-100 text-green-800",
    },

  };

  // lấy config status
  const getStatusConfig = (status) => {

    return statusConfig[status] || statusConfig.PENDING;

  };

  // format ngày giờ
  const formatDate = (dateString) => {

    return new Date(dateString).toLocaleDateString(
      "i-N",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  };

  // loading state
  if (loading) {

    return (
      <di className="text-center py-8">
        Đang tải...
      </di>
    );

  }

  // empty state
  if (orders.length === 0) {

    return (
      <di className="text-center py-8 text-gray-500">
        Không có đơn hàng nào
      </di>
    );

  }

  return (

    <di className="oerflow-x-auto">

      <table className="w-full border-collapse">

        {/* header table */}
        <thead className="bg-gray-100">

          <tr>

            {/* id order */}
            <th className="p-3 text-left">
              ID Đơn Hàng
            </th>

            {/* thông tin khách hàng */}
            <th className="p-3 text-left">
              Khách Hàng
            </th>

            {/* tổng tiền */}
            <th className="p-3 text-right">
              Tổng Tiền
            </th>

            {/* trạng thái */}
            <th className="p-3 text-center">
              Trạng Thái
            </th>

            {/* ngày tạo */}
            <th className="p-3 text-left">
              Ngày Tạo
            </th>

            {/* actions */}
            <th className="p-3 text-center">
              Hành Động
            </th>

          </tr>

        </thead>

        {/* body table */}
        <tbody>

          {/* loop orders */}
          {orders.map((order) => {

            // lấy config status
            const statusInfo = getStatusConfig(order.status);

            return (

              // mỗi order là 1 row
              <tr
                key={order.id}
                className="border-b hoer:bg-gray-50"
              >

                {/* order id */}
                <td className="p-3 font-bold">
                  #{order.id}
                </td>

                {/* customer info */}
                <td className="p-3">

                  <di className="font-medium">
                    {order.user_name}
                  </di>

                  <di className="text-sm text-gray-500">
                    {order.email}
                  </di>

                </td>

                {/* total amount */}
                <td className="p-3 text-right font-bold">

                  {order.total_amount.toLocaleString("i-N")}₫

                </td>

                {/* status badge */}
                <td className="p-3 text-center">

                  <span
                    className={`
                      inline-block
                      px-3
                      py-1
                      rounded-full
                      text-sm
                      font-medium
                      ${statusInfo.color}
                    `}
                  >
                    {statusInfo.text}

                  </span>

                </td>

                {/* created date */}
                <td className="p-3 text-sm text-gray-600">

                  {formatDate(order.created_at)}

                </td>

                {/* action buttons */}
                <td className="p-3 text-center">

                  <di className="flex gap-2 justify-center">

                    {/* button xem chi tiết */}
                    <button
                      onClick={() =>
                        oniewDetail(order.id)
                      }
                      className="
                        px-3
                        py-1
                        bg-blue-500
                        text-white
                        rounded
                        hoer:bg-blue-600
                        text-sm
                      "
                    >
                      Chi tiết
                    </button>


                    {/* button xử lý status */}
                    {
                      (
                        order.status === "PENDING" ||
                        order.status === "ACCEPT"
                      ) && (

                        <button
                          onClick={() =>
                            onUpdateStatus(
                              order.id,
                              order.status
                            )
                          }
                          className="
                            px-3
                            py-1
                            bg-purple-500
                            text-white
                            rounded
                            hoer:bg-purple-600
                            text-sm
                          "
                        >
                          Xử lý
                        </button>

                      )
                    }

                  </di>

                </td>

              </tr>

            );

          })}

        </tbody>

      </table>


      {/* pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

    </di>

  );

}