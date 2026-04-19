// ──────────────────────────────────────────────
// İzin API Servisi
// ──────────────────────────────────────────────

import api from './axiosInstance';
import { API } from './endpoints';
import type { IzinDto, CreateIzinRequest, UpdateIzinDurumuRequest, IzinFilterParams, IzinTuruDto } from '../types';

export const izinService = {
  /** İzin taleplerini filtreli listeler */
  getIzinTalepleri: (params?: IzinFilterParams) =>
    api.get<IzinDto[]>(API.IZIN.LIST, { params }),

  /** Yeni izin talebi oluşturur */
  create: (data: CreateIzinRequest) =>
    api.post<number>(API.IZIN.CREATE, data),

  /** İzin durumunu günceller (onay/red) — PUT /api/izin/onay/{izinId}?yeniDurum=X */
  updateDurum: (data: UpdateIzinDurumuRequest) =>
    api.put<boolean>(API.IZIN.UPDATE_DURUM(data.izinId), null, {
      params: { yeniDurum: data.yeniDurum },
    }),

  /** İzin talebini siler (soft-delete) */
  delete: (id: number) =>
    api.delete(API.IZIN.DELETE(id)),

  /** İzin türlerini listeler (dropdown için) */
  getIzinTurleri: () =>
    api.get<IzinTuruDto[]>(API.IZIN.TURLER),
};
