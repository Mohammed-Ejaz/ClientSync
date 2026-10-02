import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-12 h-12">
                        <div
                            className="absolute inset-0 rounded-full border-2 border-transparent"
                            style={{
                                borderTopColor: 'var(--indigo-500)',
                                animation: 'spin-slow 0.8s linear infinite',
                            }}
                        />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Verifying session...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        // Preserve the attempted URL so we can redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user.isOnboarded && location.pathname !== '/onboarding-quiz') {
        return <Navigate to="/onboarding-quiz" replace />;
    }

    if (user.isOnboarded && location.pathname === '/onboarding-quiz') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
