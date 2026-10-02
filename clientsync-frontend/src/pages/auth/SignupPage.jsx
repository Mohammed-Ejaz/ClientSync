import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

const STEPS = [
    { id: 1, title: 'Create your account', subtitle: 'Start your free freelancer workspace' },
    { id: 2, title: 'Secure your workspace', subtitle: 'Choose a strong password' },
];

function FloatingInput({ id, label, type = 'text', value, onChange, placeholder, autoComplete }) {
    const [focused, setFocused] = useState(false);
    return (
        <div className="relative">
            <label htmlFor={id} className="block text-sm font-medium mb-2" style={{ color: focused ? 'var(--indigo-400)' : 'var(--text-secondary)' }}>
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="input-field"
            />
            <motion.div
                className="absolute bottom-0 left-0 h-0.5 rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--indigo-500), var(--violet-500))' }}
                animate={{ width: focused ? '100%' : '0%' }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            />
        </div>
    );
}

export default function SignupPage() {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shakeKey, setShakeKey] = useState(0);
    const [direction, setDirection] = useState(1);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const validateStep1 = () => {
        if (!name.trim() || name.trim().length < 2) return 'Please enter your full name.';
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Please enter a valid email address.';
        return null;
    };

    const handleNextStep = () => {
        const err = validateStep1();
        if (err) {
            setError(err);
            setShakeKey((k) => k + 1);
            return;
        }
        setError('');
        setDirection(1);
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            setShakeKey((k) => k + 1);
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setShakeKey((k) => k + 1);
            return;
        }

        setLoading(true);
        try {
            await signup(name.trim(), email.trim(), password);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(msg);
            setShakeKey((k) => k + 1);
        } finally {
            setLoading(false);
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

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <Link to="/" className="inline-flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--indigo-600), var(--violet-600))' }}>
                            <svg width="20" height="20" viewBox="0 0 16 16" fill="white"><path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" /></svg>
                        </div>
                        <span className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Client<span className="gradient-text">Sync</span></span>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="glass-elevated rounded-2xl p-8 overflow-hidden"
                >
                    {/* Progress dots */}
                    <div className="flex items-center gap-2 mb-8">
                        {STEPS.map((s) => (
                            <div
                                key={s.id}
                                className="transition-all duration-400 rounded-full"
                                style={{
                                    height: 4,
                                    flex: step === s.id ? 3 : 1,
                                    background: step >= s.id ? 'linear-gradient(90deg, var(--indigo-500), var(--violet-500))' : 'rgba(255,255,255,0.1)',
                                }}
                            />
                        ))}
                        <span className="ml-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Step {step}/{STEPS.length}</span>
                    </div>

                    {/* Animated step header */}
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                            className="mb-6"
                        >
                            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                                {STEPS[step - 1].title}
                            </h1>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {STEPS[step - 1].subtitle}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                key={`err-${shakeKey}`}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-5 animate-shake"
                            >
                                <div className="flex items-center gap-3 p-3.5 rounded-xl text-sm" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {error}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Step forms */}
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={`form-${step}`}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                        >
                            {step === 1 ? (
                                <div className="flex flex-col gap-5">
                                    <FloatingInput id="signup-name" label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Johnson" autoComplete="name" />
                                    <FloatingInput id="signup-email" label="Work email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@studio.com" autoComplete="email" />
                                    <button id="signup-next" type="button" onClick={handleNextStep} className="btn-primary mt-2">
                                        Continue
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                    <FloatingInput id="signup-password" label="Create password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" autoComplete="new-password" />
                                    <FloatingInput id="signup-confirm" label="Confirm password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />

                                    {/* Password strength indicator */}
                                    {password && (
                                        <div className="space-y-1.5">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4].map((lvl) => {
                                                    const strength = Math.min(4, Math.floor(password.length / 3));
                                                    return (
                                                        <div key={lvl} className="flex-1 h-1 rounded-full transition-all duration-300" style={{
                                                            background: lvl <= strength
                                                                ? strength <= 1 ? '#f87171' : strength <= 2 ? '#fbbf24' : strength <= 3 ? '#34d399' : '#34d399'
                                                                : 'rgba(255,255,255,0.1)'
                                                        }} />
                                                    );
                                                })}
                                            </div>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                {password.length < 4 ? 'Too short' : password.length < 8 ? 'Getting there…' : password.length < 12 ? 'Good password' : 'Strong password'}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => { setDirection(-1); setStep(1); setError(''); }}
                                            className="btn-secondary flex-1"
                                        >
                                            Back
                                        </button>
                                        <button id="signup-submit" type="submit" disabled={loading} className="btn-primary flex-1">
                                            {loading ? (
                                                <span className="flex items-center gap-2">
                                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                                    Creating…
                                                </span>
                                            ) : 'Create Account'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold" style={{ color: 'var(--indigo-400)' }}>Sign in</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
