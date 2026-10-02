import express from 'express';
import {
    signup,
    login,
    getMe,
    updateProfile,
    changePassword,
    deleteAccount,
    completeOnboarding,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', signup);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me  (protected)
router.get('/me', protect, getMe);

// PATCH /api/auth/profile (protected)
router.patch('/profile', protect, updateProfile);

// PATCH /api/auth/password (protected)
router.patch('/password', protect, changePassword);

// DELETE /api/auth/account (protected)
router.delete('/account', protect, deleteAccount);

// PUT /api/auth/onboarding (protected)
router.put('/onboarding', protect, completeOnboarding);

export default router;