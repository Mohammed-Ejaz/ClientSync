import ClientSubmission from '../models/ClientSubmission.js';
import OnboardingRequest from '../models/OnboardingRequest.js';
import { sanitizeSubmission } from '../utils/sanitizeSubmission.js';

// ─── GET /api/submissions/check/:uniqueLink (Public) ─────────────────────────
// Pre-flight check — lets the wizard verify the link exists before rendering
export const getPublicRequest = async (req, res) => {
    const { uniqueLink } = req.params;

    const request = await OnboardingRequest.findOne({ uniqueLinkUrl: uniqueLink });

    if (!request) {
        return res.status(404).json({
            status: 'Fail',
            message: 'Invalid or expired onboarding link.',
        });
    }

    if (request.status === 'Completed') {
        return res.status(400).json({
            status: 'Fail',
            message: 'This onboarding form has already been completed.',
            alreadyCompleted: true,
        });
    }

    // Use the profileType snapshotted when the link was created, not the
    // freelancer's current one — those can now diverge if they change their
    // specialty in Settings after sending this link out.
    const previousSubmission = await ClientSubmission.findOne({ requestId: request._id });

    res.status(200).json({
        status: 'Success',
        data: {
            clientName: request.clientName,
            status: request.status,
            profileType: request.profileType || 'other',
            previousSubmissionData: previousSubmission || null,
        },
    });
};

// ─── POST /api/submissions/:uniqueLink (Public) ────────────────────────────────
export const submitClientData = async (req, res) => {
    const { uniqueLink } = req.params;

    const { data, error } = sanitizeSubmission(req.body);
    if (error) {
        return res.status(400).json({ status: 'Fail', message: error });
    }

    // Atomically flip Pending -> Completed. If two requests race, only one
    // findOneAndUpdate call will match (the second sees status !== 'Pending'
    // and gets null back), so there's no window where both proceed to write.
    const request = await OnboardingRequest.findOneAndUpdate(
        { uniqueLinkUrl: uniqueLink, status: 'Pending' },
        { status: 'Completed' },
        { new: false } // we want the pre-update doc to know if it existed at all
    );

    if (!request) {
        // Either the link never existed, or it was already completed
        // (possibly by the concurrent request that won the race).
        const exists = await OnboardingRequest.exists({ uniqueLinkUrl: uniqueLink });
        if (!exists) {
            return res.status(404).json({ status: 'Fail', message: 'Invalid or expired onboarding link.' });
        }
        return res.status(409).json({
            status: 'Fail',
            message: 'This onboarding request has already been completed.',
            alreadyCompleted: true,
        });
    }

    let submission;
    try {
        submission = await ClientSubmission.create({
            requestId: request._id,
            companyInfo: data.companyInfo || {},
            projectAssets: data.projectAssets || {},
            technicalDetails: data.technicalDetails || {},
        });
    } catch (err) {
        // Should be unreachable given the atomic status flip above, but the
        // unique index on requestId is the final backstop against duplicates.
        if (err.code === 11000) {
            submission = await ClientSubmission.findOne({ requestId: request._id });
        } else {
            throw err;
        }
    }

    res.status(201).json({
        status: 'Success',
        message: 'Onboarding data submitted successfully!',
        data: {
            submissionId: submission._id,
            completedAt: submission.createdAt,
        },
    });
};