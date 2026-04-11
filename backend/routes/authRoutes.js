import express from 'express';
import multer from 'multer';
import path from 'path';
import { register, login, getMe, deleteMe, getStaff, updateProfile, uploadProfilePicture } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer config for profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `profile_${req.user._id}_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);
router.post('/profile-picture', protect, upload.single('profilePicture'), uploadProfilePicture);
router.delete('/me', protect, deleteMe);
router.get('/staff', protect, authorize('Admin', 'Warden'), getStaff);

export default router;
