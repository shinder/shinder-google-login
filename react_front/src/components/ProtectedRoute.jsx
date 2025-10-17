import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute 組件
 * 保護需要登入才能訪問的路由
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div>載入中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // 未登入，重定向到登入頁面
    return <Navigate to="/login" replace />;
  }

  return children;
}
