import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import EditField from '../../components/ui/EditField';
import { getSteps, mergeSubmissionIntoForm } from '../../config/profileSchemas';

export default function EditRequestModal({ request, onClose, onSaved }) {
    const hasSubmission = request.status === 'Completed' && !!request.submissionData;
    const steps = getSteps(request.profileType);

    const [activeTab, setActiveTab] = useState('link');
    const [clientName, setClientName] = useState(request.clientName || '');
    const [clientEmail, setClientEmail] = useState(request.clientEmail || '');
    const [submissionForm, setSubmissionForm] = useState(() =>
        mergeSubmissionIntoForm(request.profileType, request.submissionData)
    );

    const [confirmingRegen, setConfirmingRegen] = useState(false);
    const [regenBusy, setRegenBusy] = useState(false);
    const [currentToken, setCurrentToken] = useState(request.uniqueLinkUrl);
    const [regenError, setRegenError] = useState('');

    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const onboardingUrl = `${window.location.origin}/onboarding/${currentToken}`;

    const handleRegenerate = async () => {
        setRegenBusy(true);
        setRegenError('');
        try {
            const res = await api.post(`/requests/${request._id}/regenerate-token`);
            setCurrentToken(res.data.data.uniqueLink);
            setConfirmingRegen(false);
        } catch (err) {
            setRegenError(err.response?.data?.message || 'Failed to regenerate the link.');
        } finally {
            setRegenBusy(false);
        }
    };

    const handleEditSubmissionField = (section, key, value) => {
        setSubmissionForm((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!clientName.trim()) { setSaveError('Client name is required.'); return; }

        setSaving(true);
        setSaveError('');
        try {
            await api.patch(`/requests/${request._id}`, {
                clientName: clientName.trim(),
                clientEmail: clientEmail.trim(),
            });

            if (hasSubmission) {
                await api.patch(`/requests/${request._id}/submission`, submissionForm);
            }

            onSaved();
            onClose();
        } catch (err) {
            setSaveError(err.response?.data?.message || 'Failed to update. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal title="Edit Client Record" onClose={onClose} maxWidth={hasSubmission ? 680 : 520}>
            <div className="flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--indigo-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Edit Client Record</h3>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{request.clientName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="transition-colors" style={{ color: 'var(--text-muted)' }} aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                {hasSubmission && (
                    <div className="flex gap-1 px-6 pb-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {[
                            { id: 'link', label: 'Link Details', icon: '🔗' },
                            { id: 'submission', label: 'Submitted Data', icon: '📋' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                                style={{
                                    background: activeTab === tab.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                                    color: activeTab === tab.id ? 'var(--indigo-300)' : 'var(--text-muted)',
                                    border: activeTab === tab.id ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                                }}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
                    <div className="overflow-y-auto flex-1 px-6 py-5">
                        <AnimatePresence mode="wait">
                            {activeTab === 'link' && (
                                <motion.div key="link" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Client / Company Name *</label>
                                        <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="input-field w-full" placeholder="e.g., Acme Corporation" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Client Email (optional)</label>
                                        <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="input-field w-full" placeholder="client@company.com" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Onboarding Link</label>
                                        <div className="flex gap-2">
                                            <code
                                                className="flex-1 text-xs font-mono px-3 py-2.5 rounded-lg truncate"
                                                style={{ background: 'rgba(0,0,0,0.25)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                                            >
                                                {onboardingUrl}
                                            </code>
                                            <button
                                                type="button"
                                                onClick={() => setConfirmingRegen(true)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1 flex-shrink-0"
                                                style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--indigo-400)', border: '1px solid rgba(99,102,241,0.2)' }}
                                            >
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>
                                                Regenerate
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {confirmingRegen && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-3 p-3.5 rounded-xl"
                                                    style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}
                                                >
                                                    <p className="text-xs font-semibold mb-1" style={{ color: '#fbbf24' }}>This will break the current link.</p>
                                                    <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                                                        Anyone who still has the old link (including the client, if you already sent it) won't be able to use it anymore. You'll need to send the new one.
                                                    </p>
                                                    {regenError && <p className="text-xs mb-3" style={{ color: '#f87171' }}>{regenError}</p>}
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => { setConfirmingRegen(false); setRegenError(''); }}
                                                            className="text-xs px-3 py-1.5 rounded-lg font-medium"
                                                            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleRegenerate}
                                                            disabled={regenBusy}
                                                            className="text-xs px-3 py-1.5 rounded-lg font-bold disabled:opacity-60"
                                                            style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}
                                                        >
                                                            {regenBusy ? 'Regenerating…' : 'Yes, regenerate'}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'submission' && hasSubmission && (
                                <motion.div key="submission" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }} className="space-y-6">
                                    {steps.map((step) => (
                                        <div key={step.title}>
                                            <p className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                                <span>{step.icon}</span> {step.title}
                                            </p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {step.fields.map((fld) => (
                                                    <EditField
                                                        key={`${fld.section}.${fld.key}`}
                                                        field={fld}
                                                        value={submissionForm[fld.section]?.[fld.key] ?? ''}
                                                        onChange={(e) => handleEditSubmissionField(fld.section, fld.key, e.target.value)}
                                                        className={fld.type === 'textarea' ? 'col-span-2' : undefined}
                                                    />
                                                ))}
                                            </div>
                                            <div className="mt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="px-6 pb-6 pt-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {saveError && (
                            <p className="text-sm mb-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                                {saveError}
                            </p>
                        )}
                        <div className="flex items-center justify-between">
                            {hasSubmission && (
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Changes on both tabs save together.</p>
                            )}
                            <div className="flex items-center gap-3 ml-auto">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={saving}
                                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="btn-primary px-5 py-2">
                                    {saving ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                            Saving…
                                        </span>
                                    ) : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
}