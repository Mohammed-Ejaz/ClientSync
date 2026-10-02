import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';

// ─── Required Environment Variables ──────────────────────────────────────────
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
    console.error(`❌ Missing required environment variable(s): ${missing.join(', ')}`);
    process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
    console.error('❌ JWT_SECRET should be at least 32 characters long.');
    process.exit(1);
}

const app = express();

// Needed for correct client IPs behind a proxy/load balancer (Render, Heroku, etc.)
// — also required for express-rate-limit to key on the real client IP.
app.set('trust proxy', 1);

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

// ─── Body Parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const makeLimiter = (max, message) =>
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { status: 'Fail', message },
    });

// Tight limits on auth (brute-force protection)
app.use('/api/auth/login', makeLimiter(20, 'Too many login attempts. Please try again in 15 minutes.'));
app.use('/api/auth/signup', makeLimiter(10, 'Too many signup attempts. Please try again in 15 minutes.'));

// Looser limit on the public submission endpoints
app.use('/api/submissions', makeLimiter(100, 'Too many requests. Please try again later.'));

// General fallback for everything else
app.use('/api', makeLimiter(300, 'Too many requests. Please slow down.'));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/submissions', submissionRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'Success',
        message: 'ClientSync API is running smoothly.',
        timestamp: new Date().toISOString(),
    });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ status: 'Fail', message: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// With Express 5, rejected promises from async route handlers land here
// automatically — no need for try/catch wrappers just to forward errors.
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ status: 'Fail', message: 'Malformed JSON in request body.' });
    }
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ status: 'Fail', message: 'Request payload too large.' });
    }
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ status: 'Fail', message: 'Origin not allowed.' });
    }
    console.error('Unhandled Error:', err);
    res.status(500).json({ status: 'Error', message: 'An unexpected server error occurred.' });
});

// ─── Start Server (only after DB connects) ───────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server flying on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Failed to connect to MongoDB, server not started:', err.message);
        process.exit(1);
    });

export default app;