// ──────────────────────────────────────────────
// React Router — Uygulama yönlendirme yapılandırması
// ──────────────────────────────────────────────

import { createBrowserRouter } from 'react-router-dom';

// Layout
import MainLayout from '../layouts/MainLayout';

// Pages
import LoginPage from '../pages/Login/LoginPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import UnauthorizedPage from '../pages/Unauthorized/UnauthorizedPage';
import OgrencilerPage from '../pages/Ogrenciler/OgrencilerPage';
import EtkinliklerPage from '../pages/Etkinlikler/EtkinliklerPage';
import DuyurularPage from '../pages/Duyurular/DuyurularPage';
import IzinlerPage from '../pages/Izinler/IzinlerPage';

// Components
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';

const router = createBrowserRouter([
  // ─── Public Routes ───
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/yetkisiz',
    element: <UnauthorizedPage />,
  },

  // ─── Protected Routes (tüm giriş yapmış kullanıcılar) ───
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/etkinlikler',
            element: <EtkinliklerPage />,
          },
          {
            path: '/duyurular',
            element: <DuyurularPage />,
          },
          {
            path: '/izinler',
            element: <IzinlerPage />,
          },
        ],
      },
    ],
  },

  // ─── Admin/Personel Only Routes ───
  {
    element: <ProtectedRoute allowedRoles={['Admin', 'Personel']} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/ogrenciler',
            element: <OgrencilerPage />,
          },
        ],
      },
    ],
  },

  // ─── Catch-all: bilinmeyen route → login'e yönlendir ───
  {
    path: '*',
    element: <LoginPage />,
  },
]);

export default router;
