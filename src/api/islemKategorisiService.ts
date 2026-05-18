// ──────────────────────────────────────────────
// İşlem Kategorisi API Servisi
// ──────────────────────────────────────────────

import api from "./axiosInstance";
import { API } from "./endpoints";
import type {
  IslemKategorisiDto,
  CreateIslemKategorisiRequest,
  UpdateIslemKategorisiRequest,
} from "../types";

export const islemKategorisiService = {
  /** Kategorileri listeler; opsiyonel yönId filtresi */
  getAll: (yonId?: number) =>
    api.get<IslemKategorisiDto[]>(API.ISLEM_KATEGORISI.LIST, {
      params: yonId !== undefined ? { yonId } : undefined,
    }),

  /** Yeni kategori oluşturur */
  create: (data: CreateIslemKategorisiRequest) =>
    api.post<number>(API.ISLEM_KATEGORISI.CREATE, data),

  /** Kategori günceller */
  update: (id: number, data: UpdateIslemKategorisiRequest) =>
    api.put<void>(API.ISLEM_KATEGORISI.UPDATE(id), data),

  /** Kategori siler (soft delete) */
  delete: (id: number) => api.delete<void>(API.ISLEM_KATEGORISI.DELETE(id)),
};
