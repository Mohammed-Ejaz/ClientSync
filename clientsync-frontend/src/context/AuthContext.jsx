import { useState, useEffect, useCallback, useMemo, createContext } from 'react';
import axios from 'axios';
import api, { TOKEN_KEY } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    // Only show the "verifying session" screen if a token actually exists —
    // otherwise a fresh visitor briefly sees a spinner for no reason.
    const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem(TOKEN_KEY));

    // Validate the stored token exactly once on mount.
    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            setIsLoading(false);
            return;
        }

        const controller = new AbortController();

        api
            .get('/auth/me', { signal: controller.signal })
            .then((res) => setUser(res.data.user))
            .catch((err) => {
                if (axios.isCancel(err)) return;
                localStorage.removeItem(TOKEN_KEY);
                setUser(null);
            })
            .finally(() => {
                if (!controller.signal.aborted) setIsLoading(false);
            });

        return () => controller.abort();
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
    }, []);

    // If any API call comes back 401 (expired/invalid token), api.js
    // dispatches this event so we can clear auth state from one place.
    useEffect(() => {
        window.addEventListener('auth:expired', logout);
        return () => window.removeEventListener('auth:expired', logout);
    }, [logout]);

    const login = useCallback(async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem(TOKEN_KEY, newToken);
        setUser(userData);
        return userData;
    }, []);

    const signup = useCallback(async (name, email, password) => {
        const res = await api.post('/auth/signup', { name, email, password });
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem(TOKEN_KEY, newToken);
        setUser(userData);
        return userData;
    }, []);

    const updateUser = useCallback((updatedUser) => {
        setUser(updatedUser);
    }, []);

    const value = useMemo(
        () => ({ user, isLoading, login, signup, logout, updateUser }),
        [user, isLoading, login, signup, logout, updateUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}