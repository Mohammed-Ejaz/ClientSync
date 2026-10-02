import express from 'express';
import { submitClientData, getPublicRequest } from '../controllers/submissionController.js';

const router = express.Router();

// GET /api/submissions/check/:uniqueLink  (public pre-flight check for wizard)
router.get('/check/:uniqueLink', getPublicRequest);

// POST /api/submissions/:uniqueLink  (public — client submits data)
router.post('/:uniqueLink', submitClientData);

export default router;