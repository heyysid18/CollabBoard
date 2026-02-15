import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const config = {
                        headers: { Authorization: `Bearer ${token}` },
                    };
                    const { data } = await axios.get('http://localhost:5001/api/auth/me', config);
                    setUser(data);
                } catch (error) {
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        const { data } = await axios.post('http://localhost:5001/api/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        setUser(data);
    };

    const register = async (username, email, password) => {
        const { data } = await axios.post('http://localhost:5001/api/auth/register', { username, email, password });
        localStorage.setItem('token', data.token);
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
