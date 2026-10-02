import Modal from './Modal';

/**
 * Generic yes/no confirmation dialog. Replaces the ad-hoc alert()/confirm()
 * calls scattered through the dashboard (e.g. SubmissionDetail's
 * handleUnlockLink/handleLockLink used alert() on failure) with something
 * that matches the rest of the UI and is keyboard/focus accessible via
 * the shared Modal primitive.
 */
export default function ConfirmModal({
    title,
    body,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = false,
    loading = false,
    error = '',
    onConfirm,
    onCancel,
}) {
    return (
        <Modal title={title} onClose={onCancel} maxWidth={400} accent={danger ? 'red' : 'indigo'}>
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                    background: danger
                        ? 'linear-gradient(90deg, transparent, rgba(248,113,113,0.6), transparent)'
                        : 'linear-gradient(90deg, transparent, var(--indigo-500), transparent)',
                }}
            />
            <div className="p-8">
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>{body}</p>

                {error && (
                    <p
                        className="text-sm mb-5 px-3 py-2 rounded-lg"
                        style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
                    >
                        {error}
                    </p>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-60"
                        style={{
                            background: danger ? 'rgba(248,113,113,0.15)' : 'rgba(99,102,241,0.15)',
                            border: `1px solid ${danger ? 'rgba(248,113,113,0.35)' : 'rgba(99,102,241,0.35)'}`,
                            color: danger ? '#f87171' : 'var(--indigo-400)',
                        }}
                    >
                        {loading ? 'Working…' : confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}