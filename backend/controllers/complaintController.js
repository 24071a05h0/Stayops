import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { categorizeComplaint, determinePriority, calculateSLA } from '../utils/smartAutomation.js';

export const createComplaint = async (req, res) => {
  try {
    const { title, description, priority: reqPriority } = req.body;
    const category = categorizeComplaint(title, description);
    const priority = reqPriority || determinePriority(title, description);
    const slaDeadline = calculateSLA(category);

    // Staff assignment happens manually by Wardens/Admins now
    const assignedStaff = null;

    let imagePath = null;
    if (req.file) {
      imagePath = req.file.path;
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority,
      slaDeadline,
      assignedTo: assignedStaff,
      createdBy: req.user._id,
      timeline: [{ status: 'Pending', note: 'Complaint registered' }],
      image: imagePath
    });

    // Create Notifications for Wardens
    const wardens = await User.find({ role: 'Warden' });
    for (const warden of wardens) {
      await Notification.create({
        userId: warden._id,
        message: `New ${priority} priority complaint registered: "${title}"`,
        relatedComplaintId: complaint._id
      });
    }

    if (assignedStaff) {
      await Notification.create({
        userId: assignedStaff,
        message: `New ${priority} priority complaint assigned to you: ${title}`,
        relatedComplaintId: complaint._id
      });
    }

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getComplaints = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Student') {
      query.createdBy = req.user._id;
    } else if (req.user.role === 'Staff') {
      query.assignedTo = req.user._id; // Only show explicitly assigned ones
    } else if (req.user.role === 'Warden') {
      // Wardens should see all complaints for monitoring, not just escalated
      query = {}; // Warden sees all inside their block ideally, but for MVP we show all
    }
    // Admin sees all

    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name roomNumber block')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('createdBy', 'name roomNumber block email')
      .populate('assignedTo', 'name email');
    
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, note, assignedTo, priority } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: 'Not found' });

    // ── Handle uploaded images ──────────────────────────────────────────────
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.fieldname === 'resolutionImage') complaint.resolutionImage = file.path;
        if (file.fieldname === 'reopenImage')     complaint.reopenImage     = file.path;
        if (file.fieldname === 'verifyImage')     complaint.verifyImage     = file.path;
      });
    } else if (req.file) {
      if (req.file.fieldname === 'resolutionImage') complaint.resolutionImage = req.file.path;
      if (req.file.fieldname === 'reopenImage')     complaint.reopenImage     = req.file.path;
      if (req.file.fieldname === 'verifyImage')     complaint.verifyImage     = req.file.path;
    }

    // ── Priority update (Warden / Admin only) ───────────────────────────────
    if (priority && priority !== complaint.priority && ['Warden', 'Admin'].includes(req.user.role)) {
      complaint.priority = priority;
      complaint.timeline.push({ status: 'Priority Updated', note: `Priority changed to ${priority}` });
    }

    // ── Staff assignment (Warden / Admin) → auto In Progress ────────────────
    if (assignedTo && ['Warden', 'Admin'].includes(req.user.role)) {
      complaint.assignedTo = assignedTo;
      if (['Pending', 'Reopened'].includes(complaint.status)) {
        complaint.status = 'In Progress';
        complaint.timeline.push({ status: 'In Progress', note: 'Staff assigned by Warden — work in progress' });
      } else {
        complaint.timeline.push({ status: 'Reassigned', note: 'Staff member reassigned by Warden' });
      }
      await Notification.create({
        userId: assignedTo,
        message: `You have been assigned to complaint: "${complaint.title}"`,
        relatedComplaintId: complaint._id
      });
    }

    // ── Status transitions ───────────────────────────────────────────────────
    if (status) {

      // STAFF: Mark as "Resolved by Staff" — requires a resolution image
      if (status === 'Resolved by Staff') {
        if (req.user.role !== 'Staff') {
          return res.status(403).json({ message: 'Only staff can mark as Resolved by Staff.' });
        }
        if (complaint.status !== 'In Progress') {
          return res.status(400).json({ message: 'Complaint must be In Progress before marking resolved.' });
        }
      }

      // STUDENT: Verify (confirm fixed) — requires a verification photo
      if (status === 'Verified by Student') {
        if (req.user.role !== 'Student') {
          return res.status(403).json({ message: 'Only the student can verify this.' });
        }
        if (complaint.status !== 'Resolved by Staff') {
          return res.status(400).json({ message: 'Complaint must be Resolved by Staff first.' });
        }
      }

      // STUDENT: Reject (escalate back to Warden) — requires a reopen image
      if (status === 'Reopened') {
        if (req.user.role !== 'Student') {
          return res.status(403).json({ message: 'Only the student can reopen a complaint.' });
        }
        // Notify warden
        const wardens = await User.find({ role: 'Warden' });
        for (const w of wardens) {
          await Notification.create({
            userId: w._id,
            message: `Student rejected resolution for "${complaint.title}" — please review and reassign.`,
            relatedComplaintId: complaint._id
          });
        }
      }

      // WARDEN: Final resolution
      if (status === 'Resolved') {
        if (!['Warden', 'Admin'].includes(req.user.role)) {
          return res.status(403).json({ message: 'Only Warden or Admin can finalize a complaint.' });
        }
        if (complaint.status !== 'Verified by Student') {
          return res.status(400).json({ message: 'Complaint must be verified by student before finalizing.' });
        }
        complaint.slaDeadline = null;
      }

      complaint.status = status;
      complaint.timeline.push({ status, note: note || `Status updated to ${status}` });

      // Notify student
      const msgMap = {
        'Resolved by Staff':  `Your complaint "${complaint.title}" has been fixed by staff. Please verify.`,
        'Verified by Student': `You confirmed the fix for "${complaint.title}". Awaiting warden finalization.`,
        'Reopened':           `Complaint "${complaint.title}" has been escalated back to the warden.`,
        'Resolved':           `Your complaint "${complaint.title}" has been officially resolved. ✅`,
      };
      const msg = msgMap[status] || `Your complaint "${complaint.title}" status changed to ${status}`;
      await Notification.create({
        userId: complaint.createdBy,
        message: msg,
        relatedComplaintId: complaint._id
      });
    }

    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
