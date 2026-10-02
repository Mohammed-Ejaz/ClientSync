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



                    {/* Menu Button */}
                    <button
                        className="p-2 rounded-lg"
                        style={{ color: 'var(--text-secondary)' }}
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {mobileOpen ? (
                                <>
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </>
                            ) : (
                                <>
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </>
                            )}
                        </svg>
                    </button>

                </div>
            </motion.nav>

            {/* Menu Dropdown */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-x-0 top-[88px] z-40 px-6 max-w-6xl mx-auto"
                    >
                        <div
                            className="glass-elevated rounded-2xl p-4 flex flex-col gap-2"
                            style={{ border: '1px solid var(--border-glass)' }}
                        >
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className="px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                                    style={{
                                        color: location.pathname === link.href ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        background: location.pathname === link.href ? 'rgba(99,102,241,0.1)' : 'transparent',
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="h-px w-full my-2" style={{ background: 'var(--border-subtle)' }} />
                            {user ? (
                                <Link to="/dashboard" className="btn-primary w-full justify-center">Go to Dashboard</Link>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Link to="/login" className="btn-ghost w-full justify-center">Sign In</Link>
                                    <Link to="/signup" className="btn-primary w-full justify-center">Get Started Free</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
