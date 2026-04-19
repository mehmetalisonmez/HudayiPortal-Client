// ──────────────────────────────────────────────
// Dosya Yükleme API Servisi
// ──────────────────────────────────────────────

import api from './axiosInstance';
import { API } from './endpoints';

export const uploadService = {
  /**
   * Dosya yükleme — multipart/form-data
   * @param file Yüklenecek dosya
   * @param folderName Hedef klasör adı (varsayılan: "genel")
   */
  uploadFile: (file: File, folderName: string = 'genel') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderName', folderName);

    return api.post<{ url: string }>(API.UPLOAD.FILE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
