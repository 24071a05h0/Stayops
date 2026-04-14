import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  text: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread'
  }
}, { timestamps: true });

export default mongoose.model('Feedback', feedbackSchema);
