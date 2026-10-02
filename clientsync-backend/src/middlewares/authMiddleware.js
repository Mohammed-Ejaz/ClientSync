import jwt from 'jsonwebtoken';
import Freelancer from '../models/Freelancer.js';

export const protect = async (req, res, next) => {
    try {
        let token;

        // Extract token from Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                status: 'Unauthorized',
                message: 'Access denied. No token provided.',
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // passwordHash is `select: false` on the schema now, so it's already
        // excluded here — no need to explicitly .select('-passwordHash').
        const user = await Freelancer.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                status: 'Unauthorized',
                message: 'Token is valid but user no longer exists.',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'Unauthorized',
                message: 'Invalid token. Please log in again.',
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'Unauthorized',
                message: 'Token has expired. Please log in again.',
            });
        }
        next(error); // let the global error handler log/report it
    }
};