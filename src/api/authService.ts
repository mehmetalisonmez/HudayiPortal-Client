// ──────────────────────────────────────────────
// Auth API Servisi — Login, Register, Email Doğrulama
// ──────────────────────────────────────────────

import api from './axiosInstance';
import { API } from './endpoints';
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types';

export const authService = {
  /** Kullanıcı girişi → JWT token döner */
  login: (data: LoginRequest) =>
    api.post<LoginResponse>(API.AUTH.LOGIN, data),

  /** Yeni kullanıcı kaydı → Oluşturulan kullanıcı ID döner */
  register: (data: RegisterRequest) =>
    api.post<number>(API.AUTH.REGISTER, data),

  /** OTP dorulama  JWT token dner */
  verifyOtp: (data: { email: string; otpCode: string }) =>
    api.post<LoginResponse>('/auth/verify-otp', data),

  /** Email doğrulama → Token ile GET isteği */
  verifyEmail: (token: string) =>
    api.get(API.AUTH.VERIFY_EMAIL, { params: { token } }),
};

