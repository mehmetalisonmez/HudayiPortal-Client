// ──────────────────────────────────────────────
// Rol API Servisi — Rol listesi
// ──────────────────────────────────────────────

import api from "./axiosInstance";
import { API } from "./endpoints";
import type { RolDto } from "../types";

export const rolService = {
  /** Tüm rolleri listeler (Admin/Personel) */
  getAll: () => api.get<RolDto[]>(API.ROL.LIST),
};
