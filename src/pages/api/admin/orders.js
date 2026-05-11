import pool from '@/lib/db';

export async function getOrders(req, res) {

   /// ==================== lấy page và limit từ query params ==================== ///
   const { page = 1, limit = 10 } = req.query;

   /// ==================== tính offset cho pagination ==================== ///
   const offset = (page - 1) * limit;

   try {

      const connection = await pool.getConnection();


      /// ==================== query tổng số đơn hàng ==================== ///
      const [[{ total }]] = await connection.query(
         `
         SELECT COUNT(*) as total
         FROM orders
         `
      );


      /// ==================== query danh sách orders ==================== ///
      const [orders] = await connection.query(
         `
         SELECT 
            o.*,
            u.name as user_name,
            u.email

         FROM orders o

         JOIN users u
         ON o.user_id = u.id

         ORDER BY o.created_at DESC

         LIMIT ? OFFSET ?
         `,

         [
            parseInt(limit),
            offset
         ]

      );
      connection.release();

      return res.status(200).json({

         data: orders,

         total,

         totalPages: Math.ceil(total / limit),

         page: parseInt(page)

      });

   } catch (error) {

      console.error(
         'Error fetching orders:',
         error
      );
      /// ==================== trả server error ==================== ///
      return res.status(500).json({

         error: 'Lỗi khi lấy danh sách đơn hàng'

      });

   }

}

export async function getOrderDetail(req, res) {
   const { orderId } = req.query;

   /// ==================== kiểm tra orderId ==================== ///
   if (!orderId) {

      return res.status(400).json({

         error: 'orderId is required'

      });

   }

   try {

      const connection = await pool.getConnection();
      /// ==================== query thông tin order ==================== ///
      const [[order]] = await connection.query(

         `
         SELECT 
            o.*,
            u.name as user_name,
            u.email

         FROM orders o

         JOIN users u
         ON o.user_id = u.id

         WHERE o.id = ?
         `,

         [orderId]

      );

      /// ==================== query danh sách sản phẩm trong order ==================== ///
      const [orderDetails] = await connection.query(

         `
         SELECT 
            od.*,
            b.title,
            b.image_url

         FROM order_details od

         JOIN books b
         ON od.book_id = b.id

         WHERE od.order_id = ?
         `,

         [orderId]

      );
      connection.release();

      return res.status(200).json({

         order,

         details: orderDetails

      });

   } catch (error) {
      console.error(
         'Error fetching order details:',
         error
      );
      return res.status(500).json({

         error: 'Lỗi khi lấy chi tiết đơn hàng'

      });

   }

}

export async function updateOrderStatus(req, res) {
   /// ==================== lấy orderId và status từ body ==================== ///
   const { orderId, status } = req.body;
   /// ==================== tạo danh sách status hợp lệ ==================== ///
   const validStatuses = [

      'PENDING',

      'ACCEPT',

      'REJECT',

      'DONE'

   ];
   /// ==================== kiểm tra status hợp lệ ==================== ///
   if (!validStatuses.includes(status)) {

      return res.status(400).json({

         error: 'Trạng thái không hợp lệ'

      });

   }
   try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
         `
         UPDATE orders
         SET status = ?
         WHERE id = ?
         `,

         [
            status,
            orderId
         ]

      );
      connection.release();

      if (result.affectedRows === 0) {

         return res.status(404).json({

            error: 'Không tìm thấy đơn hàng'

         });

      }
      return res.status(200).json({

         message: 'Cập nhật trạng thái thành công',

         orderId,

         newStatus: status

      });

   } catch (error) {
      console.error(
         'Error updating order status:',
         error
      );
      return res.status(500).json({

         error: 'Lỗi khi cập nhật trạng thái'

      });

   }

}

/// ==================== route handler ==================== ///
export default async function handler(req, res) {

   /// ==================== GET ==================== ///
   if (req.method === 'GET') {

      /// ==================== GET ORDER DETAIL ==================== ///
      if (req.query.orderId) {

         return getOrderDetail(req, res);

      }

      /// ==================== GET ALL ORDERS ==================== ///
      return getOrders(req, res);

   }

   /// ==================== PUT UPDATE STATUS ==================== ///
   if (req.method === 'PUT') {

      return updateOrderStatus(req, res);

   }

   return res.status(405).json({

      error: 'Method not allowed'

   });

}