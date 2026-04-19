// ──────────────────────────────────────────────
// Dashboard Sayfası — Rol bazlı otomatik yönlendirme
// Admin/Personel → YoneticiDashboard
// Öğrenci → OgrenciDashboard
// ──────────────────────────────────────────────

import { useAuth } from '../../hooks/useAuth';
import YoneticiDashboard from './YoneticiDashboard';
import OgrenciDashboard from './OgrenciDashboard';
import { Box, CircularProgress } from '@mui/material';

const DashboardPage = () => {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Admin ve Personel yönetici dashboard'unu görür
  if (role === 'Admin' || role === 'Personel') {
    return <YoneticiDashboard />;
  }

  // Öğrenci veya diğer roller
  return <OgrenciDashboard />;
};

export default DashboardPage;
