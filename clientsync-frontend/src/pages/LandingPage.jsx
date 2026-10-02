import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';

// ── Animated Orb ─────────────────────────────────────────────────────────────
function Orb({ style }) {
    return (
        <div
            className="absolute rounded-full pointer-events-none"
            style={{
                filter: 'blur(80px)',
                opacity: 0.25,
                animation: 'pulse-glow 4s ease-in-out infinite',
                ...style,
            }}
        />
    );
}

// ── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, description, delay, span = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
            whileHover={{ y: -6, borderColor: 'rgba(99,102,241,0.5)', boxShadow: '0 0 40px rgba(99,102,241,0.15)' }}
            className={`glass rounded-2xl p-6 flex flex-col gap-4 cursor-default transition-colors duration-300 ${span}`}
            style={{ border: '1px solid var(--border-glass)' }}
        >
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}
            >
                {icon}
            </div>
            <div>
                <h3 className="text-base font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description}</p>
            </div>
        </motion.div>
    );
}



// ── FAQ Item ─────────────────────────────────────────────────────────────────
function FAQItem({ q, a, delay }) {
    const [open, setOpen] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border-glass)' }}
        >
            <button
                className="w-full flex items-center justify-between p-6 text-left transition-all duration-200"
                style={{ background: open ? 'rgba(99,102,241,0.08)' : 'var(--bg-glass)' }}
                onClick={() => setOpen(!open)}
            >
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{q}</span>
                <motion.span
                    animate={{ rotate: open ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 ml-4 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: open ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)', color: open ? 'var(--indigo-400)' : 'var(--text-muted)' }}
                >
                    +
                </motion.span>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="faq-body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        style={{ overflow: 'hidden' }}
                    >
                        <p className="px-6 pb-6 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function LandingPage() {
    const heroRef = useRef(null);
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const heroY = useTransform(scrollY, [0, 400], [0, -60]);

    const features = [
        { icon: '⚡', title: 'Instant Link Generation', description: 'Create unique, secure onboarding links for each client in under a second. Powered by UUID tokens.' },
        { icon: '🎨', title: 'Brand Asset Collection', description: 'Capture hex color palettes, typography preferences, logo uploads, and visual style guides automatically.' },
        { icon: '🔒', title: 'JWT-Protected Console', description: 'Every freelancer workspace is secured with industry-standard RS256 tokens and bcrypt password hashing.' },
        { icon: '📊', title: 'Real-Time Dashboard', description: "Monitor every client's onboarding state, from pending invites to completed submissions, live." },
        { icon: '🚫', title: 'Double-Submit Protection', description: 'Server-side idempotency guards prevent clients from accidentally overwriting their own data.' },
        { icon: '🧩', title: 'Multi-Step Wizard UX', description: 'Clients complete a smooth, spring-animated 3-step form — no friction, no confusion, high completion rates.' },
    ];

    const logos = ['Stripe', 'Linear', 'Vercel', 'Figma', 'Notion', 'Framer', 'Loom', 'Supabase', 'PlanetScale', 'Railway'];

    const faqs = [
        { q: "How does the secure onboarding link work?", a: "Each link is a UUID-based token stored in your MongoDB database. When a client visits it, the server validates the token exists, checks for prior completion, and locks the form after submission to prevent duplicates." },
        { q: "Can I send links to multiple clients?", a: "Yes — every client gets their own unique, isolated link. Your dashboard aggregates all client submissions into a single, filterable workspace view." },
        { q: "Is client data encrypted?", a: "All data in transit is encrypted via HTTPS. Passwords are hashed with bcrypt (10 salt rounds). JWT tokens are signed with a secret and expire after 7 days." },
        { q: "What happens if a client accidentally closes the form?", a: "The multi-step wizard persists form state in React state during the session. The form resets on a fresh page load, letting the client start over with the same link (as long as it hasn't been completed)." },
        { q: "Do clients need to create an account?", a: "No. The client-facing onboarding portal is fully public — clients just receive the link and fill out the form. Only freelancers need an account." },
    ];

    return (
        <div style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
            <Navbar />

            {/* ── HERO ──────────────────────────────────────────────────────────── */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-24 pb-20 px-6">
                {/* Radial background */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.2) 0%, transparent 70%)',
                    }}
                />
                <Orb style={{ width: 600, height: 600, background: 'var(--indigo-600)', top: '0%', left: '20%', opacity: 0.12 }} />
                <Orb style={{ width: 400, height: 400, background: 'var(--violet-600)', top: '20%', right: '10%', opacity: 0.10, animationDelay: '1s' }} />

                <motion.div
                    style={{ opacity: heroOpacity, y: heroY }}
                    className="relative z-10 text-center max-w-5xl mx-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-sm font-medium"
                        style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--indigo-400)' }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse-glow" style={{ background: 'var(--indigo-400)' }} />
                        Now in Public Beta — Simplify your client onboarding
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="text-6xl md:text-7xl lg:text-8xl font-bold leading-none tracking-tight mb-6"
                    >
                        Onboard clients
                        <br />
                        <span className="gradient-text">like a studio.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.35 }}
                        className="text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Stop chasing clients for brand assets and specs. Send one link —
                        get everything structured, validated, and delivered to your dashboard.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to="/signup" className="btn-primary text-base px-8 py-4">
                            Get started — it's free
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <Link to="/features" className="btn-secondary text-base px-8 py-4">
                            See how it works
                        </Link>
                    </motion.div>

                    {/* Social proof */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="mt-10 text-sm"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Trusted by <span style={{ color: 'var(--text-secondary)' }}>1,200+</span> independent freelancers and boutique agencies
                    </motion.p>
                </motion.div>
            </section>

            {/* ── LOGO MARQUEE ───────────────────────────────────────────────── */}
            <section className="py-12 overflow-hidden" style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex animate-marquee" style={{ gap: '4rem', width: 'max-content' }}>
                    {[...logos, ...logos].map((logo, i) => (
                        <span key={i} className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                            {logo}
                        </span>
                    ))}
                </div>
            </section>

            {/* ── FEATURES BENTO ─────────────────────────────────────────────── */}
            <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--indigo-400)' }}>
                        CAPABILITIES
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Everything a professional <span className="gradient-text">needs.</span>
                    </h2>
                    <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        Built specifically for freelancers who need a polished, reliable client intake system.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.map((f, i) => (
                        <FeatureCard key={i} {...f} delay={i * 0.08} />
                    ))}
                </div>
            </section>



            {/* ── FAQ ────────────────────────────────────────────────────────── */}
            <section className="py-24 px-6 max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--indigo-400)' }}>FAQ</p>
                    <h2 className="text-4xl font-bold">Questions <span className="gradient-text">answered.</span></h2>
                </motion.div>
                <div className="flex flex-col gap-3">
                    {faqs.map((faq, i) => <FAQItem key={i} {...faq} delay={i * 0.05} />)}
                </div>
            </section>

            {/* ── FOOTER CTA ─────────────────────────────────────────────────── */}
            <section className="py-24 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative z-10 max-w-2xl mx-auto"
                >
                    <h2 className="text-5xl font-bold mb-6">
                        Ready to <span className="gradient-text">transform</span> your workflow?
                    </h2>
                    <p className="text-lg mb-10" style={{ color: 'var(--text-secondary)' }}>
                        Join 1,200+ freelancers using ClientSync to close projects faster.
                    </p>
                    <Link to="/signup" className="btn-primary text-base px-10 py-4">
                        Create your free account
                    </Link>
                </motion.div>
            </section>

            {/* ── FOOTER ─────────────────────────────────────────────────────── */}
            <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    © 2025 ClientSync. Built with React, Node.js &amp; MongoDB.
                </p>
            </footer>
        </div>
    );
}
