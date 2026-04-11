import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // e.g., Electrical, Plumbing, Cleanliness
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved by Staff', 'Verified by Student', 'Reopened', 'Resolved', 'Rejected'], default: 'Pending' },
  slaDeadline: { type: Date },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  escalationLevel: { type: Number, default: 0 }, // 0: Staff, 1: Warden, 2: Admin
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  image: { type: String },
  resolutionImage: { type: String }, // Staff uploads when marking Resolved by Staff
  verifyImage: { type: String },     // Student uploads when confirming the fix
  reopenImage: { type: String }      // Student uploads if they reject the resolution
}, { timestamps: true });

export default mongoose.model('Complaint', complaintSchema);
