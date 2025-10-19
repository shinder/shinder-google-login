import { createContext, useContext, useState, useEffect } from "react";
import {
  googleLogin,
  getCurrentUser,
  logout as apiLogout,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初始化：從 localStorage 載入 tokens
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (storedAccessToken && storedRefreshToken) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);

      // 載入用戶資料
      getCurrentUser(storedAccessToken)
        .then((response) => {
          setUser(response.user);
          setLoading(false);
        })
        .catch((err) => {
          console.error("載入用戶失敗:", err);
          // Token 可能已過期，清除
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setAccessToken(null);
          setRefreshToken(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // 處理 Google 登入
  const handleGoogleLogin = async (credentialResponse) => {
    console.log("Google signin 回傳的 credential:");
    console.log(JSON.stringify(credentialResponse, null, 4));

    try {
      setError(null);
      setLoading(true);

      // 呼叫我們自己的後端 API，將 idToken 送到 Google 的 Server 做驗證，並取得用戶資料
      const response = await googleLogin(credentialResponse.credential);
      console.log("我們自己的後端回傳的用戶資料:");
      console.log(JSON.stringify(response, null, 4));

      if (response.success) {
        // 儲存 tokens
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);

        setAccessToken(response.accessToken);
        setRefreshToken(response.refreshToken);
        setUser(response.user);

        console.log("登入成功:", response.user);
      }
    } catch (err) {
      console.error("登入失敗:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 登出
  const handleLogout = async () => {
    try {
      if (accessToken) {
        await apiLogout(accessToken);
      }
    } catch (err) {
      console.error("登出失敗:", err);
    } finally {
      // 無論 API 是否成功，都清除本地狀態
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setError(null);
    }
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    login: handleGoogleLogin,
    logout: handleLogout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook 來使用 auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth 必須在 AuthProvider 的子元件中使用");
  }
  return context;
};
