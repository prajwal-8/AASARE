import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [auth, setAuthState] = useState({
        isAuthenticated: false,
        username: '',
        role: ''
    });

    // Load auth state from localStorage on component mount
    useEffect(() => {
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
            setAuthState(JSON.parse(storedAuth));
        }
    }, []);

    // Set auth state and save to localStorage
    const setAuth = (authData) => {
        setAuthState(authData);
        localStorage.setItem('auth', JSON.stringify(authData));
    };

    // Login method to update auth state
    const login = (username, role) => {
        const authData = {
            isAuthenticated: true,
            username,
            role
        };
        localStorage.setItem('auth', JSON.stringify(authData));
        setAuth(authData);
    };

    // Logout method to clear auth state
    const logout = () => {
        setAuthState({
            isAuthenticated: false,
            username: '',
            role: ''
        });
        localStorage.removeItem('auth');
    };


    return (
        <AuthContext.Provider value={{ auth, setAuth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;