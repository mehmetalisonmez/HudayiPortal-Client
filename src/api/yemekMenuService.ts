// ──────────────────────────────────────────────
// Yemek Menü API Servisi
// ──────────────────────────────────────────────

import api from "./axiosInstance";
import { API } from "./endpoints";
import type {
  YemekMenuDto,
  CreateYemekMenuRequest,
  UpdateYemekMenuRequest,
  YemekMenuFilterParams,
  YemekTanimiListItem,
  BulkCreateYemekMenuRequest,
  StandartKahvaltiItem,
} from "../types";

export const yemekMenuService = {
  /** Aylık yemek menüsünü getirir */
  getAylikMenu: (params: YemekMenuFilterParams) =>
    api.get<YemekMenuDto[]>(API.YEMEK_MENU.AYLIK, { params }),

  /** Yeni yemek menüsü oluşturur */
  create: (data: CreateYemekMenuRequest) =>
    api.post<number>(API.YEMEK_MENU.CREATE, data),

  /** Mevcut yemek menüsünü günceller */
  update: (id: number, data: UpdateYemekMenuRequest) =>
    api.put(API.YEMEK_MENU.UPDATE(id), data),

  /** Yemek menüsünü siler (soft delete) */
  delete: (id: number) => api.delete(API.YEMEK_MENU.DELETE(id)),

  /** Aylık menü Excel dışa aktarımı — Blob olarak döner */
  exportExcel: (params: YemekMenuFilterParams) =>
    api.get(API.YEMEK_MENU.EXPORT, {
      params,
      responseType: "blob",
    }),

  /** Yemek tanımları listesini getirir (Autocomplete için) */
  getYemekTanimlari: () =>
    api.get<YemekTanimiListItem[]>(API.YEMEK_MENU.YEMEK_TANIMLARI),

  /** Toplu menü oluşturur (Haftalık) */
  bulkCreate: (data: BulkCreateYemekMenuRequest) =>
    api.post<number>(API.YEMEK_MENU.BULK_CREATE, data),

  /** Standart kahvaltı ürünleri listesini getirir */
  getStandartKahvalti: () =>
    api.get<StandartKahvaltiItem[]>(API.YEMEK_MENU.STANDART_KAHVALTI),
};
