// ──────────────────────────────────────────────
// Merkezi Axios instance — tüm API istekleri buradan geçer.
//
// ✅ Request interceptor:  JWT token'ı Authorization header'ına ekler
// ✅ Response interceptor: 401 hatalarında otomatik logout yapar
// ──────────────────────────────────────────────

import axios from 'axios';
import { getToken, removeToken } from '../utils/tokenHelper';

const axiosInstance = axios.create({
  // Vite proxy kullanıyoruz: "/api" → "https://localhost:7288/api"
  // Bu sayede CORS sorunu olmaz.
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ────────────────────────
// Her istekte localStorage'daki JWT token'ı header'a ekler.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── Response Interceptor ───────────────────────
// 401 (Unauthorized) geldiğinde token'ı siler ve login sayfasına yönlendirir.
axiosInstance.interceptors.response.use(
  (response) => {
    // Başarılı yanıt — doğrudan geç
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token geçersiz veya süresi dolmuş
      removeToken();
      // Eğer zaten login sayfasında değilsek yönlendir
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
