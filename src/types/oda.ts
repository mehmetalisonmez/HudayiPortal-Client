// ──────────────────────────────────────────────
// Oda Yerleşim Yönetimi Tipleri
// ──────────────────────────────────────────────

export interface OdaOgrenciDto {
  kullaniciId: number;
  ad: string;
  soyad: string;
  telefon: string | null;
}

export interface OdaDetailDto {
  id: number;
  odaNo: string;
  kapasite: number;
  kat: number;
  mevcutSayi: number;
  ogrenciler: OdaOgrenciDto[];
}

export interface OdasizOgrenciDto {
  kullaniciId: number;
  ad: string;
  soyad: string;
  telefon: string | null;
}

export interface OdaYerlesimResultDto {
  odalar: OdaDetailDto[];
  odasizOgrenciler: OdasizOgrenciDto[];
}

export interface AssignStudentToRoomRequest {
  kullaniciId: number;
  odaId: number | null;
}
