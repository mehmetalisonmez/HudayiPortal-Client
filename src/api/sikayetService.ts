// ──────────────────────────────────────────────
// Şikâyet API Servisi
// ──────────────────────────────────────────────

import api from "./axiosInstance";
import { API } from "./endpoints";
import type {
  SikayetDto,
  CreateSikayetRequest,
  UpdateSikayetCevapRequest,
  SikayetFilterParams,
} from "../types";

export const sikayetService = {
  /** Şikâyetleri filtreli listeler */
  getAll: (params?: SikayetFilterParams) =>
    api.get<SikayetDto[]>(API.SIKAYET.LIST, { params }),

  /** Giriş yapan kullanıcının şikâyetleri */
  getMySikayetler: () => api.get<SikayetDto[]>(API.SIKAYET.MY_LIST),

  /** Tekil şikâyet detayı */
  getById: (id: number) => api.get<SikayetDto>(API.SIKAYET.DETAIL(id)),

  /** Yeni şikâyet oluşturur */
  create: (data: CreateSikayetRequest) =>
    api.post<number>(API.SIKAYET.CREATE, data),

  /** Şikâyete cevap yazar ve durumunu günceller */
  updateCevap: (data: UpdateSikayetCevapRequest) =>
    api.put<boolean>(API.SIKAYET.UPDATE_CEVAP, data),
};
