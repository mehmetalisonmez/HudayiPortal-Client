// ──────────────────────────────────────────────
// Sohbet Yoklama API Servisi
// ──────────────────────────────────────────────

import api from "./axiosInstance";
import { API } from "./endpoints";
import type {
  SohbetGrubuDto,
  SohbetYoklamaResponse,
  TakeSohbetAttendanceRequest,
} from "../types";

export const sohbetYoklamaService = {
  /** Sohbet gruplarını getirir */
  getGruplar: () => api.get<SohbetGrubuDto[]>(API.SOHBET_YOKLAMA.GRUPLAR),

  /** Tarih + grup'a göre sohbet yoklamasını getirir (oturum yoksa oluşturur) */
  getSohbetYoklama: (tarih: string, grupId: number) =>
    api.get<SohbetYoklamaResponse>(API.SOHBET_YOKLAMA.YOKLAMA, {
      params: { tarih, grupId },
    }),

  /** Sohbet yoklaması kaydet */
  takeSohbetAttendance: (data: TakeSohbetAttendanceRequest) =>
    api.post<number>(API.SOHBET_YOKLAMA.TAKE, data),

  /** Sohbet yoklama pivot Excel export — Blob olarak döner */
  exportSohbetExcel: (startDate: string, endDate: string, grupId: number) =>
    api.get(API.SOHBET_YOKLAMA.EXPORT_SOHBET, {
      params: { startDate, endDate, grupId },
      responseType: "blob",
    }),
};
