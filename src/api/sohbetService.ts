// ──────────────────────────────────────────────
// Sohbet API Servisi
// ──────────────────────────────────────────────

import api from './axiosInstance';
import { API } from './endpoints';
import type { CreateSohbetGrubuRequest, AssignOgrenciRequest, CreateSohbetSessionRequest } from '../types';

export const sohbetService = {
  /** Yeni sohbet grubu oluşturur */
  createGrup: (data: CreateSohbetGrubuRequest) =>
    api.post<number>(API.SOHBET.CREATE_GRUP, data),

  /** Öğrenciyi sohbet grubuna atar */
  assignOgrenci: (data: AssignOgrenciRequest) =>
    api.post<number>(API.SOHBET.ASSIGN_OGRENCI, data),

  /** Yeni sohbet oturumu oluşturur */
  createOturum: (data: CreateSohbetSessionRequest) =>
    api.post<number>(API.SOHBET.CREATE_OTURUM, data),
};
