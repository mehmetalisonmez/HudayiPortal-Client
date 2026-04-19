// ──────────────────────────────────────────────
// Dashboard API Servisi
// ──────────────────────────────────────────────

import api from './axiosInstance';
import { API } from './endpoints';
import type { YoneticiDashboard, OgrenciDashboard } from '../types';

export const dashboardService = {
  /** Yönetici (Admin/Personel) dashboard verilerini getirir */
  getYoneticiDashboard: () =>
    api.get<YoneticiDashboard>(API.DASHBOARD.YONETICI),

  /** Öğrenci dashboard verilerini getirir */
  getOgrenciDashboard: () =>
    api.get<OgrenciDashboard>(API.DASHBOARD.OGRENCI),
};
