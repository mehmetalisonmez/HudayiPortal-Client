// ──────────────────────────────────────────────
// Yoklama API Servisi
// ──────────────────────────────────────────────

import api from './axiosInstance';
import { API } from './endpoints';
import type { OgrenciYoklamaDto, TakeAttendanceRequest, YoklamaExportParams } from '../types';

export const yoklamaService = {
  /** Yoklama alınacak öğrenci listesini getirir */
  getOgrenciler: () =>
    api.get<OgrenciYoklamaDto[]>(API.YOKLAMA.OGRENCILER),

  /** Toplu yoklama kaydı oluşturur */
  takeAttendance: (data: TakeAttendanceRequest) =>
    api.post<number>(API.YOKLAMA.TAKE, data),

  /** Aylık yoklama Excel dışa aktarımı — Blob olarak döner */
  exportExcel: (params: YoklamaExportParams) =>
    api.get(API.YOKLAMA.EXPORT, {
      params,
      responseType: 'blob',
    }),
};
