// ──────────────────────────────────────────────
// Mesaj API Servisi
// ──────────────────────────────────────────────

import api from './axiosInstance';
import { API } from './endpoints';
import type { MesajDto, MesajFilterParams } from '../types';

export const mesajService = {
  /** Mesajları filtreli listeler */
  getAll: (params?: MesajFilterParams) =>
    api.get<MesajDto[]>(API.MESAJ.LIST, { params }),
};
