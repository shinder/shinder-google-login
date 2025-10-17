# 路由實作文檔

## 概述

已成功為前端應用添加 React Router，實現了不同路徑訪問不同頁面。

## 路由配置

### 安裝的套件

- `react-router` (7.9.4)

### 路由結構

| 路徑 | 組件 | 描述 | 是否需要登入 |
|------|------|------|--------------|
| `/` | Redirect | 重定向到 `/login` | ❌ |
| `/login` | Login | 登入頁面 | ❌ (已登入會重定向) |
| `/dashboard` | Dashboard | 用戶儀表板 | ✅ |
| `*` (其他) | Redirect | 重定向到 `/login` | ❌ |

## 核心組件

### 1. ProtectedRoute

**位置**: `src/components/ProtectedRoute.jsx`

**功能**: 保護需要登入才能訪問的路由

**邏輯**:

- 檢查 `isAuthenticated` 狀態
- 如果未登入，重定向到 `/login`
- 如果已登入，渲染子組件
- 顯示 loading 狀態

```jsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

### 2. LoginRoute

**位置**: `src/App.jsx` (內部組件)

**功能**: 登入頁面的路由守衛

**邏輯**:

- 檢查 `isAuthenticated` 狀態
- 如果已登入，重定向到 `/dashboard`
- 如果未登入，顯示登入頁面
- 顯示 loading 狀態

## 路由流程

### 未登入用戶訪問流程

```
用戶訪問任何路徑
    ↓
檢查是否已登入
    ↓
未登入 → 重定向到 /login
    ↓
顯示登入頁面
    ↓
用戶點擊 Google 登入
    ↓
登入成功，isAuthenticated = true
    ↓
LoginRoute 檢測到已登入
    ↓
自動重定向到 /dashboard
    ↓
顯示 Dashboard
```

### 已登入用戶訪問流程

```txt
用戶訪問 /login
    ↓
LoginRoute 檢測到已登入
    ↓
自動重定向到 /dashboard
    ↓
顯示 Dashboard
```

```txt
用戶訪問 /dashboard
    ↓
ProtectedRoute 檢查登入狀態
    ↓
已登入 → 顯示 Dashboard
```

### 登出流程

```txt
用戶在 Dashboard 點擊登出
    ↓
調用 handleLogout()
    ↓
清除用戶狀態和 tokens
    ↓
navigate('/login')
    ↓
重定向到登入頁面
```

## 實作細節

### App.jsx 更新

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginRoute />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
</BrowserRouter>
```

### Dashboard.jsx 更新

添加登出後的導航功能：

```jsx
import { useNavigate } from 'react-router';

const navigate = useNavigate();

const handleLogout = async () => {
  await logout();
  navigate('/login');
};
```

## 路由守衛邏輯

### ProtectedRoute (保護已登入才能訪問的頁面)

```jsx
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
```

### LoginRoute (防止已登入用戶訪問登入頁)

```jsx
function LoginRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loading />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <Login />;
}
```

## URL 示例

### 開發環境

- 登入頁面: `http://localhost:5173/login`
- Dashboard: `http://localhost:5173/dashboard`
- 根路徑: `http://localhost:5173/` (自動重定向到 `/login`)

### 生產環境 (示例)

- 登入頁面: `https://yourapp.com/login`
- Dashboard: `https://yourapp.com/dashboard`

## 特性

### ✅ 已實作

1. **路由配置**
   - 登入頁面 (`/login`)
   - Dashboard (`/dashboard`)
   - 根路徑重定向
   - 404 處理

2. **路由守衛**
   - 受保護的路由 (ProtectedRoute)
   - 登入頁面守衛 (LoginRoute)
   - Loading 狀態處理

3. **導航功能**
   - 登入成功自動導航到 Dashboard
   - 登出後導航回登入頁面
   - 未登入訪問受保護頁面自動重定向

4. **URL 管理**
   - 乾淨的 URL 結構
   - 語義化路徑
   - 適當的重定向

### ⏳ 可選增強功能

1. **面包屑導航**
   - 顯示當前位置
   - 快速導航

2. **導航菜單**
   - 側邊欄
   - 頂部導航欄

3. **更多頁面**
   - 用戶設定 (`/settings`)
   - 個人資料 (`/profile`)
   - 關於頁面 (`/about`)

4. **404 自定義頁面**
   - 美觀的 404 頁面
   - 返回首頁按鈕

5. **路由動畫**
   - 頁面切換動畫
   - 使用 Framer Motion

## 測試指南

### 測試場景 1: 未登入用戶

1. 訪問 `http://localhost:5173/`
   - ✅ 應重定向到 `/login`

2. 訪問 `http://localhost:5173/dashboard`
   - ✅ 應重定向到 `/login`

3. 訪問 `http://localhost:5173/random-path`
   - ✅ 應重定向到 `/login`

### 測試場景 2: 登入流程

1. 在 `/login` 頁面點擊 Google 登入
   - ✅ 登入成功後自動導航到 `/dashboard`

2. URL 應該變為 `http://localhost:5173/dashboard`
   - ✅ 確認 URL 正確

### 測試場景 3: 已登入用戶

1. 已登入狀態下訪問 `/login`
   - ✅ 應自動重定向到 `/dashboard`

2. 在 `/dashboard` 刷新頁面
   - ✅ 應保持在 `/dashboard`（session 持久化）

3. 點擊登出按鈕
   - ✅ 應導航回 `/login`
   - ✅ URL 應變為 `/login`

### 測試場景 4: 瀏覽器行為

1. 在 `/dashboard` 點擊瀏覽器後退按鈕
   - ✅ 應導航到 `/login`
   - ✅ 由於已登入，應自動重定向回 `/dashboard`

2. 清除 localStorage 後刷新
   - ✅ 應重定向到 `/login`

## 常見問題

### Q: 為什麼登入後 URL 沒有變化？

A: 確保 `LoginRoute` 組件正確使用 `<Navigate to="/dashboard" replace />` 進行重定向。

### Q: 如何添加新的受保護頁面？

A: 在 `App.jsx` 的 Routes 中添加新路由，並使用 `ProtectedRoute` 包裝：

```jsx
<Route
  path="/new-page"
  element={
    <ProtectedRoute>
      <NewPage />
    </ProtectedRoute>
  }
/>
```

### Q: 如何在組件中進行導航？

A: 使用 `useNavigate` hook：

```jsx
import { useNavigate } from 'react-router';

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/dashboard');
  };
}
```

### Q: 如何獲取當前路由信息？

A: 使用 `useLocation` hook：

```jsx
import { useLocation } from 'react-router';

function MyComponent() {
  const location = useLocation();
  console.log(location.pathname); // '/dashboard'
}
```

## 優化建議

### 1. 代碼分割 (Code Splitting)

使用 React.lazy 和 Suspense 延遲加載頁面：

```jsx
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));

<Suspense fallback={<Loading />}>
  <Routes>
    {/* ... */}
  </Routes>
</Suspense>
```

### 2. 路由配置集中管理

創建 `src/routes/index.jsx` 集中管理路由配置。

### 3. 路由權限系統

為不同用戶角色設置不同的可訪問路由。

## 總結

已成功實作完整的路由系統：

- ✅ 多頁面支持（`/login` 和 `/dashboard`）
- ✅ 路由守衛（未登入重定向）
- ✅ 自動導航（登入/登出）
- ✅ 乾淨的 URL 結構
- ✅ 良好的用戶體驗

路由系統已準備好用於開發和擴展。後續可根據需求添加更多頁面和功能。
