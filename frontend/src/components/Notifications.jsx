import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

const Notifications = ({ onClose }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
        // Обновляем уведомления каждые 5 секунд
        const interval = setInterval(() => {
            fetchNotifications();
            fetchUnreadCount();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(getApiUrl('/api/notifications/'), {
                withCredentials: true
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get(getApiUrl('/api/notifications/unread_count/'), {
                withCredentials: true
            });
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Ошибка загрузки количества непрочитанных:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.post(getApiUrl(`/api/notifications/${notificationId}/mark_read/`), {}, {
                withCredentials: true
            });
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            console.error('Ошибка пометки уведомления как прочитанного:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post(getApiUrl('/api/notifications/mark_all_read/'), {}, {
                withCredentials: true
            });
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            console.error('Ошибка пометки всех уведомлений:', error);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            'rental_request': '📋',
            'rental_confirmed': '✅',
            'rental_cancelled': '❌',
            'message': '💬',
            'rental_completed': '🎉'
        };
        return icons[type] || '🔔';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'только что';
        if (minutes < 60) return `${minutes} мин. назад`;
        if (hours < 24) return `${hours} ч. назад`;
        if (days < 7) return `${days} дн. назад`;
        return date.toLocaleDateString('ru-RU');
    };

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            padding: '20px'
        },
        modal: {
            background: 'white',
            borderRadius: '15px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden'
        },
        header: {
            padding: '20px',
            borderBottom: '2px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#8c6a4f',
            color: 'white'
        },
        headerActions: {
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
        },
        closeButton: {
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            width: '35px',
            height: '35px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        markAllButton: {
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600'
        },
        content: {
            flex: 1,
            overflowY: 'auto',
            padding: '10px'
        },
        notification: {
            padding: '15px',
            marginBottom: '10px',
            borderRadius: '12px',
            background: '#f8f9fa',
            border: '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            gap: '12px',
            position: 'relative'
        },
        notificationUnread: {
            background: '#efe2d4',
            borderColor: '#a67c52'
        },
        notificationIcon: {
            fontSize: '24px',
            flexShrink: 0
        },
        notificationContent: {
            flex: 1
        },
        notificationTitle: {
            fontWeight: '600',
            fontSize: '14px',
            color: '#333',
            marginBottom: '4px'
        },
        notificationMessage: {
            fontSize: '13px',
            color: '#666',
            lineHeight: '1.4'
        },
        notificationTime: {
            fontSize: '11px',
            color: '#999',
            marginTop: '6px'
        },
        unreadDot: {
            position: 'absolute',
            top: '15px',
            right: '15px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#a67c52'
        },
        emptyState: {
            padding: '40px 20px',
            textAlign: 'center',
            color: '#999'
        },
        loading: {
            padding: '40px',
            textAlign: 'center',
            color: '#999'
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={{ margin: 0 }}>Уведомления</h2>
                    <div style={styles.headerActions}>
                        {notifications.some(n => !n.is_read) && (
                            <button
                                style={styles.markAllButton}
                                onClick={markAllAsRead}
                            >
                                Отметить все как прочитанные
                            </button>
                        )}
                        <button style={styles.closeButton} onClick={onClose}>×</button>
                    </div>
                </div>
                <div style={styles.content}>
                    {loading ? (
                        <div style={styles.loading}>Загрузка...</div>
                    ) : notifications.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔔</div>
                            <div>Нет уведомлений</div>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                style={{
                                    ...styles.notification,
                                    ...(notification.is_read ? {} : styles.notificationUnread)
                                }}
                                onClick={() => !notification.is_read && markAsRead(notification.id)}
                            >
                                <div style={styles.notificationIcon}>
                                    {getNotificationIcon(notification.notification_type)}
                                </div>
                                <div style={styles.notificationContent}>
                                    <div style={styles.notificationTitle}>{notification.title}</div>
                                    <div style={styles.notificationMessage}>{notification.message}</div>
                                    <div style={styles.notificationTime}>
                                        {formatDate(notification.created_at)}
                                    </div>
                                </div>
                                {!notification.is_read && <div style={styles.unreadDot} />}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;

