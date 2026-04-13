import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const CategoriesMenu = ({ onClose, onCategorySelect }) => {
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const menuRef = useRef(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/categories/?parent_only=true', {
                withCredentials: true
            });
            setCategories(response.data);
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
            // Используем статические данные в случае ошибки
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const getSubcategoriesForCategory = (categoryId) => {
        // Находим категорию и возвращаем её подкатегории
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.subcategories : [];
    };

    // Статические данные для подкатегорий (по названию категории)
    const staticCategories = {
        'Для праздников и вечеринок': {
            icon: '🎉',
            subcategories: {
                'Оформление': ['Шары', 'Гирлянды', 'Баннеры', 'Декорации'],
                'Оборудование': ['Проекторы', 'Звуковое оборудование', 'Световое оборудование', 'Сцены'],
                'Развлечения': ['Батуты', 'Аттракционы', 'Игровые автоматы']
            }
        },
        'Костюмы и реквизит': {
            icon: '🎭',
            subcategories: {
                'Костюмы': ['Костюмы супергероев', 'Исторические костюмы', 'Карнавальные костюмы', 'Театральные костюмы'],
                'Реквизит': ['Оружие (бутафорское)', 'Аксессуары', 'Маски', 'Парики']
            }
        },
        'Электроника и гаджеты': {
            icon: '📱',
            subcategories: {
                'Фото и видео': ['Фотоаппараты', 'Видеокамеры', 'Дроны', 'Стабилизаторы', 'Объективы'],
                'Аудио': ['Микрофоны', 'Колонки', 'Наушники', 'Аудиомикшеры'],
                'Компьютеры': ['Ноутбуки', 'Планшеты', 'Мониторы', 'Периферия']
            }
        },
        'Инструменты и оборудование': {
            icon: '🔧',
            subcategories: {
                'Строительные инструменты': ['Дрели и шуруповерты', 'Перфораторы', 'Шлифмашины', 'Пилы'],
                'Садовый инвентарь': ['Газонокосилки', 'Триммеры', 'Культиваторы', 'Садовые инструменты'],
                'Профессиональное оборудование': ['Генераторы', 'Компрессоры', 'Сварочное оборудование']
            }
        },
        'Спорт и туризм': {
            icon: '🏃',
            subcategories: {
                'Туристическое снаряжение': ['Палатки', 'Рюкзаки', 'Спальники', 'Кемпинговое оборудование'],
                'Спортивный инвентарь': ['Велосипеды', 'Лыжи', 'Сноуборды', 'Скейтборды'],
                'Водный спорт': ['Каяки', 'SUP-доски', 'Снаряжение для дайвинга']
            }
        },
        'Хобби и творчество': {
            icon: '🎨',
            subcategories: {
                'Творчество': ['Мольберты', 'Краски и кисти', 'Гончарные круги', 'Швейные машины'],
                'Музыка': ['Музыкальные инструменты', 'Синтезаторы', 'Ударные установки'],
                'Коллекционирование': ['3D принтеры', 'Лазерные граверы', 'Инструменты для моделирования']
            }
        },
        'Транспорт': {
            icon: '🚗',
            subcategories: {
                'Автомобили': ['Легковые автомобили', 'Электромобили', 'Ретро автомобили'],
                'Мототехника': ['Мотоциклы', 'Скутеры', 'Квадроциклы'],
                'Спецтехника': ['Грузовики', 'Экскаваторы', 'Подъемная техника']
            }
        },
        'Для дома': {
            icon: '🏠',
            subcategories: {
                'Бытовая техника': ['Пылесосы', 'Стиральные машины', 'Холодильники'],
                'Мебель': ['Столы и стулья', 'Диваны', 'Шкафы'],
                'Интерьер': ['Ковры', 'Картины', 'Декоративные элементы']
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleCategoryClick = (categoryName) => {
        if (onCategorySelect) {
            onCategorySelect(categoryName);
        }
        onClose();
    };

    const styles = {
        menu: {
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: 0,
            background: 'white',
            borderRadius: '15px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            minWidth: '900px',
            maxWidth: '90vw',
            maxHeight: '80vh',
            overflow: 'hidden',
            zIndex: 1501
        },
        categoriesList: {
            width: '280px',
            background: '#f8f9fa',
            borderRight: '2px solid #e9ecef',
            overflowY: 'auto',
            maxHeight: '80vh'
        },
        categoryItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '15px 20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            borderBottom: '1px solid #e9ecef',
            fontSize: '15px',
            fontWeight: '500',
            color: '#2d3748'
        },
        categoryItemHovered: {
            background: '#ffffff',
            color: '#8a6442',
            fontWeight: '600'
        },
        categoryIcon: {
            fontSize: '20px',
            marginRight: '12px'
        },
        categoryName: {
            flex: 1
        },
        arrow: {
            fontSize: '12px',
            color: '#999'
        },
        subcategoriesPanel: {
            flex: 1,
            padding: '30px',
            overflowY: 'auto',
            maxHeight: '80vh',
            background: 'white'
        },
        subcategoriesGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '25px'
        },
        subcategoryGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
        },
        subcategoryTitle: {
            fontSize: '18px',
            fontWeight: '700',
            color: '#2d3748',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'color 0.2s ease'
        },
        subcategoryList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        subcategoryItem: {
            padding: '10px 15px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '14px',
            color: '#4a5568',
            background: '#f8f9fa'
        },
        subcategoryItemHover: {
            background: '#efe2d4',
            color: '#8a6442',
            fontWeight: '600',
            transform: 'translateX(5px)'
        },
        emptyState: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#999',
            fontSize: '16px'
        }
    };

    const selectedCategory = hoveredCategory ? categories.find(cat => cat.id === hoveredCategory) : null;
    const selectedConfig = selectedCategory ? staticCategories[selectedCategory.name] : null;

    if (loading) {
        return (
            <div style={styles.menu} ref={menuRef} onClick={(e) => e.stopPropagation()}>
                <div style={styles.emptyState}>Загрузка категорий...</div>
            </div>
        );
    }

    return (
        <div style={styles.menu} ref={menuRef} onClick={(e) => e.stopPropagation()}>
                <div style={styles.categoriesList}>
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            style={{
                                ...styles.categoryItem,
                                ...(hoveredCategory === category.id ? styles.categoryItemHovered : {})
                            }}
                            onMouseEnter={() => setHoveredCategory(category.id)}
                            onClick={() => handleCategoryClick(category.name)}
                        >
                            <span style={styles.categoryIcon}>{category.icon || '📦'}</span>
                            <span style={styles.categoryName}>{category.name}</span>
                            <span style={styles.arrow}>→</span>
                        </div>
                    ))}
                </div>

                <div style={styles.subcategoriesPanel}>
                    {selectedConfig ? (
                        <div style={styles.subcategoriesGrid}>
                            {Object.entries(selectedConfig.subcategories).map(([groupName, items]) => (
                                <div key={groupName} style={styles.subcategoryGroup}>
                                    <div 
                                        style={styles.subcategoryTitle}
                                        onClick={() => handleCategoryClick(groupName)}
                                    >
                                        {groupName} →
                                    </div>
                                    <div style={styles.subcategoryList}>
                                        {items.map((itemName) => (
                                            <div
                                                key={itemName}
                                                style={styles.subcategoryItem}
                                                onClick={() => handleCategoryClick(itemName)}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#efe2d4';
                                                    e.currentTarget.style.color = '#8a6442';
                                                    e.currentTarget.style.fontWeight = '600';
                                                    e.currentTarget.style.transform = 'translateX(5px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = '#f8f9fa';
                                                    e.currentTarget.style.color = '#6f4e37';
                                                    e.currentTarget.style.fontWeight = '400';
                                                    e.currentTarget.style.transform = 'translateX(0)';
                                                }}
                                            >
                                                {itemName}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={styles.emptyState}>
                            {selectedCategory ? 'Для этой категории пока не заданы подкатегории' : 'Наведите на категорию, чтобы увидеть подкатегории'}
                        </div>
                    )}
                </div>
            </div>
    );
};

export default CategoriesMenu;

