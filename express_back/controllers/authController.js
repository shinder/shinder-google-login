import { verifyGoogleToken } from "../services/googleAuth.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../services/tokenService.js";

/**
 * 用戶資料暫存（實際應使用資料庫）
 * key: googleId, value: user object
 */
const users = new Map();

/**
 * Google 登入
 * POST /api/auth/google
 */
export async function googleLogin(req, res, next) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "需要提供 ID Token" });
    }

    // 驗證 Google ID Token
    const googleUser = await verifyGoogleToken(idToken);

    // 檢查用戶是否存在，不存在則創建
    let user = users.get(googleUser.googleId);

    if (!user) {
      user = {
        id: googleUser.googleId,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        createdAt: new Date(),
      };
      users.set(googleUser.googleId, user);
      console.log("新用戶註冊:", user.email);
    } else {
      console.log("用戶登入:", user.email);
    }

    // 生成 JWT
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 刷新 Token
 * POST /api/auth/refresh
 */
export async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "需要提供 Refresh Token" });
    }

    // 驗證 Refresh Token
    const decoded = verifyRefreshToken(refreshToken);

    // 查找用戶
    const user = users.get(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "找不到用戶" });
    }

    // 生成新的 Access Token
    const newAccessToken = generateAccessToken(user);

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 獲取當前用戶資料
 * GET /api/auth/me
 */
export function getCurrentUser(req, res) {
  // req.user 由 authenticateToken 中間件設置
  const user = users.get(req.user.userId);

  if (!user) {
    return res.status(404).json({ error: "找不到用戶" });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
  });
}

/**
 * 登出
 * POST /api/auth/logout
 */
export function logout(req, res) {
  // 如果使用資料庫存儲 refresh token，在此處移除
  res.json({
    success: true,
    message: "已成功登出",
  });
}
