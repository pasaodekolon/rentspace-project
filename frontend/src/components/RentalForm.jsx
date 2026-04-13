import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RentalForm = ({ item, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Стили для модального окна
    const modalStyles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        },
        modal: {
            background: '#8c6a4f',
            padding: '30px',
            borderRadius: '15px',
            width: '450px',
            maxWidth: '90%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            border: 'none'
        },
        title: {
            color: 'white',
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '20px',
            textAlign: 'center'
        },
        inputGroup: {
            marginBottom: '20px'
        },
        label: {
            display: 'block',
            color: 'white',
            marginBottom: '8px',
            fontWeight: '600'
        },
        input: {
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        },
        summary: {
            background: 'rgba(255,255,255,0.9)',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#2d3748'
        },
        buttonGroup: {
            display: 'flex',
            gap: '10px'
        },
        confirmButton: {
            flex: 1,
            background: '#a67c52',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.3s ease'
        },
        cancelButton: {
            background: '#b08968',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.3s ease'
        }
    };

    // Защита от undefined
    if (!item) {
        return (
            <div style={modalStyles.overlay}>
                <div style={modalStyles.modal}>
                    <p style={{color: 'white', textAlign: 'center'}}>Ошибка: товар не найден</p>
                    <button 
                        onClick={onClose}
                        style={modalStyles.cancelButton}
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        );
    }

    const calculateTotalPrice = () => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            return days * parseFloat(item.price_per_day);
        }
        return 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Проверяем авторизацию
        if (!user) {
            setError('Необходимо войти в систему для оформления аренды');
            setLoading(false);
            return;
        }

        try {
            const rentalData = {
                item: item.id,
                start_date: startDate,
                end_date: endDate,
                total_price: calculateTotalPrice()
            };

            await axios.post('http://localhost:8000/api/rentals/', rentalData, {
                withCredentials: true  // Отправляем cookies для аутентификации
            });
            
            alert('Заявка на аренду отправлена!');
            if (onSuccess) {
                onSuccess();
            }
            onClose();
        } catch (error) {
            console.error('Ошибка при создании аренды:', error);
            let errorMessage = 'Ошибка при отправке заявки';
            
            if (error.response) {
                const data = error.response.data;
                if (data.detail) {
                    errorMessage = data.detail;
                } else if (data.error) {
                    errorMessage = data.error;
                } else if (data.errors) {
                    const errorList = Object.entries(data.errors).map(([field, messages]) => {
                        const fieldName = {
                            'item': 'Товар',
                            'start_date': 'Дата начала',
                            'end_date': 'Дата окончания',
                            'total_price': 'Стоимость'
                        }[field] || field;
                        return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
                    });
                    errorMessage = errorList.join('\n');
                } else if (typeof data === 'object') {
                    const errorList = Object.entries(data).map(([field, messages]) => {
                        const fieldName = {
                            'item': 'Товар',
                            'start_date': 'Дата начала',
                            'end_date': 'Дата окончания',
                            'total_price': 'Стоимость'
                        }[field] || field;
                        return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
                    });
                    errorMessage = errorList.length > 0 ? errorList.join('\n') : errorMessage;
                }
            } else if (error.request) {
                errorMessage = 'Не удалось подключиться к серверу. Проверьте, запущен ли backend.';
            }
            
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const totalPrice = calculateTotalPrice();
    const days = totalPrice / parseFloat(item.price_per_day);

    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
                <h3 style={modalStyles.title}>Арендовать: {item.title}</h3>
                
                {error && (
                    <div style={{
                        backgroundColor: 'rgba(255, 0, 0, 0.2)',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '5px',
                        marginBottom: '15px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div style={modalStyles.inputGroup}>
                        <label style={modalStyles.label}>Дата начала:</label>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={modalStyles.input}
                            required
                        />
                    </div>
                    
                    <div style={modalStyles.inputGroup}>
                        <label style={modalStyles.label}>Дата окончания:</label>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={modalStyles.input}
                            required
                        />
                    </div>

                    {totalPrice > 0 && (
                        <div style={modalStyles.summary}>
                            <div style={{marginBottom: '8px'}}>
                                <strong>Количество дней:</strong> {days}
                            </div>
                            <div style={{marginBottom: '8px'}}>
                                <strong>Стоимость аренды:</strong> {totalPrice} ₽
                            </div>
                            <div style={{marginBottom: '8px'}}>
                                <strong>Залог:</strong> {item.deposit} ₽
                            </div>
                            <div style={{marginTop: '12px', paddingTop: '12px', borderTop: '2px solid #a67c52', fontWeight: 'bold', fontSize: '18px'}}>
                                <strong>Итого к оплате:</strong> {totalPrice + parseFloat(item.deposit)} ₽
                            </div>
                        </div>
                    )}

                    <div style={modalStyles.buttonGroup}>
                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{
                                ...modalStyles.confirmButton,
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                            onMouseEnter={(e) => !loading && (e.target.style.transform = 'scale(1.05)')}
                            onMouseLeave={(e) => !loading && (e.target.style.transform = 'scale(1)')}
                        >
                            {loading ? 'Отправка...' : 'Подтвердить аренду'}
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={onClose}
                            style={modalStyles.cancelButton}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RentalForm;