import mysql from "mysql2/promise";
//Tạo một pool (nhóm) kết nối để tái sử dụng
const pool = mysql.createPool({
  host: process.env.DB_HOST, //Địa chỉ server MySQL
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;