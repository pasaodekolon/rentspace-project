import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

const Reviews = ({ itemId, userId }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        rating: 5,
        comment: ''
    });

    useEffect(() => {
        fetchReviews();
    }, [itemId, userId]);

    const fetchReviews = async () => {
        try {
            const url = itemId 
                ? getApiUrl(`/api/reviews/?item_id=${itemId}`)
                : getApiUrl(`/api/reviews/?user_id=${userId}`);
            const response = await axios.get(url, {
                withCredentials: true
            });
            setReviews(response.data);
        } catch (error) {
            console.error('Ошибка загрузки отзывов:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Необходимо войти в систему для оставления отзыва');
            return;
        }

        if (!userId) {
            alert('Не указан пользователь для отзыва');
            return;
        }

        try {
            const reviewData = {
                reviewed_user: userId,
                rating: formData.rating,
                comment: formData.comment
            };

            // Добавляем item только если он указан
            if (itemId) {
                reviewData.item = itemId;
            }

            await axios.post(getApiUrl('/api/reviews/'), reviewData, {
                withCredentials: true
            });

            setFormData({ rating: 5, comment: '' });
            setShowForm(false);
            fetchReviews();
        } catch (error) {
            console.error('Ошибка создания отзыва:', error);
            let errorMessage = 'Ошибка при создании отзыва';
            
            if (error.response) {
                const data = error.response.data;
                if (data.detail) {
                    errorMessage = data.detail;
                } else if (data.error) {
                    errorMessage = data.error;
                } else if (data.errors) {
                    const errorList = Object.entries(data.errors).map(([field, messages]) => {
                        const fieldName = {
                            'reviewed_user': 'Пользователь',
                            'item': 'Товар',
                            'rating': 'Оценка',
                            'comment': 'Комментарий'
                        }[field] || field;
                        return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
                    });
                    errorMessage = errorList.join('\n');
                } else if (typeof data === 'object') {
                    const errorList = Object.entries(data).map(([field, messages]) => {
                        const fieldName = {
                            'reviewed_user': 'Пользователь',
                            'item': 'Товар',
                            'rating': 'Оценка',
                            'comment': 'Комментарий'
                        }[field] || field;
                        return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
                    });
                    errorMessage = errorList.length > 0 ? errorList.join('\n') : errorMessage;
                }
            } else if (error.request) {
                errorMessage = 'Не удалось подключиться к серверу. Проверьте, запущен ли backend.';
            }
            
            alert(errorMessage);
        }
    };

    const styles = {
        container: {
            marginTop: '30px'
        },
        title: {
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '20px',
            color: '#2d3748'
        },
        reviewCard: {
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '15px',
            border: '1px solid #e9ecef'
        },
        reviewHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
        },
        reviewerName: {
            fontWeight: '600',
            color: '#2d3748',
            fontSize: '16px'
        },
        reviewDate: {
            fontSize: '12px',
            color: '#999'
        },
        rating: {
            color: '#8a6442',
            fontSize: '18px',
            marginBottom: '8px'
        },
        comment: {
            color: '#4a5568',
            lineHeight: '1.6',
            fontSize: '14px'
        },
        addReviewButton: {
            background: '#a67c52',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '20px'
        },
        form: {
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '2px solid #e9ecef'
        },
        formGroup: {
            marginBottom: '15px'
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#2d3748'
        },
        textarea: {
            width: '100%',
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            minHeight: '100px',
            fontFamily: 'inherit',
            resize: 'vertical'
        },
        ratingInput: {
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
        },
        starButton: {
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '5px'
        },
        submitButton: {
            background: '#a67c52',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            marginRight: '10px'
        },
        cancelButton: {
            background: '#f0f0f0',
            color: '#333',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
        }
    };

    if (loading) {
        return <div>Загрузка отзывов...</div>;
    }

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>Отзывы {reviews.length > 0 && `(${reviews.length})`}</h3>
            
            {user && !showForm && (
                <button
                    style={styles.addReviewButton}
                    onClick={() => setShowForm(true)}
                >
                    ✍️ Оставить отзыв
                </button>
            )}

            {showForm && (
                <form style={styles.form} onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Оценка</label>
                        <div style={styles.ratingInput}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    style={styles.starButton}
                                    onClick={() => setFormData({...formData, rating: star})}
                                >
                                    {star <= formData.rating ? '⭐' : '☆'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Комментарий</label>
                        <textarea
                            style={styles.textarea}
                            value={formData.comment}
                            onChange={(e) => setFormData({...formData, comment: e.target.value})}
                            placeholder="Опишите ваш опыт..."
                            required
                        />
                    </div>
                    <div>
                        <button type="submit" style={styles.submitButton}>
                            Отправить отзыв
                        </button>
                        <button
                            type="button"
                            style={styles.cancelButton}
                            onClick={() => {
                                setShowForm(false);
                                setFormData({ rating: 5, comment: '' });
                            }}
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            )}

            {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    Пока нет отзывов. Будьте первым!
                </div>
            ) : (
                reviews.map(review => (
                    <div key={review.id} style={styles.reviewCard}>
                        <div style={styles.reviewHeader}>
                            <div>
                                <div style={styles.reviewerName}>{review.reviewer_username}</div>
                                <div style={styles.reviewDate}>
                                    {new Date(review.created_at).toLocaleDateString('ru-RU')}
                                </div>
                            </div>
                            <div style={styles.rating}>
                                {'⭐'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            </div>
                        </div>
                        <div style={styles.comment}>{review.comment}</div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Reviews;

