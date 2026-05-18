// ──────────────────────────────────────────────
// Etkinlik API Servisi
// ──────────────────────────────────────────────

import api from "./axiosInstance";
import { API } from "./endpoints";
import type {
  EtkinlikListDto,
  EtkinlikDetayDto,
  KatilimciDto,
  CreateEtkinlikRequest,
  UpdateEtkinlikRequest,
  JoinEtkinlikRequest,
  LeaveEtkinlikRequest,
  AddYorumRequest,
  UpdateKatilimDurumuRequest,
  EtkinlikFilterParams,
} from "../types";

export const etkinlikService = {
  /** Etkinlikleri filtreli listeler (aktif, ucretsiz parametreleri opsiyonel) */
  getEtkinlikler: (params?: EtkinlikFilterParams) =>
    api.get<EtkinlikListDto[]>(API.ETKINLIK.LIST, { params }),

  /** Etkinlik detayını yorumlar ve sosyal bilgilerle getirir */
  getDetay: (id: number) => api.get<EtkinlikDetayDto>(API.ETKINLIK.DETAY(id)),

  /** Yeni etkinlik oluşturur (Admin/Personel) */
  create: (data: CreateEtkinlikRequest) =>
    api.post<number>(API.ETKINLIK.CREATE, data),

  /** Etkinliği günceller (Admin/Personel) */
  update: (id: number, data: UpdateEtkinlikRequest) =>
    api.put(API.ETKINLIK.UPDATE(id), data),

  /** Etkinliği siler (Admin/Personel — soft delete) */
  deleteEtkinlik: (id: number) => api.delete(API.ETKINLIK.DELETE(id)),

  /** Etkinliğe katılır */
  join: (data: JoinEtkinlikRequest) =>
    api.post<number>(API.ETKINLIK.JOIN, data),

  /** Etkinlikten ayrılır (soft delete) */
  leave: (data: LeaveEtkinlikRequest) => api.post(API.ETKINLIK.LEAVE, data),

  /** Etkinliğe yorum ekler */
  addYorum: (data: AddYorumRequest) =>
    api.post<number>(API.ETKINLIK.YORUM, data),

  /** Etkinliği beğen/beğeniden vazgeç. Yanıt: { isLiked: boolean } */
  toggleLike: (etkinlikId: number) =>
    api.post<{ isLiked: boolean }>(API.ETKINLIK.LIKE(etkinlikId)),

  /** Etkinlik katılımcı listesini getirir (Admin/Personel) */
  getKatilimcilar: (etkinlikId: number) =>
    api.get<KatilimciDto[]>(API.ETKINLIK.KATILIMCILAR(etkinlikId)),

  /** Katılımcının katılım durumunu günceller (Admin/Personel) */
  updateKatilimDurumu: (
    katilimciId: number,
    data: UpdateKatilimDurumuRequest,
  ) => api.put(API.ETKINLIK.KATILIM_DURUM(katilimciId), data),
};
