import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const RequestsContext = createContext(null);

export function RequestsProvider({ children }) {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');
    const hasFetchedOnce = useRef(false);

    const fetchRequests = useCallback(async (isSilent = false) => {
        if (!user) return;
        if (!isSilent && !hasFetchedOnce.current) {
            setLoading(true);
        } else if (!isSilent) {
            setIsRefreshing(true);
        }

        try {
            const res = await api.get('/requests');
            setRequests(res.data.data || []);
            setError('');
            hasFetchedOnce.current = true;
        } catch (err) {
            if (!isSilent) {
                setError(err.response?.data?.message || 'Failed to load requests.');
            }
        } finally {
            setLoading(false);
            if (!isSilent) {
                setTimeout(() => setIsRefreshing(false), 300);
            }
        }
    }, [user]);

    // Initial fetch when user logs in or page loads
    useEffect(() => {
        if (user) {
            fetchRequests(hasFetchedOnce.current);
        } else {
            setRequests([]);
            hasFetchedOnce.current = false;
        }
    }, [user, fetchRequests]);

    // Single centralized background polling (every 15s) only when tab is visible
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchRequests(true);
            }
        }, 15000);

        return () => clearInterval(interval);
    }, [user, fetchRequests]);

    // Helper functions for instant cache updates
    const addRequest = useCallback((newReq) => {
        setRequests((prev) => [newReq, ...prev.filter((r) => r._id !== newReq._id)]);
    }, []);

    const updateRequestInCache = useCallback((updatedReq) => {
        setRequests((prev) => prev.map((r) => (r._id === updatedReq._id ? { ...r, ...updatedReq } : r)));
    }, []);

    const removeRequestFromCache = useCallback((id) => {
        setRequests((prev) => prev.filter((r) => r._id !== id));
    }, []);

    const value = {
        requests,
        loading,
        isRefreshing,
        error,
        fetchRequests,
        addRequest,
        updateRequestInCache,
        removeRequestFromCache,
    };

    return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>;
}

export function useRequests() {
    const ctx = useContext(RequestsContext);
    if (!ctx) {
        throw new Error('useRequests must be used within a RequestsProvider');
    }
    return ctx;
}
