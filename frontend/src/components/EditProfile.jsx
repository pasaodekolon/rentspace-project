import React, { useState } from 'react';
import axios from 'axios';
import { RF_REGIONS } from '../constants/regions';
import { getApiUrl } from '../config/api';

const EditProfile = ({ user, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        region: user?.region || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('first_name', formData.first_name);
            formDataToSend.append('last_name', formData.last_name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('region', formData.region);
            if (avatarFile) {
                formDataToSend.append('avatar', avatarFile);
            }

            const response = await axios.put(getApiUrl('/api/auth/user/'), formDataToSend, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setSuccess(true);
                if (onUpdate) {
                    onUpdate(response.data.user);
                }
                setTimeout(() => {
                    onClose();
                }, 1500);
            }
        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
            setError(
                error.response?.data?.error || 
                error.response?.data?.detail || 
                'Произошла ошибка при обновлении профиля'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(reader.result);
        reader.readAsDataURL(file);
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
            padding: '30px',
            maxWidth: '500px',
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
        avatarSection: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
        },
        avatarPreview: {
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            objectFit: 'cover',
            background: '#efe2d4',
            border: '2px solid #a67c52'
        },
        avatarFallback: {
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#efe2d4',
            color: '#7a5a3d',
            border: '2px solid #a67c52',
            fontSize: '32px',
            fontWeight: '700'
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
        },
        success: {
            background: '#efe',
            color: '#3c3',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '15px',
            textAlign: 'center'
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button 
                    style={styles.closeButton}
                    onClick={onClose}
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
                
                <h2 style={styles.title}>Редактировать профиль</h2>

                <div style={styles.avatarSection}>
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Аватар" style={styles.avatarPreview} />
                    ) : (
                        <div style={styles.avatarFallback}>
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleAvatarChange} />
                </div>

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={styles.success}>
                        ✅ Профиль успешно обновлен!
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Имя</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            style={styles.input}
                            placeholder="Введите имя"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Фамилия</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            style={styles.input}
                            placeholder="Введите фамилию"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            style={styles.input}
                            required
                            placeholder="Введите email"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Область *</label>
                        <select
                            name="region"
                            value={formData.region}
                            onChange={handleInputChange}
                            style={styles.input}
                            required
                        >
                            <option value="">Выберите область</option>
                            {RF_REGIONS.map((region) => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Телефон</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            style={styles.input}
                            placeholder="+7 (999) 123-45-67"
                        />
                    </div>

                    <div style={styles.buttonGroup}>
                        <button
                            type="submit"
                            style={{...styles.button, ...styles.submitButton}}
                            disabled={loading}
                        >
                            {loading ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{...styles.button, ...styles.cancelButton}}
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;

