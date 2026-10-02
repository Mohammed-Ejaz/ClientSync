export default function Badge({ status }) {
    const variants = {
        Completed: {
            label: 'Completed',
            bg: 'rgba(52, 211, 153, 0.12)',
            color: '#34d399',
            border: 'rgba(52, 211, 153, 0.3)',
            dot: '#34d399',
        },
        Pending: {
            label: 'Pending',
            bg: 'rgba(251, 191, 36, 0.12)',
            color: '#fbbf24',
            border: 'rgba(251, 191, 36, 0.3)',
            dot: '#fbbf24',
        },
        default: {
            label: status,
            bg: 'rgba(148, 163, 184, 0.1)',
            color: '#94a3b8',
            border: 'rgba(148, 163, 184, 0.2)',
            dot: '#94a3b8',
        },
    };

    const v = variants[status] || variants.default;

    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
            style={{ background: v.bg, color: v.color, border: `1px solid ${v.border}` }}
        >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: v.dot }} />
            {v.label}
        </span>
    );
}
