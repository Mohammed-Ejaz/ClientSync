import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../ui/Modal';
import CommandPalette from '../CommandPalette';

// ── Constants ────────────────────────────────────────────────────────────────
const SIDEBAR_KEY = 'clientsync-sidebar-collapsed';
const EXPANDED_W = 256;   // px when open
const COLLAPSED_W = 68;    // px when collapsed (icon rail)

// ── Nav items ────────────────────────────────────────────────────────────────
const navItems = [
    {
        href: '/dashboard',
        label: 'Overview',
        exact: true,
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
        ),
    },
    {
        href: '/dashboard/links',
        label: 'Client Links',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
        ),
    },
    {
        href: '/dashboard/settings',
        label: 'Settings',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.07 4.93a10 10 0 0 1 1.47 1.47M4.93 4.93A10 10 0 0 0 3.46 6.4M4.93 19.07a10 10 0 0 1-1.47-1.47M19.07 19.07a10 10 0 0 0 1.47-1.47" />
            </svg>
        ),
    },
];

const aboutFeatures = [
    { icon: '⚡', label: 'Instant onboarding links for every client' },
    { icon: '🎨', label: 'Role-customized intake forms (Dev, Design, Marketing)' },
    { icon: '🔒', label: 'JWT-secured workspace — your data stays yours' },
    { icon: '📊', label: 'Real-time dashboard to track every submission' },
    { icon: '✏️', label: 'Edit client data and request revisions anytime' },
];

// ── ChevronToggle icon ───────────────────────────────────────────────────────
function ChevronIcon({ collapsed }) {
    return (
        <motion.svg
            width="14" height="14"
            viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
            <polyline points="15 18 9 12 15 6" />
        </motion.svg>
    );
}

// ── Tooltip for collapsed icons ──────────────────────────────────────────────
function NavTooltip({ label, children }) {
    return (
        <div className="relative group/tip flex justify-center">
            {children}
            <div
                className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50
                            px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap
                            pointer-events-none opacity-0 group-hover/tip:opacity-100
                            transition-opacity duration-150"
                style={{
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-glass)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                }}
            >
                {label}
            </div>
        </div>
    );
}

// ── About ClientSync Modal ────────────────────────────────────────────────────
function AboutModal({ onClose }) {
    return (
        <Modal title="About ClientSync" onClose={onClose} maxWidth={420}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--indigo-500), var(--violet-500), transparent)' }} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-40 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />

            <div className="relative p-8">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
                    aria-label="Close"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className="flex flex-col items-center text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.05, type: 'spring', stiffness: 280, damping: 20 }}
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
                        style={{ background: 'linear-gradient(135deg, var(--indigo-600), var(--violet-600))' }}
                    >
                        <svg width="28" height="28" viewBox="0 0 16 16" fill="white">
                            <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" />
                        </svg>
                    </motion.div>

                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Client<span className="gradient-text">Sync</span>
                    </h2>
                    <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                        A client onboarding platform built for freelancers, designers, developers, and agencies.
                    </p>
                </div>

                <div className="h-px mb-6" style={{ background: 'var(--border-subtle)' }} />

                <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
                    What it does
                </p>
                <ul className="flex flex-col gap-3 mb-8">
                    {aboutFeatures.map((f) => (
                        <li key={f.label} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <span className="text-base leading-none mt-0.5 flex-shrink-0">{f.icon}</span>
                            {f.label}
                        </li>
                    ))}
                </ul>

                <div className="h-px mb-5" style={{ background: 'var(--border-subtle)' }} />

                <div className="flex items-center justify-between">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        © {new Date().getFullYear()} ClientSync
                    </p>
                    <button onClick={onClose} className="btn-primary text-xs py-2 px-4">
                        Got it
                    </button>
                </div>
            </div>
        </Modal>
    );
}

// ── Logout Confirmation Modal ────────────────────────────────────────────────
function LogoutConfirmModal({ onConfirm, onCancel }) {
    return (
        <Modal title="Sign out?" onClose={onCancel} maxWidth={380} accent="red">
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(248,113,113,0.6), transparent)' }} />
            <div className="p-8">
                <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.05, type: 'spring', stiffness: 280, damping: 18 }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)' }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                </motion.div>

                <div className="text-center mb-7">
                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Sign out?</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        You'll be returned to the login screen. Any unsaved changes will be lost.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                        style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.35)', color: '#f87171' }}
                    >
                        Yes, sign out
                    </button>
                </div>
            </div>
        </Modal>
    );
}

// ── Sidebar content ──────────────────────────────────────────────────────────
// Extracted to module scope. Previously this was a function defined *inside*
// DashboardLayout's render body, which means React treated it as a brand new
// component type on every single render — remounting the entire sidebar DOM
// each time, which broke the layoutId="activeNav" animation, hover/tooltip
// state, and caused an unnecessary render cost.
function SidebarContent({
    isCollapsed = false,
    isMobile = false,
    user,
    pathname,
    onOpenAbout,
    onToggleCollapse,
    onLogoutRequest,
}) {
    const isActive = (item) =>
        item.exact ? pathname === item.href : pathname.startsWith(item.href);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* ── Logo row ── */}
            <div
                className="flex items-center flex-shrink-0"
                style={{
                    borderColor: 'var(--border-subtle)',
                    height: 64,
                    padding: isCollapsed ? '0' : '0 20px',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                }}
            >
                {isCollapsed ? (
                    <NavTooltip label="About ClientSync">
                        <button
                            onClick={onOpenAbout}
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-110 hover:shadow-lg"
                            style={{ background: 'linear-gradient(135deg, var(--indigo-600), var(--violet-600))' }}
                            aria-label="About ClientSync"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" />
                            </svg>
                        </button>
                    </NavTooltip>
                ) : (
                    <>
                        <button
                            onClick={onOpenAbout}
                            className="flex items-center gap-2 min-w-0 group/logo transition-opacity duration-200 hover:opacity-80"
                            aria-label="About ClientSync"
                        >
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover/logo:scale-110"
                                style={{ background: 'linear-gradient(135deg, var(--indigo-600), var(--violet-600))' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                                    <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" />
                                </svg>
                            </div>
                            <span className="font-bold text-base whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                                Client<span className="gradient-text">Sync</span>
                            </span>
                        </button>

                        {!isMobile && (
                            <button
                                onClick={onToggleCollapse}
                                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
                                title="Collapse sidebar"
                            >
                                <ChevronIcon collapsed={false} />
                            </button>
                        )}
                    </>
                )}
            </div>

            {!isMobile && isCollapsed && (
                <div className="flex justify-center border-b flex-shrink-0" style={{ padding: '8px 0', borderColor: 'var(--border-subtle)' }}>
                    <button
                        onClick={onToggleCollapse}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid var(--border-glass)', color: 'var(--indigo-400)' }}
                        title="Expand sidebar"
                    >
                        <ChevronIcon collapsed={true} />
                    </button>
                </div>
            )}

            {/* ── Nav ── */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden" style={{ padding: isCollapsed ? '12px 8px' : '16px 12px' }}>
                {!isCollapsed && (
                    <div className="px-3 mb-4">
                        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                            Workspace
                        </p>
                        {user?.profileType && (
                            <span
                                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                                style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--indigo-400)', border: '1px solid rgba(99,102,241,0.2)' }}
                            >
                                {user.profileType === 'developer' && '💻 Dev Suite'}
                                {user.profileType === 'designer' && '🎨 Design Hub'}
                                {user.profileType === 'marketer' && '📣 Campaign Hub'}
                                {user.profileType === 'agency' && '🏢 Agency Suite'}
                                {user.profileType === 'consultant' && '📝 Advisor Suite'}
                                {user.profileType === 'other' && '🎯 Custom Hub'}
                            </span>
                        )}
                    </div>
                )}
                {isCollapsed && <div className="mb-4" />}

                <div className="space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item);
                        const linkEl = (
                            <Link
                                to={item.href}
                                className="flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 group"
                                style={{
                                    padding: isCollapsed ? '10px' : '10px 12px',
                                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                                    borderLeft: isCollapsed ? 'none' : (active ? '2px solid var(--indigo-500)' : '2px solid transparent'),
                                    outline: active && isCollapsed ? '2px solid rgba(99,102,241,0.4)' : 'none',
                                }}
                            >
                                <span className="flex-shrink-0" style={{ color: active ? 'var(--indigo-400)' : 'var(--text-muted)' }}>
                                    {item.icon}
                                </span>
                                {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
                                {!isCollapsed && active && (
                                    <motion.div layoutId="activeNav" className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--indigo-400)' }} />
                                )}
                            </Link>
                        );

                        return isCollapsed
                            ? <NavTooltip key={item.href} label={item.label}>{linkEl}</NavTooltip>
                            : <div key={item.href}>{linkEl}</div>;
                    })}
                </div>
            </nav>

            {/* ── User profile ── */}
            <div className="flex-shrink-0 border-t" style={{ borderColor: 'var(--border-subtle)', padding: isCollapsed ? '12px 8px' : '12px' }}>
                {isCollapsed ? (
                    <NavTooltip label={`${user?.name} · Sign out`}>
                        <button
                            onClick={onLogoutRequest}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, var(--indigo-600), var(--violet-600))', color: '#fff' }}
                            title="Sign out"
                        >
                            {user?.avatarInitials || user?.name?.[0] || '?'}
                        </button>
                    </NavTooltip>
                ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl glass-elevated">
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, var(--indigo-600), var(--violet-600))', color: '#fff' }}
                        >
                            {user?.avatarInitials || user?.name?.[0] || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                        </div>
                        <button onClick={onLogoutRequest} className="btn-ghost p-1.5 rounded-lg flex-shrink-0" title="Sign out">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main layout ──────────────────────────────────────────────────────────────
export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [collapsed, setCollapsed] = useState(() => {
        try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; }
        catch { return false; }
    });
    const [mobileOpen, setMobileOpen] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);

    useEffect(() => {
        try { localStorage.setItem(SIDEBAR_KEY, String(collapsed)); } catch { /* ignore */ }
    }, [collapsed]);

    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    const handleLogout = () => {
        setLogoutOpen(false);
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="flex h-screen" style={{ position: 'relative', zIndex: 1 }}>
            {/* Modals live outside the sidebar tree so remounting the sidebar
                (e.g. on collapse toggle) never affects them, and AnimatePresence
                wraps the conditional so exit animations actually play. */}
            <AnimatePresence>
                {aboutOpen && <AboutModal key="about" onClose={() => setAboutOpen(false)} />}
            </AnimatePresence>
            <AnimatePresence>
                {logoutOpen && <LogoutConfirmModal key="logout" onConfirm={handleLogout} onCancel={() => setLogoutOpen(false)} />}
            </AnimatePresence>
            <CommandPalette />

            {/* ── Desktop Sidebar ── */}
            <motion.aside
                className="hidden lg:flex flex-col flex-shrink-0 border-r overflow-hidden"
                animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
            >
                <SidebarContent
                    isCollapsed={collapsed}
                    user={user}
                    pathname={location.pathname}
                    onOpenAbout={() => setAboutOpen(true)}
                    onToggleCollapse={() => setCollapsed((c) => !c)}
                    onLogoutRequest={() => setLogoutOpen(true)}
                />
            </motion.aside>

            {/* ── Mobile Sidebar Overlay ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            key="mobile-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 lg:hidden"
                            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            key="mobile-sidebar"
                            initial={{ x: -EXPANDED_W }}
                            animate={{ x: 0 }}
                            exit={{ x: -EXPANDED_W }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed left-0 top-0 bottom-0 z-50 lg:hidden border-r"
                            style={{ width: EXPANDED_W, borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
                        >
                            <SidebarContent
                                isMobile
                                user={user}
                                pathname={location.pathname}
                                onOpenAbout={() => setAboutOpen(true)}
                                onLogoutRequest={() => setLogoutOpen(true)}
                            />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ── Main Content ── */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <div
                    className="lg:hidden flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
                    style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
                >
                    <button onClick={() => setMobileOpen(true)} className="btn-ghost p-2" aria-label="Open menu">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                    <button onClick={() => setAboutOpen(true)} className="font-bold transition-opacity hover:opacity-70" style={{ color: 'var(--text-primary)' }} aria-label="About ClientSync">
                        Client<span className="gradient-text">Sync</span>
                    </button>
                    <div className="w-9 h-9" />
                </div>

                <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-content, transparent)' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}