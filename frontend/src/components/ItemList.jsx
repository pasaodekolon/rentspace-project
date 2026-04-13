import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import RentalForm from './RentalForm';
import { getApiUrl, getMediaUrl } from '../config/api';

const ItemList = ({ filters = {}, refreshTrigger, searchQuery = '' }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showRentalForm, setShowRentalForm] = useState(false);
    const [favorites, setFavorites] = useState(new Set());
    const [selectedRegion, setSelectedRegion] = useState('');

    const fetchItems = () => {
        setLoading(true);
        axios.get(getApiUrl('/api/items/'), {
            withCredentials: true
        })
            .then(response => {
                console.log('Загружены товары:', response.data); // Для отладки
                setItems(response.data);
                setFilteredItems(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Ошибка загрузки товаров:', error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchItems();
        if (user) {
            fetchFavorites();
        }
    }, [user]);

    const fetchFavorites = async () => {
        try {
            const response = await axios.get(getApiUrl('/api/favorites/'), {
                withCredentials: true
            });
            const favoriteIds = new Set(response.data.map(item => item.id));
            setFavorites(favoriteIds);
        } catch (error) {
            console.error('Ошибка загрузки избранного:', error);
        }
    };

    const toggleFavorite = async (e, itemId) => {
        e.stopPropagation();
        if (!user) {
            alert('Необходимо войти в систему для добавления в избранное');
            return;
        }

        const isFavorite = favorites.has(itemId);
        try {
            if (isFavorite) {
                await axios.delete(getApiUrl(`/api/favorites/${itemId}/`), {
                    withCredentials: true
                });
                setFavorites(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(itemId);
                    return newSet;
                });
            } else {
                await axios.post(getApiUrl('/api/favorites/'), { item: itemId }, {
                    withCredentials: true
                });
                setFavorites(prev => new Set([...prev, itemId]));
            }
        } catch (error) {
            console.error('Ошибка изменения избранного:', error);
            alert(error.response?.data?.error || 'Ошибка при изменении избранного');
        }
    };

    // Обновляем список при изменении refreshTrigger
    useEffect(() => {
        if (refreshTrigger) {
            fetchItems();
        }
    }, [refreshTrigger]);

    // ФИЛЬТРАЦИЯ ТОВАРОВ
    useEffect(() => {
        if (items.length > 0) {
            let result = [...items];
            
            // Поиск по запросу
            if (searchQuery && searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                result = result.filter(item => 
                    item.title.toLowerCase().includes(query) ||
                    item.description.toLowerCase().includes(query) ||
                    (item.category_name && item.category_name.toLowerCase().includes(query))
                );
            }
            
            if (filters.category) {
                const categoryName = filters.category.replace(/^[^\s]+\s/, '');
                result = result.filter(item => 
                    item.category_name && item.category_name.includes(categoryName)
                );
            }
            
            if (filters.priceRange) {
                result = result.filter(item => 
                    parseFloat(item.price_per_day) <= filters.priceRange[1]
                );
            }

            if (selectedRegion) {
                result = result.filter(item => (item.owner_region || '').trim() === selectedRegion);
            }
            
            setFilteredItems(result);
        }
    }, [items, filters, searchQuery, selectedRegion]);

    // Функция для получения правильного URL изображения
    const getImageUrl = (item) => {
        if (Array.isArray(item.media) && item.media.length > 0) {
            return item.media[0];
        }
        if (item.image) {
            // Если URL уже полный (начинается с http:// или https://), используем его напрямую
            return getMediaUrl(item.image);
        }
        // Заглушка если изображения нет
        return 'https://via.placeholder.com/300x200/c7a17a/ffffff?text=Rently';
    };

    const handleCategoryClick = (e, categoryName) => {
        e.stopPropagation();
        if (!categoryName) return;
        navigate(`/?category=${encodeURIComponent(categoryName)}`);
    };

    const styles = {
        container: { 
            padding: '20px',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        },
        title: { 
            textAlign: 'center', 
            fontSize: '42px', 
            marginBottom: '40px',
            color: '#5f4630',
            fontWeight: '700',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '25px',
            width: '100%',
            boxSizing: 'border-box'
        },
        card: {
            background: '#fffaf3',
            borderRadius: '15px',
            overflow: 'hidden',
            boxShadow: '0 10px 24px rgba(120, 94, 70, 0.16)',
            border: 'none',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxWidth: '100%'
        },
        imageContainer: {
            width: '100%',
            height: '320px',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '15px 15px 0 0',
            background: '#ffffff',
            padding: '15px'
        },
        image: {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center center',
            transition: 'transform 0.3s ease',
            display: 'block',
            margin: 0,
            padding: 0
        },
        content: {
            padding: '20px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        },
        itemTitle: {
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '10px',
            color: '#2d3748',
            lineHeight: '1.3'
        },
        priceSection: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: '15px 0',
            padding: '12px',
            background: '#f4eadf',
            borderRadius: '8px',
            borderLeft: '4px solid #b08968'
        },
        price: {
            fontSize: '18px',
            fontWeight: '700',
            color: '#2d3748'
        },
        deposit: {
            fontSize: '14px',
            color: '#718096',
            fontWeight: '600'
        },
        details: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#718096',
            marginBottom: '15px',
            paddingTop: '10px',
            borderTop: '1px solid #e2e8f0'
        },
        button: {
            width: '100%',
            background: '#a67c52',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            boxShadow: '0 4px 15px rgba(120, 94, 70, 0.28)'
        },
        resultsInfo: {
            textAlign: 'center',
            color: '#6f4e37',
            marginBottom: '20px',
            fontSize: '16px'
        },
        regionFilterWrap: {
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '18px'
        },
        regionSelect: {
            minWidth: '260px',
            borderRadius: '999px',
            border: '1px solid #d8b99b',
            background: '#fffaf3',
            color: '#6f4e37',
            padding: '10px 14px',
            fontSize: '14px'
        },
        regionGroupTitle: {
            margin: '10px 0 14px',
            color: '#6f4e37',
            fontSize: '20px',
            fontWeight: '700'
        },
        debugInfo: {
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            marginBottom: '10px'
        },
        favoriteButton: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.3s',
            zIndex: 10
        },
        favoriteButtonActive: {
            background: 'rgba(239, 68, 68, 0.9)',
            transform: 'scale(1.1)'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={{textAlign: 'center', padding: '40px', color: '#6f4e37', fontSize: '20px'}}>
                    Загрузка товаров...
                </div>
            </div>
        );
    }

    const availableRegions = Array.from(
        new Set(items.map((item) => (item.owner_region || '').trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, 'ru'));

    const groupedItems = filteredItems.reduce((acc, item) => {
        const region = (item.owner_region || '').trim() || 'Без указанной области';
        if (!acc[region]) {
            acc[region] = [];
        }
        acc[region].push(item);
        return acc;
    }, {});

    const orderedGroups = Object.entries(groupedItems).sort(([a], [b]) => a.localeCompare(b, 'ru'));

    return (
        <div style={styles.container} data-item-list>
            <h1 style={styles.title}>Каталог товаров для аренды</h1>

            <div style={styles.regionFilterWrap}>
                <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    style={styles.regionSelect}
                >
                    <option value="">Все области</option>
                    {availableRegions.map((region) => (
                        <option key={region} value={region}>{region}</option>
                    ))}
                </select>
            </div>
            
            {Object.keys(filters).length > 0 && (
                <div style={styles.resultsInfo}>
                    Найдено товаров: {filteredItems.length}
                    {filters.category && ` • Категория: ${filters.category}`}
                    {filters.priceRange && ` • До ${filters.priceRange[1]}₽`}
                    {selectedRegion && ` • Область: ${selectedRegion}`}
                    {filters.category && (
                        <button
                            style={{
                                marginLeft: '10px',
                                padding: '4px 10px',
                                fontSize: '12px',
                                borderRadius: '999px',
                                border: 'none',
                                cursor: 'pointer',
                                background: 'rgba(255,255,255,0.9)',
                                color: '#4a5568'
                            }}
                            onClick={() => {
                                navigate('/');
                            }}
                        >
                            Показать все товары
                        </button>
                    )}
                </div>
            )}
            
            {orderedGroups.map(([regionName, regionItems]) => (
                <div key={regionName} style={{ marginBottom: '28px' }}>
                    <div style={styles.regionGroupTitle}>📍 {regionName}</div>
                    <div style={styles.grid}>
                        {regionItems.map(item => (
                            <div 
                                key={item.id} 
                                style={styles.card}
                                onClick={() => {
                                    navigate(`/item/${item.id}`);
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
                                    e.currentTarget.style.cursor = 'pointer';
                                    const img = e.currentTarget.querySelector('img');
                                    if (img) img.style.transform = 'scale(1.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                                    const img = e.currentTarget.querySelector('img');
                                    if (img) img.style.transform = 'scale(1)';
                                }}
                            >
                                <div style={styles.imageContainer}>
                                    <img 
                                        src={getImageUrl(item)} 
                                        alt={item.title}
                                        style={styles.image}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300x200/c7a17a/ffffff?text=%D0%A0%D0%B5%D0%BD%D1%82%D0%BB%D0%B8';
                                        }}
                                    />
                                    {user && (
                                        <button
                                            onClick={(e) => toggleFavorite(e, item.id)}
                                            style={{
                                                ...styles.favoriteButton,
                                                ...(favorites.has(item.id) ? styles.favoriteButtonActive : {})
                                            }}
                                            title={favorites.has(item.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                                        >
                                            {favorites.has(item.id) ? '❤️' : '🤍'}
                                        </button>
                                    )}
                                </div>
                                
                                <div style={styles.content}>
                                    <h3 style={styles.itemTitle}>{item.title}</h3>
                                    
                                    <div style={styles.priceSection}>
                                        <span style={styles.price}>{item.price_per_day} ₽/день</span>
                                        <span style={styles.deposit}>Залог: {item.deposit} ₽</span>
                                    </div>
                                    
                                    <div style={styles.details}>
                                        <span>
                                            Категория:{' '}
                                            <span
                                                style={{ textDecoration: 'underline', cursor: 'pointer' }}
                                                onClick={(e) => handleCategoryClick(e, item.category_name)}
                                            >
                                                {item.category_name}
                                            </span>
                                        </span>
                                        <span>Владелец: {item.owner_username}</span>
                                    </div>
                                    
                                    <button 
                                        style={styles.button}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/item/${item.id}`);
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 6px 20px rgba(120, 94, 70, 0.35)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 15px rgba(120, 94, 70, 0.28)';
                                        }}
                                    >
                                        Арендовать
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {filteredItems.length === 0 && !loading && (
                <div style={{textAlign: 'center', color: '#6f4e37', marginTop: '40px', fontSize: '18px'}}>
                    {items.length === 0 
                        ? 'Товаров пока нет. Добавьте первый товар через админку!'
                        : 'По вашему запросу ничего не найдено. Попробуйте изменить фильтры.'
                    }
                </div>
            )}

            {showRentalForm && (
                <RentalForm 
                    item={selectedItem}
                    onClose={() => {
                        setShowRentalForm(false);
                        setSelectedItem(null);
                    }}
                    onSuccess={() => {
                        console.log('Аренда создана!');
                    }}
                />
            )}
        </div>
    );
};

export default ItemList;