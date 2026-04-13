# Структура базы данных системы аренды вещей RentSpace

## ER диаграмма базы данных

База данных системы аренды вещей представляет собой реляционную модель, состоящую из следующих основных сущностей:

- **User** (Пользователь) - стандартная модель Django для аутентификации
- **Profile** (Профиль) - расширенная информация о пользователе
- **Category** (Категория) - иерархическая структура категорий товаров
- **Item** (Товар) - товары, доступные для аренды
- **Rental** (Аренда) - записи об аренде товаров
- **Message** (Сообщение) - внутренние сообщения между пользователями
- **Notification** (Уведомление) - уведомления о событиях системы
- **Review** (Отзыв) - отзывы и оценки пользователей
- **Favorite** (Избранное) - избранные товары пользователей

## Основные сущности системы

### 1) User (Пользователь)

**Описание сущности:** содержит информацию о пользователях системы. Каждый пользователь может быть как арендатором, так и арендодателем (определяется через связь с Profile).

**Атрибуты:**
- `id` – уникальный идентификатор пользователя (первичный ключ);
- `username` – уникальное имя пользователя;
- `email` – электронная почта пользователя;
- `first_name` – имя пользователя;
- `last_name` – фамилия пользователя;
- `password` – хешированный пароль;
- `is_active` – флаг активности аккаунта;
- `is_staff` – флаг доступа к админ-панели;
- `date_joined` – дата регистрации.

**Связи:**
- Один-к-одному с Profile (через `user_id`);
- Один-ко-многим с Item (через `owner_id`);
- Один-ко-многим с Rental (через `renter_id`);
- Один-ко-многим с Message (как `sender_id` и `recipient_id`);
- Один-ко-многим с Notification (через `user_id`);
- Один-ко-многим с Review (как `reviewer_id` и `reviewed_user_id`);
- Один-ко-многим с Favorite (через `user_id`).

---

### 2) Profile (Профиль)

**Описание сущности:** содержит расширенную информацию о пользователях системы, включая роль, рейтинг и контактные данные.

**Атрибуты:**
- `id` – уникальный идентификатор профиля (первичный ключ);
- `user_id` – ссылка на пользователя (внешний ключ на User.id);
- `phone` – номер телефона пользователя;
- `avatar` – путь к файлу аватара пользователя;
- `role` – роль пользователя ('renter' - арендатор, 'owner' - арендодатель);
- `rating` – средний рейтинг пользователя (от 1.0 до 5.0);
- `created_at` – дата создания профиля.

**Связи:**
- Многие-к-одному с User (через `user_id`).

---

### 3) Category (Категория)

**Описание сущности:** содержит информацию о категориях товаров. Поддерживает иерархическую структуру с родительскими и дочерними категориями.

**Атрибуты:**
- `id` – уникальный идентификатор категории (первичный ключ);
- `name` – название категории;
- `description` – описание категории;
- `parent_id` – ссылка на родительскую категорию (внешний ключ на Category.id, может быть NULL);
- `icon` – иконка категории (эмодзи или символ).

**Связи:**
- Один-ко-многим с Category (самосвязь через `parent_id` для подкатегорий);
- Один-ко-многим с Item (через `category_id` и `subcategory_id`).

---

### 4) Item (Товар)

**Описание сущности:** содержит информацию о товарах, доступных для аренды в системе.

**Атрибуты:**
- `id` – уникальный идентификатор товара (первичный ключ);
- `title` – название товара;
- `description` – описание товара;
- `price_per_day` – цена аренды за один день;
- `deposit` – размер залога;
- `category_id` – ссылка на категорию товара (внешний ключ на Category.id);
- `subcategory_id` – ссылка на подкатегорию товара (внешний ключ на Category.id, может быть NULL);
- `owner_id` – ссылка на владельца товара (внешний ключ на User.id);
- `status` – статус товара ('available' - доступен, 'rented' - арендован, 'maintenance' - на обслуживании);
- `image` – путь к изображению товара;
- `created_at` – дата добавления товара;
- `updated_at` – дата последнего обновления товара.

**Связи:**
- Многие-к-одному с Category (через `category_id` и `subcategory_id`);
- Многие-к-одному с User (через `owner_id`);
- Один-ко-многим с Rental (через `item_id`);
- Один-ко-многим с Notification (через `related_item_id`);
- Один-ко-многим с Review (через `item_id`);
- Один-ко-многим с Favorite (через `item_id`).

---

### 5) Rental (Аренда)

**Описание сущности:** содержит информацию об аренде товаров пользователями. Отслеживает статус аренды от запроса до завершения.

**Атрибуты:**
- `id` – уникальный идентификатор аренды (первичный ключ);
- `item_id` – ссылка на арендуемый товар (внешний ключ на Item.id);
- `renter_id` – ссылка на арендатора (внешний ключ на User.id);
- `start_date` – дата начала аренды;
- `end_date` – дата окончания аренды;
- `total_price` – общая стоимость аренды;
- `status` – статус аренды ('pending' - ожидание подтверждения, 'confirmed' - подтверждена, 'active' - активна, 'completed' - завершена, 'cancelled' - отменена);
- `created_at` – дата создания записи об аренде.

**Связи:**
- Многие-к-одному с Item (через `item_id`);
- Многие-к-одному с User (через `renter_id`);
- Один-ко-многим с Notification (через `related_rental_id`);
- Один-ко-многим с Review (через `rental_id`).

---

### 6) Message (Сообщение)

**Описание сущности:** содержит внутренние сообщения между пользователями системы для коммуникации по вопросам аренды.

**Атрибуты:**
- `id` – уникальный идентификатор сообщения (первичный ключ);
- `sender_id` – ссылка на отправителя сообщения (внешний ключ на User.id);
- `recipient_id` – ссылка на получателя сообщения (внешний ключ на User.id);
- `content` – текст сообщения;
- `image` – путь к изображению в сообщении (может быть NULL);
- `is_read` – флаг прочтения сообщения;
- `created_at` – дата и время отправки сообщения.

**Связи:**
- Многие-к-одному с User (через `sender_id` и `recipient_id`).

---

### 7) Notification (Уведомление)

**Описание сущности:** содержит уведомления пользователей о различных событиях в системе (запросы на аренду, подтверждения, сообщения и т.д.).

**Атрибуты:**
- `id` – уникальный идентификатор уведомления (первичный ключ);
- `user_id` – ссылка на пользователя-получателя (внешний ключ на User.id);
- `notification_type` – тип уведомления ('rental_request', 'rental_confirmed', 'rental_cancelled', 'message', 'rental_completed');
- `title` – заголовок уведомления;
- `message` – текст уведомления;
- `is_read` – флаг прочтения уведомления;
- `related_item_id` – ссылка на связанный товар (внешний ключ на Item.id, может быть NULL);
- `related_rental_id` – ссылка на связанную аренду (внешний ключ на Rental.id, может быть NULL);
- `created_at` – дата и время создания уведомления.

**Связи:**
- Многие-к-одному с User (через `user_id`);
- Многие-к-одному с Item (через `related_item_id`);
- Многие-к-одному с Rental (через `related_rental_id`).

---

### 8) Review (Отзыв)

**Описание сущности:** содержит отзывы и оценки пользователей друг о друге после завершения аренды.

**Атрибуты:**
- `id` – уникальный идентификатор отзыва (первичный ключ);
- `reviewer_id` – ссылка на автора отзыва (внешний ключ на User.id);
- `reviewed_user_id` – ссылка на оцениваемого пользователя (внешний ключ на User.id);
- `item_id` – ссылка на товар, по которому оставлен отзыв (внешний ключ на Item.id, может быть NULL);
- `rental_id` – ссылка на аренду, по которой оставлен отзыв (внешний ключ на Rental.id, может быть NULL);
- `rating` – оценка (от 1 до 5);
- `comment` – текстовый комментарий к отзыву;
- `created_at` – дата создания отзыва.

**Связи:**
- Многие-к-одному с User (через `reviewer_id` и `reviewed_user_id`);
- Многие-к-одному с Item (через `item_id`);
- Многие-к-одному с Rental (через `rental_id`).

**Ограничения:**
- Уникальная пара (reviewer_id, rental_id) - один отзыв на одну аренду.

---

### 9) Favorite (Избранное)

**Описание сущности:** содержит информацию о товарах, добавленных пользователями в избранное.

**Атрибуты:**
- `id` – уникальный идентификатор записи (первичный ключ);
- `user_id` – ссылка на пользователя (внешний ключ на User.id);
- `item_id` – ссылка на товар (внешний ключ на Item.id);
- `created_at` – дата добавления в избранное.

**Связи:**
- Многие-к-одному с User (через `user_id`);
- Многие-к-одному с Item (через `item_id`).

**Ограничения:**
- Уникальная пара (user_id, item_id) - один товар может быть в избранном у пользователя только один раз.

---

## Примеры SQL-запросов к базе данных

### Запрос 1: Получить список всех доступных товаров с информацией о владельце и категории

**SQL-запрос:**
```sql
SELECT 
    i.id,
    i.title,
    i.description,
    i.price_per_day,
    i.deposit,
    i.status,
    c.name AS category_name,
    u.username AS owner_username,
    p.rating AS owner_rating
FROM catalog_item i
INNER JOIN catalog_category c ON i.category_id = c.id
INNER JOIN auth_user u ON i.owner_id = u.id
INNER JOIN catalog_profile p ON u.id = p.user_id
WHERE i.status = 'available'
ORDER BY i.created_at DESC;
```

**Результат выполнения:**
| id | title | description | price_per_day | deposit | status | category_name | owner_username | owner_rating |
|----|-------|-------------|---------------|---------|--------|---------------|----------------|--------------|
| 1 | Костюм Железного человека | ... | 5000.00 | 10000.00 | available | Костюмы | user1 | 4.50 |
| 2 | Фотоаппарат Canon | ... | 2000.00 | 15000.00 | available | Электроника | user2 | 5.00 |

---

### Запрос 2: Найти всех арендодателей с количеством их товаров и средним рейтингом

**SQL-запрос:**
```sql
SELECT 
    u.id,
    u.username,
    u.email,
    p.rating,
    COUNT(i.id) AS total_items,
    COUNT(CASE WHEN i.status = 'available' THEN 1 END) AS available_items,
    COUNT(CASE WHEN i.status = 'rented' THEN 1 END) AS rented_items
FROM auth_user u
INNER JOIN catalog_profile p ON u.id = p.user_id
LEFT JOIN catalog_item i ON u.id = i.owner_id
WHERE p.role = 'owner'
GROUP BY u.id, u.username, u.email, p.rating
ORDER BY p.rating DESC, total_items DESC;
```

**Результат выполнения:**
| id | username | email | rating | total_items | available_items | rented_items |
|----|----------|-------|--------|-------------|----------------|--------------|
| 2 | user2 | user2@mail.com | 5.00 | 3 | 2 | 1 |
| 1 | user1 | user1@mail.com | 4.50 | 5 | 3 | 2 |

---

### Запрос 3: Получить статистику по арендам за последний месяц

**SQL-запрос:**
```sql
SELECT 
    r.status,
    COUNT(*) AS count,
    SUM(r.total_price) AS total_revenue,
    AVG(r.total_price) AS avg_price,
    MIN(r.start_date) AS earliest_rental,
    MAX(r.end_date) AS latest_rental
FROM catalog_rental r
WHERE r.created_at >= DATE('now', '-1 month')
GROUP BY r.status
ORDER BY count DESC;
```

**Результат выполнения:**
| status | count | total_revenue | avg_price | earliest_rental | latest_rental |
|--------|-------|---------------|-----------|------------------|---------------|
| completed | 5 | 25000.00 | 5000.00 | 2024-01-15 | 2024-01-28 |
| pending | 3 | 12000.00 | 4000.00 | 2024-01-20 | 2024-01-25 |
| active | 2 | 8000.00 | 4000.00 | 2024-01-22 | 2024-01-30 |

---

### Запрос 4: Найти товары, которые никогда не арендовались (вложенный запрос)

**SQL-запрос:**
```sql
SELECT 
    i.id,
    i.title,
    i.price_per_day,
    i.status,
    c.name AS category_name,
    u.username AS owner_username
FROM catalog_item i
INNER JOIN catalog_category c ON i.category_id = c.id
INNER JOIN auth_user u ON i.owner_id = u.id
WHERE i.id NOT IN (
    SELECT DISTINCT item_id 
    FROM catalog_rental
)
ORDER BY i.created_at DESC;
```

**Результат выполнения:**
| id | title | price_per_day | status | category_name | owner_username |
|----|-------|---------------|--------|---------------|---------------|
| 5 | Дрон DJI Mavic | 3000.00 | available | Электроника | user2 |
| 8 | Скейтборд | 800.00 | available | Спорт | user1 |
| 12 | Костюм пирата | 2500.00 | available | Костюмы | user3 |

---

### Запрос 5: Получить список товаров с количеством отзывов и средним рейтингом владельца

**SQL-запрос:**
```sql
SELECT 
    i.id,
    i.title,
    i.price_per_day,
    i.status,
    c.name AS category_name,
    u.username AS owner_username,
    p.rating AS owner_rating,
    COUNT(r.id) AS reviews_count,
    AVG(r.rating) AS avg_review_rating
FROM catalog_item i
INNER JOIN catalog_category c ON i.category_id = c.id
INNER JOIN auth_user u ON i.owner_id = u.id
INNER JOIN catalog_profile p ON u.id = p.user_id
LEFT JOIN catalog_review r ON r.item_id = i.id
WHERE i.status = 'available'
GROUP BY i.id, i.title, i.price_per_day, i.status, c.name, u.username, p.rating
ORDER BY reviews_count DESC, owner_rating DESC;
```

**Результат выполнения:**
| id | title | price_per_day | status | category_name | owner_username | owner_rating | reviews_count | avg_review_rating |
|----|-------|---------------|--------|---------------|---------------|--------------|---------------|------------------|
| 1 | Костюм Железного человека | 5000.00 | available | Костюмы | user1 | 4.50 | 3 | 4.67 |
| 2 | Фотоаппарат Canon | 2000.00 | available | Электроника | user2 | 5.00 | 2 | 5.00 |
| 3 | Велосипед горный | 1500.00 | available | Спорт | user1 | 4.50 | 1 | 4.00 |
| 4 | Дрон DJI Mavic | 3000.00 | available | Электроника | user2 | 5.00 | 0 | NULL |

---

## Диаграмма связей между сущностями

```
User (1) ──────── (1) Profile
  │
  ├─── (1:N) ──── Item (owner)
  │
  ├─── (1:N) ──── Rental (renter)
  │
  ├─── (1:N) ──── Message (sender)
  │
  ├─── (1:N) ──── Message (recipient)
  │
  ├─── (1:N) ──── Notification
  │
  ├─── (1:N) ──── Review (reviewer)
  │
  ├─── (1:N) ──── Review (reviewed_user)
  │
  └─── (1:N) ──── Favorite

Category (1) ──── (N) Category (parent/child - самосвязь)
  │
  └─── (1:N) ──── Item (category)
  │
  └─── (1:N) ──── Item (subcategory)

Item (1) ──────── (N) Rental
  │
  ├─── (1:N) ──── Notification
  │
  ├─── (1:N) ──── Review
  │
  └─── (1:N) ──── Favorite

Rental (1) ────── (N) Notification
  │
  └─── (1:N) ──── Review
```

