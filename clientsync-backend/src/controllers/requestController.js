import crypto from 'crypto';
import OnboardingRequest from '../models/OnboardingRequest.js';
import ClientSubmission from '../models/ClientSubmission.js';
import { sanitizeSubmission } from '../utils/sanitizeSubmission.js';

const generateToken = () => `req_${crypto.randomBytes(12).toString('hex')}`;
const buildOnboardingUrl = (token) =>
    `${process.env.FRONTEND_URL || 'http://localhost:5173'}/onboarding/${token}`;

// ─── POST /api/requests/create (Protected) ────────────────────────────────────
export const createOnboardingRequest = async (req, res) => {
    const { clientName, clientEmail } = req.body;

    if (typeof clientName !== 'string' || !clientName.trim()) {
        return res.status(400).json({ status: 'Fail', message: 'Client name is required.' });
    }
    if (clientEmail !== undefined && clientEmail !== '' && typeof clientEmail !== 'string') {
        return res.status(400).json({ status: 'Fail', message: 'Invalid client email.' });
    }

    const uniqueLink = generateToken();

    const newRequest = await OnboardingRequest.create({
        freelancerId: req.user._id,
        clientName: clientName.trim().slice(0, 200),
        clientEmail: clientEmail ? clientEmail.trim().toLowerCase().slice(0, 200) : '',
        uniqueLinkUrl: uniqueLink,
        status: 'Pending',
        // Snapshot the freelancer's current specialty so future profile
        // changes never reclassify this link's questions or data.
        profileType: req.user.profileType || 'other',
    });

    res.status(201).json({
        status: 'Success',
        message: 'Onboarding link generated successfully!',
        data: {
            requestId: newRequest._id,
            clientName: newRequest.clientName,
            uniqueLink: newRequest.uniqueLinkUrl,
            onboardingUrl: buildOnboardingUrl(newRequest.uniqueLinkUrl),
            status: newRequest.status,
            createdAt: newRequest.createdAt,
        },
    });
};

// ─── GET /api/requests (Protected) ────────────────────────────────────────────
export const getFreelancerRequests = async (req, res) => {
    const requests = await OnboardingRequest.find({ freelancerId: req.user._id })
        .sort({ createdAt: -1 })
        .lean();

    const requestIds = requests.map((r) => r._id);
    const submissions = await ClientSubmission.find({ requestId: { $in: requestIds } }).lean();

    const submissionByRequestId = new Map(submissions.map((s) => [String(s.requestId), s]));

    const mergedData = requests.map((request) => ({
        ...request,
        submissionData: submissionByRequestId.get(String(request._id)) || null,
    }));

    res.status(200).json({
        status: 'Success',
        count: mergedData.length,
        data: mergedData,
    });
};

// ─── GET /api/requests/:id (Protected) ────────────────────────────────────────
export const getSubmissionById = async (req, res) => {
    const { id } = req.params;

    let request;
    try {
        request = await OnboardingRequest.findOne({ _id: id, freelancerId: req.user._id });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ status: 'Fail', message: 'Invalid submission ID format.' });
        }
        throw error;
    }

    if (!request) {
        return res.status(404).json({ status: 'Fail', message: 'Submission not found or you do not have access to it.' });
    }

    const submission = await ClientSubmission.findOne({ requestId: request._id });

    res.status(200).json({
        status: 'Success',
        data: {
            ...request.toObject(),
            // Use the snapshot taken when the link was created, falling back
            // to the freelancer's current profile for older links created
            // before this field existed.
            profileType: request.profileType || req.user.profileType || 'other',
            submissionData: submission ? submission.toObject() : null,
        },
    });
};

// ─── PATCH /api/requests/:id (Protected) ──────────────────────────────────────
export const updateOnboardingRequest = async (req, res) => {
    const { id } = req.params;
    const { clientName, clientEmail, status } = req.body;

    let request;
    try {
        request = await OnboardingRequest.findOne({ _id: id, freelancerId: req.user._id });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ status: 'Fail', message: 'Invalid request ID format.' });
        }
        throw error;
    }

    if (!request) {
        return res.status(404).json({ status: 'Fail', message: 'Request not found or you do not have access to it.' });
    }

    if (clientName !== undefined) {
        if (typeof clientName !== 'string' || !clientName.trim()) {
            return res.status(400).json({ status: 'Fail', message: 'Client name cannot be empty.' });
        }
        request.clientName = clientName.trim().slice(0, 200);
    }

    if (clientEmail !== undefined) {
        request.clientEmail = clientEmail ? String(clientEmail).trim().toLowerCase().slice(0, 200) : '';
    }

    if (status !== undefined) {
        if (status !== 'Pending' && status !== 'Completed') {
            return res.status(400).json({ status: 'Fail', message: 'Status must be either Pending or Completed.' });
        }
        request.status = status;
    }

    await request.save();

    res.status(200).json({
        status: 'Success',
        message: 'Request updated successfully!',
        data: {
            requestId: request._id,
            clientName: request.clientName,
            clientEmail: request.clientEmail,
            uniqueLink: request.uniqueLinkUrl,
            onboardingUrl: buildOnboardingUrl(request.uniqueLinkUrl),
            status: request.status,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt,
        },
    });
};

// ─── POST /api/requests/:id/regenerate-token (Protected) ────────────────────
// Replaces free-text token editing: the client can no longer set an
// arbitrary/guessable token, only ask for a fresh random one.
export const regenerateToken = async (req, res) => {
    const { id } = req.params;

    let request;
    try {
        request = await OnboardingRequest.findOne({ _id: id, freelancerId: req.user._id });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ status: 'Fail', message: 'Invalid request ID format.' });
        }
        throw error;
    }

    if (!request) {
        return res.status(404).json({ status: 'Fail', message: 'Request not found or you do not have access to it.' });
    }

    request.uniqueLinkUrl = generateToken();
    await request.save();

    res.status(200).json({
        status: 'Success',
        message: 'Link regenerated. The previous link no longer works.',
        data: {
            requestId: request._id,
            uniqueLink: request.uniqueLinkUrl,
            onboardingUrl: buildOnboardingUrl(request.uniqueLinkUrl),
        },
    });
};

// ─── DELETE /api/requests/:id (Protected) ────────────────────────────────────
export const deleteOnboardingRequest = async (req, res) => {
    const { id } = req.params;

    let request;
    try {
        request = await OnboardingRequest.findOneAndDelete({ _id: id, freelancerId: req.user._id });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ status: 'Fail', message: 'Invalid request ID format.' });
        }
        throw error;
    }

    if (!request) {
        return res.status(404).json({ status: 'Fail', message: 'Request not found or you do not have access to it.' });
    }

    await ClientSubmission.deleteMany({ requestId: request._id });

    res.status(200).json({ status: 'Success', message: 'Link deleted.' });
};

// ─── PATCH /api/requests/:id/submission (Protected) ──────────────────────────
// Freelancer editing a client's already-submitted data.
export const updateRequestSubmission = async (req, res) => {
    const { id } = req.params;

    const { data, error } = sanitizeSubmission(req.body, { partial: true });
    if (error) {
        return res.status(400).json({ status: 'Fail', message: error });
    }

    let request;
    try {
        request = await OnboardingRequest.findOne({ _id: id, freelancerId: req.user._id });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ status: 'Fail', message: 'Invalid request ID format.' });
        }
        throw err;
    }

    if (!request) {
        return res.status(404).json({ status: 'Fail', message: 'Request not found or you do not have access to it.' });
    }

    let submission = await ClientSubmission.findOne({ requestId: id });
    if (!submission) {
        submission = new ClientSubmission({ requestId: id, companyInfo: {}, projectAssets: {}, technicalDetails: {} });
    }

    if (data.companyInfo) submission.companyInfo = { ...submission.companyInfo, ...data.companyInfo };
    if (data.projectAssets) submission.projectAssets = { ...submission.projectAssets, ...data.projectAssets };
    if (data.technicalDetails) submission.technicalDetails = { ...submission.technicalDetails, ...data.technicalDetails };

    await submission.save();

    res.status(200).json({
        status: 'Success',
        message: 'Submission updated successfully!',
        data: submission,
    });
};