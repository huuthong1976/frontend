// src/utils/api.js (bản cải tiến gợi ý)
import axios from "axios";

const API_ROOT = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_ROOT,
  timeout: 15000, // tuỳ chọn
});

api.interceptors.request.use((cfg) => {
  const u = cfg.url || "";
  // chỉ prefix nếu là đường dẫn tương đối và chưa có /api/
  if (typeof u === "string" && !/^https?:\/\//i.test(u) && !u.startsWith("/api/")) {
    cfg.url = `/api${u.startsWith("/") ? "" : "/"}${u}`;
  }
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      // window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
