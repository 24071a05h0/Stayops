import Complaint from '../models/Complaint.js';

export const getAnalytics = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });
    const pendingComplaints = await Complaint.countDocuments({ status: { $ne: 'Resolved' } });
    
    // SLA Breaches
    const now = new Date();
    const slaBreaches = await Complaint.countDocuments({
      status: { $ne: 'Resolved' },
      slaDeadline: { $lt: now }
    });

    // Category breakdown
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Priority breakdown
    const priorityStats = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.json({
      total: totalComplaints,
      resolved: resolvedComplaints,
      pending: pendingComplaints,
      slaBreaches: slaBreaches,
      byCategory: categoryStats,
      byPriority: priorityStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
