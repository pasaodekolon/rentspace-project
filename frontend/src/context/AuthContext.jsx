import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Проверяем авторизацию при загрузке
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // Проверяем авторизацию через сессию
            const response = await axios.get(getApiUrl('/api/auth/user/'), {
                withCredentials: true  // Отправляем cookies для сессии
            });
            if (response.data.success && response.data.user) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Ошибка проверки авторизации:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData) => {
        // Просто сохраняем данные пользователя (сессия уже установлена на сервере)
        setUser(userData);
    };

    const logout = async () => {
        try {
            // Выходим через API для очистки сессии на сервере
            await axios.post(getApiUrl('/api/auth/logout/'), {}, {
                withCredentials: true
            });
        } catch (error) {
            console.error('Ошибка выхода:', error);
        } finally {
            setUser(null);
        }
    };

    const value = {
        user,
        login,
        logout,
        checkAuth,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};