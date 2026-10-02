import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

const capabilities = [
    {
        icon: '🔗',
        title: 'Secure Invite Links',
        body: 'Every client receives a unique, expiring UUID-backed URL. No login required on their end — just a beautiful, guided form.',
        tags: ['UUID v4', 'Idempotent', 'Anti-replay'],
    },
    {
        icon: '🎨',
        title: 'Complete Brand Collection',
        body: 'Collect primary/secondary colors, font families, logo references, and style guide URLs — all in one structured step.',
        tags: ['HEX Colors', 'Typography', 'Assets'],
    },
    {
        icon: '⚙️',
        title: 'Technical Spec Capture',
        body: 'Capture domain registrar details, hosting providers, CMS platforms, server configurations, and access credentials securely.',
        tags: ['Domains', 'Hosting', 'CMS'],
    },
    {
        icon: '📡',
        title: 'Real-Time Status Feed',
        body: 'Your dashboard updates the moment a client completes their form. No polling, no refreshing — instant visibility.',
        tags: ['Live Updates', 'Status Badges', 'Timeline'],
    },
    {
        icon: '🛡️',
        title: 'JWT Authentication',
        body: 'Freelancer accounts are protected with RS-signed tokens, bcrypt-hashed passwords, and 7-day auto-expiry sessions.',
        tags: ['JWT', 'Bcrypt', 'Secure Headers'],
    },
    {
        icon: '📤',
        title: 'Structured Data Export',
        body: 'All submission data is stored as clean JSON payloads — ready to export, parse, or pipe into your existing toolchain.',
        tags: ['JSON', 'MongoDB', 'REST API'],
    },
];

export default function FeaturesPage() {
    return (
        <div style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', minHeight: '100vh' }}>
            <Navbar />

            {/* Header */}
            <section className="pt-40 pb-20 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="relative max-w-3xl mx-auto"
                >
                    <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--indigo-400)' }}>PLATFORM FEATURES</p>
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Built for <span className="gradient-text">professionals</span>.
                    </h1>
                    <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
                        Every feature in ClientSync was designed to replace the disorganized chaos of email threads and Notion templates.
                    </p>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="py-16 px-6 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {capabilities.map((cap, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            whileHover={{ y: -6, borderColor: 'rgba(99,102,241,0.4)', boxShadow: '0 0 40px rgba(99,102,241,0.12)' }}
                            className="glass rounded-2xl p-7 flex flex-col gap-5 cursor-default"
                            style={{ border: '1px solid var(--border-glass)', transition: 'all 0.3s ease' }}
                        >
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}
                            >
                                {cap.icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{cap.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{cap.body}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-auto">
                                {cap.tags.map((tag, j) => (
                                    <span
                                        key={j}
                                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                                        style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--indigo-400)', border: '1px solid rgba(99,102,241,0.2)' }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl font-bold mb-6">Start collecting better <span className="gradient-text">client data</span> today.</h2>
                    <Link to="/signup" className="btn-primary text-base px-8 py-4">
                        Create free account
                    </Link>
                </motion.div>
            </section>
        </div>
    );
}
