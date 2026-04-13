import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RentalManagement = ({ onUpdate }) => {
    const { user } = useAuth();
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, confirmed, active, completed

    useEffect(() => {
        fetchRentals();
    }, [filter]);

    const fetchRentals = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/rentals/?as_owner=true', {
                withCredentials: true
            });
            let filteredRentals = response.data;
            
            if (filter !== 'all') {
                filteredRentals = filteredRentals.filter(r => r.status === filter);
            }
            
            setRentals(filteredRentals);
        } catch (error) {
            console.error('Ошибка загрузки аренд:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (rentalId) => {
        try {
            await axios.post(`http://localhost:8000/api/rentals/${rentalId}/confirm/`, {}, {
                withCredentials: true
            });
            fetchRentals();
            if (onUpdate) onUpdate();
        } catch (error) {
            alert(error.response?.data?.error || 'Ошибка при подтверждении аренды');
        }
    };

    const handleReject = async (rentalId) => {
        if (!window.confirm('Вы уверены, что хотите отклонить эту заявку?')) {
            return;
        }
        try {
            await axios.post(`http://localhost:8000/api/rentals/${rentalId}/reject/`, {}, {
                withCredentials: true
            });
            fetchRentals();
            if (onUpdate) onUpdate();
        } catch (error) {
            alert(error.response?.data?.error || 'Ошибка при отклонении аренды');
        }
    };

    const handleComplete = async (rentalId) => {
        if (!window.confirm('Завершить аренду?')) {
            return;
        }
        try {
            await axios.post(`http://localhost:8000/api/rentals/${rentalId}/complete/`, {}, {
                withCredentials: true
            });
            fetchRentals();
            if (onUpdate) onUpdate();
        } catch (error) {
            alert(error.response?.data?.error || 'Ошибка при завершении аренды');
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
        return <div style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</div>;
    }

    return (
        <div>
            {/* Фильтры */}
            <div style={styles.filters}>
                {['all', 'pending', 'confirmed', 'active', 'completed'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        style={{
                            ...styles.filterButton,
                            ...(filter === status ? styles.activeFilter : {})
                        }}
                    >
                        {status === 'all' ? 'Все' : 
                         status === 'pending' ? 'Ожидание' :
                         status === 'confirmed' ? 'Подтвержденные' :
                         status === 'active' ? 'Активные' : 'Завершенные'}
                    </button>
                ))}
            </div>

            {/* Список аренд */}
            {rentals.length === 0 ? (
                <div style={styles.emptyState}>
                    <p>Нет аренд с выбранным статусом</p>
                </div>
            ) : (
                rentals.map(rental => (
                    <div key={rental.id} style={styles.rentalCard}>
                        <div style={styles.rentalHeader}>
                            <div>
                                <h3 style={styles.itemTitle}>{rental.item_title}</h3>
                                <p style={styles.renterInfo}>Арендатор: {rental.renter_name}</p>
                            </div>
                            {getStatusBadge(rental.status)}
                        </div>
                        
                        <div style={styles.rentalDetails}>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Дата начала:</span>
                                <span>{formatDate(rental.start_date)}</span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Дата окончания:</span>
                                <span>{formatDate(rental.end_date)}</span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Стоимость:</span>
                                <span style={styles.price}>{rental.total_price} ₽</span>
                            </div>
                        </div>

                        {/* Кнопки управления */}
                        <div style={styles.actions}>
                            {rental.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => handleConfirm(rental.id)}
                                        style={styles.confirmButton}
                                    >
                                        ✓ Подтвердить
                                    </button>
                                    <button
                                        onClick={() => handleReject(rental.id)}
                                        style={styles.rejectButton}
                                    >
                                        ✕ Отклонить
                                    </button>
                                </>
                            )}
                            {(rental.status === 'confirmed' || rental.status === 'active') && (
                                <button
                                    onClick={() => handleComplete(rental.id)}
                                    style={styles.completeButton}
                                >
                                    ✓ Завершить
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

const styles = {
    filters: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap'
    },
    filterButton: {
        padding: '8px 16px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        background: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.3s'
    },
    activeFilter: {
        background: '#a67c52',
        color: 'white',
        borderColor: 'transparent'
    },
    rentalCard: {
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '15px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    rentalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '15px'
    },
    itemTitle: {
        margin: 0,
        fontSize: '18px',
        fontWeight: '600',
        color: '#2d3748'
    },
    renterInfo: {
        margin: '5px 0 0 0',
        fontSize: '14px',
        color: '#718096'
    },
    rentalDetails: {
        marginBottom: '15px',
        padding: '15px',
        background: '#f7fafc',
        borderRadius: '8px'
    },
    detailRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
        fontSize: '14px'
    },
    detailLabel: {
        fontWeight: '600',
        color: '#4a5568'
    },
    price: {
        fontWeight: '600',
        color: '#8a6442',
        fontSize: '16px'
    },
    actions: {
        display: 'flex',
        gap: '10px'
    },
    confirmButton: {
        padding: '10px 20px',
        background: '#8c6a4f',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px'
    },
    rejectButton: {
        padding: '10px 20px',
        background: '#b08968',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px'
    },
    completeButton: {
        padding: '10px 20px',
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
        padding: '40px',
        color: '#718096'
    }
};

export default RentalManagement;

