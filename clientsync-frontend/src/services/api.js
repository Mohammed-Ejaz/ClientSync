import axios from 'axios';

export const TOKEN_KEY = 'cs_token';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request Interceptor: Attach JWT token ─────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor: Signal 401s instead of hard-reloading ──────────────
// We dispatch an event rather than touching window.location directly so
// AuthContext can clear its in-memory state (avatar, name, etc.) before
// ProtectedRoute redirects. A hard reload here would also blow away any
// unsaved form state on the current page.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthCall = /\/auth\/(login|signup)/.test(error.config?.url || '');
        const hadToken = !!localStorage.getItem(TOKEN_KEY);

        if (error.response?.status === 401 && !isAuthCall && hadToken) {
            window.dispatchEvent(new Event('auth:expired'));
        }
        return Promise.reject(error);
    }
);

export default api;