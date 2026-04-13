-- =====================================================
-- ПОЛНЫЙ SQL СКРИПТ СОЗДАНИЯ БАЗЫ ДАННЫХ ДЛЯ MYSQL
-- Система аренды вещей RentSpace/OddRent
-- =====================================================

-- Создание базы данных
CREATE DATABASE IF NOT EXISTS rentspace_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE rentspace_db;

-- =====================================================
-- 1. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ (auth_user)
-- =====================================================
CREATE TABLE IF NOT EXISTS auth_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login DATETIME NULL,
    is_superuser TINYINT(1) NOT NULL DEFAULT 0,
    username VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(150) NOT NULL DEFAULT '',
    last_name VARCHAR(150) NOT NULL DEFAULT '',
    email VARCHAR(254) NOT NULL DEFAULT '',
    is_staff TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    date_joined DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_auth_user_username (username),
    INDEX idx_auth_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. ТАБЛИЦА ПРОФИЛЕЙ ПОЛЬЗОВАТЕЛЕЙ (catalog_profile)
-- =====================================================
CREATE TABLE IF NOT EXISTS catalog_profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL DEFAULT '',
    avatar VARCHAR(100) NULL,
    role ENUM('renter', 'owner') NOT NULL DEFAULT 'renter',
    rating DECIMAL(3,2) NOT NULL DEFAULT 5.0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE,
    INDEX idx_catalog_profile_user_id (user_id),
    INDEX idx_catalog_profile_role (role),
    INDEX idx_catalog_profile_rating (rating),
    CHECK (rating >= 1.0 AND rating <= 5.0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. ТАБЛИЦА КАТЕГОРИЙ (catalog_category)
-- =====================================================
CREATE TABLE IF NOT EXISTS catalog_category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    parent_id INT NULL,
    icon VARCHAR(10) NOT NULL DEFAULT '',
    FOREIGN KEY (parent_id) REFERENCES catalog_category(id) ON DELETE CASCADE,
    INDEX idx_catalog_category_parent_id (parent_id),
    INDEX idx_catalog_category_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. ТАБЛИЦА ТОВАРОВ (catalog_item)
-- =====================================================
CREATE TABLE IF NOT EXISTS catalog_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    deposit DECIMAL(10,2) NOT NULL DEFAULT 0,
    category_id INT NOT NULL,
    subcategory_id INT NULL,
    owner_id INT NOT NULL,
    status ENUM('available', 'rented', 'maintenance') NOT NULL DEFAULT 'available',
    image VARCHAR(100) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES catalog_category(id) ON DELETE CASCADE,
    FOREIGN KEY (subcategory_id) REFERENCES catalog_category(id) ON DELETE SET NULL,
    FOREIGN KEY (owner_id) REFERENCES auth_user(id) ON DELETE CASCADE,
    INDEX idx_catalog_item_category_id (category_id),
    INDEX idx_catalog_item_subcategory_id (subcategory_id),
    INDEX idx_catalog_item_owner_id (owner_id),
    INDEX idx_catalog_item_status (status),
    INDEX idx_catalog_item_created_at (created_at),
    CHECK (price_per_day >= 0),
    CHECK (deposit >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. ТАБЛИЦА АРЕНД (catalog_rental)
-- =====================================================
CREATE TABLE IF NOT EXISTS catalog_rental (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    renter_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES catalog_item(id) ON DELETE CASCADE,
    FOREIGN KEY (renter_id) REFERENCES auth_user(id) ON DELETE CASCADE,
    INDEX idx_catalog_rental_item_id (item_id),
    INDEX idx_catalog_rental_renter_id (renter_id),
    INDEX idx_catalog_rental_status (status),
    INDEX idx_catalog_rental_start_date (start_date),
    INDEX idx_catalog_rental_created_at (created_at),
    CHECK (total_price >= 0),
    CHECK (end_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. ТАБЛИЦА СООБЩЕНИЙ (catalog_message)
-- =====================================================
CREATE TABLE IF NOT EXISTS catalog_message (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    recipient_id INT NOT NULL,
    content TEXT NOT NULL,
    image VARCHAR(100) NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES auth_user(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES auth_user(id) ON DELETE CASCADE,
    INDEX idx_catalog_message_sender_id (sender_id),
    INDEX idx_catalog_message_recipient_id (recipient_id),
    INDEX idx_catalog_message_is_read (is_read),
    INDEX idx_catalog_message_created_at (created_at),
    CHECK (sender_id != recipient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. ТАБЛИЦА УВЕДОМЛЕНИЙ (catalog_notification)
-- =====================================================
CREATE TABLE IF NOT EXISTS catalog_notification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_type ENUM('rental_request', 'rental_confirmed', 'rental_cancelled', 'message', 'rental_completed') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    related_item_id INT NULL,
    related_rental_id INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE,
    FOREIGN KEY (related_item_id) REFERENCES catalog_item(id) ON DELETE CASCADE,
    FOREIGN KEY (related_rental_id) REFERENCES catalog_rental(id) ON DELETE CASCADE,
    INDEX idx_catalog_notification_user_id (user_id),
    INDEX idx_catalog_notification_is_read (is_read),
    INDEX idx_catalog_notification_created_at (created_at),
    INDEX idx_catalog_notification_type (notification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. ТАБЛИЦА ОТЗЫВОВ (catalog_review)
-- =====================================================
CREATE TABLE IF NOT EXISTS catalog_review (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reviewer_id INT NOT NULL,
    reviewed_user_id INT NOT NULL,
    item_id INT NULL,
    rental_id INT NULL,
    rating INT NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_id) REFERENCES auth_user(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_user_id) REFERENCES auth_user(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES catalog_item(id) ON DELETE CASCADE,
    FOREIGN KEY (rental_id) REFERENCES catalog_rental(id) ON DELETE CASCADE,
    INDEX idx_catalog_review_reviewer_id (reviewer_id),
    INDEX idx_catalog_review_reviewed_user_id (reviewed_user_id),
    INDEX idx_catalog_review_item_id (item_id),
    INDEX idx_catalog_review_rental_id (rental_id),
    INDEX idx_catalog_review_rating (rating),
    INDEX idx_catalog_review_created_at (created_at),
    UNIQUE KEY unique_reviewer_rental (reviewer_id, rental_id),
    CHECK (rating >= 1 AND rating <= 5),
    CHECK (reviewer_id != reviewed_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. ТАБЛИЦА ИЗБРАННОГО (catalog_favorite)
-- =====================================================
CREATE TABLE IF NOT EXISTS catalog_favorite (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES catalog_item(id) ON DELETE CASCADE,
    INDEX idx_catalog_favorite_user_id (user_id),
    INDEX idx_catalog_favorite_item_id (item_id),
    INDEX idx_catalog_favorite_created_at (created_at),
    UNIQUE KEY unique_user_item (user_id, item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ЗАПОЛНЕНИЕ БАЗЫ ДАННЫХ ТЕСТОВЫМИ ДАННЫМИ
-- =====================================================

-- Вставка категорий
INSERT IGNORE INTO catalog_category (id, name, description, icon) VALUES
(1, 'Электроника', 'Электронные устройства и гаджеты', '📱'),
(2, 'Спорт', 'Спортивный инвентарь и оборудование', '⚽'),
(3, 'Костюмы', 'Карнавальные и тематические костюмы', '🎭'),
(4, 'Инструменты', 'Ручной и электроинструмент', '🔧'),
(5, 'Мебель', 'Мебель для дома и офиса', '🪑'),
(6, 'Одежда', 'Одежда для особых случаев', '👔'),
(7, 'Техника', 'Бытовая техника', '🔌');

-- Вставка подкатегорий
INSERT IGNORE INTO catalog_category (id, name, description, parent_id, icon) VALUES
(8, 'Фотоаппараты', 'Цифровые и пленочные фотоаппараты', 1, '📷'),
(9, 'Дроны', 'Квадрокоптеры и дроны', 1, '🚁'),
(10, 'Велосипеды', 'Горные, городские и спортивные велосипеды', 2, '🚲'),
(11, 'Лыжи', 'Горные и беговые лыжи', 2, '⛷️'),
(12, 'Карнавальные', 'Костюмы для праздников', 3, '🎪'),
(13, 'Костюмы персонажей', 'Костюмы героев фильмов и игр', 3, '🦸');

-- Вставка пользователей
INSERT IGNORE INTO auth_user (id, username, email, first_name, last_name, password, is_active, date_joined) VALUES
(1, 'user1', 'user1@mail.com', 'Иван', 'Петров', 'pbkdf2_sha256$dummy_hash', 1, '2024-01-01 10:00:00'),
(2, 'user2', 'user2@mail.com', 'Мария', 'Сидорова', 'pbkdf2_sha256$dummy_hash', 1, '2024-01-02 11:00:00'),
(3, 'user3', 'user3@mail.com', 'Алексей', 'Иванов', 'pbkdf2_sha256$dummy_hash', 1, '2024-01-03 12:00:00'),
(4, 'user4', 'user4@mail.com', 'Елена', 'Козлова', 'pbkdf2_sha256$dummy_hash', 1, '2024-01-04 13:00:00'),
(5, 'user5', 'user5@mail.com', 'Дмитрий', 'Смирнов', 'pbkdf2_sha256$dummy_hash', 1, '2024-01-05 14:00:00');

-- Вставка профилей
INSERT IGNORE INTO catalog_profile (user_id, phone, role, rating) VALUES
(1, '+7 (999) 111-11-11', 'owner', 4.50),
(2, '+7 (999) 222-22-22', 'owner', 5.00),
(3, '+7 (999) 333-33-33', 'renter', 4.50),
(4, '+7 (999) 444-44-44', 'renter', 4.20),
(5, '+7 (999) 555-55-55', 'renter', 4.80);

-- Вставка товаров
INSERT IGNORE INTO catalog_item (id, title, description, price_per_day, deposit, category_id, subcategory_id, owner_id, status) VALUES
(1, 'Костюм Железного человека', 'Полный костюм Железного человека с подсветкой. Размер M-L. Отличное состояние.', 5000.00, 10000.00, 3, 13, 1, 'available'),
(2, 'Фотоаппарат Canon EOS 5D', 'Профессиональный фотоаппарат Canon с объективом 24-70mm. Полный комплект.', 2000.00, 15000.00, 1, 8, 2, 'available'),
(3, 'Велосипед горный Trek', 'Горный велосипед Trek в отличном состоянии. 21 скорость, дисковые тормоза.', 1500.00, 5000.00, 2, 10, 1, 'available'),
(4, 'Дрон DJI Mavic Pro', 'Квадрокоптер DJI Mavic Pro с камерой 4K. Стабилизация, режим следования.', 3000.00, 20000.00, 1, 9, 2, 'available'),
(5, 'Скейтборд профессиональный', 'Профессиональный скейтборд с подвесками. Отличное состояние.', 800.00, 3000.00, 2, NULL, 1, 'available'),
(6, 'Дрель аккумуляторная Bosch', 'Аккумуляторная дрель Bosch 18V с двумя батареями и зарядным устройством.', 500.00, 2000.00, 4, NULL, 2, 'rented'),
(7, 'Костюм пирата', 'Карнавальный костюм пирата с аксессуарами. Размер универсальный.', 1500.00, 3000.00, 3, 12, 1, 'available');

-- Вставка аренд
INSERT IGNORE INTO catalog_rental (item_id, renter_id, start_date, end_date, total_price, status) VALUES
(1, 3, '2024-01-20', '2024-01-25', 25000.00, 'completed'),
(2, 4, '2024-01-15', '2024-01-20', 10000.00, 'completed'),
(3, 5, '2024-01-22', '2024-01-27', 7500.00, 'active'),
(6, 3, '2024-01-25', '2024-01-30', 2500.00, 'confirmed'),
(1, 4, '2024-02-01', '2024-02-05', 20000.00, 'pending');

-- Вставка сообщений
INSERT IGNORE INTO catalog_message (sender_id, recipient_id, content, is_read) VALUES
(3, 1, 'Здравствуйте! Интересует аренда костюма на 5 дней. Можно ли посмотреть?', 1),
(1, 3, 'Конечно! Могу показать сегодня после 18:00. Напишите удобное время.', 1),
(4, 2, 'Спасибо за аренду фотоаппарата! Всё работает отлично.', 0),
(2, 4, 'Рад, что всё понравилось! Жду вас снова.', 0);

-- Вставка уведомлений
INSERT IGNORE INTO catalog_notification (user_id, notification_type, title, message, related_item_id, related_rental_id, is_read) VALUES
(1, 'rental_request', 'Новый запрос на аренду', 'Пользователь user4 хочет арендовать ваш товар "Костюм Железного человека"', 1, 5, 0),
(2, 'rental_confirmed', 'Аренда подтверждена', 'Ваша заявка на аренду "Дрель аккумуляторная Bosch" подтверждена', 6, 4, 1),
(3, 'message', 'Новое сообщение', 'Вам пришло сообщение от user1', NULL, NULL, 0);

-- Вставка отзывов
INSERT IGNORE INTO catalog_review (reviewer_id, reviewed_user_id, item_id, rental_id, rating, comment) VALUES
(3, 1, 1, 1, 5, 'Отличный костюм! Всё как на фото, качество превосходное. Владелец очень отзывчивый и пунктуальный. Рекомендую!'),
(1, 3, 1, 1, 5, 'Арендатор аккуратный, вернул костюм в идеальном состоянии. Приятно иметь дело!'),
(4, 2, 2, 2, 5, 'Фотоаппарат в отличном состоянии, всё работает идеально. Спасибо!'),
(2, 4, 2, 2, 4, 'Арендатор ответственный, всё вернул в срок и в хорошем состоянии.');

-- Вставка избранного
INSERT IGNORE INTO catalog_favorite (user_id, item_id) VALUES
(3, 2),
(3, 4),
(4, 1),
(5, 3),
(5, 7);

-- =====================================================
-- КОНЕЦ СКРИПТА
-- =====================================================

