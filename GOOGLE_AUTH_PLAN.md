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
