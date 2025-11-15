import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 检查URL参数（OAuth回调）
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');
        const name = urlParams.get('name');
        const picture = urlParams.get('picture');
        const user_id = urlParams.get('user_id');

        if (token && user_id) {
            // OAuth回调，保存用户信息
            const userInfo = {
                token,
                email,
                name,
                picture,
                user_id
            };
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user_info', JSON.stringify(userInfo));
            setUser(userInfo);
            setIsAuthenticated(true);
            
            // 清除URL参数
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            // 检查本地存储
            const savedToken = localStorage.getItem('auth_token');
            const savedUserInfo = localStorage.getItem('user_info');
            
            if (savedToken && savedUserInfo) {
                try {
                    const userInfo = JSON.parse(savedUserInfo);
                    setUser(userInfo);
                    setIsAuthenticated(true);
                } catch (e) {
                    console.error('解析用户信息失败:', e);
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_info');
                }
            }
        }
        
        setLoading(false);
    }, []);

    const login = (userInfo) => {
        setUser(userInfo);
        setIsAuthenticated(true);
        localStorage.setItem('auth_token', userInfo.token);
        localStorage.setItem('user_info', JSON.stringify(userInfo));
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

