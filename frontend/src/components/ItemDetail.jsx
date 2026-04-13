import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import RentalForm from './RentalForm';
import Reviews from './Reviews';
import Messenger from './Messenger';

const ItemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showRentalForm, setShowRentalForm] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [availability, setAvailability] = useState([]);
    const [availabilityLoading, setAvailabilityLoading] = useState(true);
    const [recommendations, setRecommendations] = useState({ similar: [], also_rented: [] });
    const [recommendationsLoading, setRecommendationsLoading] = useState(true);
    const [showMessenger, setShowMessenger] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);

    useEffect(() => {
        fetchItem();
        if (user && id) {
            checkFavorite();
        }
        if (id) {
            fetchAvailability();
            fetchRecommendations();
        }
    }, [id, user]);

    const checkFavorite = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/favorites/check/?item_id=${id}`, {
                withCredentials: true
            });
            setIsFavorite(response.data.is_favorite);
        } catch (error) {
            console.error('Ошибка проверки избранного:', error);
        }
    };

    const fetchAvailability = async () => {
        setAvailabilityLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/api/items/${id}/availability/`, {
                withCredentials: true
            });
            setAvailability(response.data);
        } catch (error) {
            console.error('Ошибка загрузки занятости товара:', error);
        } finally {
            setAvailabilityLoading(false);
        }
    };

    const fetchRecommendations = async () => {
        setRecommendationsLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/api/items/${id}/recommendations/`, {
                withCredentials: true
            });
            setRecommendations({
                similar: response.data.similar || [],
                also_rented: response.data.also_rented || []
            });
        } catch (error) {
            console.error('Ошибка загрузки рекомендаций:', error);
        } finally {
            setRecommendationsLoading(false);
        }
    };

    const toggleFavorite = async () => {
        if (!user) {
            alert('Необходимо войти в систему для добавления в избранное');
            return;
        }

        try {
            if (isFavorite) {
                await axios.delete(`http://localhost:8000/api/favorites/${id}/`, {
                    withCredentials: true
                });
                setIsFavorite(false);
            } else {
                await axios.post('http://localhost:8000/api/favorites/', { item: id }, {
                    withCredentials: true
                });
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Ошибка изменения избранного:', error);
            alert(error.response?.data?.error || 'Ошибка при изменении избранного');
        }
    };

    const fetchItem = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`http://localhost:8000/api/items/${id}/`, {
                withCredentials: true
            });
            setItem(response.data);
        } catch (error) {
            console.error('Ошибка загрузки товара:', error);
            setError('Товар не найден');
        } finally {
            setLoading(false);
        }
    };


    const getImageUrl = (image) => {
        if (image) {
            if (image.startsWith('http://') || image.startsWith('https://')) {
                return image;
            }
            return `http://localhost:8000${image}`;
        }
        return 'https://via.placeholder.com/600x400/c7a17a/ffffff?text=Rently';
    };

    const getMediaList = () => {
        if (!item) return [];
        if (Array.isArray(item.media) && item.media.length > 0) return item.media;
        return [getImageUrl(item.image)];
    };

    const mediaList = getMediaList();

    const showPrevImage = () => {
        if (!mediaList.length) return;
        setActiveMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
    };

    const showNextImage = () => {
        if (!mediaList.length) return;
        setActiveMediaIndex((prev) => (prev + 1) % mediaList.length);
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                setIsImageModalOpen(false);
            }
            if (e.key === 'ArrowLeft') {
                showPrevImage();
            }
            if (e.key === 'ArrowRight') {
                showNextImage();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [mediaList.length]);

    useEffect(() => {
        setActiveMediaIndex(0);
    }, [id]);

    const styles = {
        container: {
            width: '100%',
            maxWidth: '100%',
            margin: '0 auto',
            padding: '30px 20px',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            boxSizing: 'border-box'
        },
        backButton: {
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        },
        loading: {
            textAlign: 'center',
            padding: '60px 20px',
            color: 'white',
            fontSize: '20px'
        },
        error: {
            textAlign: 'center',
            padding: '60px 20px',
            color: 'white',
            fontSize: '20px',
            background: 'rgba(239, 68, 68, 0.2)',
            borderRadius: '15px'
        },
        content: {
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: 'clamp(20px, 4vw, 40px)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'clamp(20px, 4vw, 40px)',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
        },
        imageSection: {
            position: 'relative',
            width: '100%',
            maxWidth: '100%',
            height: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start'
        },
        mediaControls: {
            width: '100%',
            maxWidth: '560px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
            gap: '10px'
        },
        navButton: {
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: '1px solid #b08968',
            background: '#fffaf3',
            color: '#6f4e37',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '20px',
            lineHeight: '1'
        },
        mediaCounter: {
            color: '#6f4e37',
            fontSize: '13px',
            fontWeight: '600'
        },
        mediaStage: {
            width: '100%',
            maxWidth: '560px',
            height: 'clamp(320px, 56vh, 640px)',
            minHeight: '320px',
            borderRadius: '30px 12px 30px 12px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            backgroundColor: '#efe4d6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        mainImage: {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease',
            display: 'block',
            cursor: 'zoom-in',
            padding: '12px',
            boxSizing: 'border-box'
        },
        thumbsRow: {
            marginTop: '10px',
            width: '100%',
            maxWidth: '560px',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px'
        },
        thumbButton: {
            width: '66px',
            height: '66px',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '2px solid #d8b99b',
            padding: 0,
            background: '#fffaf3',
            cursor: 'pointer',
            flexShrink: 0
        },
        thumbImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
        },
        imageModalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.82)',
            zIndex: 2100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        },
        imageModalContent: {
            maxWidth: '90vw',
            maxHeight: '90vh',
            objectFit: 'contain',
            borderRadius: '20px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)'
        },
        modalNavButton: {
            position: 'fixed',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.22)',
            color: '#fff',
            fontSize: '26px',
            cursor: 'pointer'
        },
        infoSection: {
            display: 'flex',
            flexDirection: 'column',
            gap: '25px',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
        },
        title: {
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: '800',
            color: '#2d3748',
            marginBottom: '10px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
        },
        category: {
            fontSize: '16px',
            color: '#8a6442',
            fontWeight: '600',
            marginBottom: '20px'
        },
        priceSection: {
            background: '#a67c52',
            padding: '25px',
            borderRadius: '15px',
            color: 'white',
            marginBottom: '20px'
        },
        price: {
            fontSize: 'clamp(24px, 3vw, 32px)',
            fontWeight: '800',
            marginBottom: '5px'
        },
        deposit: {
            fontSize: 'clamp(14px, 2vw, 18px)',
            opacity: 0.9
        },
        description: {
            fontSize: 'clamp(16px, 2vw, 18px)',
            lineHeight: '1.8',
            color: '#4a5568',
            marginBottom: '30px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
        },
        ownerSection: {
            background: '#efe2d4',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '20px'
        },
        ownerTitle: {
            fontSize: '18px',
            fontWeight: '700',
            color: '#2d3748',
            marginBottom: '15px'
        },
        ownerInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
        },
        ownerAvatar: {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: '#8c6a4f',
            border: '2px solid #d7bea2',
            overflow: 'hidden',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px',
            fontWeight: '700'
        },
        ownerDetails: {
            flex: 1
        },
        ownerActions: {
            display: 'flex',
            alignItems: 'center'
        },
        ownerName: {
            fontSize: '18px',
            fontWeight: '700',
            color: '#2d3748',
            marginBottom: '5px'
        },
        ownerRating: {
            fontSize: '14px',
            color: '#8a6442',
            fontWeight: '600'
        },
        chatButton: {
            background: '#8c6a4f',
            color: 'white',
            border: 'none',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
        },
        status: {
            display: 'inline-block',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '20px'
        },
        statusAvailable: {
            background: '#8c6a4f',
            color: 'white'
        },
        statusRented: {
            background: '#a67c52',
            color: 'white'
        },
        statusMaintenance: {
            background: '#b08968',
            color: 'white'
        },
        button: {
            background: '#a67c52',
            color: 'white',
            border: 'none',
            padding: '18px 40px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 5px 20px rgba(120, 94, 70, 0.24)',
            width: '100%'
        },
        favoriteButton: {
            padding: '18px 25px',
            background: 'white',
            border: '2px solid #a67c52',
            borderRadius: '12px',
            fontSize: '24px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 5px 20px rgba(120, 94, 70, 0.16)'
        },
        favoriteButtonActive: {
            background: '#a67c52',
            borderColor: '#a67c52',
            transform: 'scale(1.05)'
        },
        calendarSection: {
            marginTop: '25px',
            padding: '20px',
            background: 'rgba(247, 250, 252, 0.9)',
            borderRadius: '15px',
            border: '1px solid #e2e8f0'
        },
        calendarTitle: {
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '10px',
            color: '#2d3748'
        },
        calendarLegend: {
            fontSize: '13px',
            color: '#718096',
            marginBottom: '10px'
        },
        calendarGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '6px',
            fontSize: '12px'
        },
        calendarDayHeader: {
            textAlign: 'center',
            fontWeight: '600',
            color: '#4a5568'
        },
        calendarDay: {
            height: '28px',
            borderRadius: '6px',
            textAlign: 'center',
            lineHeight: '28px',
            background: '#edf2f7',
            color: '#2d3748'
        },
        calendarDayBusy: {
            background: '#e9d8c5',
            color: '#7a5a3d',
            fontWeight: '700'
        },
        calendarDayToday: {
            border: '2px solid #a67c52'
        },
        recommendationsSection: {
            marginTop: '40px',
            padding: '25px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        },
        recommendationsTitle: {
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '15px',
            color: '#2d3748'
        },
        recommendationsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '15px'
        },
        recommendationCard: {
            background: '#f7fafc',
            borderRadius: '12px',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        },
        recommendationImage: {
            width: '100%',
            height: '150px',
            borderRadius: '10px',
            objectFit: 'cover',
            marginBottom: '8px'
        },
        recommendationTitle: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#2d3748',
            marginBottom: '4px'
        },
        recommendationPrice: {
            fontSize: '13px',
            color: '#4a5568',
            marginBottom: '4px'
        },
        recommendationMeta: {
            fontSize: '12px',
            color: '#718096'
        },
        detailsGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '30px'
        },
        detailItem: {
            padding: '15px',
            background: '#f4eadf',
            borderRadius: '10px'
        },
        detailLabel: {
            fontSize: '14px',
            color: '#718096',
            marginBottom: '5px'
        },
        detailValue: {
            fontSize: 'clamp(16px, 2vw, 18px)',
            fontWeight: '700',
            color: '#2d3748'
        }
    };

    // Добавляем медиа-запросы через inline стили с использованием window.innerWidth
    const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

    React.useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Адаптивные стили для контента
    const adaptiveContentStyle = {
        ...styles.content,
        gridTemplateColumns: windowWidth < 768 ? '1fr' : '1fr 1fr'
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Загрузка товара...</div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div style={styles.container}>
                <div style={styles.error}>
                    {error || 'Товар не найден'}
                </div>
            </div>
        );
    }

    const getStatusStyle = (status) => {
        const statusMap = {
            'available': styles.statusAvailable,
            'rented': styles.statusRented,
            'maintenance': styles.statusMaintenance
        };
        return { ...styles.status, ...(statusMap[status] || styles.statusAvailable) };
    };

    const getStatusText = (status) => {
        const statusMap = {
            'available': 'Доступен',
            'rented': 'Арендован',
            'maintenance': 'На обслуживании'
        };
        return statusMap[status] || status;
    };

    const buildBusyDatesSet = () => {
        const busy = new Set();
        availability.forEach(period => {
            if (!period.start_date || !period.end_date) return;
            const start = new Date(period.start_date);
            const end = new Date(period.end_date);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const iso = d.toISOString().slice(0, 10);
                busy.add(iso);
            }
        });
        return busy;
    };

    const renderAvailabilityCalendar = () => {
        if (availabilityLoading) {
            return <div style={styles.calendarLegend}>Загружаем календарь доступности...</div>;
        }

        if (!availability || availability.length === 0) {
            return <div style={styles.calendarLegend}>Пока нет активных аренд — товар свободен.</div>;
        }

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startWeekDay = (firstDay.getDay() + 6) % 7; // Понедельник = 0
        const daysInMonth = lastDay.getDate();
        const busyDates = buildBusyDatesSet();

        const cells = [];
        const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

        weekdays.forEach((day, index) => {
            cells.push(
                <div key={`h-${index}`} style={styles.calendarDayHeader}>
                    {day}
                </div>
            );
        });

        for (let i = 0; i < startWeekDay; i++) {
            cells.push(<div key={`e-${i}`} />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const current = new Date(year, month, day);
            const iso = current.toISOString().slice(0, 10);
            const isBusy = busyDates.has(iso);
            const isToday =
                current.getFullYear() === today.getFullYear() &&
                current.getMonth() === today.getMonth() &&
                current.getDate() === today.getDate();

            cells.push(
                <div
                    key={`d-${day}`}
                    style={{
                        ...styles.calendarDay,
                        ...(isBusy ? styles.calendarDayBusy : {}),
                        ...(isToday ? styles.calendarDayToday : {})
                    }}
                >
                    {day}
                </div>
            );
        }

        return (
            <>
                <div style={styles.calendarLegend}>
                    Красным отмечены даты, когда товар уже занят (ожидает подтверждения, подтверждён или в активной аренде).
                </div>
                <div style={styles.calendarGrid}>{cells}</div>
            </>
        );
    };

    const renderRecommendations = () => {
        if (recommendationsLoading) {
            return <div style={{ fontSize: '14px', color: '#718096' }}>Загружаем рекомендации...</div>;
        }

        const { similar, also_rented } = recommendations;
        if ((!similar || similar.length === 0) && (!also_rented || also_rented.length === 0)) {
            return <div style={{ fontSize: '14px', color: '#718096' }}>Пока нет рекомендаций для этого товара.</div>;
        }

        const renderGroup = (title, items) => {
            if (!items || items.length === 0) return null;
            return (
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ ...styles.recommendationsTitle, fontSize: '18px', marginBottom: '10px' }}>{title}</h4>
                    <div style={styles.recommendationsGrid}>
                        {items.map(rec => (
                            <div
                                key={rec.id}
                                style={styles.recommendationCard}
                                onClick={() => navigate(`/item/${rec.id}`)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <img
                                    src={getImageUrl(rec.image)}
                                    alt={rec.title}
                                    style={styles.recommendationImage}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/300x200/c7a17a/ffffff?text=%D0%A0%D0%B5%D0%BD%D1%82%D0%BB%D0%B8';
                                    }}
                                />
                                <div style={styles.recommendationTitle}>{rec.title}</div>
                                <div style={styles.recommendationPrice}>{rec.price_per_day} ₽/день</div>
                                <div style={styles.recommendationMeta}>
                                    {rec.category_name} • {rec.owner_username}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        };

        return (
            <>
                {renderGroup('Похожие товары', similar)}
                {renderGroup('Часто арендуют также', also_rented)}
            </>
        );
    };

    return (
        <div style={styles.container}>
            <button
                style={styles.backButton}
                onClick={() => navigate(-1)}
                onMouseEnter={(e) => {
                    e.target.style.transform = 'translateX(-5px)';
                    e.target.style.background = '#efe2d4';
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'translateX(0)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                }}
            >
                ← Назад
            </button>

            <div style={adaptiveContentStyle}>
                <div style={styles.imageSection}>
                    {mediaList.length > 1 && (
                        <div style={styles.mediaControls}>
                            <button style={styles.navButton} onClick={showPrevImage}>‹</button>
                            <span style={styles.mediaCounter}>{activeMediaIndex + 1} / {mediaList.length}</span>
                            <button style={styles.navButton} onClick={showNextImage}>›</button>
                        </div>
                    )}
                    <div style={styles.mediaStage}>
                        <img
                            src={mediaList[activeMediaIndex]}
                            alt={item.title}
                            style={styles.mainImage}
                            onClick={() => setIsImageModalOpen(true)}
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/600x400/c7a17a/ffffff?text=%D0%A0%D0%B5%D0%BD%D1%82%D0%BB%D0%B8';
                            }}
                        />
                    </div>
                    {mediaList.length > 1 && (
                        <div style={styles.thumbsRow}>
                            {mediaList.map((mediaUrl, idx) => (
                                <button
                                    key={idx}
                                    style={{
                                        ...styles.thumbButton,
                                        borderColor: idx === activeMediaIndex ? '#8c6a4f' : '#d8b99b'
                                    }}
                                    onClick={() => setActiveMediaIndex(idx)}
                                >
                                    <img src={mediaUrl} alt={`thumb-${idx}`} style={styles.thumbImage} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div style={styles.infoSection}>
                    <div>
                        <div style={getStatusStyle(item.status)}>
                            {getStatusText(item.status)}
                        </div>
                        <h1 style={styles.title}>{item.title}</h1>
                        <div style={styles.category}>
                            📂{' '}
                            <span
                                style={{ textDecoration: 'underline', cursor: 'pointer' }}
                                onClick={() => {
                                    if (item.category_name) {
                                        navigate(`/?category=${encodeURIComponent(item.category_name)}`);
                                    }
                                }}
                            >
                                {item.category_name || 'Без категории'}
                            </span>
                        </div>
                    </div>

                    <div style={styles.priceSection}>
                        <div style={styles.price}>{item.price_per_day} ₽/день</div>
                        {item.deposit > 0 && (
                            <div style={styles.deposit}>Залог: {item.deposit} ₽</div>
                        )}
                    </div>

                    <div style={styles.description}>
                        <h3 style={{ marginBottom: '15px', fontSize: '20px', color: '#2d3748' }}>
                            Описание
                        </h3>
                        {item.description || 'Описание отсутствует'}
                    </div>

                    <div style={styles.detailsGrid}>
                        <div style={styles.detailItem}>
                            <div style={styles.detailLabel}>Дата добавления</div>
                            <div style={styles.detailValue}>
                                {new Date(item.created_at).toLocaleDateString('ru-RU')}
                            </div>
                        </div>
                        <div style={styles.detailItem}>
                            <div style={styles.detailLabel}>ID товара</div>
                            <div style={styles.detailValue}>#{item.id}</div>
                        </div>
                    </div>

                    <div style={styles.ownerSection}>
                        <div style={styles.ownerTitle}>Владелец товара</div>
                        <div style={styles.ownerInfo}>
                            <div style={styles.ownerAvatar}>
                                {item.owner_avatar ? (
                                    <img
                                        src={item.owner_avatar}
                                        alt={item.owner_username || 'Владелец'}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                    />
                                ) : (
                                    (item.owner_username ? item.owner_username[0].toUpperCase() : 'U')
                                )}
                            </div>
                            <div style={styles.ownerDetails}>
                                <div style={styles.ownerName}>
                                    {item.owner_username || 'Неизвестно'}
                                </div>
                                <div style={styles.ownerRating}>
                                    ⭐ Рейтинг: {item.owner_rating || '5.0'} / 5.0
                                </div>
                                <div style={{ fontSize: '13px', color: '#7a5a3d', marginTop: '4px' }}>
                                    📍 Область: {item.owner_region || 'Не указана'}
                                </div>
                            </div>
                            <div style={styles.ownerActions}>
                                <button
                                    style={{
                                        ...styles.chatButton,
                                        ...(user && user.id === item.owner ? { opacity: 0.5, cursor: 'not-allowed' } : {})
                                    }}
                                    disabled={user && user.id === item.owner}
                                    onClick={() => {
                                        if (!user) {
                                            alert('Войдите в аккаунт, чтобы написать владельцу');
                                            return;
                                        }
                                        if (user.id === item.owner) return;
                                        setShowMessenger(true);
                                    }}
                                    title="Написать владельцу"
                                >
                                    💬 Написать
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={styles.calendarSection}>
                        <div style={styles.calendarTitle}>Календарь доступности</div>
                        {renderAvailabilityCalendar()}
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                        {item.status === 'available' && (
                            <button
                                style={{...styles.button, flex: 1}}
                                onClick={() => {
                                    if (user) {
                                        setShowRentalForm(true);
                                    } else {
                                        alert('Пожалуйста, войдите в систему для аренды товара');
                                    }
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 8px 25px rgba(120, 94, 70, 0.35)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 5px 20px rgba(120, 94, 70, 0.24)';
                                }}
                            >
                                🎯 Арендовать товар
                            </button>
                        )}
                        {user && (
                            <button
                                onClick={toggleFavorite}
                                style={{
                                    ...styles.favoriteButton,
                                    ...(isFavorite ? styles.favoriteButtonActive : {})
                                }}
                                title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                            >
                                {isFavorite ? '❤️' : '🤍'}
                            </button>
                        )}
                    </div>

                    {item.status !== 'available' && (
                        <div style={{
                            padding: '18px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '12px',
                            color: '#8b6f54',
                            textAlign: 'center',
                            fontWeight: '600'
                        }}>
                            Товар временно недоступен для аренды
                        </div>
                    )}
                </div>
            </div>

            {showRentalForm && (
                <RentalForm
                    item={item}
                    onClose={() => setShowRentalForm(false)}
                    onSuccess={() => {
                        setShowRentalForm(false);
                        fetchItem(); // Обновляем данные товара
                    }}
                />
            )}

            {showMessenger && item && (
                <Messenger
                    onClose={() => setShowMessenger(false)}
                    recipientId={item.owner}
                    recipientUsername={item.owner_username}
                />
            )}

            {item && (
                <>
                    {isImageModalOpen && (
                        <div
                            style={styles.imageModalOverlay}
                            onClick={() => setIsImageModalOpen(false)}
                        >
                            {mediaList.length > 1 && (
                                <>
                                    <button
                                        style={{ ...styles.modalNavButton, left: '24px' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            showPrevImage();
                                        }}
                                    >
                                        ‹
                                    </button>
                                    <button
                                        style={{ ...styles.modalNavButton, right: '24px' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            showNextImage();
                                        }}
                                    >
                                        ›
                                    </button>
                                </>
                            )}
                            <img
                                src={mediaList[activeMediaIndex]}
                                alt={item.title}
                                style={styles.imageModalContent}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}
                    <div style={styles.recommendationsSection}>
                        <h3 style={styles.recommendationsTitle}>Рекомендации</h3>
                        {renderRecommendations()}
                    </div>
                    <div style={{ marginTop: '40px', padding: '30px', background: 'white', borderRadius: '15px' }}>
                        <Reviews itemId={item.id} userId={item.owner} />
                    </div>
                </>
            )}
        </div>
    );
};

export default ItemDetail;

