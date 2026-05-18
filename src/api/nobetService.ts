// ──────────────────────────────────────────────
// Nöbet API Servisi — CRUD + sorgular
// ──────────────────────────────────────────────

import api from "./axiosInstance";
import { API } from "./endpoints";
import type {
  PersonelNobetDto,
  AvailablePersonelDto,
  CreateNobetRequest,
  UpdateNobetRequest,
} from "../types/nobet";

const nobetService = {
  /** Tarih aralığındaki tüm nöbetleri getir (Admin + Personel) */
  getNobetler: (startDate: string, endDate: string) =>
    api.get<PersonelNobetDto[]>(API.NOBET.LIST, {
      params: { startDate, endDate },
    }),

  /** Giriş yapan kullanıcının kendi nöbetleri */
  getMyNobetler: (startDate?: string, endDate?: string) =>
    api.get<PersonelNobetDto[]>(API.NOBET.BENIM, {
      params: { startDate, endDate },
    }),

  /** Nöbet ataması için Personel listesi (Admin) */
  getAvailablePersonel: () =>
    api.get<AvailablePersonelDto[]>(API.NOBET.PERSONELLER),

  /** Yeni nöbet oluştur (Admin) */
  createNobet: (req: CreateNobetRequest) =>
    api.post<number>(API.NOBET.LIST, req),

  /** Mevcut nöbeti güncelle (Admin) */
  updateNobet: (id: number, req: UpdateNobetRequest) =>
    api.put(API.NOBET.UPDATE(id), req),

  /** Nöbet sil — soft delete (Admin) */
  deleteNobet: (id: number) => api.delete(API.NOBET.DELETE(id)),
};

export default nobetService;
