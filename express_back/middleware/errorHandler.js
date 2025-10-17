/**
 * 全域錯誤處理中間件
 * 統一處理應用程式中的錯誤
 */
export function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "伺服器內部錯誤";

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
