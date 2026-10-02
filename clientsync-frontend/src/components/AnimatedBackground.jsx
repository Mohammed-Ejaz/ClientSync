/**
 * AnimatedBackground
 * ──────────────────
 * Theme-aware aurora gradient background — clean, no dots, no grain.
 * Three huge ultra-blurred elliptical sweeps anchored to corners + centre.
 * Breathing animation via CSS alternate keyframes (GPU-only, zero JS cost).
 * Colors swap via [data-theme] selectors in index.css.
 */
export default function AnimatedBackground() {
    return (
        <div className="animated-bg" aria-hidden="true">
            <div className="bg-orb bg-orb-1" />
            <div className="bg-orb bg-orb-2" />
            <div className="bg-orb bg-orb-3" />
            <div className="bg-orb bg-orb-4" />
        </div>
    );
}
