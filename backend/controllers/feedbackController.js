import Feedback from '../models/Feedback.js';

export const createFeedback = async (req, res) => {
  try {
    const { text } = req.body;
    // req.user might not exist if we allow unauthenticated feedback, but if we protect the route it will.
    // Let's assume widget can be used by anyone, but generally it's logged in users.
    const userId = req.user ? req.user._id : null;
    const feedback = await Feedback.create({ text, user: userId });
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('user', 'name email role').sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
