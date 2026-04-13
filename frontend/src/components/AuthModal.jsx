import React, { useState } from 'react';
import axios from 'axios';
import { RF_REGIONS } from '../constants/regions';
import { getApiUrl } from '../config/api';

const AuthModal = ({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) => {
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        phone: '',
        region: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (isOpen) {
            const loginMode = initialMode === 'login';
            setIsLogin(loginMode);
            setError('');
            setFormData({
                username: '',
                email: '',
                password: '',
                password_confirm: '',
                first_name: '',
                last_name: '',
                phone: '',
                region: ''
            });
        }
    }, [initialMode, isOpen]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = isLogin 
                ? getApiUrl('/api/auth/login/')
                : getApiUrl('/api/auth/register/');

            const response = await axios.post(url, formData, {
                withCredentials: true  // Отправляем cookies для сессии
            });
            
            if (response.data.success) {
                onAuthSuccess(response.data.user);
                onClose();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.errors 
                ? (typeof error.response.data.errors === 'object' 
                    ? JSON.stringify(error.response.data.errors) 
                    : error.response.data.errors)
                : error.response?.data?.error || 'Произошла ошибка';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const switchToLogin = () => {
        setIsLogin(true);
        setError('');
        setFormData({
            username: '',
            email: '',
            password: '',
            password_confirm: '',
            first_name: '',
            last_name: '',
            phone: '',
            region: ''
        });
    };

    const switchToRegister = () => {
        setIsLogin(false);
        setError('');
        setFormData({
            username: '',
            email: '',
            password: '',
            password_confirm: '',
            first_name: '',
            last_name: '',
            phone: '',
            region: ''
        });
    };

    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <button style={styles.closeButton} onClick={onClose}>×</button>
                
                <h2 style={styles.title}>
                    {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
                </h2>

                {error && (
                    <div style={styles.error}>
                        {typeof error === 'object' ? JSON.stringify(error) : error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <input
                            type="text"
                            name="username"
                            placeholder="Имя пользователя"
                            value={formData.username}
                            onChange={handleInputChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <input
                            type="password"
                            name="password"
                            placeholder="Пароль"
                            value={formData.password}
                            onChange={handleInputChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <>
                            <div style={styles.inputGroup}>
                                <input
                                    type="password"
                                    name="password_confirm"
                                    placeholder="Подтвердите пароль"
                                    value={formData.password_confirm}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    required
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <input
                                    type="text"
                                    name="first_name"
                                    placeholder="Имя"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <input
                                    type="text"
                                    name="last_name"
                                    placeholder="Фамилия"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Телефон"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <select
                                    name="region"
                                    value={formData.region}
                                    onChange={handleInputChange}
                                    style={styles.select}
                                    required
                                >
                                    <option value="">Выберите область</option>
                                    {RF_REGIONS.map((region) => (
                                        <option key={region} value={region}>{region}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={styles.submitButton}
                    >
                        {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
                    </button>
                </form>

                <div style={styles.switchMode}>
                    <span>
                        {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                    </span>
                    {isLogin ? (
                        <button onClick={switchToRegister} style={styles.switchButton}>
                            Зарегистрироваться
                        </button>
                    ) : (
                        <button onClick={switchToLogin} style={styles.switchButton}>
                            Войти
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
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
        zIndex: 1000
    },
    modal: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '15px',
        width: '400px',
        maxWidth: '90%',
        position: 'relative'
    },
    closeButton: {
        position: 'absolute',
        top: '15px',
        right: '15px',
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#666'
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#333'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column'
    },
    input: {
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '16px'
    },
    select: {
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '16px',
        background: 'white'
    },
    submitButton: {
        padding: '12px',
        backgroundColor: '#a67c52',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        cursor: 'pointer',
        fontWeight: '600'
    },
    error: {
        backgroundColor: '#fee',
        color: '#c33',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '15px',
        fontSize: '14px'
    },
    switchMode: {
        textAlign: 'center',
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid #eee'
    },
    switchButton: {
        background: 'none',
        border: 'none',
        color: '#8a6442',
        cursor: 'pointer',
        textDecoration: 'underline',
        marginLeft: '5px'
    }
};

export default AuthModal;