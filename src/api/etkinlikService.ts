// ──────────────────────────────────────────────
// Etkinlik API Servisi
// ──────────────────────────────────────────────

import api from './axiosInstance';
import { API } from './endpoints';
import type { EtkinlikDto, CreateEtkinlikRequest, JoinEtkinlikRequest } from '../types';

export const etkinlikService = {
  /** Aktif etkinlikleri listeler */
  getAktifEtkinlikler: () =>
    api.get<EtkinlikDto[]>(API.ETKINLIK.AKTIF),

  /** Yeni etkinlik oluşturur */
  create: (data: CreateEtkinlikRequest) =>
    api.post<number>(API.ETKINLIK.CREATE, data),

  /** Etkinliğe katılır */
  join: (data: JoinEtkinlikRequest) =>
    api.post<number>(API.ETKINLIK.JOIN, data),
};
