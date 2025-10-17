# API 測試文檔

## 服務器信息

- **URL**: http://localhost:3001
- **狀態**: ✅ 運行中

## API 端點

### 1. 首頁（健康檢查）

```bash
curl http://localhost:3001/
```

**響應**:
```json
{
  "name": "Google OAuth API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth"
  }
}
```

### 2. Google 登入

**端點**: `POST /api/auth/google`

**需要**: Google ID Token

```bash
curl -X POST http://localhost:3001/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken": "YOUR_GOOGLE_ID_TOKEN_HERE"}'
```

**成功響應**:
```json
{
  "success": true,
  "accessToken": "jwt_access_token...",
  "refreshToken": "jwt_refresh_token...",
  "user": {
    "id": "google_user_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://..."
  }
}
```

**錯誤響應**:
```json
{
  "error": "ID token is required"
}
```

### 3. 刷新 Token

**端點**: `POST /api/auth/refresh`

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

**成功響應**:
```json
{
  "success": true,
  "accessToken": "new_jwt_access_token..."
}
```

### 4. 獲取當前用戶資料

**端點**: `GET /api/auth/me`

**需要**: Authorization header with Bearer token

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**成功響應**:
```json
{
  "success": true,
  "user": {
    "id": "google_user_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://..."
  }
}
```

**錯誤響應（未授權）**:
```json
{
  "error": "Access token required"
}
```

### 5. 登出

**端點**: `POST /api/auth/logout`

**需要**: Authorization header with Bearer token

```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**成功響應**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 測試狀態

### ✅ 已完成的測試

1. **根路徑** - ✅ 正常運作
   - 返回 API 信息

2. **Google 登入端點驗證** - ✅ 正常運作
   - 缺少 token 時正確返回錯誤信息

3. **受保護端點驗證** - ✅ 正常運作
   - 未提供 token 時正確拒絕訪問

### ⏳ 待測試（需要真實 Google ID Token）

4. **完整登入流程**
   - 使用真實 Google ID Token 登入
   - 驗證返回的 JWT tokens
   - 測試 refresh token 機制
   - 測試受保護端點訪問

## 下一步

### 1. 設置 Google Cloud Console

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 "Google Identity Services"
4. 建立 OAuth 2.0 憑證（Web 應用程式）
5. 設置授權來源：
   - JavaScript 來源：`http://localhost:5173`
   - 重定向 URI：`http://localhost:3001/api/auth/google/callback`
6. 複製 Client ID 和 Client Secret

### 2. 更新環境變數

在 `express_back/.env` 中更新：

```env
GOOGLE_CLIENT_ID=your_actual_client_id
GOOGLE_CLIENT_SECRET=your_actual_client_secret
```

### 3. 使用 Google OAuth Playground 測試

前往 [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) 獲取測試用的 ID Token。

### 4. 開始前端開發

參考 `docs/020-plan2.md` 開始前端整合。

## 啟動服務器

```bash
cd express_back
node index.js
# 或使用 nodemon 開發模式
npx nodemon index.js
```

## 停止服務器

使用 `Ctrl + C` 停止服務器。

## 常見問題

### Q: 如何獲取 Google ID Token 進行測試？

**A**: 有兩種方式：

1. **使用 Google OAuth Playground**:
   - 前往 https://developers.google.com/oauthplayground/
   - 配置使用你的 OAuth 憑證
   - 獲取 ID Token

2. **整合前端**:
   - 使用 `@react-oauth/google` 在前端實作
   - 前端會自動獲取 ID Token

### Q: JWT Secret 如何生成？

**A**: 使用以下命令生成強隨機字串：

```bash
# 生成 32 字節隨機字串（base64 編碼）
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Q: 如何驗證 JWT Token？

**A**: 可以使用 [jwt.io](https://jwt.io/) 解碼和驗證 JWT token。

## 目錄結構

```
express_back/
├── index.js                    # 主入口文件
├── .env                        # 環境變數配置
├── package.json
├── services/
│   ├── googleAuth.js          # Google OAuth 驗證服務
│   └── tokenService.js        # JWT 生成和驗證服務
├── middleware/
│   ├── auth.js                # JWT 驗證中間件
│   └── errorHandler.js        # 錯誤處理中間件
├── controllers/
│   └── authController.js      # 認證控制器
└── routes/
    └── auth.js                # 認證路由
```

## 技術棧

- **Runtime**: Node.js
- **Framework**: Express.js 4.21.2
- **Authentication**:
  - googleapis 164.0.0 (Google OAuth)
  - jsonwebtoken 9.0.2 (JWT)
- **Middleware**:
  - cors 2.8.5
  - express-validator 7.2.1
- **Environment**: dotenv 17.2.3
