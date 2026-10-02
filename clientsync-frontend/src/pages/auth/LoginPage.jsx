import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

function FloatingInput({ id, label, type = 'text', value, onChange, placeholder, autoComplete }) {
    const [focused, setFocused] = useState(false);
    return (
        <div className="relative">
            <label
                htmlFor={id}
                className="block text-sm font-medium mb-2"
                style={{ color: focused ? 'var(--indigo-400)' : 'var(--text-secondary)' }}
            >
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="input-field"
            />
            <motion.div
                className="absolute bottom-0 left-0 h-0.5 rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--indigo-500), var(--violet-500))' }}
                animate={{ width: focused ? '100%' : '0%' }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            />
        </div>
    );
}

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shakeKey, setShakeKey] = useState(0);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please try again.';
            setError(msg);
            setShakeKey((k) => k + 1);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
            style={{ background: 'var(--bg-base)' }}
        >
            {/* Background orbs */}
            <div className="absolute w-96 h-96 rounded-full pointer-events-none" style={{ background: 'var(--indigo-600)', filter: 'blur(120px)', opacity: 0.12, top: '10%', left: '15%' }} />
            <div className="absolute w-80 h-80 rounded-full pointer-events-none" style={{ background: 'var(--violet-600)', filter: 'blur(100px)', opacity: 0.1, bottom: '10%', right: '15%' }} />

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8"
                >
                    <Link to="/" className="inline-flex items-center gap-2 group">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, var(--indigo-600), var(--violet-600))' }}
                        >
                            <svg width="20" height="20" viewBox="0 0 16 16" fill="white">
                                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" />
                            </svg>
                        </div>
                        <span className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                            Client<span className="gradient-text">Sync</span>
                        </span>
                    </Link>
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="glass-elevated rounded-2xl p-8"
                >
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Sign in to your freelancer workspace
                        </p>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                key={`err-${shakeKey}`}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 animate-shake"
                            >
                                <div
                                    className="flex items-center gap-3 p-4 rounded-xl text-sm"
                                    style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {error}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <FloatingInput
                            id="login-email"
                            label="Email address"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            autoComplete="off"
                        />
                        <FloatingInput
                            id="login-password"
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="off"
                        />

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading || !email || !password}
                            className="btn-primary mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                    </svg>
                                    Signing in…
                                </span>
                            ) : 'Sign in to workspace'}
                        </button>
                    </form>


                    <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-semibold transition-colors" style={{ color: 'var(--indigo-400)' }}>
                                Create one free
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
