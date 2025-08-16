import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';
import speakeasy from 'speakeasy';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Register user
export const registerUser = async (req, res) => {
  const { name, age, email, username, password } = req.body;
  try {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.json({ value: false, message: 'User exists' });

    const hashed = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000;

    const user = await User.create({
      name,
      age,
      email,
      username,
      password: hashed,
      emailVerificationToken: token,
      emailVerificationExpires: expires,
    });

    const link = `${BASE_URL}/verify-email?token=${token}&email=${email}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your email',
      html: `<p>Click to verify your email: <a href='${link}'>Verify</a></p>`,
    });

    res.json({ value: true, message: 'Registered, verify your email' });
  } catch (err) {
    res.status(400).json({ error: 'Registration failed' });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  const { token, email } = req.query;
  try {
    const user = await User.findOne({
      email,
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).send('Invalid or expired token');

    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    user.isVerified = true;
    await user.save();

    res.redirect('/login');
  } catch (err) {
    res.status(400).json({ error: 'Email verification failed' });
  }
};

// Login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie('token', token, { httpOnly: true }).json({ message: 'Login successful' });
  } catch (err) {
    res.status(400).json({ error: 'Login failed' });
  }
};

// Google login
export const googleLogin = async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        email: payload.email,
        name: payload.name,
        username: payload.email.split('@')[0],
        googleId: payload.sub,
        isVerified: true,
      });
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie('token', jwtToken, { httpOnly: true }).json({ message: 'Google login successful' });
  } catch (err) {
    res.status(401).json({ error: 'Google login failed' });
  }
};

// 2FA
export const setup2FA = (req, res) => {
  const secret = speakeasy.generateSecret();
  res.json({ secret: secret.base32, otpauth_url: secret.otpauth_url });
};

export const verify2FA = (req, res) => {
  const { secret, token } = req.body;
  const verified = speakeasy.totp.verify({ secret, encoding: 'base32', token });
  res.json({ verified });
};

// Username availability
export const checkUsername = async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    res.json({ exists: !!user });
  } catch (err) {
    res.status(400).json({ error: 'Error checking username' });
  }
};

// Forgot password
export const sendResetEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `${BASE_URL}/reset-password?token=${token}&email=${email}`;

    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Reset your password',
      html: `<p>Click <a href='${resetLink}'>here</a> to reset your password.</p>`,
    });

    res.json({ message: 'Reset email sent' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to send reset email' });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(404).json({ error: 'Invalid or expired token' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(400).json({ error: 'Password reset failed' });
  }
};
