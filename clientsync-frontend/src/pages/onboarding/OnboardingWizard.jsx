import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { getSteps, buildEmptyForm, mergeSubmissionIntoForm, findFirstMissingRequiredField } from '../../config/profileSchemas';

const DRAFT_PREFIX = 'clientsync-draft:';

function StepField({ field: fld, value, onChange, showError }) {
    const [focused, setFocused] = useState(false);
    const isEmpty = !value?.trim();
    const invalid = showError && fld.required && isEmpty;

    return (
        <div>
            <label className="block text-sm font-medium mb-2" style={{ color: invalid ? '#f87171' : focused ? 'var(--indigo-400)' : 'var(--text-secondary)' }}>
                {fld.label}
            </label>
            {fld.type === 'textarea' ? (
                <textarea
                    rows={3}
                    value={value}
                    onChange={onChange}
                    placeholder={fld.placeholder}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="input-field resize-none"
                    style={invalid ? { borderColor: 'rgba(248,113,113,0.5)' } : undefined}
                />
            ) : (
                <div className="relative">
                    <input
                        type={fld.type}
                        value={value}
                        onChange={onChange}
                        placeholder={fld.placeholder}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        className="input-field"
                        style={invalid ? { borderColor: 'rgba(248,113,113,0.5)' } : undefined}
                    />
                    <motion.div
                        className="absolute bottom-0 left-0 h-0.5 rounded-full"
                        style={{ background: 'linear-gradient(90deg, var(--indigo-500), var(--violet-500))' }}
                        animate={{ width: focused ? '100%' : '0%' }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            )}
            {fld.kind === 'color' && value && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) && (
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-8 h-8 rounded-lg border" style={{ background: value, border: '2px solid rgba(255,255,255,0.1)' }} />
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Preview</span>
                </div>
            )}
            {invalid ? (
                <p className="text-xs mt-1.5" style={{ color: '#f87171' }}>This field is required.</p>
            ) : fld.note ? (
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>{fld.note}</p>
            ) : null}
        </div>
    );
}

const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0, scale: 0.98 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0, scale: 0.98 }),
};

export default function OnboardingWizard() {
    const { uniqueLink } = useParams();
    const draftKey = `${DRAFT_PREFIX}${uniqueLink}`;

    const [preflight, setPreflight] = useState({ loading: true, error: null, clientName: '', profileType: 'other', hadPreviousSubmission: false });
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [status, setStatus] = useState('idle'); // idle | submitting | success | error
    const [errorMsg, setErrorMsg] = useState('');
    const [showValidation, setShowValidation] = useState(false);
    const [formData, setFormData] = useState(() => buildEmptyForm('other'));

    const profileType = preflight.profileType || 'other';
    const steps = useMemo(() => getSteps(profileType), [profileType]);

    // Pre-flight: verify link is valid, then load previous submission or a
    // locally-saved draft (whichever exists) into the form.
    useEffect(() => {
        let cancelled = false;

        const verify = async () => {
            try {
                const res = await api.get(`/submissions/check/${uniqueLink}`);
                if (cancelled) return;
                const { clientName, previousSubmissionData, profileType: backendProfileType } = res.data.data;

                setPreflight({
                    loading: false,
                    error: null,
                    clientName,
                    profileType: backendProfileType || 'other',
                    hadPreviousSubmission: !!previousSubmissionData,
                });

                if (previousSubmissionData) {
                    setFormData(mergeSubmissionIntoForm(backendProfileType || 'other', previousSubmissionData));
                } else {
                    // No server-side data yet — restore an in-progress local draft, if any.
                    try {
                        const raw = localStorage.getItem(draftKey);
                        if (raw) {
                            const draft = JSON.parse(raw);
                            setFormData(mergeSubmissionIntoForm(backendProfileType || 'other', draft.formData));
                            setStep(Math.min(draft.step || 1, getSteps(backendProfileType || 'other').length));
                        } else {
                            setFormData(buildEmptyForm(backendProfileType || 'other'));
                        }
                    } catch {
                        setFormData(buildEmptyForm(backendProfileType || 'other'));
                    }
                }
            } catch (err) {
                if (cancelled) return;
                const msg = err.response?.data?.message || 'This onboarding link is invalid or has expired.';
                const alreadyDone = err.response?.data?.alreadyCompleted;
                setPreflight((prev) => ({ ...prev, loading: false, error: msg, alreadyDone }));
            }
        };

        verify();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uniqueLink]);

    // Persist a local draft (debounced) whenever the form changes, as long as
    // we're not editing a previously-submitted record (that's already saved
    // server-side) and haven't succeeded yet.
    useEffect(() => {
        if (preflight.loading || preflight.error || preflight.hadPreviousSubmission || status === 'success') return;
        const id = setTimeout(() => {
            try {
                localStorage.setItem(draftKey, JSON.stringify({ formData, step, savedAt: Date.now() }));
            } catch {
                // Storage unavailable (private mode, quota) — draft persistence
                // is a convenience, not a requirement, so fail silently.
            }
        }, 500);
        return () => clearTimeout(id);
    }, [formData, step, draftKey, preflight.loading, preflight.error, preflight.hadPreviousSubmission, status]);

    const handleChange = useCallback((section, fieldKey, value) => {
        setFormData((prev) => ({
            ...prev,
            [section]: { ...prev[section], [fieldKey]: value },
        }));
    }, []);

    const goToStep = (targetStep, dir) => {
        setDirection(dir);
        setShowValidation(false);
        setStep(targetStep);
    };

    const nextStep = () => {
        const missing = findFirstMissingRequiredField(profileType, step - 1, formData);
        if (missing) {
            setShowValidation(true);
            return;
        }
        goToStep(Math.min(step + 1, steps.length), 1);
    };

    const prevStep = () => goToStep(Math.max(step - 1, 1), -1);

    const handleSubmit = async () => {
        const missingStepIndex = steps.findIndex((_, i) => findFirstMissingRequiredField(profileType, i, formData));
        if (missingStepIndex !== -1) {
            goToStep(missingStepIndex + 1, missingStepIndex + 1 < step ? -1 : 1);
            setShowValidation(true);
            return;
        }

        setStatus('submitting');
        setErrorMsg('');
        try {
            await api.post(`/submissions/${uniqueLink}`, formData);
            try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
            setStatus('success');
        } catch (err) {
            if (err.response?.status === 409 || err.response?.data?.alreadyCompleted) {
                setErrorMsg('This link was just completed — possibly in another tab. Refresh to check its status.');
            } else {
                setErrorMsg(err.response?.data?.message || 'Something went wrong. Please try again.');
            }
            setStatus('error');
        }
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (preflight.loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-transparent" style={{ borderTopColor: 'var(--indigo-500)', animation: 'spin-slow 0.8s linear infinite' }} />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Verifying your onboarding link…</p>
                </div>
            </div>
        );
    }

    // ── Invalid / already completed ───────────────────────────────────────────
    if (preflight.error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
                <div className="absolute w-96 h-96 rounded-full" style={{ background: 'var(--indigo-600)', filter: 'blur(120px)', opacity: 0.1, top: '10%', left: '20%', pointerEvents: 'none' }} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-elevated rounded-2xl p-12 max-w-md w-full text-center relative"
                >
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                        style={{ background: preflight.alreadyDone ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${preflight.alreadyDone ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}` }}
                    >
                        {preflight.alreadyDone ? (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                        )}
                    </div>
                    <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                        {preflight.alreadyDone ? 'Already Submitted' : 'Link Invalid'}
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{preflight.error}</p>
                </motion.div>
            </div>
        );
    }

    // ── Success state ─────────────────────────────────────────────────────────
    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(52,211,153,0.1) 0%, transparent 70%)' }} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                    className="glass-elevated rounded-2xl p-12 max-w-md w-full text-center relative"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 12 }}
                        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                        style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}
                    >
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold mb-3"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        You're all set! 🎉
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-base leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Your onboarding details have been securely submitted.
                    </motion.p>
                </motion.div>
            </div>
        );
    }

    // ── Main wizard ───────────────────────────────────────────────────────────
    const currentStep = steps[step - 1];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
            <div className="absolute w-96 h-96 rounded-full" style={{ background: 'var(--indigo-600)', filter: 'blur(120px)', opacity: 0.1, top: '5%', right: '10%', pointerEvents: 'none' }} />
            <div className="absolute w-80 h-80 rounded-full" style={{ background: 'var(--violet-600)', filter: 'blur(100px)', opacity: 0.08, bottom: '10%', left: '5%', pointerEvents: 'none' }} />

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 relative z-10">
                <div className="inline-flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--indigo-600), var(--violet-600))' }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" /></svg>
                    </div>
                    <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Client<span className="gradient-text">Sync</span></span>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Onboarding form for <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{preflight.clientName}</span>
                </p>
            </motion.div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="glass-elevated rounded-2xl w-full max-w-lg relative z-10 overflow-hidden"
            >
                {/* Progress bar */}
                <div className="h-1 w-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                        animate={{ width: `${(step / steps.length) * 100}%` }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        className="h-full"
                        style={{ background: 'linear-gradient(90deg, var(--indigo-500), var(--violet-500))' }}
                    />
                </div>

                {/* Step indicators */}
                <div className="flex items-center justify-between px-8 pt-6 pb-4">
                    {steps.map((s, i) => (
                        <div key={s.title} className="flex items-center gap-2">
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                                style={{
                                    background: step > i + 1 ? 'rgba(52,211,153,0.2)' : step === i + 1 ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)',
                                    border: step === i + 1 ? '1px solid rgba(99,102,241,0.5)' : step > i + 1 ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.08)',
                                    color: step > i + 1 ? '#34d399' : step === i + 1 ? 'var(--indigo-400)' : 'var(--text-muted)',
                                }}
                            >
                                {step > i + 1 ? '✓' : i + 1}
                            </div>
                            {i < steps.length - 1 && (
                                <div className="w-16 h-px" style={{ background: step > i + 1 ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)' }} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Animated step content */}
                <div className="px-8 pb-8 overflow-hidden">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                        >
                            {/* Step Header */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl">{currentStep.icon}</span>
                                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{currentStep.title}</h2>
                                </div>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{currentStep.subtitle}</p>
                            </div>

                            {/* Error */}
                            {status === 'error' && (
                                <div className="mb-4 p-3.5 rounded-xl text-sm flex items-center gap-3" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    {errorMsg}
                                </div>
                            )}

                            {/* Schema-driven fields */}
                            <div className="space-y-4">
                                {currentStep.fields.map((fld) => (
                                    <StepField
                                        key={`${fld.section}.${fld.key}`}
                                        field={fld}
                                        value={formData[fld.section]?.[fld.key] ?? ''}
                                        onChange={(e) => handleChange(fld.section, fld.key, e.target.value)}
                                        showError={showValidation}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <button
                            onClick={prevStep}
                            disabled={step === 1 || status === 'submitting'}
                            className="btn-ghost flex items-center gap-2 disabled:opacity-30"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                            Back
                        </button>

                        {step < steps.length ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={nextStep}
                                className="btn-primary"
                            >
                                Next Step
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSubmit}
                                disabled={status === 'submitting'}
                                className="btn-primary"
                                style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
                            >
                                {status === 'submitting' ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                        Submitting…
                                    </span>
                                ) : (
                                    <>
                                        Complete Onboarding
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                    </>
                                )}
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-xs text-center relative z-10"
                style={{ color: 'var(--text-muted)' }}
            >
                🔒 Your data is encrypted in transit and stored securely. Powered by ClientSync.
            </motion.p>
        </div>
    );
}