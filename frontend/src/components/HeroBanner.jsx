import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HeroBanner = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleStartRenting = () => {
        // Прокручиваем к каталогу товаров
        const itemList = document.querySelector('[data-item-list]');
        if (itemList) {
            itemList.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // Если каталог не найден, просто прокручиваем вниз
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        }
    };

    const handleBecomeOwner = () => {
        if (user) {
            // Если пользователь авторизован, переходим в профиль
            navigate('/profile');
        } else {
            // Если не авторизован, показываем сообщение
            alert('Пожалуйста, войдите в систему или зарегистрируйтесь, чтобы стать арендодателем');
        }
    };
    return (
        <div style={styles.hero}>
            <div style={styles.heroContent}>
                <h1 style={styles.heroTitle}>
                    Арендуй необычные вещи 
                    <span style={styles.heroHighlight}> для незабываемых моментов</span>
                </h1>
                <p style={styles.heroSubtitle}>
                    От костюмов супергероев до профессиональной техники — 
                    всё что нужно для твоих идей в аренду
                </p>
                
                <div style={styles.heroStats}>
                    <div style={styles.stat}>
                        <div style={styles.statNumber}>500+</div>
                        <div style={styles.statLabel}>товаров</div>
                    </div>
                    <div style={styles.stat}>
                        <div style={styles.statNumber}>1,200+</div>
                        <div style={styles.statLabel}>аренд</div>
                    </div>
                    <div style={styles.stat}>
                        <div style={styles.statNumber}>98%</div>
                        <div style={styles.statLabel}>довольных клиентов</div>
                    </div>
                </div>
                
                <div style={styles.heroButtons}>
                    <button 
                        style={styles.primaryButton}
                        onClick={handleStartRenting}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-3px)';
                            e.target.style.boxShadow = '0 8px 25px rgba(120, 94, 70, 0.35)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 5px 20px rgba(120, 94, 70, 0.28)';
                        }}
                    >
                        🎯 Начать арендовать
                    </button>
                    <button 
                        style={styles.secondaryButton}
                        onClick={handleBecomeOwner}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-3px)';
                            e.target.style.background = '#e8d9c8';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.background = '#f3e8dc';
                        }}
                    >
                        📦 Стать арендодателем
                    </button>
                </div>
            </div>
            
            <div style={styles.heroVisual}>
                <div style={styles.floatingItem}></div>
                <div style={styles.floatingItem}></div>
                <div style={styles.floatingItem}></div>
                <div style={styles.floatingItem}></div>
            </div>
        </div>
    );
};

const styles = {
    hero: {
        background: '#fbf7f1',
        borderRadius: '20px',
        padding: '50px',
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 10px 30px rgba(120, 94, 70, 0.12)',
        width: '100%',
        boxSizing: 'border-box'
    },
    heroContent: {
        flex: 1,
        maxWidth: '100%',
        paddingRight: '40px',
        boxSizing: 'border-box'
    },
    heroTitle: {
        fontSize: 'clamp(32px, 5vw, 48px)',
        fontWeight: '800',
        color: '#5f4630',
        lineHeight: '1.2',
        marginBottom: '20px',
        wordWrap: 'break-word',
        overflowWrap: 'break-word'
    },
    heroHighlight: {
        color: '#9a7046'
    },
    heroSubtitle: {
        fontSize: 'clamp(16px, 2vw, 18px)',
        color: '#7b624b',
        lineHeight: '1.6',
        marginBottom: '30px',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        maxWidth: '100%'
    },
    heroStats: {
        display: 'flex',
        gap: 'clamp(15px, 3vw, 30px)',
        marginBottom: '30px',
        flexWrap: 'wrap'
    },
    stat: {
        textAlign: 'center'
    },
    statNumber: {
        fontSize: 'clamp(24px, 4vw, 32px)',
        fontWeight: '800',
        color: '#8a6442',
        marginBottom: '5px'
    },
    statLabel: {
        fontSize: '14px',
        color: '#8d745d',
        fontWeight: '600'
    },
    heroButtons: {
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap'
    },
    primaryButton: {
        background: '#a67c52',
        color: 'white',
        border: 'none',
        padding: '15px 30px',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'transform 0.3s ease',
        boxShadow: '0 5px 20px rgba(120, 94, 70, 0.28)'
    },
    secondaryButton: {
        background: '#f3e8dc',
        color: '#7a5a3d',
        border: '2px solid #b08968',
        padding: '15px 30px',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    heroVisual: {
        position: 'relative',
        width: '300px',
        height: '200px',
        flexShrink: 0,
        display: 'none' // Скрываем визуальные элементы, чтобы текст занимал больше места
    },
    floatingItem: {
        position: 'absolute',
        fontSize: '40px',
        animation: 'float 3s ease-in-out infinite'
    }
};

export default HeroBanner;