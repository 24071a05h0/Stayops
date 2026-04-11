import express from 'express';
import { register, login, getMe, deleteMe, getStaff, updateProfile } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.delete('/me', protect, deleteMe);
router.get('/staff', protect, authorize('Admin', 'Warden'), getStaff);

export default router;
