export default function EditField({ field, value, onChange, className = '' }) {
    const isColor = field?.kind === 'color';
    const showSwatch = isColor && value && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);

    return (
        <div className={className}>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {field.label}
            </label>
            {field.type === 'textarea' ? (
                <textarea
                    rows={3}
                    value={value}
                    onChange={onChange}
                    placeholder={field.placeholder}
                    className="input-field w-full resize-none"
                />
            ) : (
                <div className="flex gap-2 items-center">
                    <input
                        type={field.type}
                        value={value}
                        onChange={onChange}
                        placeholder={field.placeholder}
                        className={`input-field w-full${isColor ? ' font-mono text-sm' : ''}`}
                    />
                    {showSwatch && (
                        <div
                            className="w-9 h-9 rounded-lg flex-shrink-0 border"
                            style={{ background: value, borderColor: 'rgba(255,255,255,0.15)' }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}