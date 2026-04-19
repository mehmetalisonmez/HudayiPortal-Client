// ──────────────────────────────────────────────
// Duyuru API Servisi — CRUD işlemleri
// ──────────────────────────────────────────────

import api from './axiosInstance';
import { API } from './endpoints';
import type { DuyuruDto, CreateDuyuruRequest, UpdateDuyuruRequest } from '../types';

export const duyuruService = {
  /** Aktif duyuruları listeler (öğrenci görünümü) */
  getAktifDuyurular: () =>
    api.get<DuyuruDto[]>(API.DUYURU.AKTIF),

  /** Tüm duyuruları listeler — süresi dolmuş dahil (admin görünümü) */
  getAll: () =>
    api.get<DuyuruDto[]>(API.DUYURU.LIST),

  /** Yeni duyuru oluşturur */
  create: (data: CreateDuyuruRequest) =>
    api.post<number>(API.DUYURU.CREATE, data),

  /** Mevcut duyuruyu günceller */
  update: (id: number, data: UpdateDuyuruRequest) =>
    api.put<void>(API.DUYURU.UPDATE(id), data),

  /** Duyuruyu siler (soft delete) */
  delete: (id: number) =>
    api.delete<void>(API.DUYURU.DELETE(id)),
};
