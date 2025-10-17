import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

export function GoogleLoginButton() {
  const { login, error } = useAuth();

  return (
    <div className="google-login-container">
      <GoogleLogin
        onSuccess={login}
        onError={() => {
          console.log("Google Login Failed");
        }}
        text="signin_with"
        shape="rectangular"
        size="large"
        locale="zh_TW"
      />
      {error && (
        <div style={{ color: "red", marginTop: "10px" }}>錯誤: {error}</div>
      )}
    </div>
  );
}
