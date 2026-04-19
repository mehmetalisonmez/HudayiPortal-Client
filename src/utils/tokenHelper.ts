// ──────────────────────────────────────────────
// JWT Token yardımcı fonksiyonları
// .NET backend'in uzun-URI claim tiplerini destekler
// ──────────────────────────────────────────────

import type { DecodedToken } from '../types/auth';

const TOKEN_KEY = 'hudayi_token';

/** localStorage'dan JWT token'ı alır */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/** JWT token'ı localStorage'a kaydeder */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/** JWT token'ı localStorage'dan siler */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// ──────────────────────────────────────────────
// .NET Claim URI → kısa alan adı eşleme tablosu
// ASP.NET Core / IdentityServer tarafından kullanılan
// standart claim URI'ları burada kısa isimlere dönüştürülür.
// ──────────────────────────────────────────────
const CLAIM_MAP: Record<string, string> = {
  // Role
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'role',
  // Name (Ad Soyad)
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'name',
  // Email
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'email',
  // NameIdentifier (Kullanıcı ID)
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': 'sub',
};

/**
 * JWT token'ın payload kısmını decode eder.
 *
 * .NET backend'leri claim'leri genellikle uzun URI formatında yazar:
 *   "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Admin"
 *
 * Bu fonksiyon hem kısa ("role") hem de uzun URI formatını tanır
 * ve her ikisini de DecodedToken arayüzüne normalize eder.
 *
 * Geçersiz token durumunda null döner.
 */
export const parseJwt = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const raw = JSON.parse(jsonPayload) as Record<string, unknown>;

    // Uzun URI claim tiplerini kısa isimlere dönüştür
    const normalized: Record<string, unknown> = { ...raw };

    for (const [longUri, shortKey] of Object.entries(CLAIM_MAP)) {
      if (longUri in raw && !(shortKey in raw)) {
        // Uzun URI var ama kısa key yok — normalize et
        normalized[shortKey] = raw[longUri];
      }
    }

    // "unique_name" alternatifini de destekle (bazı .NET tokenlar bunu kullanır)
    if (!normalized['name'] && raw['unique_name']) {
      normalized['name'] = raw['unique_name'];
    }

    // "nameid" alternatifini de destekle
    if (!normalized['sub'] && raw['nameid']) {
      normalized['sub'] = raw['nameid'];
    }

    return normalized as unknown as DecodedToken;
  } catch {
    return null;
  }
};

/**
 * Token'ın süresinin dolup dolmadığını kontrol eder.
 * Süresi dolmuşsa veya geçersizse true döner.
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = parseJwt(token);
  if (!decoded) return true;
  // exp alanı saniye cinsinden, Date.now() milisaniye cinsinden
  return decoded.exp * 1000 < Date.now();
};
