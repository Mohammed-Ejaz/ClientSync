import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import DataField from '../../components/ui/DataField';
import EditField from '../../components/ui/EditField';
import { getSteps, mergeSubmissionIntoForm } from '../../config/profileSchemas';
import AnimatedPage from '../../components/AnimatedPage';

function SectionHeader({ icon, title }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <span style={{ color: 'var(--indigo-400)' }}>{icon}</span>
            </div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        </div>
    );
}

// A small self-dismissing error banner, used in place of the old
// alert()-based failure handling for the lock/unlock actions.
function InlineError({ message, onDismiss }) {
    useEffect(() => {
        if (!message) return;
        const id = setTimeout(onDismiss, 5000);
        return () => clearTimeout(id);
    }, [message, onDismiss]);

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3.5 rounded-xl text-sm flex items-center justify-between gap-3"
                    style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}
                >
                    <span className="flex items-center gap-2">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        {message}
                    </span>
                    <button onClick={onDismiss} className="flex-shrink-0 opacity-70 hover:opacity-100">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function StatusTimeline({ status }) {
    const statuses = ['Pending', 'Submitted', 'Completed'];
    const currentIndex = statuses.indexOf(status);

    return (
        <div className="flex items-center justify-between mb-8 relative px-4">
            <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 rounded-full z-0" style={{ background: 'var(--border-glass)' }}></div>
            <motion.div 
                className="absolute top-1/2 left-4 h-1 -translate-y-1/2 rounded-full z-0" 
                style={{ background: 'var(--indigo-500)' }}
                initial={{ width: '0%' }}
                animate={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            />
            {statuses.map((s, i) => (
                <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                    <motion.div
                        className="w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg"
                        initial={false}
                        animate={{ 
                            background: i <= currentIndex ? 'var(--indigo-600)' : 'var(--bg-surface)',
                            borderColor: i <= currentIndex ? 'var(--indigo-400)' : 'var(--border-subtle)',
                            color: i <= currentIndex ? '#fff' : 'var(--text-muted)'
                        }}
                    >
                        {i < currentIndex ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : (
                            <span className="text-xs font-bold">{i + 1}</span>
                        )}
                    </motion.div>
                    <span className="text-xs font-medium" style={{ color: i <= currentIndex ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s}</span>
                </div>
            ))}
        </div>
    );
}

export default function SubmissionDetail() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [actionError, setActionError] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const [lockBusy, setLockBusy] = useState(false);

    const fetchDetail = useCallback(async () => {
        try {
            const res = await api.get(`/requests/${id}`);
            setData(res.data.data);
        } catch (err) {
            setLoadError(err.response?.data?.message || 'Failed to load submission data.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        setLoading(true);
        setLoadError('');
        fetchDetail();
    }, [fetchDetail]);

    const steps = data ? getSteps(data.profileType) : [];
    const sub = data?.submissionData;

    const handleStartEdit = () => {
        setEditForm(mergeSubmissionIntoForm(data.profileType, sub));
        setSaveError('');
        setIsEditing(true);
    };

    const handleEditChange = (section, key, value) => {
        setEditForm((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
    };

    const handleSaveEdits = async () => {
        setSaving(true);
        setSaveError('');
        try {
            await api.patch(`/requests/${id}/submission`, editForm);
            setIsEditing(false);
            fetchDetail();
        } catch (err) {
            setSaveError(err.response?.data?.message || 'Failed to save edits.');
        } finally {
            setSaving(false);
        }
    };

    const setLinkStatus = async (status) => {
        setLockBusy(true);
        setActionError('');
        try {
            await api.patch(`/requests/${id}`, { status });
            fetchDetail();
        } catch (err) {
            setActionError(err.response?.data?.message || `Failed to ${status === 'Completed' ? 'lock' : 'unlock'} the link.`);
        } finally {
            setLockBusy(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 md:p-8 max-w-4xl mx-auto">
                <div className="h-8 w-48 rounded-lg mb-8 animate-shimmer" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-2xl animate-shimmer" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
                </div>
            </div>
        );
    }

    if (loadError || !data) {
        return (
            <div className="p-6 md:p-8 max-w-4xl mx-auto">
                <Link to="/dashboard/links" className="btn-ghost text-sm mb-6 inline-flex">← Back to Links</Link>
                <div className="glass rounded-2xl p-12 text-center" style={{ border: '1px solid var(--border-glass)' }}>
                    <p className="text-lg font-semibold mb-2" style={{ color: '#f87171' }}>Submission Not Found</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{loadError || 'This submission could not be found or you do not have access.'}</p>
                </div>
            </div>
        );
    }

    const primaryColor = sub?.projectAssets?.primaryColor;

    return (
        <AnimatedPage>
            <div className="p-6 md:p-8 max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 flex items-center justify-between">
                    <Link to="/dashboard/links" className="btn-ghost text-sm px-0 gap-1.5 inline-flex">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                        Back to Links
                    </Link>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        transition={{ delay: 2, duration: 0.5 }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full" 
                        style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)' }}
                    >
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--emerald-400)' }}></span>
                        <span className="text-xs font-medium" style={{ color: 'var(--emerald-400)' }}>Client is currently viewing</span>
                    </motion.div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 mb-6" style={{ border: '1px solid var(--border-glass)' }}>
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
                                style={{
                                    background: primaryColor ? `${primaryColor}20` : 'rgba(99,102,241,0.15)',
                                    border: `1px solid ${primaryColor ? `${primaryColor}40` : 'rgba(99,102,241,0.25)'}`,
                                    color: primaryColor || 'var(--indigo-400)',
                                }}
                            >
                                {data.clientName?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{data.clientName}</h1>
                                <code className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{data.uniqueLinkUrl}</code>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <Badge status={data.status} />
                            {sub && !isEditing && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleStartEdit}
                                        className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all duration-200"
                                        style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--indigo-400)', border: '1px solid rgba(99,102,241,0.2)' }}
                                    >
                                        Edit Details
                                    </button>
                                    {data.status === 'Completed' ? (
                                        <button
                                            onClick={() => setLinkStatus('Pending')}
                                            disabled={lockBusy}
                                            className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                                            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}
                                        >
                                            Unlock for Revision
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setLinkStatus('Completed')}
                                            disabled={lockBusy}
                                            className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                                        >
                                            Lock Link
                                        </button>
                                    )}
                                </div>
                            )}
                            {data.updatedAt && (
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    Updated {new Date(data.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>

                <StatusTimeline status={data.status} />

                <InlineError message={actionError} onDismiss={() => setActionError('')} />

                {data.status === 'Pending' && sub && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-xl flex items-center justify-between gap-4"
                        style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}
                    >
                        <div className="flex items-center gap-3">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                            <div>
                                <p className="text-sm font-semibold">Link Unlocked for Revision</p>
                                <p className="text-xs" style={{ color: 'rgba(251,191,36,0.8)' }}>The client can currently edit and submit their details via the onboarding link.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setLinkStatus('Completed')}
                            disabled={lockBusy}
                            className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                            style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}
                        >
                            Lock Link
                        </button>
                    </motion.div>
                )}

                {!sub ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-12 text-center" style={{ border: '1px solid var(--border-glass)' }}>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        </div>
                        <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Awaiting Client Submission</p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>The client hasn't completed their onboarding wizard yet.</p>
                    </motion.div>
                ) : isEditing ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {steps.map((step) => (
                            <div key={step.title} className="glass rounded-2xl p-6" style={{ border: '1px solid var(--border-glass)' }}>
                                <SectionHeader icon={step.icon} title={`Edit ${step.title}`} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {step.fields.map((fld) => (
                                        <EditField
                                            key={`${fld.section}.${fld.key}`}
                                            field={fld}
                                            value={editForm[fld.section]?.[fld.key] ?? ''}
                                            onChange={(e) => handleEditChange(fld.section, fld.key, e.target.value)}
                                            className={fld.type === 'textarea' ? 'md:col-span-2' : undefined}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}

                        {saveError && (
                            <p className="text-sm p-3 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                                {saveError}
                            </p>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-4">
                            <button
                                onClick={() => setIsEditing(false)}
                                disabled={saving}
                                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
                                style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                            >
                                Cancel
                            </button>
                            <button onClick={handleSaveEdits} disabled={saving} className="btn-primary px-4 py-2">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.08 * i }}
                                className="glass rounded-2xl p-6"
                                style={{ border: '1px solid var(--border-glass)' }}
                            >
                                <SectionHeader icon={step.icon} title={step.title} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {step.fields.map((fld) => (
                                        <DataField
                                            key={`${fld.section}.${fld.key}`}
                                            field={fld}
                                            value={sub[fld.section]?.[fld.key]}
                                            className={fld.type === 'textarea' ? 'md:col-span-2' : undefined}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        ))}

                        <motion.details
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="glass rounded-2xl overflow-hidden"
                            style={{ border: '1px solid var(--border-glass)' }}
                        >
                            <summary className="px-6 py-4 cursor-pointer text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                View raw JSON payload
                            </summary>
                            <pre className="px-6 pb-6 text-xs overflow-x-auto" style={{ color: 'var(--text-secondary)' }}>
                                {JSON.stringify(sub, null, 2)}
                            </pre>
                        </motion.details>
                    </div>
                )}
            </div>
        </AnimatedPage>
    );
}