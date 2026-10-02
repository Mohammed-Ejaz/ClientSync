import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const { user } = useAuth();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [location]);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/features', label: 'Features' },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
            >
                <div
                    className="max-w-6xl mx-auto flex items-center justify-between rounded-2xl px-6 py-3 transition-all duration-300"
                    style={{
                        background: scrolled ? 'rgba(11,15,25,0.85)' : 'transparent',
                        backdropFilter: scrolled ? 'blur(20px)' : 'none',
                        border: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
                    }}
                >
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, var(--indigo-600), var(--violet-600))' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" />
                            </svg>
                        </div>
                        <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                            Client<span className="gradient-text">Sync</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                style={{
                                    color: location.pathname === link.href
                                        ? 'var(--text-primary)'
                                        : 'var(--text-secondary)',
                                    background: location.pathname === link.href
                                        ? 'rgba(99,102,241,0.15)'
                                        : 'transparent',
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* CTA Buttons — auth-aware */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            /* Already logged in → go to dashboard */
                            <Link
                                to="/dashboard"
                                className="btn-primary text-sm py-2 px-5 flex items-center gap-2"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7" rx="1" />
                                    <rect x="14" y="3" width="7" height="7" rx="1" />
                                    <rect x="14" y="14" width="7" height="7" rx="1" />
                                    <rect x="3" y="14" width="7" height="7" rx="1" />
                                </svg>
                                Go to Dashboard
                            </Link>
                        ) : (
                            /* Guest → sign in / get started */
                            <>
                                <Link to="/login" className="btn-ghost text-sm">
                                    Sign In
                                </Link>
                                <Link to="/signup" className="btn-primary text-sm py-2 px-5">
                                    Get Started Free
                                </Link>
                            </>
                        )}
                    </div>

                </div>
            </motion.nav>

        </>
    );
}
