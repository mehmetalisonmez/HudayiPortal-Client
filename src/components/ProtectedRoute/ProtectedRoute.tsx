// ──────────────────────────────────────────────
// ProtectedRoute — JWT ve rol bazlı route koruması
// ──────────────────────────────────────────────

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  /** İzin verilen roller. Boş bırakılırsa sadece giriş kontrolü yapar. */
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, role, loading } = useAuth();

  // Auth state yüklenirken spinner göster
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: (t) => t.palette.background.default,
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  // Giriş yapılmamışsa login'e yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Rol kontrolü — allowedRoles tanımlıysa ve kullanıcının rolü uygun değilse
  if (allowedRoles && allowedRoles.length > 0 && role) {
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/yetkisiz" replace />;
    }
  }

  // Her şey OK — çocuk route'ları render et
  return <Outlet />;
};

export default ProtectedRoute;
