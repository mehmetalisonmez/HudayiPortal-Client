// ──────────────────────────────────────────────
// React Router — Uygulama yönlendirme yapılandırması
// ──────────────────────────────────────────────

import { createBrowserRouter } from "react-router-dom";

// Layout
import MainLayout from "../layouts/MainLayout";

// Pages
import LoginPage from "../pages/Login/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import UnauthorizedPage from "../pages/Unauthorized/UnauthorizedPage";
import OgrencilerPage from "../pages/Ogrenciler/OgrencilerPage";
import EtkinliklerPage from "../pages/Etkinlikler/EtkinliklerPage";
import DuyurularPage from "../pages/Duyurular/DuyurularPage";
import DuyuruYonetimiPage from "../pages/Duyurular/DuyuruYonetimiPage";
import IzinlerPage from "../pages/Izinler/IzinlerPage";
import YemekMenuPage from "../pages/YemekMenu/YemekMenuPage";
import YemekTanimlariPage from "../pages/YemekTanimlari/YemekTanimlariPage";
import GunlukYoklamalarPage from "../pages/Yoklamalar/GunlukYoklamalarPage";
import SohbetYoklamalariPage from "../pages/Yoklamalar/SohbetYoklamalariPage";
import SohbetGruplariPage from "../pages/SohbetGruplari/SohbetGruplariPage";
import SohbetGrubuDetayPage from "../pages/SohbetGruplari/SohbetGrubuDetayPage";
import OdaYonetimiPage from "../pages/OdaYonetimi/OdaYonetimiPage";
import SikayetlerPage from "../pages/Sikayetler/SikayetlerPage";
import MaliIslemlerPage from "../pages/MaliIslemler/MaliIslemlerPage";
import FinansDashboardPage from "../pages/FinansDashboard/FinansDashboardPage";
import EtkinlikYonetimiPage from "../pages/EtkinlikYonetimi/EtkinlikYonetimiPage";
import NobetYonetimiPage from "../pages/NobetYonetimi/NobetYonetimiPage";
import NobetlerimPage from "../pages/Nobetlerim/NobetlerimPage";
import ChatPage from "../pages/Chat/ChatPage";

// Components
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";

const router = createBrowserRouter([
  // ─── Public Routes ───
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/yetkisiz",
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
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/etkinlikler",
            element: <EtkinliklerPage />,
          },
          {
            path: "/duyurular",
            element: <DuyurularPage />,
          },
          {
            path: "/izinler",
            element: <IzinlerPage />,
          },
          {
            path: "/yemek-menu",
            element: <YemekMenuPage />,
          },
          {
            path: "/sikayetler",
            element: <SikayetlerPage />,
          },
          {
            path: "/nobetlerim",
            element: <NobetlerimPage />,
          },
          {
            path: "/finans-dashboard",
            element: <FinansDashboardPage />,
          },
          {
            path: "/mesajlar",
            element: <ChatPage />,
          },
        ],
      },
    ],
  },

  // ─── Admin/Personel Only Routes ───
  {
    element: <ProtectedRoute allowedRoles={["Admin", "Personel"]} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "/ogrenciler",
            element: <OgrencilerPage />,
          },
          {
            path: "/yemek-tanimlari",
            element: <YemekTanimlariPage />,
          },
          {
            path: "/yoklamalar/gunluk",
            element: <GunlukYoklamalarPage />,
          },
          {
            path: "/yoklamalar/sohbet",
            element: <SohbetYoklamalariPage />,
          },
          {
            path: "/sohbet-gruplari",
            element: <SohbetGruplariPage />,
          },
          {
            path: "/sohbet-gruplari/:id",
            element: <SohbetGrubuDetayPage />,
          },
          {
            path: "/oda-yonetimi",
            element: <OdaYonetimiPage />,
          },
          {
            path: "/etkinlik-yonetimi",
            element: <EtkinlikYonetimiPage />,
          },
          {
            path: "/duyuru-yonetimi",
            element: <DuyuruYonetimiPage />,
          },
          {
            path: "/nobet-yonetimi",
            element: <NobetYonetimiPage />,
          },
          {
            path: "/mali-islemler",
            element: <MaliIslemlerPage />,
          },
        ],
      },
    ],
  },

  // ─── Catch-all: bilinmeyen route → login'e yönlendir ───
  {
    path: "*",
    element: <LoginPage />,
  },
]);

export default router;
