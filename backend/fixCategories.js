import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Complaint from './models/Complaint.js';
import { categorizeComplaint } from './utils/smartAutomation.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const complaints = await Complaint.find();
    let updatedCount = 0;

    for (let c of complaints) {
      const correctCategory = categorizeComplaint(c.title, c.description);
      if (c.category !== correctCategory) {
        c.category = correctCategory;
        await c.save();
        updatedCount++;
        console.log(`Updated "${c.title}" to ${correctCategory}`);
      }
    }

    console.log(`Finished! Updated ${updatedCount} complaints.`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

run();
