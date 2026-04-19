// ──────────────────────────────────────────────
// Yemek Yorum API Servisi
// ──────────────────────────────────────────────

import api from './axiosInstance';
import { API } from './endpoints';
import type { YemekYorumDto, CreateYemekYorumRequest } from '../types';

export const yemekYorumService = {
  /** Belirli bir menünün yorumlarını getirir */
  getByMenuId: (yemekMenuId: number) =>
    api.get<YemekYorumDto[]>(API.YEMEK_YORUM.BY_MENU(yemekMenuId)),

  /** Yeni yemek yorumu oluşturur */
  create: (data: CreateYemekYorumRequest) =>
    api.post<number>(API.YEMEK_YORUM.CREATE, data),
};
