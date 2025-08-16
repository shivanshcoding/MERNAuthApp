import express from 'express';
import { me, logout } from '../controllers/userController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/me', verifyToken, me);
router.post('/logout', logout);

export default router;
