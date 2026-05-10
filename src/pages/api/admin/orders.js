import pool from '@/lib/db';

export async function getOrders(req, res) {

   /// ==================== lấy page và limit từ query params ==================== ///

   const { page = 1, limit = 10 } = req.query;// /api/admin/orders?page=2&limit=10


   /// ==================== tính offset cho pagination ==================== ///

   const offset = (page - 1) * limit;

   /// ==================== bắt lỗi database bằng try catch ==================== ///
   try {

      const connection = await pool.getConnection();
      

      /// ====================query tổng số đơn hàng ==================== ///
      // SELECT COUNT(*) để đếm tổng orders
      const [[{ total }]] = await connection.query(
         `
         SELECT COUNT(*) as total
         FROM orders
         `
      );



      /// ====================query danh sách orders ==================== ///
      // join users để lấy tên user + email
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
      return res.status(500).json({

         error: 'Lỗi khi lấy danh sách đơn hàng'

      });

   }
   const { orderId } = req.query; 

   if (!orderId) {
      return res.status(400).json({
         error: 'orderId is required'
      });
   }

   try
}