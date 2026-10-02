import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const actions = [
        { id: 'dashboard', name: 'Go to Dashboard', icon: '🏠', shortcut: 'G D', action: () => navigate('/dashboard') },
        { id: 'links', name: 'Manage Links', icon: '🔗', shortcut: 'G L', action: () => navigate('/dashboard/links') },
        { id: 'settings', name: 'Settings', icon: '⚙️', shortcut: 'G S', action: () => navigate('/dashboard/settings') },
        { id: 'new-link', name: 'Create New Link', icon: '✨', shortcut: 'C L', action: () => { navigate('/dashboard'); /* Trigger modal logic if accessible globally */ } },
    ];

    const filteredActions = actions.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

    const handleSelect = (action) => {
        action.action();
        setIsOpen(false);
        setSearch('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
                        style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)' }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-xl glass rounded-2xl overflow-hidden shadow-2xl"
                            style={{ border: '1px solid var(--border-glass)', background: 'rgba(20, 20, 20, 0.6)' }}
                        >
                            <div className="flex items-center px-4 py-3 border-b" style={{ borderColor: 'var(--border-glass)' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Type a command or search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none px-3 text-lg"
                                    style={{ color: 'var(--text-primary)' }}
                                />
                                <span className="text-xs px-2 py-1 rounded-md bg-white/5" style={{ color: 'var(--text-muted)' }}>ESC</span>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto p-2">
                                {filteredActions.length === 0 ? (
                                    <div className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>No results found.</div>
                                ) : (
                                    filteredActions.map((action, i) => (
                                        <button
                                            key={action.id}
                                            onClick={() => handleSelect(action)}
                                            className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left hover:bg-white/5 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl group-hover:scale-110 transition-transform duration-200">{action.icon}</span>
                                                <span style={{ color: 'var(--text-primary)' }}>{action.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {action.shortcut.split(' ').map(s => (
                                                    <span key={s} className="text-xs px-1.5 py-0.5 rounded-md bg-white/5" style={{ color: 'var(--text-muted)' }}>{s}</span>
                                                ))}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
