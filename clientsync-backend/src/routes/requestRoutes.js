import express from 'express';
import {
    createOnboardingRequest,
    getFreelancerRequests,
    getSubmissionById,
    updateOnboardingRequest,
    updateRequestSubmission,
    regenerateToken,
    deleteOnboardingRequest,
} from '../controllers/requestController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All request routes are protected — require JWT
router.use(protect);

// POST /api/requests/create
router.post('/create', createOnboardingRequest);

// GET /api/requests  (all for the session user)
router.get('/', getFreelancerRequests);

// GET /api/requests/:id  (single request + submission)
router.get('/:id', getSubmissionById);

// PATCH /api/requests/:id  (update onboarding request)
router.patch('/:id', updateOnboardingRequest);

// POST /api/requests/:id/regenerate-token  (replace the link's token)
router.post('/:id/regenerate-token', regenerateToken);

// PATCH /api/requests/:id/submission  (update client submitted data)
router.patch('/:id/submission', updateRequestSubmission);

// DELETE /api/requests/:id  (delete a link and its submission)
router.delete('/:id', deleteOnboardingRequest);

export default router;