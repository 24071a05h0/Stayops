import express from 'express';
import { 
  createComplaint, 
  getComplaints, 
  getComplaintById, 
  updateComplaintStatus 
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Setup Multer for local uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.route('/')
  .post(protect, upload.single('image'), createComplaint)
  .get(protect, getComplaints);

router.route('/:id')
  .get(protect, getComplaintById)
  .put(protect, authorize('Staff', 'Warden', 'Admin', 'Student'), upload.any(), updateComplaintStatus);

export default router;
