import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) {
    return <div>載入中...</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>歡迎！</h1>

      <div
        style={{
          background: "#cccccc",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h2>用戶資料</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {user.picture && (
            <img
              src={user.picture}
              alt={user.name}
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
              }}
            />
          )}
          <div>
            <p>
              <strong>名稱:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>ID:</strong> {user.id}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        style={{
          padding: "10px 20px",
          background: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        登出
      </button>
    </div>
  );
}
