import pool from '@/lib/db';

export default async function handler(req, res) {

    // Chỉ cho phép GET
    if (req.method !== 'GET') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    // Lấy id từ query
    const { id } = req.query;

    // Validate id
    if (!id || isNaN(id)) {
        return res.status(400).json({
            error: 'Invalid product ID'
        });
    }

    let connection;

    try {

        // Kết nối database
        connection = await pool.getConnection();

        // Query product + category
        // Chỉ lấy sách AVAILABLE hoặc OUT_OF_STOCK (không lấy HIDDEN hoặc DELETED)
        const [rows] = await connection.query(
            `
            SELECT 
                b.*,
                c.name AS category_name
            FROM books b
            LEFT JOIN categories c
                ON b.category_id = c.id
            WHERE b.id = ? AND b.status IN ('AVAILABLE', 'OUT_OF_STOCK')
            `,
            [id]
        );

        // Không tìm thấy sản phẩm
        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Product not found'
            });
        }

        // Trả về product
        return res.status(200).json(rows[0]);

    } catch (error) {

        console.error('Error fetching product:', error);

        return res.status(500).json({
            error: 'Internal server error'
        });

    } finally {

        // Luôn release connection
        if (connection) {
            connection.release();
        }

    }
}