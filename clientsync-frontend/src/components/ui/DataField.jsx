export default function DataField({ field, value, className = '' }) {
    const isColor = field?.kind === 'color';
    const label = field?.label?.replace(/\s*\(optional\)\s*$/i, '') || '';

    return (
        <div
            className={`p-4 rounded-xl ${className}`}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}
        >
            <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                {label}
            </p>
            {isColor && value ? (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: value, border: '2px solid rgba(255,255,255,0.1)' }} />
                    <p className="text-sm font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
            ) : (
                <p className="text-sm font-medium" style={{ color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {value || '—'}
                </p>
            )}
        </div>
    );
}