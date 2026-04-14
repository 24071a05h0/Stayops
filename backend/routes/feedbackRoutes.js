import express from 'express';
import { createFeedback, getFeedbacks } from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createFeedback);
router.get('/', protect, authorize('Admin'), getFeedbacks);

export default router;
