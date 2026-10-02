import { motion } from 'framer-motion';

export default function StatCard({ label, value, icon, color = 'indigo', delta = null, delay = 0 }) {
    const colorMap = {
        indigo: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', icon: '#818cf8', glow: 'rgba(99,102,241,0.15)' },
        violet: { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', icon: '#a78bfa', glow: 'rgba(139,92,246,0.15)' },
        emerald: { bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)', icon: '#34d399', glow: 'rgba(52,211,153,0.12)' },
        amber: { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)', icon: '#fbbf24', glow: 'rgba(251,191,36,0.12)' },
    };
    const c = colorMap[color] || colorMap.indigo;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
            whileHover={{ y: -3, boxShadow: `0 0 30px ${c.glow}` }}
            className="rounded-2xl p-5"
            style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                transition: 'box-shadow 0.3s ease',
            }}
        >
            <div className="flex items-start justify-between mb-4">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${c.bg}`, border: `1px solid ${c.border}` }}
                >
                    <span style={{ color: c.icon }}>{icon}</span>
                </div>
                {delta !== null && (
                    <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                            background: delta >= 0 ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
                            color: delta >= 0 ? '#34d399' : '#f87171',
                        }}
                    >
                        {delta >= 0 ? '+' : ''}{delta}%
                    </span>
                )}
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {value}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</p>
        </motion.div>
    );
}
