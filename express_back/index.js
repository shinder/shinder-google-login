import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// CORS 設定 - 允許前端跨域請求
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// 中間件 - 解析請求 body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 設定靜態內容資料夾
app.use(express.static("public"));

// 路由
app.get("/", (req, res) => {
  res.json({
    name: "Google OAuth API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth"
    }
  });
});

// 認證相關路由
app.use("/api/auth", authRoutes);

// 錯誤處理中間件（必須放在最後）
app.use(errorHandler);

const port = process.env.WEB_PORT || 3002;
app.listen(port, () => {
  console.log(`伺服器啟動: http://localhost:${port}`);
  console.log(`API 文檔: http://localhost:${port}/api/auth`);
});
