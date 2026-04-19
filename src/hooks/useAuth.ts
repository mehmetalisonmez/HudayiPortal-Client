// ──────────────────────────────────────────────
// useAuth hook — AuthContext'e kolay erişim sağlar
// ──────────────────────────────────────────────

import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../context/AuthContext';

/**
 * AuthContext'i kullanan hook.
 * AuthProvider dışında çağrılırsa hata fırlatır.
 *
 * Kullanım:
 * ```tsx
 * const { user, login, logout, isAuthenticated, role } = useAuth();
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth hook\'u AuthProvider içinde kullanılmalıdır.');
  }
  return context;
};
