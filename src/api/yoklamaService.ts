// ──────────────────────────────────────────────
// Yoklama API Servisi
// ──────────────────────────────────────────────

import api from "./axiosInstance";
import { API } from "./endpoints";
import type {
  OgrenciYoklamaDto,
  TakeAttendanceRequest,
  YoklamaExportParams,
  YoklamaTuruDto,
  OgrenciYoklamaDurumDto,
} from "../types";

export const yoklamaService = {
  /** Yoklama alınacak öğrenci listesini getirir */
  getOgrenciler: () => api.get<OgrenciYoklamaDto[]>(API.YOKLAMA.OGRENCILER),

  /** Toplu yoklama kaydı oluşturur */
  takeAttendance: (data: TakeAttendanceRequest) =>
    api.post<number>(API.YOKLAMA.TAKE, data),

  /** Aylık yoklama Excel dışa aktarımı — Blob olarak döner */
  exportExcel: (params: YoklamaExportParams) =>
    api.get(API.YOKLAMA.EXPORT, {
      params,
      responseType: "blob",
    }),

  /** Yoklama türlerini getirir */
  getTurler: () => api.get<YoklamaTuruDto[]>(API.YOKLAMA.TURLER),

  /** Tarih + yoklama türüne göre öğrenci listesini (mevcut durumlarıyla) getirir */
  getGunlukYoklama: (tarih: string, yoklamaTurId: number) =>
    api.get<OgrenciYoklamaDurumDto[]>(API.YOKLAMA.GUNLUK, {
      params: { tarih, yoklamaTurId },
    }),

  /** Günlük yoklama pivot Excel export — Blob olarak döner */
  exportGunlukExcel: (
    startDate: string,
    endDate: string,
    yoklamaTurId: number,
  ) =>
    api.get(API.YOKLAMA.EXPORT_GUNLUK, {
      params: { startDate, endDate, yoklamaTurId },
      responseType: "blob",
    }),
};
