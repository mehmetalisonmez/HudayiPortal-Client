// ──────────────────────────────────────────────
// Personel Nöbet API Servisi
// ──────────────────────────────────────────────

import api from './axiosInstance';
import { API } from './endpoints';
import type { PersonelNobetDto, CreatePersonelNobetRequest, PersonelNobetFilterParams } from '../types';

export const personelNobetService = {
  /** Personel nöbetlerini filtreli listeler */
  getAll: (params?: PersonelNobetFilterParams) =>
    api.get<PersonelNobetDto[]>(API.PERSONEL_NOBET.LIST, { params }),

  /** Yeni personel nöbeti oluşturur */
  create: (data: CreatePersonelNobetRequest) =>
    api.post<number>(API.PERSONEL_NOBET.CREATE, data),
};
