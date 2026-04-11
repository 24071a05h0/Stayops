import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  block: { type: String, required: true },
  occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['Available', 'Full', 'Maintenance'], default: 'Available' }
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);
