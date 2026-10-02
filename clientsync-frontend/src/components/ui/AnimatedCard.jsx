import { motion } from 'framer-motion';

export default function AnimatedCard({ children, className = '', delay = 0, style = {} }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
            whileHover={{
                y: -4,
                boxShadow: '0 0 40px rgba(99, 102, 241, 0.2)',
                borderColor: 'rgba(99, 102, 241, 0.4)',
            }}
            className={`glass rounded-2xl p-6 transition-colors duration-300 ${className}`}
            style={style}
        >
            {children}
        </motion.div>
    );
}
