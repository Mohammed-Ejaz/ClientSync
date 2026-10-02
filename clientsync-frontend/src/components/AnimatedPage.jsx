import { motion } from 'framer-motion';

const pageVariants = {
    initial: { opacity: 0, filter: 'blur(10px)', scale: 0.98 },
    animate: { opacity: 1, filter: 'blur(0px)', scale: 1 },
    exit: { opacity: 0, filter: 'blur(10px)', scale: 0.98 }
};

export default function AnimatedPage({ children, className = '' }) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full h-full ${className}`}
        >
            {children}
        </motion.div>
    );
}
