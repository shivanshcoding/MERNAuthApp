import express from 'express';
const router = express.Router();

import {
  registerUser,
  loginUser,
  googleLogin,
  setup2FA,
  verify2FA,
  checkUsername,
  resetPassword,
  verifyEmail,
  sendResetEmail
} from '../controllers/authControllers.js';

router.post('/check-username', checkUsername);
router.post('/reset-password', resetPassword);
router.post('/send-reset-email', sendResetEmail);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.post('/2fa/setup', setup2FA);
router.post('/2fa/verify', verify2FA);
router.get('/verify-email', verifyEmail);

export default router;
