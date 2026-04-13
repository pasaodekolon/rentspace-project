import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getApiUrl, getMediaUrl } from '../config/api';

const Favorites = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchFavorites();
        }
    }, [user]);

    const fetchFavorites = async () => {
        try {
            const response = await axios.get(getApiUrl('/api/favorites/'), {
                withCredentials: true
            });
            setFavorites(response.data);
        } catch (error) {
            console.error('Ошибка загрузки избранного:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (itemId) => {
        try {
            await axios.delete(getApiUrl(`/api/favorites/${itemId}/`), {
                withCredentials: true
            });
            setFavorites(favorites.filter(item => item.id !== itemId));
        } catch (error) {
            console.error('Ошибка удаления из избранного:', error);
            alert('Ошибка при удалении из избранного');
        }
    };

    const getImageUrl = (image) => {
        if (image) return getMediaUrl(image);
        return 'https://via.placeholder.com/300x200/c7a17a/ffffff?text=Rently';
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</div>;
    }

    if (favorites.length === 0) {
        return (
            <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🤍</div>
                <h3>Избранное пусто</h3>
                <p>Добавьте товары в избранное, чтобы быстро находить их позже</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.grid}>
                {favorites.map(item => (
                    <div key={item.id} style={styles.card}>
                        <div style={styles.imageContainer}>
                            <img 
                                src={getImageUrl(item.image)} 
                                alt={item.title}
                                style={styles.image}
                                onClick={() => navigate(`/item/${item.id}`)}
                            />
                            <button
                                onClick={() => removeFavorite(item.id)}
                                style={styles.removeButton}
                                title="Удалить из избранного"
                            >
                                ❌
                            </button>
                        </div>
                        <div style={styles.content}>
                            <h3 style={styles.title}>{item.title}</h3>
                            <div style={styles.priceSection}>
                                <span style={styles.price}>{item.price_per_day} ₽/день</span>
                                <span style={styles.deposit}>Залог: {item.deposit} ₽</span>
                            </div>
                            <button
                                onClick={() => navigate(`/item/${item.id}`)}
                                style={styles.viewButton}
                            >
                                Посмотреть
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
    },
    card: {
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s',
        cursor: 'pointer'
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: '200px',
        overflow: 'hidden'
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    removeButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(255, 255, 255, 0.9)',
        border: 'none',
        borderRadius: '50%',
        width: '35px',
        height: '35px',
        cursor: 'pointer',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    },
    content: {
        padding: '15px'
    },
    title: {
        margin: '0 0 10px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#2d3748'
    },
    priceSection: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '15px',
        padding: '10px',
        background: '#f7fafc',
        borderRadius: '8px'
    },
    price: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#2d3748'
    },
    deposit: {
        fontSize: '14px',
        color: '#718096'
    },
    viewButton: {
        width: '100%',
        padding: '10px',
        background: '#a67c52',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px'
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px',
        color: '#718096'
    },
    emptyIcon: {
        fontSize: '64px',
        marginBottom: '20px'
    }
};

export default Favorites;

