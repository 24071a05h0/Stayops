import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const userFields = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  roomNumber: user.roomNumber,
  block: user.block,
  hostelName: user.hostelName,
  profilePicture: user.profilePicture,
  createdAt: user.createdAt,
  ...(token && { token })
});

export const register = async (req, res) => {
  try {
    const { name, email, password, role, roomNumber, block, hostelName } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name, email, password, role, roomNumber, block, hostelName
    });

    res.status(201).json(userFields(user, generateToken(user._id)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json(userFields(user, generateToken(user._id)));
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, roomNumber, block, hostelName, password, oldPassword } = req.body;

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already taken by another account.' });
      }
    }

    if (password) {
      if (!oldPassword) {
        return res.status(400).json({ message: 'Please provide your current password to set a new one.' });
      }
      const isMatch = await user.matchPassword(oldPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect current password.' });
      }
      user.password = password;
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (roomNumber !== undefined) user.roomNumber = roomNumber;
    if (block !== undefined) user.block = block;
    if (hostelName !== undefined) user.hostelName = hostelName;

    // Handle profile picture from multer
    if (req.file) {
      user.profilePicture = req.file.path.replace(/\\/g, '/');
    }

    await user.save();

    res.json(userFields(user, generateToken(user._id)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profilePicture = req.file.path.replace(/\\/g, '/');
    await user.save();

    res.json(userFields(user, generateToken(user._id)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.deleteOne();
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: 'Staff' }).select('-password');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
