# Google OAuth 實作範例代碼

## 1. 安裝套件

```bash
cd express_back
pnpm add googleapis jsonwebtoken cors express-validator
```

## 2. 更新 .env 文件

```env
WEB_PORT=3001

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# JWT
JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173
```

## 3. 核心服務實作

### services/googleAuth.js
```javascript
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * 驗證 Google ID Token
 * @param {string} token - Google ID Token
 * @returns {Promise<Object>} - 用戶資料
 */
export async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    return {
      googleId: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified,
      name: payload.name,
      picture: payload.picture,
      givenName: payload.given_name,
      familyName: payload.family_name,
    };
  } catch (error) {
    throw new Error('Invalid Google token');
  }
}
```

### services/tokenService.js
```javascript
import jwt from 'jsonwebtoken';

/**
 * 生成 Access Token
 */
export function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
}

/**
 * 生成 Refresh Token
 */
export function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

/**
 * 驗證 Access Token
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * 驗證 Refresh Token
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}
```

## 4. 中間件

### middleware/auth.js
```javascript
import { verifyAccessToken } from '../services/tokenService.js';

/**
 * JWT 驗證中間件
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = verifyAccessToken(token);
    req.user = user; // 將用戶資料附加到 request
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}
```

### middleware/errorHandler.js
```javascript
/**
 * 全域錯誤處理中間件
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
```

## 5. 控制器

### controllers/authController.js
```javascript
import { verifyGoogleToken } from '../services/googleAuth.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../services/tokenService.js';

/**
 * 用戶資料暫存（實際應使用資料庫）
 */
const users = new Map();

/**
 * Google 登入
 */
export async function googleLogin(req, res, next) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
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
      console.log('新用戶註冊:', user.email);
    } else {
      console.log('用戶登入:', user.email);
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
 */
export async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // 驗證 Refresh Token
    const decoded = verifyRefreshToken(refreshToken);

    // 查找用戶
    const user = users.get(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
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
 */
export function getCurrentUser(req, res) {
  // req.user 由 authenticateToken 中間件設置
  const user = users.get(req.user.userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
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
 */
export function logout(req, res) {
  // 如果使用資料庫存儲 refresh token，在此處移除
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}
```

## 6. 路由

### routes/auth.js
```javascript
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
```

## 7. 更新主入口文件

### index.js
```javascript
import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// CORS 設定
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// 中間件
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 設定靜態內容資料夾
app.use(express.static("public"));

// 路由
app.get("/", (req, res) => {
  res.json({ name: "Google OAuth API", version: "1.0.0" });
});

app.use("/api/auth", authRoutes);

// 錯誤處理（放在最後）
app.use(errorHandler);

const port = process.env.WEB_PORT || 3002;
app.listen(port, () => {
  console.log(`伺服器啟動: http://localhost:${port}`);
});
```

## 8. 測試 API

### 使用 curl 測試

```bash
# 測試 Google 登入（需要真實的 Google ID Token）
curl -X POST http://localhost:3001/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken": "YOUR_GOOGLE_ID_TOKEN"}'

# 測試獲取用戶資料（需要 access token）
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 測試刷新 Token
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

## 9. 前端整合範例（React）

```bash
cd react_front
pnpm add @react-oauth/google
```

### 前端代碼範例
```jsx
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function App() {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 儲存 tokens
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        console.log('登入成功:', data.user);
      }
    } catch (error) {
      console.error('登入失敗:', error);
    }
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => console.log('Login Failed')}
      />
    </GoogleOAuthProvider>
  );
}
```

## 注意事項

1. **資料庫**：以上範例使用 Map 存儲用戶，實際應使用資料庫
2. **Refresh Token**：應該在資料庫中存儲 refresh token，以便可以撤銷
3. **錯誤處理**：生產環境需要更完善的錯誤處理
4. **安全性**：確保 `.env` 不被提交到 Git
5. **HTTPS**：生產環境必須使用 HTTPS
