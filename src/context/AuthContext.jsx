import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Token se user info fetch karo
            API.get('/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                setUser(res.data);
                setLoading(false);
            })
            .catch(() => {
                localStorage.removeItem('token');
                setUser(null);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    // ✅ LOGIN FUNCTION – Token aur user dono save karega
    const login = (userData, token) => {
        localStorage.setItem('token', token);
        setUser(userData);
    };

    // ✅ LOGOUT FUNCTION
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    // ✅ UPDATE USER (Payment ke baad plan update karne ke liye)
    const updateUser = (updatedData) => {
        setUser(prev => ({ ...prev, ...updatedData }));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};