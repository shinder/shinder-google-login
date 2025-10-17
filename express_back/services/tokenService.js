import jwt from "jsonwebtoken";

/**
 * 生成 Access Token
 * @param {Object} user - 用戶資料
 * @returns {string} - JWT Access Token
 */
export function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" }
  );
}

/**
 * 生成 Refresh Token
 * @param {Object} user - 用戶資料
 * @returns {string} - JWT Refresh Token
 */
export function generateRefreshToken(user) {
  return jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
}

/**
 * 驗證 Access Token
 * @param {string} token - JWT Access Token
 * @returns {Object} - 解碼後的 payload
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    throw new Error("無效或過期的 Token");
  }
}

/**
 * 驗證 Refresh Token
 * @param {string} token - JWT Refresh Token
 * @returns {Object} - 解碼後的 payload
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error("無效或過期的 Refresh Token");
  }
}
