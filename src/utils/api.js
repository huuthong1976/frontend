// src/utils/api.js
import axios from "axios";

const API_ROOT = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_ROOT,               // giữ nguyên domain Railway
  // withCredentials: true,        // bật nếu dùng cookie
});

// Gắn JWT nếu có
api.interceptors.request.use((cfg) => {
  // Auto-prefix /api nếu url chưa có
  const u = cfg.url || "";
  if (typeof u === "string" && !u.startsWith("/api/")) {
    cfg.url = `/api${u.startsWith("/") ? "" : "/"}${u}`;
  }

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// (tuỳ chọn) Nếu 401 thì xoá token và về /login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      // window.location.href = "/login"; // nếu muốn
    }
    return Promise.reject(err);
  }
);

export default api;
