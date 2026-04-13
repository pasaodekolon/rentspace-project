import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

const ItemForm = ({ onSuccess, onCancel }) => {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price_per_day: '',
        deposit: '',
        category: '',
        image: null
    });
    const [mediaFiles, setMediaFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    // Загружаем категории при монтировании компонента
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(getApiUrl('/api/categories/'));
            setCategories(response.data);
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        setMediaFiles(files);
        setFormData({
            ...formData,
            image: files.length ? files[0] : null
        });
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setImagePreviews(files.map((file) => URL.createObjectURL(file)));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!user) {
            setError('Необходимо войти в систему для добавления товара');
            setLoading(false);
            return;
        }

        try {
            // Создаем FormData для отправки файла
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price_per_day', formData.price_per_day);
            formDataToSend.append('deposit', formData.deposit || 0);
            formDataToSend.append('category', formData.category);
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }
            mediaFiles.forEach((file) => formDataToSend.append('media_files', file));

            // Отправляем данные с учетными данными сессии
            const response = await axios.post(
                getApiUrl('/api/items/'),
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    withCredentials: true  // Отправляем cookies для сессии
                }
            );

            if (onSuccess) {
                onSuccess(response.data);
            }
            
            // Сбрасываем форму
            setFormData({
                title: '',
                description: '',
                price_per_day: '',
                deposit: '',
                category: '',
                image: null
            });
            setMediaFiles([]);
            imagePreviews.forEach((url) => URL.revokeObjectURL(url));
            setImagePreviews([]);
        } catch (error) {
            console.error('Ошибка создания товара:', error);
            let errorMessage = 'Произошла ошибка при создании товара';
            
            if (error.response) {
                // Обработка ошибок от сервера
                const data = error.response.data;
                
                if (data.detail) {
                    // Ошибка от DRF (например, PermissionDenied)
                    errorMessage = data.detail;
                } else if (data.error) {
                    errorMessage = data.error;
                } else if (data.errors) {
                    // Ошибки валидации
                    const errorList = Object.entries(data.errors).map(([field, messages]) => {
                        const fieldName = {
                            'title': 'Название',
                            'description': 'Описание',
                            'price_per_day': 'Цена за день',
                            'deposit': 'Залог',
                            'category': 'Категория',
                            'image': 'Изображение'
                        }[field] || field;
                        return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
                    });
                    errorMessage = errorList.join('\n');
                } else if (typeof data === 'object') {
                    // Другие ошибки валидации
                    const errorList = Object.entries(data).map(([field, messages]) => {
                        const fieldName = {
                            'title': 'Название',
                            'description': 'Описание',
                            'price_per_day': 'Цена за день',
                            'deposit': 'Залог',
                            'category': 'Категория',
                            'image': 'Изображение'
                        }[field] || field;
                        return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
                    });
                    errorMessage = errorList.length > 0 ? errorList.join('\n') : errorMessage;
                }
            } else if (error.request) {
                errorMessage = 'Не удалось подключиться к серверу. Проверьте, запущен ли backend.';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
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
            zIndex: 1000,
            padding: '20px'
        },
        modal: {
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        },
        closeButton: {
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            fontSize: '30px',
            cursor: 'pointer',
            color: '#666',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.3s ease'
        },
        title: {
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '25px',
            color: '#333',
            textAlign: 'center'
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        inputGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        label: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#555'
        },
        input: {
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '16px',
            transition: 'border-color 0.3s ease',
            fontFamily: 'inherit'
        },
        textarea: {
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '16px',
            minHeight: '100px',
            resize: 'vertical',
            fontFamily: 'inherit',
            transition: 'border-color 0.3s ease'
        },
        select: {
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '16px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'border-color 0.3s ease'
        },
        fileInput: {
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            fontFamily: 'inherit'
        },
        imagePreview: {
            width: '100%',
            maxHeight: '200px',
            objectFit: 'cover',
            borderRadius: '8px',
            marginTop: '10px'
        },
        previewsGrid: {
            marginTop: '12px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))',
            gap: '8px'
        },
        previewItem: {
            width: '100%',
            height: '92px',
            borderRadius: '8px',
            border: '1px solid #d9c4aa',
            overflow: 'hidden'
        },
        buttonGroup: {
            display: 'flex',
            gap: '15px',
            marginTop: '10px'
        },
        button: {
            flex: 1,
            padding: '14px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: 'inherit'
        },
        submitButton: {
            background: '#a67c52',
            color: 'white'
        },
        cancelButton: {
            background: '#f0f0f0',
            color: '#333'
        },
        error: {
            background: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '15px'
        }
    };

    return (
        <div style={styles.overlay} onClick={onCancel}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button 
                    style={styles.closeButton}
                    onClick={onCancel}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#f0f0f0';
                        e.target.style.color = '#333';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'none';
                        e.target.style.color = '#666';
                    }}
                >
                    ×
                </button>
                
                <h2 style={styles.title}>Добавить товар</h2>

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Название товара *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            style={styles.input}
                            required
                            placeholder="Введите название товара"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Описание *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            style={styles.textarea}
                            required
                            placeholder="Опишите товар подробно"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Цена за день (₽) *</label>
                        <input
                            type="number"
                            name="price_per_day"
                            value={formData.price_per_day}
                            onChange={handleInputChange}
                            style={styles.input}
                            required
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Залог (₽)</label>
                        <input
                            type="number"
                            name="deposit"
                            value={formData.deposit}
                            onChange={handleInputChange}
                            style={styles.input}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Категория *</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            style={styles.select}
                            required
                        >
                            <option value="">Выберите категорию</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Медиа (можно выбрать несколько фото)</label>
                        <input
                            type="file"
                            name="image"
                            onChange={handleImageChange}
                            style={styles.fileInput}
                            accept="image/*"
                            multiple
                        />
                        {imagePreviews.length > 0 && (
                            <div style={styles.previewsGrid}>
                                {imagePreviews.map((preview, idx) => (
                                    <div key={idx} style={styles.previewItem}>
                                        <img src={preview} alt={`Превью ${idx + 1}`} style={styles.imagePreview} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={styles.buttonGroup}>
                        <button
                            type="submit"
                            style={{...styles.button, ...styles.submitButton}}
                            disabled={loading}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(120, 94, 70, 0.28)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            {loading ? 'Создание...' : 'Создать товар'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            style={{...styles.button, ...styles.cancelButton}}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#e0e0e0';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#f0f0f0';
                            }}
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemForm;

