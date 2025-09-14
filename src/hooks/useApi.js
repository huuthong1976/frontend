import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL;

export default function useApi() {
  const navigate = useNavigate();

  const request = useCallback(
    async (endpoint, options = {}) => {
      const token = localStorage.getItem("token");

      // Thêm header Authorization
      const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers,
        });

        // Nếu token hết hạn → redirect login
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          throw new Error("Unauthorized - Token expired or invalid");
        }

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }

        // Nếu có body trả về
        return await res.json();
      } catch (err) {
        console.error("API Request Error:", err);
        throw err;
      }
    },
    [navigate]
  );

  return request;
}
