import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import ConfirmModal from '../../components/ui/ConfirmModal';
import EditRequestModal from './EditRequestModal';
import AnimatedPage from '../../components/AnimatedPage';

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const id = setTimeout(() => setCopied(false), 2000);
        return () => clearTimeout(id);
    }, [copied]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
        } catch {
            // clipboard API can be unavailable (non-HTTPS origin, permissions) —
            // fail quietly rather than throwing an unhandled rejection.
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{
                background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(99,102,241,0.1)',
                color: copied ? '#34d399' : 'var(--indigo-400)',
                border: copied ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(99,102,241,0.2)',
            }}
        >
            {copied ? (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Copied!</>
            ) : (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>Copy</>
            )}
        </button>
    );
}

export default function LinksPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [generating, setGenerating] = useState(false);
    const [genError, setGenError] = useState('');
    const [newLink, setNewLink] = useState(null);
    const [filter, setFilter] = useState('all');

    const [editingRequest, setEditingRequest] = useState(null);
    const [deletingRequest, setDeletingRequest] = useState(null);
    const [deleteBusy, setDeleteBusy] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchLinks = useCallback(async (isSilent = false) => {
        if (!isSilent) setIsRefreshing(true);
        try {
            const res = await api.get('/requests');
            setRequests(res.data.data || []);
            setLoadError('');
        } catch {
            if (!isSilent) setLoadError('Failed to load links.');
        } finally {
            setLoading(false);
            if (!isSilent) setTimeout(() => setIsRefreshing(false), 400);
        }
    }, []);

    useEffect(() => {
        fetchLinks();
        // Auto-refresh in background every 10 seconds when tab is active
        const timer = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchLinks(true);
            }
        }, 10000);
        return () => clearInterval(timer);
    }, [fetchLinks]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!clientName.trim()) { setGenError('Client name is required.'); return; }
        setGenerating(true);
        setGenError('');
        setNewLink(null);

        try {
            const res = await api.post('/requests/create', { clientName: clientName.trim(), clientEmail: clientEmail.trim() });
            setNewLink(res.data.data);
            setClientName('');
            setClientEmail('');
            fetchLinks();
        } catch (err) {
            setGenError(err.response?.data?.message || 'Failed to generate link.');
        } finally {
            setGenerating(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingRequest) return;
        setDeleteBusy(true);
        setDeleteError('');
        try {
            await api.delete(`/requests/${deletingRequest._id}`);
            setDeletingRequest(null);
            fetchLinks();
        } catch (err) {
            setDeleteError(err.response?.data?.message || 'Failed to delete this link.');
        } finally {
            setDeleteBusy(false);
        }
    };

    const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

    return (
        <AnimatedPage>
            <div className="p-6 md:p-8 max-w-6xl mx-auto">
                <AnimatePresence>
                    {editingRequest && (
                        <EditRequestModal
                            key="edit-request"
                            request={editingRequest}
                            onClose={() => setEditingRequest(null)}
                            onSaved={fetchLinks}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {deletingRequest && (
                        <ConfirmModal
                            key="delete-request"
                            title="Delete this link?"
                            body={`This permanently deletes the onboarding link for "${deletingRequest.clientName}"${deletingRequest.submissionData ? ' along with their submitted data' : ''}. This can't be undone.`}
                            confirmLabel="Delete Link"
                            danger
                            loading={deleteBusy}
                            error={deleteError}
                            onConfirm={handleConfirmDelete}
                            onCancel={() => { setDeletingRequest(null); setDeleteError(''); }}
                        />
                    )}
                </AnimatePresence>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Client Links</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Generate and manage secure client onboarding links.</p>
                </motion.div>

                {/* Generator Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-2xl p-6 mb-6"
                    style={{ border: '1px solid rgba(99,102,241,0.25)', boxShadow: '0 0 40px rgba(99,102,241,0.08)' }}
                >
                    <h2 className="text-base font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--indigo-400)" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        </span>
                        Generate New Onboarding Link
                    </h2>

                    <form onSubmit={handleGenerate}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Client / Company Name *</label>
                                <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="input-field" placeholder="e.g., Acme Corporation" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Client Email (optional)</label>
                                <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="input-field" placeholder="client@company.com" />
                            </div>
                        </div>

                        {genError && (
                            <p className="text-sm mb-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                                {genError}
                            </p>
                        )}

                        <button type="submit" disabled={generating} className="btn-primary">
                            {generating ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                    Generating…
                                </span>
                            ) : 'Generate Secure Link'}
                        </button>
                    </form>

                    <AnimatePresence>
                        {newLink && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.4 }}
                                className="mt-5 p-4 rounded-xl"
                                style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}
                            >
                                <p className="text-xs font-semibold mb-2" style={{ color: '#34d399' }}>✓ Link generated for {newLink.clientName}</p>
                                <div className="flex items-center gap-3">
                                    <code className="flex-1 text-xs font-mono px-3 py-2 rounded-lg truncate" style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text-secondary)' }}>
                                        {`${window.location.origin}/onboarding/${newLink.uniqueLink}`}
                                    </code>
                                    <CopyButton text={`${window.location.origin}/onboarding/${newLink.uniqueLink}`} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Filter Tabs & Refresh Controls */}
                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        {[['all', 'All'], ['Pending', 'Pending'], ['Completed', 'Completed']].map(([val, label]) => (
                            <button
                                key={val}
                                onClick={() => setFilter(val)}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                                style={{
                                    background: filter === val ? 'rgba(99,102,241,0.2)' : 'transparent',
                                    color: filter === val ? 'var(--text-primary)' : 'var(--text-muted)',
                                    border: filter === val ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                                }}
                            >
                                {label}
                                <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                    {val === 'all' ? requests.length : requests.filter((r) => r.status === val).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => fetchLinks(false)}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                        style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            color: isRefreshing ? 'var(--indigo-400)' : 'var(--text-secondary)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                        title="Check for newly completed client submissions"
                    >
                        <svg
                            className={`transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                        </svg>
                        <span>{isRefreshing ? 'Checking…' : 'Refresh Status'}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Live background syncing active" />
                    </button>
                </div>

                {/* Links Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-2xl overflow-hidden"
                    style={{ border: '1px solid var(--border-glass)' }}
                >
                    {loading ? (
                        <div className="p-8 space-y-4">
                            {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl animate-shimmer" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
                        </div>
                    ) : loadError ? (
                        <div className="p-8 text-center"><p style={{ color: '#f87171' }}>{loadError}</p></div>
                    ) : filtered.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>No {filter !== 'all' ? filter.toLowerCase() + ' ' : ''}links found</p>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Generate a link above to get started.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="hidden md:grid md:grid-cols-12 px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                                <span className="md:col-span-3">Client</span>
                                <span className="md:col-span-4">Link Token</span>
                                <span className="md:col-span-2">Status</span>
                                <span className="md:col-span-1">Created</span>
                                <span className="md:col-span-2 text-right">Actions</span>
                            </div>

                            <div>
                                {filtered.map((req, i) => (
                                    <motion.div
                                        key={req._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="flex flex-col md:grid md:grid-cols-12 md:items-center px-6 py-4 hover:bg-white/[0.02] transition-colors"
                                        style={{ borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none' }}
                                    >
                                        <div className="md:col-span-3 flex items-center justify-between md:justify-start gap-3 min-w-0 mb-3 md:mb-0">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--indigo-400)' }}>
                                                    {req.clientName?.[0]?.toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{req.clientName}</span>
                                            </div>
                                            <div className="md:hidden">
                                                <Badge status={req.status} />
                                            </div>
                                        </div>
                                        <div className="md:col-span-4 flex md:hidden lg:flex items-center gap-2 mb-3 md:mb-0">
                                            <code className="text-xs font-mono truncate" style={{ color: 'var(--text-muted)' }}>{req.uniqueLinkUrl}</code>
                                            <CopyButton text={`${window.location.origin}/onboarding/${req.uniqueLinkUrl}`} />
                                        </div>
                                        <div className="md:col-span-2 hidden md:block"><Badge status={req.status} /></div>
                                        <div className="md:col-span-1 hidden md:block text-xs" style={{ color: 'var(--text-muted)' }}>
                                            {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="md:col-span-2 flex justify-start md:justify-end items-center gap-2 flex-wrap sm:flex-nowrap">
                                            <button
                                                onClick={() => fetchLinks(false)}
                                                disabled={isRefreshing}
                                                className="text-xs p-1.5 rounded-lg font-medium transition-all duration-200 hover:bg-white/10"
                                                style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                                                title="Refresh this link status"
                                                aria-label={`Refresh status for ${req.clientName}`}
                                            >
                                                <svg
                                                    className={isRefreshing ? 'animate-spin' : ''}
                                                    width="13"
                                                    height="13"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setEditingRequest(req)}
                                                className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all duration-200"
                                                style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                                            >
                                                Edit
                                            </button>
                                            {req.status === 'Completed' && (
                                                <Link to={`/dashboard/submissions/${req._id}`} className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all duration-200" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--indigo-400)', border: '1px solid rgba(99,102,241,0.2)' }}>
                                                    View
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => setDeletingRequest(req)}
                                                className="text-xs p-1.5 rounded-lg font-medium transition-all duration-200"
                                                style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.18)' }}
                                                aria-label={`Delete link for ${req.clientName}`}
                                                title="Delete link"
                                            >
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatedPage>
    );
}