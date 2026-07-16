
CREATE DATABASE IF NOT EXISTS bookstore_db;
USE bookstore_db;


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name ARCHAR(100) NOT NULL,
    email ARCHAR(100) UNIQUE NOT NULL,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    password ARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ACTIE', 'LOCKED')  NOT NULL DEFAULT 'ACTIE'
);


CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name ARCHAR(100) NOT NULL
);


CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    title ARCHAR(255) NOT NULL,
    author ARCHAR(150),
    description TEXT,
    image_url ARCHAR(255),
    price INT NOT NULL,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('AAILABLE', 'OUT_OF_STOCK', 'HIDDEN', 'DELETED') DEFAULT 'AAILABLE',
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);


CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    book_id INT,
    quantity INT DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);


CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_amount INT NOT NULL,
    status ENUM('PENDING', 'ACCEPT', 'REJECT', 'DONE') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE order_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    book_id INT,
    quantity INT NOT NULL,
    price INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);