// ──────────────────────────────────────────────
// Backend: LoginQuery, LoginResponseDto, RegisterCommand, VerifyEmailCommand
// ──────────────────────────────────────────────

/** POST /api/auth/login — İstek gövdesi */
export interface LoginRequest {
  email: string;
  sifre: string;
}

/** POST /api/auth/login — Başarılı yanıt */
export interface LoginResponse {
  token: string;
}

/** POST /api/auth/register — İstek gövdesi */
export interface RegisterRequest {
  ad: string;
  soyad: string;
  tcKimlikNo: string;
  telefon: string;
  email: string;
  sifre: string;
}

/** JWT token'dan decode edilen kullanıcı bilgisi */
export interface DecodedToken {
  sub: string;          // Kullanıcı ID
  email: string;
  role: string;         // "Admin" | "Personel" | "Öğrenci"
  name: string;         // Ad Soyad
  exp: number;          // Token bitiş zamanı (unix timestamp)
  iss: string;
  aud: string;
}
