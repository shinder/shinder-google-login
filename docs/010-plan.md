# Google OAuth 登入實作計劃

## 專案需求

- Express.js 後端
- Google OAuth 2.0 登入
- 不使用 Passport.js
- 前後端分離架構（React 前端）
- JWT 身份驗證

## 推薦套件清單

### 必要套件

```bash
cd express_back
pnpm add googleapis jsonwebtoken cors dotenv
```

### 可選套件

```bash
pnpm add express-validator helmet
pnpm add -D @types/jsonwebtoken  # 如果使用 TypeScript
```

## 實作架構

### 方式 A：前端主導 OAuth 流程（推薦）

#### 流程說明

1. **前端**：使用 `@react-oauth/google` 顯示 Google 登入按鈕
2. **前端**：用戶點擊登入，Google 返回 ID Token
3. **前端**：將 ID Token 發送到後端 `POST /api/auth/google`
4. **後端**：驗證 ID Token 的有效性
5. **後端**：檢查/創建用戶記錄
6. **後端**：生成 JWT（access token + refresh token）
7. **後端**：返回 JWT 給前端
8. **前端**：儲存 JWT，用於後續 API 請求

#### 優點

- 前端有完整控制權
- 更好的用戶體驗（不需要重定向）
- 適合 SPA 應用
- 實作較簡單

#### 前端需要安裝

```bash
cd react_front
pnpm add @react-oauth/google
```

### 方式 B：後端主導 OAuth 流程

#### 流程說明

1. **前端**：重定向到 `GET /api/auth/google`
2. **後端**：重定向到 Google OAuth 授權頁面
3. **用戶**：在 Google 頁面授權
4. **Google**：重定向回 `GET /api/auth/google/callback`
5. **後端**：用授權碼換取 access token
6. **後端**：獲取用戶資料
7. **後端**：生成 JWT
8. **後端**：重定向回前端，附帶 JWT（URL 參數或 cookie）

#### 缺點

- 需要多次重定向
- 用戶體驗較差
- 實作較複雜

## JWT 策略

### Token 類型

- **Access Token**：短期有效（15-30 分鐘）
- **Refresh Token**：長期有效（7-30 天）

### Token 存儲

**前端選項：**

1. **Memory**（最安全，但刷新頁面會丟失）
2. **httpOnly Cookie**（安全，防 XSS）
3. **LocalStorage**（不推薦，容易受 XSS 攻擊）

### Token Payload 範例

```javascript
{
  "userId": "12345",
  "email": "user@example.com",
  "name": "User Name",
  "picture": "https://...",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 後端 API 設計

### 端點規劃

```
POST   /api/auth/google           - 驗證 Google ID Token，返回 JWT
POST   /api/auth/refresh          - 使用 refresh token 獲取新的 access token
POST   /api/auth/logout           - 登出（可選，移除 refresh token）
GET    /api/auth/me               - 獲取當前用戶資料（需要 JWT 驗證）
```

### 目錄結構建議

```
express_back/
├── index.js                 # 主入口
├── .env                     # 環境變數
├── package.json
├── config/
│   └── google.js           # Google OAuth 配置
├── middleware/
│   ├── auth.js             # JWT 驗證中間件
│   └── errorHandler.js     # 錯誤處理
├── routes/
│   └── auth.js             # 認證相關路由
├── controllers/
│   └── authController.js   # 認證邏輯
├── services/
│   ├── googleAuth.js       # Google OAuth 服務
│   └── tokenService.js     # JWT 生成/驗證
└── models/                 # 如果使用資料庫
    └── User.js
```

## 環境變數配置

需要在 `express_back/.env` 添加：

```env
# Server
WEB_PORT=3001

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# JWT
JWT_ACCESS_SECRET=your_access_token_secret_key
JWT_REFRESH_SECRET=your_refresh_token_secret_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173

# Database (如果需要)
# DATABASE_URL=your_database_url
```

## GCP 設置步驟

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Google+ API 或 Google Identity Services
4. 建立 OAuth 2.0 憑證：
   - 應用程式類型：Web 應用程式
   - 授權的 JavaScript 來源：`http://localhost:5173`（前端）
   - 授權的重新導向 URI：`http://localhost:3001/api/auth/google/callback`（後端）
5. 複製 Client ID 和 Client Secret 到 `.env`

## 安全性建議

1. **環境變數**：絕不將 `.env` 提交到 Git
2. **CORS**：只允許信任的前端域名
3. **JWT Secret**：使用強隨機字串
4. **HTTPS**：生產環境必須使用 HTTPS
5. **Token 過期**：設置合理的過期時間
6. **Input 驗證**：使用 express-validator 驗證所有輸入
7. **Rate Limiting**：防止暴力攻擊

## 資料庫考量

雖然 JWT 是無狀態的，但建議仍需資料庫來：

- 儲存用戶基本資料
- 儲存 refresh token（用於撤銷）
- 記錄登入歷史

**推薦選項：**

- **PostgreSQL** + Prisma
- **MongoDB** + Mongoose
- **SQLite**（開發用）

## 下一步實作順序

1. 安裝必要套件
2. 設置 GCP OAuth 憑證
3. 配置環境變數
4. 實作 Google Token 驗證服務
5. 實作 JWT 生成與驗證
6. 建立認證路由和控制器
7. 添加 JWT 驗證中間件
8. 測試 API 端點
9. 整合前端

---

# 實作範例代碼

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

---

## 總結回答原始問題

### 1. 不使用 passport.js 下，建議使用哪些套件？

**核心套件：**

- `googleapis` - Google 官方 Node.js 客戶端，用於驗證 Google ID Token
- `jsonwebtoken` - 生成和驗證 JWT
- `cors` - 處理前後端分離的跨域請求

**可選套件：**

- `express-validator` - 驗證和清理請求數據
- `helmet` - 增強 Express 應用的安全性

### 2. 前後端分離架構建議

**推薦使用方式 A（前端主導 OAuth 流程）：**

- 前端使用 `@react-oauth/google` 處理 Google 登入
- 前端獲取 Google ID Token 後發送給後端驗證
- 後端只負責驗證 Token 和生成 JWT
- 無需複雜的重定向流程，用戶體驗更好

**後端核心職責：**

- 驗證 Google ID Token 的有效性
- 管理用戶資料（創建/更新）
- 生成和驗證 JWT tokens
- 提供受保護的 API 端點

### 3. 是否需要使用 JWT？

**是的，強烈建議使用 JWT，原因如下：**

✅ **適合前後端分離架構**

- 無狀態（stateless），不需要在後端存儲 session
- 易於橫向擴展
- 支持跨域和多個前端應用

✅ **實作建議**

- 使用雙 Token 機制：
  - Access Token：15-30 分鐘（用於 API 請求）
  - Refresh Token：7-30 天（用於刷新 Access Token）
- Access Token 存儲在前端 memory 或 httpOnly cookie
- Refresh Token 應在資料庫中記錄以便撤銷

✅ **安全性考量**

- 使用強隨機字串作為 JWT secret
- 設置合理的過期時間
- 生產環境必須使用 HTTPS
- 考慮實作 token 黑名單機制
