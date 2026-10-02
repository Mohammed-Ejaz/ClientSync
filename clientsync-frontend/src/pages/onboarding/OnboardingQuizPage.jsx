import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const SPECIALTIES = [
    {
        id: 'designer',
        label: 'Designer',
        desc: 'UI/UX, branding, graphic or product design',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19" />
                <path d="M6 14C6.5 13.5 7.5 13 8.5 13.5C9.5 14 10.5 14.5 11.5 14C12.5 13.5 13 12.5 13.5 11.5C14 10.5 14.5 9.5 15.5 8.5C16.5 7.5 17.5 7.5 18 8" />
                <circle cx="7.5" cy="10.5" r="1.5" />
                <circle cx="11.5" cy="7.5" r="1.5" />
                <circle cx="16.5" cy="9.5" r="1.5" />
                <circle cx="15.5" cy="14.5" r="1.5" />
            </svg>
        ),
    },
    {
        id: 'developer',
        label: 'Developer',
        desc: 'Web, mobile, software or devops engineering',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
                <line x1="14" y1="4" x2="10" y2="20" />
            </svg>
        ),
    },
    {
        id: 'marketer',
        label: 'Marketer',
        desc: 'SEO, ads, content strategy, or social media',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
                <path d="M12 6v6l4 2" />
            </svg>
        ),
    },
    {
        id: 'agency',
        label: 'Agency',
        desc: 'Studio or team offering multi-disciplinary services',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                <line x1="9" y1="22" x2="9" y2="16" />
                <line x1="15" y1="22" x2="15" y2="16" />
                <line x1="9" y1="16" x2="15" y2="16" />
                <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01" />
            </svg>
        ),
    },
    {
        id: 'consultant',
        label: 'Consultant',
        desc: 'Strategy, coaching, business operations, or law',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        ),
    },
    {
        id: 'other',
        label: 'Other',
        desc: 'Anything else entirely — customized on the go',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ),
    },
];

const WORK_STYLES = [
    { id: 'solo', label: 'Solo Freelancer', desc: 'Just me, managing projects independently' },
    { id: 'small_team', label: 'Small Team', desc: '2 to 5 members collaborating together' },
    { id: 'growing_agency', label: 'Growing Agency', desc: '6 to 20 staff scaling our production' },
    { id: 'established_studio', label: 'Established Studio', desc: '20+ team members with complex workflows' },
];

const NEEDS = [
    { id: 'onboarding', label: 'Client Onboarding', desc: 'Securely collect project requirements, assets, and specs' },
    { id: 'proposals', label: 'Proposals & Contracts', desc: 'Draft pitches and request digital signatures (Pro)' },
    { id: 'tracking', label: 'Milestone Tracking', desc: 'Show clients visual project roadmap & task statuses (Pro)' },
    { id: 'invoices', label: 'Invoices & Payments', desc: 'Generate professional invoices and sync payments (Pro)' },
];

export default function OnboardingQuizPage() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [profileType, setProfileType] = useState('');
    const [workStyle, setWorkStyle] = useState('');
    const [primaryNeeds, setPrimaryNeeds] = useState([]);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const toggleNeed = (id) => {
        setPrimaryNeeds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleNext = () => {
        if (step === 1 && !profileType) return;
        if (step === 2 && !workStyle) return;
        setErrorMsg('');
        setDirection(1);
        setStep((s) => s + 1);
    };

    const handleBack = () => {
        setErrorMsg('');
        setDirection(-1);
        setStep((s) => Math.max(1, s - 1));
    };

    const handleSubmit = async () => {
        setSaving(true);
        setErrorMsg('');
        try {
            const res = await api.put('/auth/onboarding', {
                profileType,
                workStyle,
                primaryNeeds,
            });
            updateUser(res.data.user);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to complete onboarding. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const slideVariants = {
        enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
            <div className="absolute w-96 h-96 rounded-full pointer-events-none" style={{ background: 'var(--indigo-600)', filter: 'blur(120px)', opacity: 0.12, top: '5%', right: '20%' }} />
            <div className="absolute w-80 h-80 rounded-full pointer-events-none" style={{ background: 'var(--violet-600)', filter: 'blur(100px)', opacity: 0.1, bottom: '15%', left: '10%' }} />

            <div className="relative z-10 w-full max-w-xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--indigo-600), var(--violet-600))' }}>
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="white">
                                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" />
                            </svg>
                        </div>
                        <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Client<span className="gradient-text">Sync</span></span>
                    </div>
                    <h1 className="text-xl font-medium" style={{ color: 'var(--text-secondary)' }}>Welcome, {user?.name?.split(' ')[0]}! Let's build your workspace.</h1>
                </div>

                {/* Wizard Container */}
                <div className="glass-elevated rounded-2xl p-8 overflow-hidden">
                    {/* Progress indicator */}
                    <div className="flex items-center gap-2 mb-8">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className="h-1 rounded-full transition-all duration-400"
                                style={{
                                    flex: step === s ? 3 : 1,
                                    background: step >= s ? 'linear-gradient(90deg, var(--indigo-500), var(--violet-500))' : 'rgba(255,255,255,0.06)',
                                }}
                            />
                        ))}
                        <span className="ml-2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Step {step} of 3</span>
                    </div>

                    {/* Error message */}
                    <AnimatePresence>
                        {errorMsg && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 p-4 rounded-xl text-sm flex items-center gap-3"
                                style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {errorMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Steps view */}
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        >
                            {/* Step 1: Profile Type / Specialty */}
                            {step === 1 && (
                                <div>
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>What is your specialty?</h2>
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>We'll customize your client onboarding questions based on your background.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                        {SPECIALTIES.map((opt) => {
                                            const active = profileType === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setProfileType(opt.id)}
                                                    className="p-4 rounded-xl text-left transition-all duration-200 border flex items-start gap-3.5 group relative overflow-hidden"
                                                    style={{
                                                        background: active ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.01)',
                                                        borderColor: active ? 'var(--indigo-500)' : 'var(--border-glass)',
                                                        boxShadow: active ? '0 0 20px rgba(99,102,241,0.1)' : 'none',
                                                    }}
                                                >
                                                    <span
                                                        className="p-2.5 rounded-lg flex-shrink-0 transition-colors"
                                                        style={{
                                                            background: active ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                                                            color: active ? 'var(--indigo-400)' : 'var(--text-muted)',
                                                        }}
                                                    >
                                                        {opt.icon}
                                                    </span>
                                                    <div>
                                                        <p className="font-semibold text-sm leading-snug mb-0.5" style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{opt.label}</p>
                                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{opt.desc}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Work Style */}
                            {step === 2 && (
                                <div>
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>How do you work?</h2>
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tell us about your team setup so we can tailor workspace permissions.</p>
                                    </div>

                                    <div className="space-y-3.5">
                                        {WORK_STYLES.map((opt) => {
                                            const active = workStyle === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setWorkStyle(opt.id)}
                                                    className="w-full p-4 rounded-xl text-left transition-all duration-200 border flex items-center justify-between group"
                                                    style={{
                                                        background: active ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.01)',
                                                        borderColor: active ? 'var(--indigo-500)' : 'var(--border-glass)',
                                                    }}
                                                >
                                                    <div>
                                                        <p className="font-semibold text-sm leading-snug mb-0.5" style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{opt.label}</p>
                                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{opt.desc}</p>
                                                    </div>
                                                    <div
                                                        className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors"
                                                        style={{
                                                            borderColor: active ? 'var(--indigo-500)' : 'var(--text-muted)',
                                                            background: active ? 'var(--indigo-500)' : 'transparent',
                                                        }}
                                                    >
                                                        {active && (
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Primary Needs */}
                            {step === 3 && (
                                <div>
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>What do you need most?</h2>
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Select all the modules you want active in your sidebar workspace (you can toggle these in Settings).</p>
                                    </div>

                                    <div className="space-y-3">
                                        {NEEDS.map((opt) => {
                                            const active = primaryNeeds.includes(opt.id);
                                            return (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => toggleNeed(opt.id)}
                                                    className="w-full p-4 rounded-xl text-left transition-all duration-200 border flex items-start gap-4 group"
                                                    style={{
                                                        background: active ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.01)',
                                                        borderColor: active ? 'var(--indigo-500)' : 'var(--border-glass)',
                                                    }}
                                                >
                                                    <div
                                                        className="w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors mt-0.5"
                                                        style={{
                                                            borderColor: active ? 'var(--indigo-500)' : 'var(--text-muted)',
                                                            background: active ? 'var(--indigo-500)' : 'transparent',
                                                        }}
                                                    >
                                                        {active && (
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm leading-snug mb-0.5" style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{opt.label}</p>
                                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{opt.desc}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <button
                            onClick={handleBack}
                            disabled={step === 1 || saving}
                            className="btn-secondary text-sm px-6 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Back
                        </button>

                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                disabled={(step === 1 && !profileType) || (step === 2 && !workStyle)}
                                className="btn-primary text-sm px-6 py-2.5 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Continue
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="btn-primary text-sm px-6 py-2.5 flex items-center gap-1.5"
                                style={{ background: 'linear-gradient(135deg, var(--indigo-500), var(--violet-500))' }}
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                        Setting up...
                                    </>
                                ) : (
                                    <>
                                        Finish Setup
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
