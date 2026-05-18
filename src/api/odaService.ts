// ──────────────────────────────────────────────
// Oda Yerleşim API Servisi
// ──────────────────────────────────────────────

import api from "./axiosInstance";
import { API } from "./endpoints";
import type {
  OdaYerlesimResultDto,
  AssignStudentToRoomRequest,
} from "../types";

export const odaService = {
  /** Oda yerleşim bilgilerini getirir */
  getYerlesim: () => api.get<OdaYerlesimResultDto>(API.ODA.YERLESIM),

  /** Öğrenciyi odaya atar veya odadan çıkarır */
  assignStudent: (data: AssignStudentToRoomRequest) =>
    api.put<void>(API.ODA.ASSIGN, data),
};
