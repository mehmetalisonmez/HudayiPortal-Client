// ──────────────────────────────────────────────
// Yemek Tanımı API Servisi
// ──────────────────────────────────────────────

import api from "./axiosInstance";
import { API } from "./endpoints";
import type {
  YemekTanimiFullDto,
  YemekKategorisiDto,
  CreateYemekTanimiRequest,
  UpdateYemekTanimiRequest,
} from "../types";

export const yemekTanimiService = {
  /** Tüm yemek tanımlarını getirir */
  getAll: () => api.get<YemekTanimiFullDto[]>(API.YEMEK_TANIMI.LIST),

  /** Yemek kategorilerini getirir */
  getKategoriler: () =>
    api.get<YemekKategorisiDto[]>(API.YEMEK_TANIMI.KATEGORILER),

  /** Yeni yemek tanımı oluşturur */
  create: (data: CreateYemekTanimiRequest) =>
    api.post<number>(API.YEMEK_TANIMI.CREATE, data),

  /** Mevcut yemek tanımını günceller */
  update: (id: number, data: UpdateYemekTanimiRequest) =>
    api.put(API.YEMEK_TANIMI.UPDATE(id), data),

  /** Yemek tanımını siler (soft delete) */
  delete: (id: number) => api.delete(API.YEMEK_TANIMI.DELETE(id)),
};
