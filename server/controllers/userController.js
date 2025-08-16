import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token').json({ message: 'Logged out' });
};
