import cron from 'node-cron';
import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';

// Run every hour
export const startCronJobs = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('Running SLA check cron job...');
    try {
      const now = new Date();
      // Find unresolved complaints past their SLA
      const breachedComplaints = await Complaint.find({
        status: { $ne: 'Resolved' },
        slaDeadline: { $lt: now },
        escalationLevel: { $lt: 2 } // Max level 2 (Admin)
      });

      for (const complaint of breachedComplaints) {
        complaint.escalationLevel += 1;
        
        let notifyMessage = '';
        if (complaint.escalationLevel === 1) {
          notifyMessage = `SLA Breached! Complaint "${complaint.title}" escalated to Warden.`;
        } else if (complaint.escalationLevel === 2) {
          notifyMessage = `CRITICAL SLA Breach! Complaint "${complaint.title}" escalated to Admin.`;
        }

        // Add to timeline
        complaint.timeline.push({ status: complaint.status, note: notifyMessage });
        
        // Notify Creator
        await Notification.create({
          userId: complaint.createdBy,
          message: notifyMessage,
          relatedComplaintId: complaint._id
        });

        // Set next SLA deadline (e.g., +12 hours for next level)
        const nextDeadline = new Date(now);
        nextDeadline.setHours(nextDeadline.getHours() + 12);
        complaint.slaDeadline = nextDeadline;

        await complaint.save();
      }
      console.log(`Escalated ${breachedComplaints.length} complaints.`);
    } catch (error) {
      console.error('Cron Job Error:', error);
    }
  });
};
