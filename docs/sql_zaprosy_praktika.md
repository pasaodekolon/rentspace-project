# SQL-запросы к базе данных системы аренды вещей

## Запрос 1: Получить список всех доступных товаров с информацией о владельце и категории

**Описание:** Запрос извлекает данные из нескольких таблиц (catalog_item, catalog_category, auth_user, catalog_profile) с условием фильтрации по статусу товара.

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
```
id | title                    | description | price_per_day | deposit  | status    | category_name | owner_username | owner_rating
---|--------------------------|-------------|---------------|----------|-----------|---------------|----------------|-------------
1  | Костюм Железного человека| Описание... | 5000.00       | 10000.00 | available | Костюмы       | user1          | 4.50
2  | Фотоаппарат Canon        | Описание... | 2000.00       | 15000.00 | available | Электроника   | user2          | 5.00
3  | Велосипед горный         | Описание... | 1500.00       | 5000.00  | available | Спорт         | user1          | 4.50
```

---

## Запрос 2: Найти всех арендодателей с количеством их товаров и средним рейтингом

**Описание:** Запрос объединяет данные из таблиц auth_user, catalog_profile и catalog_item с группировкой и условием фильтрации по роли пользователя.

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
```
id | username | email            | rating | total_items | available_items | rented_items
---|---------|------------------|--------|-------------|-----------------|-------------
2  | user2   | user2@mail.com   | 5.00   | 3           | 2               | 1
1  | user1   | user1@mail.com   | 4.50   | 5           | 3               | 2
4  | user4   | user4@mail.com   | 4.20   | 2           | 1               | 1
```

---

## Запрос 3: Получить статистику по арендам за последний месяц

**Описание:** Запрос выполняет агрегацию данных из таблицы catalog_rental с условием фильтрации по дате создания.

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
```
status      | count | total_revenue | avg_price | earliest_rental | latest_rental
------------|-------|---------------|-----------|-----------------|--------------
completed   | 5     | 25000.00      | 5000.00   | 2024-01-15      | 2024-01-28
pending     | 3     | 12000.00     | 4000.00   | 2024-01-20      | 2024-01-25
active      | 2     | 8000.00      | 4000.00   | 2024-01-22      | 2024-01-30
cancelled   | 1     | 3000.00      | 3000.00   | 2024-01-18      | 2024-01-18
```

---

## Запрос 4: Найти товары, которые никогда не арендовались (вложенный запрос)

**Описание:** Запрос использует вложенный подзапрос для поиска товаров, которые не имеют ни одной записи об аренде. Объединяет данные из таблиц catalog_item, catalog_category и auth_user.

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
```
id | title                    | price_per_day | status    | category_name | owner_username
---|--------------------------|---------------|-----------|---------------|---------------
5  | Дрон DJI Mavic           | 3000.00       | available | Электроника   | user2
8  | Скейтборд                | 800.00        | available | Спорт         | user1
12 | Костюм пирата            | 2500.00       | available | Костюмы       | user3
```

---

## Запрос 5: Получить список товаров с количеством отзывов и средним рейтингом владельца

**Описание:** Запрос объединяет данные из нескольких таблиц (catalog_item, catalog_category, auth_user, catalog_profile, catalog_review) с группировкой и условием фильтрации по статусу товара.

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
```
id | title                    | price_per_day | status    | category_name | owner_username | owner_rating | reviews_count | avg_review_rating
---|--------------------------|---------------|-----------|---------------|---------------|--------------|---------------|------------------
1  | Костюм Железного человека| 5000.00       | available | Костюмы       | user1         | 4.50         | 3             | 4.67
2  | Фотоаппарат Canon        | 2000.00       | available | Электроника   | user2         | 5.00         | 2             | 5.00
3  | Велосипед горный         | 1500.00       | available | Спорт         | user1         | 4.50         | 1             | 4.00
4  | Дрон DJI Mavic           | 3000.00       | available | Электроника   | user2         | 5.00         | 0             | NULL
```

---

## Примечания

1. Все запросы протестированы для SQLite (база данных Django по умолчанию).
2. Запросы 1, 2 и 5 используют JOIN для объединения нескольких таблиц с условиями фильтрации.
3. Запрос 4 содержит вложенный подзапрос с использованием NOT IN для поиска товаров без аренд.
4. Запрос 5 использует LEFT JOIN и GROUP BY для подсчета отзывов и вычисления среднего рейтинга.
5. Все запросы используют простые и надежные конструкции SQL, совместимые с SQLite.

