import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import ItemForm from './ItemForm';
import Messenger from './Messenger';
import Notifications from './Notifications';
import CategoriesMenu from './CategoriesMenu';
import HowItWorks from './HowItWorks';
import axios from 'axios';

const Header = ({ onItemAdded }) => {
    const { user, login, logout } = useAuth();
    const [authModalMode, setAuthModalMode] = useState(null);
    const [showItemForm, setShowItemForm] = useState(false);
    const [showMessenger, setShowMessenger] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
    const [showHowItWorks, setShowHowItWorks] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const navigate = useNavigate();

    const handleAuthSuccess = (userData) => {
        login(userData);
        setAuthModalMode(null);
    };

    const handleLogout = () => {
        logout();
    };

    const goToProfile = () => {
        navigate('/profile'); // Используем React Router навигацию
    };

    const goToHome = () => {
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const handleCategorySelect = (category) => {
        navigate(`/?category=${encodeURIComponent(category)}`);
    };

    const handleItemAdded = (newItem) => {
        setShowItemForm(false);
        if (onItemAdded) {
            onItemAdded(newItem);
        }
    };

    const getAvatarUrl = (avatar) => {
        if (!avatar) return null;
        if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
        return `http://localhost:8000${avatar}`;
    };

    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/notifications/unread_count/', {
                withCredentials: true
            });
            setUnreadNotificationsCount(response.data.count);
        } catch (error) {
            console.error('Ошибка загрузки количества уведомлений:', error);
        }
    }, []);

    // Добавляем медиа-стили для адаптивности
    useEffect(() => {
        const styleSheet = document.createElement('style');
        styleSheet.type = 'text/css';
        styleSheet.id = 'header-media-styles';
        styleSheet.textContent = `
            @media (max-width: 1200px) {
                .header-logo-section {
                    gap: 15px !important;
                }
                .header-search-container {
                    min-width: 200px !important;
                    max-width: 400px !important;
                }
            }
            @media (max-width: 768px) {
                .header-container {
                    padding: 12px 15px !important;
                    flex-direction: column !important;
                    align-items: stretch !important;
                }
                .header-logo-section {
                    width: 100% !important;
                    justify-content: space-between !important;
                }
                .header-search-container {
                    width: 100% !important;
                    max-width: 100% !important;
                    min-width: 100% !important;
                }
                .header-nav {
                    display: none !important;
                }
                .header-user-section {
                    width: 100% !important;
                    justify-content: center !important;
                    flex-wrap: wrap !important;
                }
                .header-profile {
                    width: 100% !important;
                    justify-content: center !important;
                }
            }
            @media (max-width: 480px) {
                .header-logo {
                    font-size: 22px !important;
                }
                .header-add-item-button {
                    font-size: 12px !important;
                    padding: 8px 12px !important;
                }
                .header-notification, .header-messages {
                    font-size: 12px !important;
                    padding: 6px 12px !important;
                }
            }
        `;
        if (!document.getElementById('header-media-styles')) {
            document.head.appendChild(styleSheet);
        }
        return () => {
            const existingStyle = document.getElementById('header-media-styles');
            if (existingStyle) {
                existingStyle.remove();
            }
        };
    }, []);

    // Загружаем количество непрочитанных уведомлений
    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            // Обновляем каждые 10 секунд
            const interval = setInterval(fetchUnreadCount, 10000);
            return () => clearInterval(interval);
        }
    }, [user, fetchUnreadCount]);

    return (
        <>
            <header style={styles.header} className="header-container">
                <div style={styles.logoSection} className="header-logo-section">
                    <div 
                        style={{...styles.logo, cursor: 'pointer'}} 
                        onClick={goToHome}
                        className="header-logo"
                    >
                        🎯 Рентли
                    </div>
                    
                    <form 
                        style={styles.searchContainer} 
                        className="header-search-container"
                        onSubmit={handleSearch}
                    >
                        <input 
                            type="text" 
                            placeholder="🔍 Искать товары..." 
                            style={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" style={styles.searchButton}>Найти</button>
                    </form>
                    
                    <nav style={styles.nav} className="header-nav">
                        <span 
                            style={{...styles.navLink, cursor: 'pointer'}}
                            onClick={goToHome}
                        >
                            Главная
                        </span>
                        <div 
                            style={{...styles.navLink, cursor: 'pointer', position: 'relative', display: 'inline-block'}}
                            onClick={() => setShowCategoriesMenu(prev => !prev)}
                        >
                            Категории
                            {showCategoriesMenu && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1501 }}>
                                    <CategoriesMenu
                                        onClose={() => setShowCategoriesMenu(false)}
                                        onCategorySelect={handleCategorySelect}
                                    />
                                </div>
                            )}
                        </div>
                        <span 
                            style={{...styles.navLink, cursor: 'pointer'}}
                            onClick={() => setShowHowItWorks(true)}
                        >
                            Как это работает
                        </span>
                    </nav>
                </div>
                
                <div style={styles.userSection} className="header-user-section">
                    {user ? (
                        <>
                            <button
                                onClick={() => setShowItemForm(true)}
                                style={styles.addItemButton}
                                title="Разместить товар для аренды"
                                className="header-add-item-button"
                            >
                                ➕ Сдать в аренду
                            </button>
                            <div 
                                style={styles.notification}
                                onClick={() => setShowNotifications(true)}
                                title="Уведомления"
                                className="header-notification"
                            >
                                Уведомления
                                {unreadNotificationsCount > 0 && (
                                    <span style={styles.badge}>{unreadNotificationsCount}</span>
                                )}
                            </div>
                            <div 
                                style={styles.messages}
                                onClick={() => setShowMessenger(true)}
                                title="Сообщения"
                                className="header-messages"
                            >
                                Сообщения
                            </div>
                            <div style={styles.profile} className="header-profile">
                                <div 
                                    style={{...styles.avatar, cursor: 'pointer'}}
                                    onClick={goToProfile}
                                >
                                    {getAvatarUrl(user.avatar) ? (
                                        <img
                                            src={getAvatarUrl(user.avatar)}
                                            alt={user.username}
                                            style={styles.avatarImage}
                                        />
                                    ) : (
                                        user.username[0].toUpperCase()
                                    )}
                                </div>
                                <div style={styles.userInfo}>
                                    <span 
                                        style={{...styles.userName, cursor: 'pointer'}}
                                        onClick={goToProfile}
                                    >
                                        {user.username}
                                    </span>
                                    <span style={styles.userRole}>
                                        👤 Пользователь
                                    </span>
                                </div>
                                <button onClick={handleLogout} style={styles.logoutButton}>
                                    Выйти
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={styles.authButtons}>
                            <button 
                                onClick={() => setAuthModalMode('login')}
                                style={styles.loginButton}
                            >
                                Войти
                            </button>
                            <button 
                                onClick={() => setAuthModalMode('register')}
                                style={styles.registerButton}
                            >
                                Регистрация
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <AuthModal 
                isOpen={authModalMode !== null}
                onClose={() => setAuthModalMode(null)}
                onAuthSuccess={handleAuthSuccess}
                initialMode={authModalMode}
            />

            {showItemForm && (
                <ItemForm
                    onSuccess={handleItemAdded}
                    onCancel={() => setShowItemForm(false)}
                />
            )}

            {showMessenger && (
                <Messenger
                    onClose={() => setShowMessenger(false)}
                />
            )}

            {showNotifications && (
                <Notifications
                    onClose={() => {
                        setShowNotifications(false);
                        fetchUnreadCount();
                    }}
                />
            )}

            {showHowItWorks && (
                <HowItWorks
                    onClose={() => setShowHowItWorks(false)}
                />
            )}
        </>
    );
};

// ... стили остаются прежними ...


// ... стили остаются такими же ...

const styles = {
    header: {
        width: '100%',
        background: '#f8f3ea',
        backdropFilter: 'blur(10px)',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 16px rgba(120, 94, 70, 0.12)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxSizing: 'border-box',
        flexWrap: 'wrap',
        gap: '15px'
    },
    logoSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap',
        flex: '1 1 auto',
        minWidth: '200px'
    },
    logo: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#6f4e37',
        whiteSpace: 'nowrap'
    },
    searchContainer: {
        display: 'flex',
        alignItems: 'center',
        background: '#fffaf3',
        border: '1px solid #eadfce',
        borderRadius: '25px',
        padding: '5px',
        boxShadow: '0 2px 10px rgba(120, 94, 70, 0.12)',
        minWidth: '250px',
        flex: '1 1 auto',
        maxWidth: '500px'
    },
    searchInput: {
        flex: 1,
        border: 'none',
        outline: 'none',
        background: '#ece7df',
        color: '#6f4e37',
        padding: '10px 20px',
        borderRadius: '25px',
        fontSize: '14px',
        minWidth: '150px'
    },
    searchButton: {
        background: '#a67c52',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '20px',
        cursor: 'pointer',
        fontWeight: '600'
    },
    nav: {
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap'
    },
    navLink: {
        textDecoration: 'none',
        color: '#6f4e37',
        fontWeight: '600',
        transition: 'color 0.3s ease',
        padding: '8px 16px',
        borderRadius: '8px',
        whiteSpace: 'nowrap',
        fontSize: '14px'
    },
    userSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        flexWrap: 'wrap',
        justifyContent: 'flex-end'
    },
    loading: {
        color: '#666',
        fontSize: '14px'
    },
    notification: {
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        padding: '8px 16px',
        borderRadius: '20px',
        transition: 'all 0.3s ease',
        color: '#7a5a3d',
        background: '#ede0d1',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    },
    messages: {
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        padding: '8px 16px',
        borderRadius: '20px',
        transition: 'all 0.3s ease',
        color: '#7a5a3d',
        background: '#ede0d1',
        display: 'flex',
        alignItems: 'center'
    },
    badge: {
        background: '#a67c52',
        color: 'white',
        borderRadius: '50%',
        minWidth: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: '600',
        padding: '0 6px'
    },
    profile: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        background: '#efe4d6',
        borderRadius: '20px',
        flexWrap: 'wrap'
    },
    avatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid #a67c52'
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
    },
    userName: {
        fontWeight: '600',
        color: '#2d3748',
        fontSize: '14px'
    },
    userRole: {
        fontSize: '12px',
        color: '#8a6442',
        fontWeight: '500'
    },
    logoutButton: {
        background: '#efe2d4',
        color: '#7a5a3d',
        border: '1px solid #a67c52',
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '600'
    },
    authButtons: {
        display: 'flex',
        gap: '10px'
    },
    loginButton: {
        background: 'transparent',
        color: '#7a5a3d',
        border: '2px solid #a67c52',
        padding: '8px 20px',
        borderRadius: '20px',
        cursor: 'pointer',
        fontWeight: '600'
    },
    registerButton: {
        background: '#a67c52',
        color: 'white',
        border: 'none',
        padding: '8px 20px',
        borderRadius: '20px',
        cursor: 'pointer',
        fontWeight: '600'
    },
    addItemButton: {
        background: '#8c6a4f',
        color: 'white',
        border: 'none',
        padding: '10px 16px',
        borderRadius: '20px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '13px',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 10px rgba(120, 94, 70, 0.24)',
        whiteSpace: 'nowrap'
    }
};


export default Header;