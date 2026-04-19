// ──────────────────────────────────────────────
// MainLayout — Sidebar + Navbar + Content alanı
// Authenticated sayfalar için ortak iskelet
// Desktop: Sidebar genişliğine göre content margin ayarlanır
// Sayfa geçiş animasyonu eklenmiş
// ──────────────────────────────────────────────

import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Sidebar, { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const location = useLocation();

  /** Desktop sidebar'ın mevcut genişliği */
  const sidebarWidth = desktopOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        desktopOpen={desktopOpen}
        onDesktopToggle={() => setDesktopOpen(!desktopOpen)}
      />

      {/* Ana İçerik Alanı */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${sidebarWidth}px)` },
          ml: { lg: `${sidebarWidth}px` },
          minHeight: '100vh',
          background: (t) => t.palette.background.default,
          transition: 'margin-left 0.25s ease, width 0.25s ease',
        }}
      >
        <Navbar
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
          sidebarWidth={sidebarWidth}
        />

        {/* Toolbar yüksekliği kadar boşluk (AppBar fixed olduğu için) */}
        <Toolbar />

        {/* Sayfa içeriği — fade-in animasyonlu */}
        <Box
          key={location.pathname}
          sx={{
            p: { xs: 2, sm: 3 },
            animation: 'fadeInUp 0.4s ease-out',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
