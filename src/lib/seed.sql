USE bookstore_db;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE order_details;
TRUNCATE TABLE orders;
TRUNCATE TABLE cart;
TRUNCATE TABLE books;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- USERS DATA (10)
-- =====================================================

INSERT INTO users (name, email, role, password)
VALUES
('Admin', 'admin@gmail.com', 'ADMIN', '123456'),
('Tham', 'tham@gmail.com', 'USER', '123456'),
('An', 'an@gmail.com', 'USER', '123456'),
('Khoa', 'khoa@gmail.com', 'USER', '123456'),
('Long', 'long@gmail.com', 'USER', '123456'),
('Vy', 'vy@gmail.com', 'USER', '123456'),
('Trang', 'trang@gmail.com', 'USER', '123456'),
('Minh', 'minh@gmail.com', 'USER', '123456'),
('Dat', 'dat@gmail.com', 'USER', '123456'),
('Hieu', 'hieu@gmail.com', 'USER', '123456');

-- =====================================================
-- CATEGORIES DATA (7)
-- =====================================================

INSERT INTO categories (name)
VALUES
('Novel'),
('Science'),
('Programming'),
('History'),
('Manga'),
('Business'),
('Psychology');

-- =====================================================
-- BOOKS DATA (30)
-- =====================================================

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

(1,'The Great Gatsby','F. Scott Fitzgerald','Classic novel','https://picsum.photos/200?1',120000,10,'AVAILABLE'),
(1,'1984','George Orwell','Dystopian novel','https://picsum.photos/200?2',130000,5,'AVAILABLE'),
(1,'To Kill a Mockingbird','Harper Lee','Classic literature','https://picsum.photos/200?3',140000,0,'OUT_OF_STOCK'),
(1,'Pride and Prejudice','Jane Austen','Romance novel','https://picsum.photos/200?4',125000,7,'AVAILABLE'),

(2,'Brief Answers to the Big Questions','Stephen Hawking','Science universe','https://picsum.photos/200?5',180000,8,'AVAILABLE'),
(2,'Physics of Time','Albert Newton','Physics concepts','https://picsum.photos/200?6',220000,0,'OUT_OF_STOCK'),
(2,'Quantum Mechanics','Max Planck','Quantum science','https://picsum.photos/200?7',250000,4,'AVAILABLE'),
(2,'Astronomy Basics','Carl Sagan','Space science','https://picsum.photos/200?8',190000,3,'HIDDEN'),

(3,'Clean Code','Robert C. Martin','Programming practices','https://picsum.photos/200?9',250000,5,'AVAILABLE'),
(3,'JavaScript Basics','John Doe','Learn JavaScript','https://picsum.photos/200?10',150000,0,'OUT_OF_STOCK'),
(3,'React Mastery','Meta Dev','Advanced React','https://picsum.photos/200?11',270000,2,'AVAILABLE'),
(3,'NodeJS Backend','Backend Team','NodeJS API','https://picsum.photos/200?12',230000,9,'AVAILABLE'),
(3,'Python Crash Course','Eric Matthes','Learn Python','https://picsum.photos/200?13',240000,6,'HIDDEN'),

(4,'World War II','Winston Churchill','History book','https://picsum.photos/200?14',200000,2,'AVAILABLE'),
(4,'Ancient Rome','Marcus Aurelius','Roman history','https://picsum.photos/200?15',175000,0,'OUT_OF_STOCK'),
(4,'Vietnam History','Tran Trong Kim','Vietnam history','https://picsum.photos/200?16',185000,4,'AVAILABLE'),
(4,'Greek Mythology','Homer','Greek myths','https://picsum.photos/200?17',195000,1,'AVAILABLE'),

(5,'Doraemon','Fujiko F Fujio','Famous manga','https://picsum.photos/200?18',50000,20,'AVAILABLE'),
(5,'Naruto Vol 1','Masashi Kishimoto','Naruto manga','https://picsum.photos/200?19',60000,15,'AVAILABLE'),
(5,'One Piece Vol 1','Eiichiro Oda','Pirate manga','https://picsum.photos/200?20',65000,12,'AVAILABLE'),
(5,'Attack on Titan','Hajime Isayama','Titan manga','https://picsum.photos/200?21',70000,0,'OUT_OF_STOCK'),

(6,'Rich Dad Poor Dad','Robert Kiyosaki','Business mindset','https://picsum.photos/200?22',175000,7,'HIDDEN'),
(6,'The Lean Startup','Eric Ries','Startup guide','https://picsum.photos/200?23',260000,3,'AVAILABLE'),
(6,'Zero To One','Peter Thiel','Startup ideas','https://picsum.photos/200?24',240000,5,'AVAILABLE'),
(6,'Business Strategy','Michael Porter','Business model','https://picsum.photos/200?25',280000,2,'AVAILABLE'),

(7,'Atomic Habits','James Clear','Habit psychology','https://picsum.photos/200?26',220000,8,'AVAILABLE'),
(7,'Think Fast and Slow','Daniel Kahneman','Psychology thinking','https://picsum.photos/200?27',210000,6,'AVAILABLE'),
(7,'Deep Work','Cal Newport','Focus productivity','https://picsum.photos/200?28',190000,0,'OUT_OF_STOCK'),
(7,'The Power of Habit','Charles Duhigg','Habit building','https://picsum.photos/200?29',205000,4,'AVAILABLE'),

(1,'Deleted Test Book','Unknown','Deleted book','https://picsum.photos/200?30',100000,1,'DELETED');

-- =====================================================
-- CART DATA
-- =====================================================

INSERT INTO cart (user_id, book_id, quantity)
VALUES
(1,1,2),
(2,5,1),
(3,9,1),
(4,18,3),
(5,22,1),
(6,26,2),
(7,11,1),
(8,14,2),
(9,20,1),
(10,27,1);

-- =====================================================
-- ORDERS DATA (15)
-- =====================================================

INSERT INTO orders (user_id, total_amount, status)
VALUES
(1,490000,'PENDING'),
(2,150000,'DONE'),
(3,320000,'ACCEPT'),
(4,180000,'REJECT'),
(5,450000,'DONE'),
(6,230000,'PENDING'),
(7,600000,'ACCEPT'),
(8,90000,'DONE'),
(9,700000,'PENDING'),
(10,120000,'DONE'),
(1,250000,'ACCEPT'),
(2,340000,'DONE'),
(3,410000,'PENDING'),
(4,175000,'REJECT'),
(5,530000,'DONE');

-- =====================================================
-- ORDER DETAILS DATA
-- =====================================================

INSERT INTO order_details (
    order_id,
    book_id,
    quantity,
    price
)
VALUES

(1,1,2,120000),
(1,9,1,250000),

(2,18,3,50000),

(3,5,1,180000),
(3,10,1,140000),

(4,14,1,180000),

(5,23,2,225000),

(6,12,1,230000),

(7,9,2,250000),
(7,26,1,100000),

(8,20,1,90000),

(9,11,2,270000),
(9,24,1,160000),

(10,18,2,60000),

(11,3,1,250000),

(12,22,2,170000),

(13,27,2,205000),

(14,15,1,175000),

(15,23,2,265000);