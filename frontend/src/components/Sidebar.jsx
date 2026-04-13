import React, { useState } from 'react';

const Sidebar = ({ onFilterChange }) => {
    const [filters, setFilters] = useState({
        category: '',
        priceRange: [0, 5000],
        availability: true,
        highRating: false
    });

    const categories = [
        'Электроника и гаджеты',
        'Фото- и видеотехника', 
        'Инструменты и оборудование',
        'Спорт и туризм',
        'Костюмы и реквизит',
        'Для праздников',
        'Хобби и творчество'
    ];

    const handleCategoryChange = (category) => {
        const newFilters = {
            ...filters,
            category: filters.category === category ? '' : category
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handlePriceChange = (value) => {
        const newFilters = {
            ...filters,
            priceRange: [0, parseInt(value)]
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleAvailabilityChange = (checked) => {
        const newFilters = {
            ...filters,
            availability: checked
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleRatingChange = (checked) => {
        const newFilters = {
            ...filters,
            highRating: checked
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const newFilters = {
            category: '',
            priceRange: [0, 5000],
            availability: true,
            highRating: false
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const styles = {
        sidebar: {
            width: '280px',
            background: '#fbf7f1',
            padding: '20px',
            borderRadius: '15px',
            boxShadow: '0 5px 20px rgba(120, 94, 70, 0.12)',
            marginRight: '25px',
            height: 'fit-content',
            position: 'sticky',
            top: '100px'
        },
        title: {
            color: '#5f4630',
            marginBottom: '20px',
            fontSize: '20px',
            fontWeight: '700',
            textAlign: 'center'
        },
        section: {
            borderBottom: '1px solid #e8ddcf',
            paddingBottom: '20px',
            marginBottom: '20px'
        },
        sectionTitle: {
            color: '#6f4e37',
            marginBottom: '15px',
            fontSize: '16px',
            fontWeight: '600'
        },
        categoryList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        categoryItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: 'transparent'
        },
        categoryItemActive: {
            background: '#efe2d4',
            color: '#7a5a3d',
            fontWeight: '600'
        },
        checkbox: {
            width: '16px',
            height: '16px',
            accentColor: '#a67c52'
        },
        priceRange: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        },
        priceValue: {
            color: '#6f4e37',
            fontSize: '14px',
            fontWeight: '600'
        },
        rangeInput: {
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: '#eadfce',
            outline: 'none',
            accentColor: '#a67c52'
        },
        applyButton: {
            width: '100%',
            background: '#a67c52',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            marginBottom: '15px'
        },
        clearButton: {
            width: '100%',
            background: 'transparent',
            color: '#7a5a3d',
            border: '2px solid #a67c52',
            padding: '10px',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        },
        funnySection: {
            background: '#efe2d4',
            padding: '15px',
            borderRadius: '10px',
            textAlign: 'center',
            marginTop: '20px'
        },
        funnyText: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#7a5a3d',
            marginBottom: '8px'
        }
    };

    return (
        <div style={styles.sidebar}>
            <h3 style={styles.title}>Фильтры</h3>
            
            {/* Категории */}
            <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Категории</h4>
                <div style={styles.categoryList}>
                    {categories.map((category, index) => (
                        <div
                            key={index}
                            style={{
                                ...styles.categoryItem,
                                ...(filters.category === category ? styles.categoryItemActive : {})
                            }}
                            onClick={() => handleCategoryChange(category)}
                        >
                            <input
                                type="checkbox"
                                style={styles.checkbox}
                                checked={filters.category === category}
                                onChange={() => {}}
                            />
                            {category}
                        </div>
                    ))}
                </div>
            </div>

            {/* Цена */}
            <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Цена за день</h4>
                <div style={styles.priceRange}>
                    <span style={styles.priceValue}>0 ₽ - {filters.priceRange[1]} ₽</span>
                    <input
                        type="range"
                        min="0"
                        max="5000"
                        step="100"
                        value={filters.priceRange[1]}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        style={styles.rangeInput}
                    />
                </div>
            </div>

            {/* Статус */}
            <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Статус</h4>
                <div style={styles.categoryList}>
                    <label style={styles.categoryItem}>
                        <input
                            type="checkbox"
                            style={styles.checkbox}
                            checked={filters.availability}
                            onChange={(e) => handleAvailabilityChange(e.target.checked)}
                        />
                        Доступно сейчас
                    </label>
                    <label style={styles.categoryItem}>
                        <input
                            type="checkbox"
                            style={styles.checkbox}
                            checked={filters.highRating}
                            onChange={(e) => handleRatingChange(e.target.checked)}
                        />
                        ⭐ С высоким рейтингом
                    </label>
                </div>
            </div>

            {/* Кнопки */}
            <button 
                style={styles.applyButton}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
                Применить фильтры
            </button>

            <button 
                style={styles.clearButton}
                onClick={clearFilters}
                onMouseEnter={(e) => {
                    e.target.style.background = '#a67c52';
                    e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#7a5a3d';
                }}
            >
                Сбросить фильтры
            </button>

            {/* Смешные надписи */}
            <div style={styles.funnySection}>
                <div style={styles.funnyText}>🎯 Нашли то, что искали?</div>
                <div style={styles.funnyText}>🚀 Арендуй и покоряй мир!</div>
                <div style={styles.funnyText}>💡 Нужна идея? Возьми дрон!</div>
            </div>
        </div>
    );
};

export default Sidebar;