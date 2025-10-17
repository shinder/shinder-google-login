const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Google 登入
 * @param {string} idToken - Google ID Token
 * @returns {Promise<Object>} - 用戶資料和 tokens
 */
export async function googleLogin(idToken) {
  const response = await fetch(`${API_URL}/api/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
}

/**
 * 刷新 Access Token
 * @param {string} refreshToken - Refresh Token
 * @returns {Promise<Object>} - 新的 access token
 */
export async function refreshAccessToken(refreshToken) {
  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Token refresh failed');
  }

  return response.json();
}

/**
 * 獲取當前用戶資料
 * @param {string} accessToken - Access Token
 * @returns {Promise<Object>} - 用戶資料
 */
export async function getCurrentUser(accessToken) {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get user');
  }

  return response.json();
}

/**
 * 登出
 * @param {string} accessToken - Access Token
 * @returns {Promise<Object>} - 登出響應
 */
export async function logout(accessToken) {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Logout failed');
  }

  return response.json();
}
