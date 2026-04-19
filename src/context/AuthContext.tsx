// ──────────────────────────────────────────────
// AuthContext — Uygulama genelinde kimlik doğrulama durumunu yönetir.
//
// Sağladığı veriler: user, token, isAuthenticated, role
// Sağladığı aksiyonlar: login(), logout()
// ──────────────────────────────────────────────

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { DecodedToken, LoginRequest, LoginResponse } from '../types';
import { authService } from '../api/authService';
import { getToken, setToken, removeToken, parseJwt, isTokenExpired } from '../utils/tokenHelper';

/** Context tarafından sağlanan değerlerin tipi */
export interface AuthContextType {
  /** Decode edilmiş kullanıcı bilgisi (null = giriş yapılmamış) */
  user: DecodedToken | null;
  /** Ham JWT token */
  token: string | null;
  /** Kullanıcı giriş yapmış mı */
  isAuthenticated: boolean;
  /** Kullanıcının rolü */
  role: string | null;
  /** Giriş yapma fonksiyonu */
  login: (credentials: LoginRequest) => Promise<void>;
  /** Çıkış yapma fonksiyonu */
  logout: () => void;
  /** Auth işlemleri sırasında yükleniyor durumu */
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ─── Uygulama açılışında token kontrolü ────────────
  useEffect(() => {
    const savedToken = getToken();
    if (savedToken && !isTokenExpired(savedToken)) {
      const decoded = parseJwt(savedToken);
      if (decoded) {
        setTokenState(savedToken);
        setUser(decoded);
      } else {
        removeToken();
      }
    } else if (savedToken) {
      // Token süresi dolmuş — temizle
      removeToken();
    }
    setLoading(false);
  }, []);

  // ─── Login ─────────────────────────────────────────
  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    const data: LoginResponse = response.data;
    const decoded = parseJwt(data.token);

    if (!decoded) {
      throw new Error('Geçersiz token alındı.');
    }

    setToken(data.token);
    setTokenState(data.token);
    setUser(decoded);
  }, []);

  // ─── Logout ────────────────────────────────────────
  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    role: user?.role ?? null,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
