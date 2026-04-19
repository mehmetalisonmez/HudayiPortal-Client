// ──────────────────────────────────────────────
// Kullanıcı API Servisi — CRUD işlemleri
// ──────────────────────────────────────────────

import api from './axiosInstance';
import { API } from './endpoints';
import type {
  KullaniciListDto,
  CreateKullaniciRequest,
  UpdateKullaniciRequest,
  OdaListDto,
  PagedResponse,
  PaginationParams,
} from '../types';

export const kullaniciService = {
  /** Sayfalı öğrenci listesi getirir */
  getOgrenciList: (params?: PaginationParams) =>
    api.get<PagedResponse<KullaniciListDto>>(API.KULLANICI.OGRENCI_LIST, { params }),

  /** Yeni kullanıcı oluşturur */
  create: (data: CreateKullaniciRequest) =>
    api.post<number>(API.KULLANICI.CREATE, data),

  /** Mevcut kullanıcıyı günceller */
  update: (id: number, data: UpdateKullaniciRequest) =>
    api.put<void>(API.KULLANICI.UPDATE(id), data),

  /** Kullanıcıyı siler (soft delete) */
  delete: (id: number) =>
    api.delete<void>(API.KULLANICI.DELETE(id)),

  /** Oda listesini getirir (form dropdown için) */
  getOdaList: () =>
    api.get<OdaListDto[]>(API.KULLANICI.ODA_LIST),
};
