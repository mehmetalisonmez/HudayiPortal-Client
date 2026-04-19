// ──────────────────────────────────────────────
// Yemek Menü API Servisi
// ──────────────────────────────────────────────

import api from './axiosInstance';
import { API } from './endpoints';
import type { YemekMenuDto, CreateYemekMenuRequest, YemekMenuFilterParams } from '../types';

export const yemekMenuService = {
  /** Aylık yemek menüsünü getirir */
  getAylikMenu: (params: YemekMenuFilterParams) =>
    api.get<YemekMenuDto[]>(API.YEMEK_MENU.AYLIK, { params }),

  /** Yeni yemek menüsü oluşturur */
  create: (data: CreateYemekMenuRequest) =>
    api.post<number>(API.YEMEK_MENU.CREATE, data),

  /** Aylık menü Excel dışa aktarımı — Blob olarak döner */
  exportExcel: (params: YemekMenuFilterParams) =>
    api.get(API.YEMEK_MENU.EXPORT, {
      params,
      responseType: 'blob',
    }),
};
