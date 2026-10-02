import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Freelancer from '../models/Freelancer.js';
import OnboardingRequest from '../models/OnboardingRequest.js';
import ClientSubmission from '../models/ClientSubmission.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_PROFILE_TYPES = ['designer', 'developer', 'marketer', 'agency', 'consultant', 'other'];
const VALID_WORK_STYLES = ['solo', 'small_team', 'growing_agency', 'established_studio'];
const VALID_NEEDS = ['onboarding', 'proposals', 'tracking', 'invoices'];

// ─── Helper: Sign a JWT ──────────────────────────────────────────────────────
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// ─── Helper: Build safe user payload (no password) ──────────────────────────
const buildUserPayload = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarInitials: user.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2),
    isOnboarded: user.isOnboarded || false,
    profileType: user.profileType || 'other',
    workStyle: user.workStyle,
    primaryNeeds: user.primaryNeeds || [],
    createdAt: user.createdAt,
});

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
export const signup = async (req, res) => {
    const { name, email, password } = req.body;

    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ status: 'Fail', message: 'Name, email, and password are all required.' });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || trimmedName.length > 100) {
        return res.status(400).json({ status: 'Fail', message: 'Please enter a valid name.' });
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
        return res.status(400).json({ status: 'Fail', message: 'Please enter a valid email address.' });
    }
    if (password.length < 8) {
        return res.status(400).json({ status: 'Fail', message: 'Password must be at least 8 characters long.' });
    }
    // bcrypt silently ignores bytes beyond 72 — reject long inputs instead of truncating them.
    if (Buffer.byteLength(password, 'utf8') > 72) {
        return res.status(400).json({ status: 'Fail', message: 'Password must be 72 characters or fewer.' });
    }

    const existingUser = await Freelancer.findOne({ email: trimmedEmail });
    if (existingUser) {
        return res.status(409).json({ status: 'Fail', message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let newFreelancer;
    try {
        newFreelancer = await Freelancer.create({
            name: trimmedName,
            email: trimmedEmail,
            passwordHash,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ status: 'Fail', message: 'An account with this email already exists.' });
        }
        throw error;
    }

    const token = signToken(newFreelancer._id);

    res.status(201).json({
        status: 'Success',
        message: 'Account created successfully!',
        token,
        user: buildUserPayload(newFreelancer),
    });
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
        return res.status(400).json({ status: 'Fail', message: 'Email and password are required.' });
    }

    const freelancer = await Freelancer.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
    if (!freelancer) {
        return res.status(401).json({ status: 'Fail', message: 'Incorrect email or password. Please try again.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, freelancer.passwordHash);
    if (!isPasswordCorrect) {
        return res.status(401).json({ status: 'Fail', message: 'Incorrect email or password. Please try again.' });
    }

    const token = signToken(freelancer._id);

    res.status(200).json({
        status: 'Success',
        message: 'Login successful!',
        token,
        user: buildUserPayload(freelancer),
    });
};

// ─── GET /api/auth/me (protected) ─────────────────────────────────────────────
export const getMe = async (req, res) => {
    res.status(200).json({
        status: 'Success',
        user: buildUserPayload(req.user),
    });
};

// ─── PATCH /api/auth/profile (protected) ─────────────────────────────────────
export const updateProfile = async (req, res) => {
    const { name } = req.body;
    if (typeof name !== 'string') {
        return res.status(400).json({ status: 'Fail', message: 'Name is required.' });
    }
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
        return res.status(400).json({ status: 'Fail', message: 'Name must be between 2 and 100 characters.' });
    }

    req.user.name = trimmed;
    await req.user.save();

    res.status(200).json({ status: 'Success', message: 'Profile updated.', user: buildUserPayload(req.user) });
};

// ─── PATCH /api/auth/password (protected) ────────────────────────────────────
export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
        return res.status(400).json({ status: 'Fail', message: 'Current and new password are required.' });
    }
    if (newPassword.length < 8 || Buffer.byteLength(newPassword, 'utf8') > 72) {
        return res.status(400).json({ status: 'Fail', message: 'New password must be 8–72 characters.' });
    }

    const user = await Freelancer.findById(req.user._id).select('+passwordHash');
    const correct = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!correct) {
        return res.status(401).json({ status: 'Fail', message: 'Current password is incorrect.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ status: 'Success', message: 'Password updated.' });
};

// ─── DELETE /api/auth/account (protected) ────────────────────────────────────
export const deleteAccount = async (req, res) => {
    const { password } = req.body;
    if (typeof password !== 'string' || !password) {
        return res.status(400).json({ status: 'Fail', message: 'Password confirmation is required.' });
    }

    const user = await Freelancer.findById(req.user._id).select('+passwordHash');
    const correct = await bcrypt.compare(password, user.passwordHash);
    if (!correct) {
        return res.status(401).json({ status: 'Fail', message: 'Incorrect password.' });
    }

    const requestIds = (await OnboardingRequest.find({ freelancerId: user._id }).select('_id')).map((r) => r._id);
    await ClientSubmission.deleteMany({ requestId: { $in: requestIds } });
    await OnboardingRequest.deleteMany({ freelancerId: user._id });
    await user.deleteOne();

    res.status(200).json({ status: 'Success', message: 'Your account and all associated data have been deleted.' });
};

// ─── PUT /api/auth/onboarding (Protected) ────────────────────────────────────
export const completeOnboarding = async (req, res) => {
    const { profileType, workStyle, primaryNeeds } = req.body;

    if (!profileType || !workStyle) {
        return res.status(400).json({ status: 'Fail', message: 'Profile type and work style are required.' });
    }
    if (!VALID_PROFILE_TYPES.includes(profileType)) {
        return res.status(400).json({ status: 'Fail', message: 'Invalid profile type.' });
    }
    if (!VALID_WORK_STYLES.includes(workStyle)) {
        return res.status(400).json({ status: 'Fail', message: 'Invalid work style.' });
    }

    let cleanNeeds = [];
    if (primaryNeeds !== undefined) {
        if (!Array.isArray(primaryNeeds)) {
            return res.status(400).json({ status: 'Fail', message: 'primaryNeeds must be an array.' });
        }
        cleanNeeds = [...new Set(primaryNeeds)].filter((n) => VALID_NEEDS.includes(n));
    }

    const user = await Freelancer.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ status: 'Fail', message: 'User not found.' });
    }

    user.profileType = profileType;
    user.workStyle = workStyle;
    user.primaryNeeds = cleanNeeds;
    user.isOnboarded = true;

    await user.save();

    res.status(200).json({
        status: 'Success',
        message: 'Onboarding completed successfully!',
        user: buildUserPayload(user),
    });
};