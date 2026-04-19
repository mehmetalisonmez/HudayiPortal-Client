// ──────────────────────────────────────────────
// Mali İşlem API Servisi
// ──────────────────────────────────────────────

import api from './axiosInstance';
import { API } from './endpoints';
import type { MaliIslemDto, CreateMaliIslemRequest, MaliIslemFilterParams } from '../types';

export const maliIslemService = {
  /** Mali işlemleri filtreli listeler */
  getAll: (params?: MaliIslemFilterParams) =>
    api.get<MaliIslemDto[]>(API.MALI_ISLEM.LIST, { params }),

  /** Yeni mali işlem oluşturur */
  create: (data: CreateMaliIslemRequest) =>
    api.post<number>(API.MALI_ISLEM.CREATE, data),
};
