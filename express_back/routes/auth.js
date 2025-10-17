import express from 'express';
import { body } from 'express-validator';
import {
  googleLogin,
  refreshToken,
  getCurrentUser,
  logout,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Google 登入
router.post(
  '/google',
  body('idToken').notEmpty().withMessage('ID token is required'),
  googleLogin
);

// 刷新 Token
router.post(
  '/refresh',
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  refreshToken
);

// 獲取當前用戶（需要驗證）
router.get('/me', authenticateToken, getCurrentUser);

// 登出
router.post('/logout', authenticateToken, logout);

export default router;
