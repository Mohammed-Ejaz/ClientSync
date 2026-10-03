import { motion } from 'framer-motion';

const pageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 }
};

export default function AnimatedPage({ children, className = '' }) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className={`w-full h-full ${className}`}
        >
            {children}
        </motion.div>
    );
}
