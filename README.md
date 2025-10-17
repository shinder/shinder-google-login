# Google OAuth 2.0 登入系統

這是一個使用 Google OAuth 2.0 實現的完整身份驗證系統，採用前後端分離架構。

## 專案架構

```txt
shinder-google-login/
├── express_back/         # Express 後端
│   ├── controllers/      # 控制器層
│   ├── middleware/       # 中間件
│   ├── routes/           # 路由定義
│   ├── services/         # 業務邏輯
│   └── index.js          # 後端入口
│
├── react_front/          # React 前端
│   ├── src/
│   │   ├── components/   # React 元件
│   │   ├── context/      # Context API
│   │   ├── pages/        # 頁面元件
│   │   ├── services/     # API 服務
│   │   └── App.jsx       # 前端入口
│   └── index.html
│
└── docs/                 # 專案文檔
```

## 技術棧

### 後端

- **Node.js** + **Express.js** - Web 框架
- **googleapis** - Google OAuth 2.0 驗證
- **jsonwebtoken** - JWT Token 管理
- **express-validator** - 請求驗證
- **cors** - 跨域資源共享

### 前端

- **React 19** - UI 框架
- **React Router v7** - 前端路由
- **@react-oauth/google** - Google 登入元件
- **Vite** - 建置工具

## 核心功能

### 認證流程

1. 使用者點擊 Google 登入按鈕
2. Google OAuth 2.0 回傳 ID Token
3. 前端將 ID Token 發送至後端
4. 後端驗證 Google Token 並生成 JWT
5. 前端儲存 Access Token 和 Refresh Token
6. 使用 Access Token 存取受保護的 API

### 完整流程圖

```txt
1. 用戶訪問前端
   ↓
2. 點擊 Google 登入按鈕
   ↓
3. Google OAuth 彈窗授權
   ↓
4. 獲取 Google ID Token
   ↓
5. 前端發送 ID Token 到後端 API
   ↓
6. 後端驗證 Google ID Token
   ↓
7. 創建/更新用戶資料
   ↓
8. 生成 JWT Access Token + Refresh Token
   ↓
9. 返回 Tokens 和用戶資料給前端
   ↓
10. 前端存儲 Tokens 到 localStorage
    ↓
11. 顯示 Dashboard 頁面
```

### Token 管理

- **Access Token**: 有效期 60 分鐘，用於 API 認證
- **Refresh Token**: 有效期 7 天，用於更新 Access Token
- Token 儲存於瀏覽器 localStorage

### 路由保護

- `/login` - 登入頁面（已登入自動跳轉至 Dashboard）
- `/dashboard` - 用戶儀表板（需要登入）
- 未登入訪問受保護路由會自動重定向至登入頁

## 安裝與設定

### 1. 環境需求

- Node.js 18+
- pnpm（或 npm/yarn）
- Google Cloud Console 帳號

### 2. 獲取 Google OAuth 憑證

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用「Google+ API」
4. 建立「OAuth 2.0 用戶端 ID」憑證
5. 設定授權的 JavaScript 來源：
   - `http://localhost:5173`
6. 設定授權的重新導向 URI：
   - `http://localhost:3001/api/auth/google/callback`
7. 複製「用戶端 ID」

### 3. 後端設定

```bash
cd express_back
pnpm install
```

建立 `.env` 文件：

```ini
# 伺服器設定
WEB_PORT=3001
NODE_ENV=development

# Google OAuth
GOOGLE_CLIENT_ID=你的_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=你的_GOOGLE_CLIENT_密碼

# JWT 密鑰（請使用強密碼）
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

# CORS 設定
FRONTEND_URL=http://localhost:5173
```

### 4. 前端設定

```bash
cd react_front
pnpm install
```

建立 `.env` 文件：

```ini
VITE_GOOGLE_CLIENT_ID=你的_GOOGLE_CLIENT_ID
VITE_API_URL=http://localhost:3001
```

## 啟動專案

### 開發模式

開啟兩個終端視窗：

**終端 1 - 後端：**

```bash
cd express_back
npm run dev
```

後端將運行於：<http://localhost:3001>

**終端 2 - 前端：**

```bash
cd react_front
pnpm dev
```

前端將運行於：<http://localhost:5173>

### 訪問應用

開啟瀏覽器訪問：<http://localhost:5173>

## API 端點

### 認證相關

#### POST `/api/auth/google`

Google 登入

**請求：**

```json
{
  "idToken": "Google_ID_Token"
}
```

**響應：**

```json
{
  "success": true,
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "user": {
    "id": "google_user_id",
    "email": "user@example.com",
    "name": "使用者名稱",
    "picture": "https://..."
  }
}
```

#### POST `/api/auth/refresh`

刷新 Access Token

**請求：**

```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**響應：**

```json
{
  "success": true,
  "accessToken": "new_jwt_access_token"
}
```

#### GET `/api/auth/me`

獲取當前用戶資料（需要認證）

**Headers：**

```txt
Authorization: Bearer <access_token>
```

**響應：**

```json
{
  "success": true,
  "user": {
    "id": "google_user_id",
    "email": "user@example.com",
    "name": "使用者名稱",
    "picture": "https://..."
  }
}
```

#### POST `/api/auth/logout`

登出（需要認證）

**Headers：**

```txt
Authorization: Bearer <access_token>
```

**響應：**

```json
{
  "success": true,
  "message": "已成功登出"
}
```

## 專案特點

### 安全性

- ✅ Google OAuth 2.0 官方驗證
- ✅ JWT Token 雙重認證機制
- ✅ Token 自動過期管理
- ✅ CORS 跨域保護
- ✅ HTTP Headers 安全設定

### 用戶體驗

- ✅ 自動登入狀態恢復
- ✅ 路由保護與自動重定向
- ✅ 載入狀態提示
- ✅ 錯誤訊息處理
- ✅ 響應式設計

### 開發體驗

- ✅ 前後端分離架構
- ✅ 清晰的程式碼結構
- ✅ 完整的錯誤處理
- ✅ 正體中文錯誤訊息
- ✅ 詳細的程式碼註解

## 目錄結構說明

### 後端 (express_back)

```txt
express_back/
├── controllers/
│   └── authController.js      # 認證控制器
├── middleware/
│   ├── auth.js                # JWT 驗證中間件
│   └── errorHandler.js        # 全域錯誤處理
├── routes/
│   └── auth.js                # 認證路由
├── services/
│   ├── googleAuth.js          # Google Token 驗證
│   └── tokenService.js        # JWT Token 服務
├── .env                       # 環境變數
├── index.js                   # 應用入口
└── package.json
```

### 前端 (react_front)

```txt
react_front/
├── src/
│   ├── components/
│   │   ├── GoogleLoginButton.jsx    # Google 登入按鈕
│   │   └── ProtectedRoute.jsx       # 路由保護元件
│   ├── context/
│   │   └── AuthContext.jsx          # 認證狀態管理
│   ├── pages/
│   │   ├── Login.jsx                # 登入頁面
│   │   └── Dashboard.jsx            # 用戶儀表板
│   ├── services/
│   │   └── api.js                   # API 請求服務
│   ├── App.jsx                      # 應用主元件
│   └── main.jsx                     # React 入口
├── .env                             # 環境變數
├── index.html
└── package.json
```

## 測試 API

可以使用 `express_back/API_TESTING.md` 中的範例進行 API 測試。

建議使用工具：

- Postman
- Insomnia
- curl
- HTTPie

## 常見問題

### Q: Google 登入按鈕沒有顯示？

A: 檢查：

1. `.env` 中的 `VITE_GOOGLE_CLIENT_ID` 是否正確
2. Google Cloud Console 中的授權來源是否包含 `http://localhost:5173`
3. 瀏覽器控制台是否有錯誤訊息

### Q: 登入後重新整理頁面就登出了？

A: 這是正常的，目前 Token 儲存於 localStorage，刷新頁面會自動從 localStorage 恢復登入狀態。

### Q: CORS 錯誤？

A: 確認：

1. 後端 `.env` 中的 `FRONTEND_URL` 設定正確
2. 前端和後端都在運行
3. 端口號沒有衝突

### Q: Token 過期了怎麼辦？

A: Access Token 過期後，系統會自動使用 Refresh Token 獲取新的 Access Token（此功能需要額外實作）。

## 後續改進建議

- [ ] 實作 Refresh Token 自動更新機制
- [ ] 使用資料庫儲存用戶資料（目前使用 Map）
- [ ] 加入 Refresh Token 黑名單機制
- [ ] 實作記住我功能
- [ ] 加入更多第三方登入選項
- [ ] 加入單元測試和整合測試
- [ ] 部署至生產環境

## 授權

此專案為學習和示範用途，可自由使用和修改。

## 參考資料

- [Google OAuth 2.0 文檔](https://developers.google.com/identity/protocols/oauth2)
- [React OAuth Google](https://www.npmjs.com/package/@react-oauth/google)
- [JWT.io](https://jwt.io/)
- [Express.js 文檔](https://expressjs.com/)
- [React Router 文檔](https://reactrouter.com/)
