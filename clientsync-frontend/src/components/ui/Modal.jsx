import { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * A single accessible modal primitive meant to replace the three ad-hoc
 * modal implementations (About, Logout confirm, Edit) that previously
 * duplicated backdrop/animation code and had no focus trap, no scroll lock,
 * and inconsistent Escape handling.
 *
 * Usage:
 *   <AnimatePresence>
 *     {open && (
 *       <Modal title="Edit client" onClose={() => setOpen(false)}>
 *         ...content...
 *       </Modal>
 *     )}
 *   </AnimatePresence>
 *
 * Wrapping in <AnimatePresence> at the call site (not inside this
 * component) is required so the exit animation can play before unmount.
 */
export default function Modal({ title, onClose, maxWidth = 480, children, accent = 'indigo' }) {
    const panelRef = useRef(null);
    const titleId = useId();

    useEffect(() => {
        const previouslyFocused = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        // Focus the panel itself first so Escape works immediately even if
        // no focusable child exists yet (e.g. content still loading).
        panelRef.current?.focus();

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }
            if (e.key !== 'Tab' || !panelRef.current) return;

            const focusable = panelRef.current.querySelectorAll(FOCUSABLE);
            if (!focusable.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
            if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
        };
    }, [onClose]);

    const accentGlow = {
        indigo: 'rgba(99,102,241,0.15)',
        red: 'rgba(248,113,113,0.15)',
    }[accent] || 'rgba(99,102,241,0.15)';

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
        >
            <motion.div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full rounded-2xl overflow-hidden outline-none"
                style={{
                    maxWidth,
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-glass)',
                    boxShadow: `0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px ${accentGlow}`,
                }}
            >
                <h2 id={titleId} className="sr-only">{title}</h2>
                {children}
            </motion.div>
        </motion.div>,
        document.body
    );
}