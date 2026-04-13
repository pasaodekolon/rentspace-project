import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import EditProfile from './EditProfile';
import RentalManagement from './RentalManagement';
import Favorites from './Favorites';
import axios from 'axios';
import { getApiUrl, getMediaUrl } from '../config/api';

const Profile = () => {
    const { user, loading, login } = useAuth();
    
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('activeProfileTab');
        return savedTab || 'profile';
    });
    
    const [userRentals, setUserRentals] = useState([]);
    const [userItems, setUserItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [savingItem, setSavingItem] = useState(false);
    const [itemActionError, setItemActionError] = useState('');

    useEffect(() => {
        localStorage.setItem('activeProfileTab', activeTab);
    }, [activeTab]);

    useEffect(() => {
        if (user) {
            fetchUserData();
            fetchCategories();
        }
    }, [user]);

    const fetchUserData = async () => {
        setDataLoading(true);
        try {
            const rentalsResponse = await axios.get(getApiUrl('/api/auth/my-rentals/'), {
                withCredentials: true
            });
            if (rentalsResponse.data.success) {
                setUserRentals(rentalsResponse.data.rentals);
            }
            
            const itemsResponse = await axios.get(getApiUrl('/api/auth/my-items/'), {
                withCredentials: true
            });
            if (itemsResponse.data.success) {
                setUserItems(itemsResponse.data.items);
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            if (error.response?.status === 401) {
                setUserRentals([]);
                setUserItems([]);
            }
        } finally {
            setDataLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(getApiUrl('/api/categories/'));
            setCategories(response.data || []);
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
        }
    };

    const openEditItem = (item) => {
        setItemActionError('');
        setEditingItem({
            id: item.id,
            title: item.title || '',
            description: item.description || '',
            price_per_day: item.price_per_day || '',
            deposit: item.deposit || '',
            category: item.category || ''
        });
    };

    const closeEditItem = () => {
        setEditingItem(null);
        setItemActionError('');
    };

    const handleEditItemChange = (e) => {
        const { name, value } = e.target;
        setEditingItem(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const saveEditedItem = async (e) => {
        e.preventDefault();
        if (!editingItem) return;
        setSavingItem(true);
        setItemActionError('');
        try {
            await axios.patch(
                getApiUrl(`/api/items/${editingItem.id}/`),
                {
                    title: editingItem.title,
                    description: editingItem.description,
                    price_per_day: editingItem.price_per_day,
                    deposit: editingItem.deposit || 0,
                    category: editingItem.category
                },
                { withCredentials: true }
            );
            closeEditItem();
            fetchUserData();
        } catch (error) {
            console.error('Ошибка обновления товара:', error);
            setItemActionError(error.response?.data?.detail || 'Не удалось сохранить изменения товара');
        } finally {
            setSavingItem(false);
        }
    };

    const handleDeleteItem = async (itemId) => {
        const firstConfirmation = window.confirm('Удалить товар? Это действие можно будет отменить только вручную через новый товар.');
        if (!firstConfirmation) return;

        const secondConfirmation = window.confirm('Подтвердите ещё раз удаление. Товар будет удалён окончательно.');
        if (!secondConfirmation) return;

        try {
            await axios.delete(getApiUrl(`/api/items/${itemId}/`), {
                withCredentials: true
            });
            fetchUserData();
        } catch (error) {
            console.error('Ошибка удаления товара:', error);
            alert(error.response?.data?.detail || 'Не удалось удалить товар');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { text: 'Ожидание', color: '#7a5a3d', bg: '#f4eadf' },
            'confirmed': { text: 'Подтверждена', color: '#8a6442', bg: '#efe2d4' },
            'active': { text: 'Активна', color: '#6f4e37', bg: '#eadbc9' },
            'completed': { text: 'Завершена', color: '#6b5a49', bg: '#f3ece3' },
            'cancelled': { text: 'Отменена', color: '#8b6f54', bg: '#efe4d8' }
        };
        
        const config = statusConfig[status] || { text: status, color: '#6b7280', bg: '#f3f4f6' };
        return (
            <span style={{
                background: config.bg,
                color: config.color,
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                border: `1px solid ${config.color}20`
            }}>
                {config.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingContainer}>
                    <div style={styles.loader}></div>
                    <p>Загрузка профиля...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={styles.container}>
                <div style={styles.errorContainer}>
                    <h2>Пожалуйста, войдите в систему</h2>
                    <p>Чтобы просмотреть личный кабинет, необходимо авторизоваться</p>
                </div>
            </div>
        );
    }

    const handleProfileUpdate = (updatedUser) => {
        login(updatedUser);
        window.location.reload();
    };

    const getAvatarUrl = (avatar) => {
        if (!avatar) return null;
        return getMediaUrl(avatar);
    };

    return (
        <div style={styles.container}>
            {showEditProfile && (
                <EditProfile
                    user={user}
                    onClose={() => setShowEditProfile(false)}
                    onUpdate={handleProfileUpdate}
                />
            )}
            {editingItem && (
                <div style={styles.modalOverlay} onClick={closeEditItem}>
                    <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, color: '#2d3748' }}>Редактировать товар</h3>
                        {itemActionError && (
                            <div style={styles.itemActionError}>{itemActionError}</div>
                        )}
                        <form onSubmit={saveEditedItem} style={styles.itemForm}>
                            <input
                                name="title"
                                value={editingItem.title}
                                onChange={handleEditItemChange}
                                style={styles.itemFormInput}
                                placeholder="Название"
                                required
                            />
                            <textarea
                                name="description"
                                value={editingItem.description}
                                onChange={handleEditItemChange}
                                style={styles.itemFormTextarea}
                                placeholder="Описание"
                                required
                            />
                            <div style={styles.itemFormRow}>
                                <input
                                    type="number"
                                    name="price_per_day"
                                    value={editingItem.price_per_day}
                                    onChange={handleEditItemChange}
                                    style={styles.itemFormInput}
                                    placeholder="Цена за день"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                                <input
                                    type="number"
                                    name="deposit"
                                    value={editingItem.deposit}
                                    onChange={handleEditItemChange}
                                    style={styles.itemFormInput}
                                    placeholder="Залог"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <select
                                name="category"
                                value={editingItem.category}
                                onChange={handleEditItemChange}
                                style={styles.itemFormInput}
                                required
                            >
                                <option value="">Выберите категорию</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <div style={styles.itemFormActions}>
                                <button type="submit" style={styles.editButton} disabled={savingItem}>
                                    {savingItem ? 'Сохранение...' : 'Сохранить'}
                                </button>
                                <button type="button" style={styles.deleteButton} onClick={closeEditItem}>
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Header с градиентом */}
            <div style={styles.header}>
                <div style={styles.headerContent}>
                    <div style={styles.avatarSection}>
                        <div style={styles.avatar}>
                            {getAvatarUrl(user.avatar) ? (
                                <img src={getAvatarUrl(user.avatar)} alt={user.username} style={styles.avatarImage} />
                            ) : (
                                user.username[0].toUpperCase()
                            )}
                        </div>
                        <div style={styles.userInfo}>
                            <h1 style={styles.userName}>{user.username}</h1>
                            <div style={styles.roleBadge}>
                                👤 Пользователь
                            </div>
                        </div>
                    </div>
                    <div style={styles.statsSection}>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>{userRentals.length}</div>
                            <div style={styles.statLabel}>Аренд</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>{userItems.length}</div>
                            <div style={styles.statLabel}>Товаров</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>⭐ {user.rating || '5.00'}</div>
                            <div style={styles.statLabel}>Рейтинг</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Навигационные вкладки */}
            <div style={styles.tabsContainer}>
                <button 
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'profile' ? styles.activeTab : {})
                    }}
                    onClick={() => setActiveTab('profile')}
                >
                    <span style={styles.tabIcon}>👤</span>
                    Профиль
                </button>
                <button 
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'rentals' ? styles.activeTab : {})
                    }}
                    onClick={() => setActiveTab('rentals')}
                >
                    <span style={styles.tabIcon}>📋</span>
                    Мои аренды
                </button>
                <button 
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'items' ? styles.activeTab : {})
                    }}
                    onClick={() => setActiveTab('items')}
                >
                    <span style={styles.tabIcon}>📦</span>
                    Мои товары
                </button>
                <button 
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'rental-management' ? styles.activeTab : {})
                    }}
                    onClick={() => setActiveTab('rental-management')}
                >
                    <span style={styles.tabIcon}>⚙️</span>
                    Управление арендами
                </button>
                <button 
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'statistics' ? styles.activeTab : {})
                    }}
                    onClick={() => setActiveTab('statistics')}
                >
                    <span style={styles.tabIcon}>📊</span>
                    Статистика
                </button>
                <button 
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'favorites' ? styles.activeTab : {})
                    }}
                    onClick={() => setActiveTab('favorites')}
                >
                    <span style={styles.tabIcon}>🤍</span>
                    Избранное
                </button>
            </div>

            {/* Контент */}
            <div style={styles.content}>
                {dataLoading ? (
                    <div style={styles.loadingContainer}>
                        <div style={styles.loader}></div>
                        <p>Загрузка данных...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'profile' && (
                            <div style={styles.tabContent}>
                                <div style={styles.card}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <h2 style={styles.cardTitle}>Информация о профиле</h2>
                                        <button
                                            onClick={() => setShowEditProfile(true)}
                                            style={styles.editProfileButton}
                                        >
                                            ✏️ Редактировать
                                        </button>
                                    </div>
                                    <div style={styles.infoGrid}>
                                        <div style={styles.infoItem}>
                                            <div style={styles.infoLabel}>Имя пользователя</div>
                                            <div style={styles.infoValue}>{user.username}</div>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <div style={styles.infoLabel}>Email</div>
                                            <div style={styles.infoValue}>{user.email || 'Не указан'}</div>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <div style={styles.infoLabel}>Телефон</div>
                                            <div style={styles.infoValue}>{user.phone || 'Не указан'}</div>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <div style={styles.infoLabel}>Область</div>
                                            <div style={styles.infoValue}>{user.region || 'Не указана'}</div>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <div style={styles.infoLabel}>Рейтинг</div>
                                            <div style={styles.infoValue}>
                                                <span style={styles.rating}>⭐ {user.rating || '5.00'}/5.00</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'rentals' && (
                            <div style={styles.tabContent}>
                                <div style={styles.card}>
                                    <h2 style={styles.cardTitle}>История аренд</h2>
                                    {userRentals.length === 0 ? (
                                        <div style={styles.emptyState}>
                                            <div style={styles.emptyIcon}>📋</div>
                                            <h3>У вас пока нет аренд</h3>
                                            <p>Начните арендовать товары прямо сейчас!</p>
                                            <button 
                                                style={styles.primaryButton}
                                                onClick={() => window.location.href = '/'}
                                            >
                                                Перейти к каталогу
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={styles.rentalsGrid}>
                                            {userRentals.map(rental => (
                                                <div key={rental.id} style={styles.rentalCard}>
                                                    <div style={styles.rentalHeader}>
                                                        <h3 style={styles.rentalTitle}>{rental.item_title}</h3>
                                                        {getStatusBadge(rental.status)}
                                                    </div>
                                                    <div style={styles.rentalDetails}>
                                                        <div style={styles.detailItem}>
                                                            <span style={styles.detailIcon}>📅</span>
                                                            <div>
                                                                <div style={styles.detailLabel}>Период аренды</div>
                                                                <div style={styles.detailValue}>
                                                                    {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={styles.detailItem}>
                                                            <span style={styles.detailIcon}>💰</span>
                                                            <div>
                                                                <div style={styles.detailLabel}>Стоимость</div>
                                                                <div style={styles.detailValue}>{rental.total_price} ₽</div>
                                                            </div>
                                                        </div>
                                                        <div style={styles.detailItem}>
                                                            <span style={styles.detailIcon}>🕐</span>
                                                            <div>
                                                                <div style={styles.detailLabel}>Создано</div>
                                                                <div style={styles.detailValue}>{formatDate(rental.created_at)}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'items' && (
                            <div style={styles.tabContent}>
                                <div style={styles.card}>
                                    <h2 style={styles.cardTitle}>Мои товары для аренды</h2>
                                    {userItems.length === 0 ? (
                                        <div style={styles.emptyState}>
                                            <div style={styles.emptyIcon}>📦</div>
                                            <h3>У вас пока нет товаров</h3>
                                            <p>Добавьте первый товар для аренды</p>
                                            <button style={styles.primaryButton}>
                                                Добавить товар
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={styles.itemsGrid}>
                                            {userItems.map(item => (
                                                <div key={item.id} style={styles.itemCard}>
                                                    {item.image && (
                                                        <div style={styles.itemImageContainer}>
                                                            <img 
                                                                src={getMediaUrl(item.image)}
                                                                alt={item.title}
                                                                style={styles.itemImage}
                                                            />
                                                        </div>
                                                    )}
                                                    <div style={styles.itemContent}>
                                                        <h3 style={styles.itemTitle}>{item.title}</h3>
                                                        <p style={styles.itemDescription}>{item.description}</p>
                                                        <div style={styles.itemMeta}>
                                                            <div style={styles.itemPrice}>
                                                                <span style={styles.priceLabel}>Цена:</span>
                                                                <span style={styles.priceValue}>{item.price_per_day} ₽/день</span>
                                                            </div>
                                                            <div style={styles.itemDeposit}>
                                                                <span style={styles.depositLabel}>Залог:</span>
                                                                <span style={styles.depositValue}>{item.deposit} ₽</span>
                                                            </div>
                                                        </div>
                                                        <div style={styles.itemStatus}>
                                                            <span style={{
                                                                ...styles.statusBadge,
                                                                background: item.status === 'available' ? '#eadbc9' : '#efe4d8',
                                                                color: item.status === 'available' ? '#6f4e37' : '#8b6f54'
                                                            }}>
                                                                {item.status === 'available' ? '✅ Доступен' : '⛔ Занят'}
                                                            </span>
                                                        </div>
                                                        <div style={styles.itemActions}>
                                                            <button
                                                                style={styles.editButton}
                                                                onClick={() => openEditItem(item)}
                                                            >
                                                                ✏️ Редактировать
                                                            </button>
                                                            <button
                                                                style={styles.deleteButton}
                                                                onClick={() => handleDeleteItem(item.id)}
                                                            >
                                                                🗑️ Удалить
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'rental-management' && (
                            <div style={styles.tabContent}>
                                <div style={styles.card}>
                                    <h2 style={styles.cardTitle}>Управление арендами</h2>
                                    <RentalManagement onUpdate={fetchUserData} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'statistics' && (
                            <StatisticsTab />
                        )}

                        {activeTab === 'favorites' && (
                            <div style={styles.tabContent}>
                                <div style={styles.card}>
                                    <h2 style={styles.cardTitle}>Избранное</h2>
                                    <Favorites />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Компонент статистики
const StatisticsTab = () => {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            const response = await axios.get(getApiUrl('/api/auth/statistics/'), {
                withCredentials: true
            });
            if (response.data.success) {
                setStatistics(response.data.statistics);
            }
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Загрузка статистики...</div>;
    }

    if (!statistics) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Не удалось загрузить статистику</div>;
    }

    return (
        <div style={styles.tabContent}>
            <div style={styles.card}>
                <h2 style={styles.cardTitle}>Статистика</h2>
                <div style={styles.statsGrid}>
                    <div style={styles.statisticsCard}>
                        <div style={styles.statisticsIcon}>📦</div>
                        <div style={styles.statisticsValue}>{statistics.items.total}</div>
                        <div style={styles.statisticsLabel}>Всего товаров</div>
                        <div style={styles.statisticsSub}>
                            <span>Доступно: {statistics.items.available}</span>
                            <span>Арендовано: {statistics.items.rented}</span>
                        </div>
                    </div>
                    <div style={styles.statisticsCard}>
                        <div style={styles.statisticsIcon}>📋</div>
                        <div style={styles.statisticsValue}>{statistics.rentals.total}</div>
                        <div style={styles.statisticsLabel}>Всего аренд</div>
                        <div style={styles.statisticsSub}>
                            <span>Ожидание: {statistics.rentals.pending}</span>
                            <span>Активные: {statistics.rentals.active}</span>
                            <span>Завершено: {statistics.rentals.completed}</span>
                        </div>
                    </div>
                    <div style={styles.statisticsCard}>
                        <div style={styles.statisticsIcon}>💰</div>
                        <div style={styles.statisticsValue}>{statistics.revenue.total.toLocaleString()} ₽</div>
                        <div style={styles.statisticsLabel}>Общий доход</div>
                    </div>
                    <div style={styles.statisticsCard}>
                        <div style={styles.statisticsIcon}>⭐</div>
                        <div style={styles.statisticsValue}>{statistics.rating}</div>
                        <div style={styles.statisticsLabel}>Рейтинг</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: '#f5efe6',
        padding: '20px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        color: '#666'
    },
    loader: {
        width: '50px',
        height: '50px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #a67c52',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
    },
    errorContainer: {
        textAlign: 'center',
        padding: '60px 20px',
        background: 'white',
        borderRadius: '15px',
        maxWidth: '600px',
        margin: '40px auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    },
    header: {
        background: '#8c6a4f',
        borderRadius: '20px',
        padding: '40px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(120, 94, 70, 0.2)',
        color: 'white'
    },
    headerContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '30px'
    },
    avatarSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    avatar: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        overflow: 'hidden',
        background: '#efe2d4',
        color: '#7a5a3d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '40px',
        fontWeight: 'bold',
        border: '4px solid #d8b99b',
        boxShadow: '0 6px 18px rgba(120,94,70,0.18)'
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '50%',
        display: 'block'
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    userName: {
        margin: 0,
        fontSize: '32px',
        fontWeight: '700'
    },
    roleBadge: {
        background: 'rgba(255,255,255,0.2)',
        padding: '6px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        backdropFilter: 'blur(10px)'
    },
    statsSection: {
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap'
    },
    statCard: {
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(10px)',
        padding: '20px 30px',
        borderRadius: '15px',
        textAlign: 'center',
        minWidth: '120px',
        border: '1px solid rgba(255,255,255,0.2)'
    },
    statValue: {
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '5px'
    },
    statLabel: {
        fontSize: '14px',
        opacity: 0.9
    },
    tabsContainer: {
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        background: 'white',
        padding: '10px',
        borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        flexWrap: 'wrap'
    },
    tab: {
        background: 'transparent',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        color: '#666',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    activeTab: {
        background: '#a67c52',
        color: 'white',
        boxShadow: '0 4px 15px rgba(120, 94, 70, 0.25)'
    },
    tabIcon: {
        fontSize: '20px'
    },
    content: {
        maxWidth: '1200px',
        margin: '0 auto'
    },
    tabContent: {
        // Анимация будет через CSS класс
    },
    card: {
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
    },
    cardTitle: {
        margin: '0 0 30px 0',
        fontSize: '28px',
        color: '#2d3748',
        fontWeight: '700'
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
    },
    infoItem: {
        padding: '20px',
        background: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e9ecef'
    },
    infoLabel: {
        fontSize: '12px',
        color: '#6c757d',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '8px'
    },
    infoValue: {
        fontSize: '18px',
        color: '#2d3748',
        fontWeight: '600'
    },
    rating: {
        color: '#8a6442',
        fontSize: '20px'
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px',
        color: '#666'
    },
    emptyIcon: {
        fontSize: '80px',
        marginBottom: '20px'
    },
    primaryButton: {
        background: '#a67c52',
        color: 'white',
        border: 'none',
        padding: '14px 32px',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        marginTop: '20px',
        boxShadow: '0 4px 15px rgba(120, 94, 70, 0.25)',
        transition: 'all 0.3s ease'
    },
    rentalsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '25px'
    },
    rentalCard: {
        background: '#f8f9fa',
        borderRadius: '15px',
        padding: '25px',
        border: '1px solid #e9ecef',
        transition: 'all 0.3s ease'
    },
    rentalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        gap: '15px'
    },
    rentalTitle: {
        margin: 0,
        fontSize: '20px',
        color: '#2d3748',
        fontWeight: '700',
        flex: 1
    },
    rentalDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    detailItem: {
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start'
    },
    detailIcon: {
        fontSize: '20px',
        marginTop: '2px'
    },
    detailLabel: {
        fontSize: '12px',
        color: '#6c757d',
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: '4px'
    },
    detailValue: {
        fontSize: '16px',
        color: '#2d3748',
        fontWeight: '600'
    },
    itemsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '25px'
    },
    itemCard: {
        background: '#f8f9fa',
        borderRadius: '15px',
        overflow: 'hidden',
        border: '1px solid #e9ecef',
        transition: 'all 0.3s ease'
    },
    itemImageContainer: {
        width: '100%',
        height: '200px',
        overflow: 'hidden',
        background: '#e9ecef'
    },
    itemImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    itemContent: {
        padding: '20px'
    },
    itemTitle: {
        margin: '0 0 10px 0',
        fontSize: '20px',
        color: '#2d3748',
        fontWeight: '700'
    },
    itemDescription: {
        margin: '0 0 15px 0',
        color: '#666',
        fontSize: '14px',
        lineHeight: '1.6'
    },
    itemMeta: {
        display: 'flex',
        gap: '15px',
        marginBottom: '15px',
        flexWrap: 'wrap'
    },
    itemPrice: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    priceLabel: {
        fontSize: '12px',
        color: '#6c757d'
    },
    priceValue: {
        fontSize: '18px',
        color: '#8a6442',
        fontWeight: '700'
    },
    itemDeposit: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    depositLabel: {
        fontSize: '12px',
        color: '#6c757d'
    },
    depositValue: {
        fontSize: '18px',
        color: '#8a6442',
        fontWeight: '700'
    },
    itemStatus: {
        marginBottom: '15px'
    },
    statusBadge: {
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block'
    },
    itemActions: {
        display: 'flex',
        gap: '10px'
    },
    editButton: {
        flex: 1,
        background: '#8c6a4f',
        color: 'white',
        border: 'none',
        padding: '10px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.3s ease'
    },
    deleteButton: {
        flex: 1,
        background: '#b08968',
        color: 'white',
        border: 'none',
        padding: '10px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.3s ease'
    },
    editProfileButton: {
        background: '#a67c52',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(120, 94, 70, 0.25)'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginTop: '20px'
    },
    statisticsCard: {
        background: '#8c6a4f',
        padding: '30px',
        borderRadius: '15px',
        textAlign: 'center',
        color: 'white',
        boxShadow: '0 10px 24px rgba(120, 94, 70, 0.2)'
    },
    statisticsIcon: {
        fontSize: '48px',
        marginBottom: '15px'
    },
    statisticsValue: {
        fontSize: '36px',
        fontWeight: '700',
        marginBottom: '10px'
    },
    statisticsLabel: {
        fontSize: '16px',
        opacity: 0.9,
        marginBottom: '10px'
    },
    statisticsSub: {
        fontSize: '14px',
        opacity: 0.8,
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        marginTop: '10px'
    },
    modalOverlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
    },
    modalCard: {
        background: 'white',
        borderRadius: '14px',
        width: '100%',
        maxWidth: '620px',
        padding: '20px',
        boxShadow: '0 12px 30px rgba(0,0,0,0.2)'
    },
    itemActionError: {
        background: '#fee',
        color: '#c33',
        borderRadius: '8px',
        padding: '10px',
        marginBottom: '12px',
        fontSize: '14px'
    },
    itemForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    itemFormRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px'
    },
    itemFormInput: {
        width: '100%',
        border: '1px solid #d8c7b4',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '14px',
        boxSizing: 'border-box'
    },
    itemFormTextarea: {
        width: '100%',
        border: '1px solid #d8c7b4',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '14px',
        minHeight: '90px',
        boxSizing: 'border-box',
        resize: 'vertical'
    },
    itemFormActions: {
        display: 'flex',
        gap: '10px',
        marginTop: '8px'
    }
};

export default Profile;
