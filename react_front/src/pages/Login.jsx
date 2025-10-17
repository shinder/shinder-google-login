import { GoogleLoginButton } from "../components/GoogleLoginButton";

export function Login() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          textAlign: "center",
          maxWidth: "400px",
          width: "90%",
        }}
      >
        <h1 style={{ marginBottom: "10px", color: "#333" }}>Google 登入示範</h1>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          使用您的 Google 帳號登入
        </p>

        <GoogleLoginButton />

        <div
          style={{
            marginTop: "30px",
            padding: "15px",
            background: "#f8f9fa",
            borderRadius: "8px",
            fontSize: "14px",
            color: "#666",
          }}
        >
          <p style={{ margin: "0 0 10px 0" }}>
            <strong>功能說明：</strong>
          </p>
          <ul
            style={{
              textAlign: "left",
              margin: 0,
              paddingLeft: "20px",
            }}
          >
            <li>使用 Google OAuth 2.0 認證</li>
            <li>JWT Token 管理</li>
            <li>前後端分離架構</li>
            <li>安全的身份驗證</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
