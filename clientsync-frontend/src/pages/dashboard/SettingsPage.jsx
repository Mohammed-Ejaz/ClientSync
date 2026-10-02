import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import AnimatedPage from '../../components/AnimatedPage';

// ── Theme definitions ────────────────────────────────────────────────────────
const THEME_OPTIONS = [
    {
        id: 'dark',
        label: 'Dark',
        description: 'Deep slate · Classic',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
        ),
        preview: { bg: '#0B0F19', surface: '#111827', accent: '#6366f1', text: '#f1f5f9', muted: '#64748b' },
    },
    {
        id: 'dim',
        label: 'Dim',
        description: 'Slate-800 · Medium',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
        ),
        preview: { bg: '#1e2533', surface: '#252d3d', accent: '#818cf8', text: '#e2e8f0', muted: '#64748b' },
    },
    {
        id: 'light',
        label: 'Light',
        description: 'Crisp white · Minimal',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
        ),
        preview: { bg: '#f1f5f9', surface: '#ffffff', accent: '#6366f1', text: '#0f172a', muted: '#94a3b8' },
    },
];

function ThemePreviewCard({ option, isActive, onClick }) {
    const p = option.preview;
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 text-left"
            style={{
                border: isActive ? `2px solid ${p.accent}` : '2px solid rgba(128,128,128,0.15)',
                boxShadow: isActive ? `0 0 24px ${p.accent}40, 0 4px 20px rgba(0,0,0,0.2)` : '0 2px 8px rgba(0,0,0,0.15)',
                background: p.surface,
            }}
        >
            <div className="relative h-28 overflow-hidden" style={{ background: p.bg }}>
                <div className="absolute left-0 top-0 bottom-0 w-8" style={{ background: p.surface, borderRight: `1px solid ${p.muted}20` }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="mx-1.5 mt-2 rounded" style={{ height: 4, background: i === 1 ? p.accent : `${p.muted}40`, width: i === 1 ? '70%' : '50%' }} />
                    ))}
                </div>
                <div className="absolute left-10 top-3 right-2 space-y-1.5">
                    <div className="rounded" style={{ height: 5, width: '55%', background: `${p.text}90` }} />
                    <div className="rounded" style={{ height: 3, width: '40%', background: `${p.muted}60` }} />
                    <div className="rounded-lg mt-2 p-1.5" style={{ background: p.surface, border: `1px solid ${p.muted}25` }}>
                        <div className="rounded" style={{ height: 3, width: '70%', background: `${p.text}70` }} />
                        <div className="mt-1 flex gap-1">
                            <div className="rounded" style={{ height: 3, width: '30%', background: `${p.accent}80` }} />
                            <div className="rounded" style={{ height: 3, width: '20%', background: `${p.muted}40` }} />
                        </div>
                    </div>
                    <div className="rounded-md mt-1" style={{ height: 8, width: 40, background: p.accent }} />
                </div>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5" style={{ background: p.surface }}>
                <div className="flex items-center gap-2">
                    <span style={{ color: p.text, opacity: 0.8 }}>{option.icon}</span>
                    <div>
                        <p className="text-xs font-semibold leading-none mb-0.5" style={{ color: p.text }}>{option.label}</p>
                        <p className="text-[10px] leading-none" style={{ color: p.muted }}>{option.description}</p>
                    </div>
                </div>
                <div
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                    style={{ border: `2px solid ${isActive ? p.accent : `${p.muted}60`}`, background: isActive ? p.accent : 'transparent' }}
                >
                    {isActive && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
            </div>
            {isActive && <motion.div layoutId="themeBorder" className="absolute inset-0 rounded-2xl pointer-events-none" style={{ border: `2px solid ${p.accent}`, borderRadius: 14 }} />}
        </motion.button>
    );
}

// ── Delete Account confirmation (requires password) ──────────────────────────
function DeleteAccountModal({ onClose, onDeleted }) {
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password) { setError('Enter your password to confirm.'); return; }
        setBusy(true);
        setError('');
        try {
            await api.delete('/auth/account', { data: { password } });
            onDeleted();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete account.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Modal title="Delete account" onClose={onClose} maxWidth={420} accent="red">
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(248,113,113,0.6), transparent)' }} />
            <form onSubmit={handleSubmit} className="p-8">
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Delete your account?</h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                    This permanently deletes your account, every client link you've generated, and all submitted data. This cannot be undone. Enter your password to confirm.
                </p>
                <input
                    type="password"
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="input-field w-full mb-2"
                />
                {error && <p className="text-xs mb-4" style={{ color: '#f87171' }}>{error}</p>}
                <div className="flex gap-3 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={busy}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={busy}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
                        style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.35)', color: '#f87171' }}
                    >
                        {busy ? 'Deleting…' : 'Delete permanently'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// ── Main Settings Page ───────────────────────────────────────────────────────
export default function SettingsPage() {
    const { user, updateUser, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();

    const [name, setName] = useState(user?.name || '');
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);
    const [profileError, setProfileError] = useState('');

    const [themeSaved, setThemeSaved] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [profileType, setProfileType] = useState(user?.profileType || 'other');
    const [workStyle, setWorkStyle] = useState(user?.workStyle || 'solo');
    const [primaryNeeds, setPrimaryNeeds] = useState(user?.primaryNeeds || []);
    const [customizationSaved, setCustomizationSaved] = useState(false);
    const [customizationSaving, setCustomizationSaving] = useState(false);
    const [customizationError, setCustomizationError] = useState('');

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setProfileSaving(true);
        setProfileError('');
        try {
            const res = await api.patch('/auth/profile', { name });
            updateUser(res.data.user);
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 2500);
        } catch (err) {
            setProfileError(err.response?.data?.message || 'Failed to save profile.');
        } finally {
            setProfileSaving(false);
        }
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        setThemeSaved(true);
        setTimeout(() => setThemeSaved(false), 1800);
    };

    const toggleNeed = (id) => {
        setPrimaryNeeds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleSaveCustomization = async (e) => {
        e.preventDefault();
        setCustomizationSaving(true);
        setCustomizationError('');
        try {
            const res = await api.put('/auth/onboarding', { profileType, workStyle, primaryNeeds });
            updateUser(res.data.user);
            setCustomizationSaved(true);
            setTimeout(() => setCustomizationSaved(false), 2500);
        } catch (err) {
            setCustomizationError(err.response?.data?.message || 'Failed to save customization preferences.');
        } finally {
            setCustomizationSaving(false);
        }
    };

    const handleAccountDeleted = () => {
        logout(); // clears the stored token and in-memory user state
        navigate('/', { replace: true });
    };

    return (
        <AnimatedPage>
            <div className="p-6 md:p-8 max-w-2xl mx-auto">
                <AnimatePresence>
                    {deleteModalOpen && (
                        <DeleteAccountModal key="delete-account" onClose={() => setDeleteModalOpen(false)} onDeleted={handleAccountDeleted} />
                    )}
                </AnimatePresence>

                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Settings</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage your workspace preferences.</p>
                </motion.div>

                <div className="space-y-6">
                    {/* ── Profile Section ──────────────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-2xl p-6" style={{ border: '1px solid var(--border-glass)' }}>
                        <h2 className="text-base font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <span>👤</span> Profile
                        </h2>
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Display Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field max-w-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                                <input type="email" value={user?.email || ''} readOnly className="input-field max-w-sm opacity-60 cursor-not-allowed" />
                                <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>Email cannot be changed at this time.</p>
                            </div>
                            {profileError && (
                                <p className="text-xs font-semibold px-3 py-2 rounded-lg max-w-sm" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                                    {profileError}
                                </p>
                            )}
                            <button type="submit" disabled={profileSaving} className="btn-primary text-sm px-6 py-2.5 disabled:opacity-60">
                                {profileSaving ? 'Saving…' : profileSaved ? (
                                    <span className="flex items-center gap-2">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                        Saved!
                                    </span>
                                ) : 'Save Changes'}
                            </button>
                        </form>
                    </motion.div>

                    {/* ── Appearance / Theme Section ───────────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="glass rounded-2xl p-6" style={{ border: '1px solid var(--border-glass)' }}>
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <span>🎨</span> Appearance
                            </h2>
                            <AnimatePresence>
                                {themeSaved && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.8, x: 8 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, x: 8 }}
                                        className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                                        style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}
                                    >
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                        Applied
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                        <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Choose a theme for your dashboard. Your preference is saved locally.</p>

                        <div className="grid grid-cols-3 gap-3">
                            {THEME_OPTIONS.map((opt) => (
                                <ThemePreviewCard key={opt.id} option={opt} isActive={theme === opt.id} onClick={() => handleThemeChange(opt.id)} />
                            ))}
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--indigo-400)' }} />
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Active theme: <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{THEME_OPTIONS.find((t) => t.id === theme)?.label}</span>
                            </p>
                        </div>
                    </motion.div>

                    {/* ── Workspace Customization Section ────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-6" style={{ border: '1px solid var(--border-glass)' }}>
                        <h2 className="text-base font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <span>🛠️</span> Workspace Customization
                        </h2>

                        <form onSubmit={handleSaveCustomization} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Specialty / Workspace Mode</label>
                                    <select
                                        value={profileType}
                                        onChange={(e) => setProfileType(e.target.value)}
                                        className="input-field w-full"
                                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '10px' }}
                                    >
                                        <option value="designer">🎨 Designer Mode</option>
                                        <option value="developer">💻 Developer Mode</option>
                                        <option value="marketer">📣 Marketer Mode</option>
                                        <option value="agency">🏢 Agency Mode</option>
                                        <option value="consultant">📝 Consultant Mode</option>
                                        <option value="other">🎯 Other Mode</option>
                                    </select>
                                    <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                                        Only affects <strong>new</strong> links you generate from now on — existing links keep the specialty they were created with.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Team Size / Setup</label>
                                    <select
                                        value={workStyle}
                                        onChange={(e) => setWorkStyle(e.target.value)}
                                        className="input-field w-full"
                                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '10px' }}
                                    >
                                        <option value="solo">Solo Freelancer</option>
                                        <option value="small_team">Small Team (2-5)</option>
                                        <option value="growing_agency">Growing Agency (6-20)</option>
                                        <option value="established_studio">Established Studio (20+)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Active Modules</label>
                                <div className="space-y-2">
                                    {[
                                        { id: 'onboarding', label: 'Client Onboarding Checklist' },
                                        { id: 'proposals', label: 'Proposals & Contracts Builder (coming soon)' },
                                        { id: 'tracking', label: 'Visual Milestone Tracking (coming soon)' },
                                        { id: 'invoices', label: 'Invoices & Payments Sync (coming soon)' },
                                    ].map((item) => {
                                        const active = primaryNeeds.includes(item.id);
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => toggleNeed(item.id)}
                                                className="flex items-center gap-3 w-full text-left p-2.5 rounded-xl border transition-colors"
                                                style={{
                                                    background: active ? 'rgba(99,102,241,0.04)' : 'rgba(255,255,255,0.01)',
                                                    borderColor: active ? 'var(--indigo-500)' : 'var(--border-subtle)',
                                                }}
                                            >
                                                <div
                                                    className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors"
                                                    style={{ borderColor: active ? 'var(--indigo-500)' : 'var(--text-muted)', background: active ? 'var(--indigo-500)' : 'transparent' }}
                                                >
                                                    {active && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                                                </div>
                                                <span className="text-xs font-medium" style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {customizationError && (
                                <p className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                                    {customizationError}
                                </p>
                            )}

                            <button type="submit" disabled={customizationSaving} className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2 disabled:opacity-60">
                                {customizationSaving ? 'Saving...' : customizationSaved ? (
                                    <span className="flex items-center gap-2">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                        Saved!
                                    </span>
                                ) : 'Save Customization'}
                            </button>
                        </form>
                    </motion.div>

                    {/* ── Danger Zone ──────────────────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }} className="glass rounded-2xl p-6" style={{ border: '1px solid var(--border-glass)' }}>
                        <h2 className="text-base font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <span>⚠️</span> Danger Zone
                        </h2>
                        <div className="p-4 rounded-xl" style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)' }}>
                            <p className="text-sm font-medium mb-1" style={{ color: '#f87171' }}>Delete Account</p>
                            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                                Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                            <button
                                onClick={() => setDeleteModalOpen(true)}
                                className="text-sm px-4 py-2 rounded-lg font-medium"
                                style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}
                            >
                                Delete Account
                            </button>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="mt-6 px-4 py-3 rounded-xl text-xs"
                    style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}
                >
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'} · Role: {user?.role || 'freelancer'}
                </motion.div>
            </div>
        </AnimatedPage>
    );
}