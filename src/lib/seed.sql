USE bookstore_db;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE order_details;
TRUNCATE TABLE orders;
TRUNCATE TABLE cart;
TRUNCATE TABLE books;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================
-- USERS
-- =========================
INSERT INTO users (name, email, password)
VALUES
('Tham', 'tham@gmail.com', '123456'),
('An', 'an@gmail.com', '123456'),
('Khoa', 'khoa@gmail.com', '123456');

-- =========================
-- CATEGORIES
-- =========================
INSERT INTO categories (name)
VALUES
('Novel'),
('Science'),
('Programming'),
('History'),
('Manga');

-- =========================
-- BOOKS
-- =========================
INSERT INTO books (
    category_id,
    title,
    author,
    description,
    image_url,
    price,
    stock,
    status
)
VALUES
(
    1,
    'The Great Gatsby',
    'F. Scott Fitzgerald',
    'Classic American novel',
    'https://picsum.photos/200?1',
    120000,
    10,
    'AVAILABLE'
),
(
    2,
    'Brief Answers to the Big Questions',
    'Stephen Hawking',
    'Science and universe',
    'https://picsum.photos/200?2',
    180000,
    7,
    'AVAILABLE'
),
(
    3,
    'Clean Code',
    'Robert C. Martin',
    'Programming best practices',
    'https://picsum.photos/200?3',
    250000,
    5,
    'AVAILABLE'
),
(
    3,
    'JavaScript Basics',
    'John Doe',
    'Learn JavaScript',
    'https://picsum.photos/200?4',
    150000,
    8,
    'AVAILABLE'
),
(
    5,
    'Doraemon',
    'Fujiko F Fujio',
    'Famous manga series',
    'https://picsum.photos/200?5',
    50000,
    20,
    'AVAILABLE'
),
(
    4,
    'World War II',
    'Winston Churchill',
    'History book',
    'https://picsum.photos/200?6',
    200000,
    4,
    'AVAILABLE'
);

-- =========================
-- CART
-- =========================
INSERT INTO cart (user_id, book_id, quantity)
VALUES
(1, 1, 2),
(1, 3, 1),
(2, 5, 3);

-- =========================
-- ORDERS
-- =========================
INSERT INTO orders (
    user_id,
    total_amount,
    status
)
VALUES
(1, 490000, 'PENDING'),
(2, 150000, 'DONE');

-- =========================
-- ORDER DETAILS
-- =========================
INSERT INTO order_details (
    order_id,
    book_id,
    quantity,
    price
)
VALUES
(1, 1, 2, 120000),
(1, 3, 1, 250000),
(2, 5, 3, 50000);