// ──────────────────────────────────────────────
// Mali İşlem API Servisi
// ──────────────────────────────────────────────

import api from "./axiosInstance";
import { API } from "./endpoints";
import type {
  MaliIslemDto,
  CreateMaliIslemRequest,
  UpdateMaliIslemRequest,
  MaliIslemFilterParams,
  FinansDashboardDto,
} from "../types";

export const maliIslemService = {
  /** Mali işlemleri filtreli listeler */
  getAll: (params?: MaliIslemFilterParams) =>
    api.get<MaliIslemDto[]>(API.MALI_ISLEM.LIST, { params }),

  /** Yeni mali işlem oluşturur */
  create: (data: CreateMaliIslemRequest) =>
    api.post<number>(API.MALI_ISLEM.CREATE, data),

  /** Mali işlem günceller */
  update: (id: number, data: UpdateMaliIslemRequest) =>
    api.put<void>(API.MALI_ISLEM.UPDATE(id), data),

  /** Mali işlem siler (soft delete) */
  delete: (id: number) => api.delete<void>(API.MALI_ISLEM.DELETE(id)),

  /** Finans dashboard verilerini getirir */
  getDashboard: (params?: { baslangicTarihi?: string; bitisTarihi?: string }) =>
    api.get<FinansDashboardDto>(API.MALI_ISLEM.DASHBOARD, { params }),
};
