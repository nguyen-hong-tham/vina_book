// Đây là API endpoint xử lý tất cả CRUD operations. File này sẽ có:
// - GET - Lấy danh sách sản phẩm (with search & pagination)
// - POST - Tạo sản phẩm mới
// - PUT - Cập nhật sản phẩm
// - PATCH - Thay đổi status

import pool from '@/lib/db';

// req chứa request từ frontend gửi lên
// res dùng để trả response về frontend
export default async function handler(req, res) {

    const { id } = req.query; // lấy id từ URL query

    const connection = await pool.getConnection();//// lấy connection từ mysql pool

    try {

        //=================== GET ALL / GET BY ID ===================//

        if (req.method === 'GET') {

            //================GET BY ID=================//
            if (id) {

                // status != DELETED để không lấy sản phẩm đã xóa mềm
                const [rows] = await connection.query(
                    `SELECT *
                     FROM books 
                     WHERE id = ? AND status != 'DELETED'`,
                    [id]
                );

                connection.release();

                if (rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Product not found'
                    });
                }

                return res.status(200).json({
                    success: true,
                    data: rows[0]
                });

            }

            ////================GET ALL=================//
            else {

                 // pagination + search
                const { page = 1, limit = 10, search = '' } = req.query;

                // tính vị trí bắt đầu lấy dữ liệu
                const offset = (parseInt(page) - 1) * parseInt(limit);

                // tạo keyword search
                const searchParam = `%${search}%`;
                const [rows] = await connection.query(
                    `SELECT *
                     FROM books 
                     WHERE status != 'DELETED' AND title LIKE ?
                     ORDER BY created_at DESC
                     LIMIT ? OFFSET ?`,
                    [searchParam, parseInt(limit), offset]
                );

                // Lấy total count
                const [countResult] = await connection.query(
                    `SELECT COUNT(*) as total FROM books 
                     WHERE status != 'DELETED' AND title LIKE ?`,
                    [searchParam]
                );

                connection.release();

                const total = countResult[0].total;
                const totalPages = Math.ceil(total / parseInt(limit));

                return res.status(200).json({
                    success: true,
                    data: rows,
                    total: total,
                    page: parseInt(page),
                    totalPages: totalPages
                });
            }
        }
        ///=================== CREATE  ===================//
        if (req.method === 'POST') {

            // lấy dữ liệu từ frontend gửi lên 
            const {
                title,
                author,
                description,
                image_url,
                price,
                stock,
                category_id
            } = req.body;


            // ---------------validation required fields-------------------
            if (!title || !author || !description || price === undefined || stock === undefined || !category_id || !image_url) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields'
                });
            }

            if (isNaN(price) || isNaN(stock)) // price và stock phải là số ?
            {
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'Price and stock must be number'
                });

            }

            if (price < 1000 || stock < 0) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'Price must be >= 1000, Stock must be >= 0'
                });
            }

            const [result] = await connection.query(
                `INSERT INTO books 
                (title, author, description, image_url, price, stock, category_id,status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    title,
                    author,
                    description,
                    image_url,
                    price,
                    stock,
                    category_id,
                    'AVAILABLE'
                ]
            );

            connection.release();

            // trả về id product mới tạo để frontend có thể redirect sang trang chi tiết hoặc edit
            return res.status(201).json({
                success: true,
                data: result.insertId,
                message: 'Product created successfully'
            });
        }


        ///=================== UPDATE  ===================//
        if (req.method === 'PUT') {

            // Kiểm tra id từ query params
            if (!id || isNaN(id)) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    error: 'Invalid product ID'
                });
            }

            const {
                title,
                author,
                description,
                image_url,
                price,
                stock,
                category_id
            } = req.body;


            // kiểm tra các trường bắt buộc
            if (!title || !author || !description || price === undefined || stock === undefined || !category_id || !image_url) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });

            }

            // price và stock phải là số ?
            if (isNaN(price) || isNaN(stock)) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'Price and stock must be number'
                });

            }

            if (price < 1000 || stock < 0) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'Price must be >= 1000, Stock must be >= 0'
                });
            }

            //--------------------- kiểm tra product tồn tại chưa trước khi update ---------------------    
            const [exitingProduct] = await connection.query(
                `SELECT id
                 FROM books
                 WHERE id = ? AND status != 'DELETED'`,
                [id]
            );

            // nếu không tìm thấy product hoặc product đã bị xóa mềm thì trả về lỗi 404
            if (exitingProduct.length === 0) {
                connection.release();
                return res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
            }

            const [result] = await connection.query(
                `UPDATE books 
                 SET title = ?, author = ?, description = ?, image_url = ?, 
                     price = ?, stock = ?, category_id = ? 
                 WHERE id = ?`,
                [
                    title,
                    author,
                    description,
                    image_url,
                    price,
                    stock,
                    category_id,
                    id
                ]
            );

            connection.release();

            return res.status(200).json({
                success: true,
                message: 'Product updated successfully'
            });
        }
        ///=================== CHANGE STATUS  ===================//
        if (req.method === 'PATCH') {

            // Kiểm tra id từ query params
            if (!id || isNaN(id)) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    error: 'Invalid product ID'
                });
            }
            
            // ============lấy status từ body
            const { status } = req.body;

            // ===========danh sách status hợp lệ
            const validStatuses = ['AVAILABLE', 'OUT_OF_STOCK', 'HIDDEN'];

            // ============check status hợp lệ
            if (!validStatuses.includes(status)) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be one of: AVAILABLE, OUT_OF_STOCK, HIDDEN'
                });
            }

            // ===========================kiểm tra product tồn tại
            const [exitingProduct] = await connection.query(
                `SELECT id
                 FROM books
                 WHERE id = ? AND status != 'DELETED'`,
                [id]
            );

            if (exitingProduct.length === 0) {
                connection.release();
                return res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
            }
            

            const [result] = await connection.query(
                `UPDATE books 
                 SET status = ? 
                 WHERE id = ?`,
                [
                    status,
                    id
                ]
            );

            connection.release();

            return res.status(200).json({
                success: true,
                message: `Product status updated to ${status}`
            });
        }
        //==========================DELETE==================//
        if (req.method === 'DELETE') {

            // Kiểm tra id từ query params
            if (!id || isNaN(id)) {
                connection.release();
                return res.status(400).json({
                    success: false,
                    error: 'Invalid product ID'
                });
            }

            const [exitingProduct] = await connection.query(
                `SELECT id
                 FROM books
                 WHERE id = ? AND status != 'DELETED'`,
                [id]
            );

            if (exitingProduct.length === 0) {
                connection.release();
                return res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
            }

            const [result] = await connection.query(
                `UPDATE books 
                 SET status = 'DELETED' 
                 WHERE id = ?`,
                [id]
            );

            connection.release();

            return res.status(200).json({
                success: true,
                message: 'Product deleted successfully (soft delete)'
            });
        }


        connection.release();
        return res.status(405).json({ success: false, error: 'Method not allowed' });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: 'Server error'
        });

    } finally {

        connection.release();

    }
}

