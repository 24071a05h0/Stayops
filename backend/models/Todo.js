import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'Personal' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'Complete', 'Incomplete'], default: 'Pending' },
  repairCost: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Todo', todoSchema);
