// ──────────────────────────────────────────────
// Sohbet API Servisi
// ──────────────────────────────────────────────

import api from "./axiosInstance";
import { API } from "./endpoints";
import type {
  CreateSohbetGrubuRequest,
  UpdateSohbetGrubuRequest,
  AssignOgrenciRequest,
  CreateSohbetSessionRequest,
  UpdateSohbetSessionRequest,
  SyncOgrencilerRequest,
  SohbetGrubuDetailDto,
  SohbetGrubuFullDto,
  AvailableOgrenciDto,
  GrupOturumDto,
} from "../types";

export const sohbetService = {
  // ── Grup CRUD ────────────────────────────

  /** Tüm sohbet gruplarını listeler */
  getGruplar: () => api.get<SohbetGrubuDetailDto[]>(API.SOHBET.GRUPLAR),

  /** Grup detayını getirir (öğrenciler + oturumlar dahil) */
  getGrupById: (id: number) =>
    api.get<SohbetGrubuFullDto>(API.SOHBET.GRUP_BY_ID(id)),

  /** Yeni sohbet grubu oluşturur */
  createGrup: (data: CreateSohbetGrubuRequest) =>
    api.post<number>(API.SOHBET.CREATE_GRUP, data),

  /** Sohbet grubunu günceller */
  updateGrup: (id: number, data: UpdateSohbetGrubuRequest) =>
    api.put<void>(API.SOHBET.UPDATE_GRUP(id), data),

  /** Sohbet grubunu siler (soft delete) */
  deleteGrup: (id: number) => api.delete<void>(API.SOHBET.DELETE_GRUP(id)),

  // ── Öğrenci Atama ────────────────────────

  /** Öğrenciyi sohbet grubuna atar (tekil) */
  assignOgrenci: (data: AssignOgrenciRequest) =>
    api.post<number>(API.SOHBET.ASSIGN_OGRENCI, data),

  /** Grubun öğrenci listesini toplu senkronize eder */
  syncOgrenciler: (id: number, data: SyncOgrencilerRequest) =>
    api.put<void>(API.SOHBET.SYNC_OGRENCILER(id), data),

  /** Transfer list için tüm öğrencileri (atanmış/atanmamış) getirir */
  getAvailableOgrenciler: (grupId: number) =>
    api.get<AvailableOgrenciDto[]>(API.SOHBET.AVAILABLE_OGRENCILER(grupId)),

  // ── Oturum CRUD ──────────────────────────

  /** Grubun oturumlarını listeler */
  getOturumlar: (grupId: number) =>
    api.get<GrupOturumDto[]>(API.SOHBET.OTURUMLAR(grupId)),

  /** Yeni sohbet oturumu oluşturur */
  createOturum: (data: CreateSohbetSessionRequest) =>
    api.post<number>(API.SOHBET.CREATE_OTURUM, data),

  /** Oturumu günceller */
  updateOturum: (id: number, data: UpdateSohbetSessionRequest) =>
    api.put<void>(API.SOHBET.UPDATE_OTURUM(id), data),

  /** Oturumu siler (soft delete) */
  deleteOturum: (id: number) => api.delete<void>(API.SOHBET.DELETE_OTURUM(id)),
};
