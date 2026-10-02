import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import AnimatedPage from '../../components/AnimatedPage';

export default function DashboardHome() {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;
        const fetchData = async (isSilent = false) => {
            try {
                const res = await api.get('/requests');
                if (isMounted) {
                    setRequests(res.data.data || []);
                    setError('');
                }
            } catch {
                if (isMounted && !isSilent) {
                    setError('Failed to load workspace data. Please refresh.');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        // Auto-poll in background every 12 seconds when active
        const timer = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchData(true);
            }
        }, 12000);

        return () => {
            isMounted = false;
            clearInterval(timer);
        };
    }, []);

    const total = requests.length;
    const completed = requests.filter((r) => r.status === 'Completed').length;
    const pending = requests.filter((r) => r.status === 'Pending').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const stats = [
        { label: 'Total Links Sent', value: total, color: 'indigo', delay: 0, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg> },
        { label: 'Completed', value: completed, color: 'emerald', delay: 0.08, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> },
        { label: 'Awaiting Client', value: pending, color: 'amber', delay: 0.16, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
        { label: 'Completion Rate', value: `${completionRate}%`, color: 'violet', delay: 0.24, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
    ];



    return (
        <AnimatedPage>
            <div className="p-6 md:p-8 max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                        Good morning, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {(() => {
                            switch (user?.profileType) {
                                case 'developer':
                                    return "Ready to build? Your developer dashboard is customized and optimized.";
                                case 'designer':
                                    return "Time to create? Your design studio dashboard is set up with asset collections.";
                                case 'marketer':
                                    return "Ready to target? Your campaign hub is tuned to collect audience insights.";
                                case 'agency':
                                    return "Ready to collaborate? Your agency dashboard is set up for teamwork.";
                                case 'consultant':
                                    return "Ready to advise? Your consulting workspace is ready for client briefs.";
                                default:
                                    return "Here's your workspace overview for today.";
                            }
                        })()}
                    </p>
                </motion.div>

                {/* Specialty Tip Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-2xl p-4 mb-8 flex items-start gap-3.5"
                    style={{
                        border: '1px solid var(--border-glass)',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(168,85,247,0.02) 100%)',
                    }}
                >
                    <div className="text-xl leading-none select-none mt-0.5">
                        {user?.profileType === 'developer' && '💻'}
                        {user?.profileType === 'designer' && '🎨'}
                        {user?.profileType === 'marketer' && '📣'}
                        {user?.profileType !== 'developer' && user?.profileType !== 'designer' && user?.profileType !== 'marketer' && '💡'}
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                            {(() => {
                                switch (user?.profileType) {
                                    case 'developer': return 'Developer Suite Active';
                                    case 'designer': return 'Design Studio Active';
                                    case 'marketer': return 'Marketing Hub Active';
                                    case 'agency': return 'Agency Suite Active';
                                    case 'consultant': return 'Consulting Workspace Active';
                                    default: return 'ClientSync Workspace Active';
                                }
                            })()}
                        </h4>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {(() => {
                                switch (user?.profileType) {
                                    case 'developer':
                                        return 'Your workspace is configured for software engineering. Client onboarding links automatically request technical details (domain, hosting, CMS) and developer setup details (tech stack, repository preferences, third-party integrations).';
                                    case 'designer':
                                        return 'Your workspace is configured for design and branding. Client onboarding links automatically request visual identity assets (brand colors, logo file URLs, typography) and design preferences (inspirations, layout styles).';
                                    case 'marketer':
                                        return 'Your workspace is configured for digital marketing. Client onboarding links automatically request campaign parameters (target audience, ad budgets, competitors) and marketing platforms.';
                                    default:
                                        return 'Your workspace is configured in default mode. Onboarding links request standard business information, visual assets, and initial domain configurations.';
                                }
                            })()}
                        </p>
                    </div>
                </motion.div>

                {/* 1. Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                >
                    {stats.map((s) => (
                        <StatCard key={s.label} {...s} />
                    ))}
                </motion.div>

                {/* 2. Progress Widget */}
                {total > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass rounded-2xl p-6 mb-8"
                        style={{ border: '1px solid var(--border-glass)' }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Overall completion rate</span>
                            <span className="text-sm font-bold" style={{ color: 'var(--indigo-400)' }}>{completionRate}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${completionRate}%` }}
                                transition={{ duration: 1, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
                                className="h-full rounded-full"
                                style={{ background: 'linear-gradient(90deg, var(--indigo-500), var(--violet-500))' }}
                            />
                        </div>
                    </motion.div>
                )}

                {/* 3. Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="glass rounded-2xl"
                    style={{ border: '1px solid var(--border-glass)' }}
                >
                    <div className="flex items-center justify-between p-6 pb-0 mb-4">
                        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Client Activity</h2>
                        <Link to="/dashboard/links" className="text-sm font-medium" style={{ color: 'var(--indigo-400)' }}>
                            View all →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="p-8 space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 rounded-xl animate-shimmer" style={{ background: 'rgba(255,255,255,0.04)' }} />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center">
                            <p className="text-sm" style={{ color: 'var(--rose-400)' }}>{error}</p>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="p-12 text-center">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
                            >
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--indigo-400)" strokeWidth="1.5">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                </svg>
                            </div>
                            <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No client links yet</p>
                            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Generate your first secure onboarding link to get started.</p>
                            <Link to="/dashboard/links" className="btn-primary text-sm px-6 py-2.5">
                                Generate First Link
                            </Link>
                        </div>
                    ) : (
                        <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
                            {requests.slice(0, 5).map((req) => {
                                const isCompleted = req.status === 'Completed';
                                return (
                                    <div
                                        key={req._id}
                                        className="relative flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-all overflow-hidden"
                                        style={{
                                            borderLeft: isCompleted ? '3px solid #34d399' : '3px solid transparent',
                                            background: isCompleted ? 'rgba(52, 211, 153, 0.015)' : 'transparent',
                                        }}
                                    >
                                        {/* Color beam sweep for completed links */}
                                        {isCompleted && (
                                            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                                                <div
                                                    className="absolute inset-y-0 w-2/5 animate-completion-sweep"
                                                    style={{
                                                        background: 'linear-gradient(90deg, transparent 0%, rgba(52, 211, 153, 0.08) 50%, transparent 100%)',
                                                        filter: 'blur(10px)',
                                                    }}
                                                />
                                            </div>
                                        )}

                                        <div className="relative z-10 flex items-center gap-3">
                                            <div
                                                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all"
                                                style={{
                                                    background: isCompleted ? 'rgba(52, 211, 153, 0.15)' : 'rgba(99,102,241,0.15)',
                                                    color: isCompleted ? '#34d399' : 'var(--indigo-400)',
                                                    boxShadow: isCompleted ? '0 0 12px rgba(52, 211, 153, 0.25)' : 'none',
                                                }}
                                            >
                                                {req.clientName?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{req.clientName}</p>
                                                <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{req.uniqueLinkUrl}</p>
                                            </div>
                                        </div>
                                        <div className="relative z-10 flex items-center gap-4">
                                            <Badge status={req.status} />
                                            {req.status === 'Completed' && (
                                                <Link
                                                    to={`/dashboard/submissions/${req._id}`}
                                                    className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                                                    style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--indigo-400)', border: '1px solid rgba(99,102,241,0.2)' }}
                                                >
                                                    View Data
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatedPage>
    );
}
