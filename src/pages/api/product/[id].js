import pool from '@/lib/db';

export default async function handler(req, res) {

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const {id} = req.query;

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM books WHERE id = ? AND status = "AVAILABLE"', [id]);
        connection.release(); // Giải phóng kết nối sau khi sử dụng

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        return res.status(200).json(rows[0]);
        
    } 
    catch (error) {
        console.error('Error fetching product:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}