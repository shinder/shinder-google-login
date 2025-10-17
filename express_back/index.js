import express from "express";
import "dotenv/config";


const app = express();

// 設定靜態內容資料夾
app.use(express.static("public"));


// *** 頂層的中間件 ***
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



// 兩個條件: 方法, 路徑
app.get("/", (req, res) => {
  res.json({ name: "首頁" });
});


const port = process.env.WEB_PORT || 3002; // 問題: || 什麼意思??
app.listen(port, () => {
  console.log(`伺服器啟動: http://localhost:${port}`);
});
