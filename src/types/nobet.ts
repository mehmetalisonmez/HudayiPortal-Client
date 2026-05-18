// ──────────────────────────────────────────────
// Personel Nöbet modülü tip tanımları
// ──────────────────────────────────────────────

export const NobetTuruEnum = {
  Nobetci: 1,
  YarimGun: 2,
  Izinli: 3,
} as const;

export type NobetTuruValue = (typeof NobetTuruEnum)[keyof typeof NobetTuruEnum];

export const NobetTuruLabel: Record<NobetTuruValue, string> = {
  1: "Nöbetçi",
  2: "Yarım Gün",
  3: "İzinli",
};

export const NobetTuruRenk: Record<NobetTuruValue, string> = {
  1: "#1565c0", // koyu mavi — Nöbetçi
  2: "#e65100", // turuncu  — Yarım Gün
  3: "#616161", // gri      — İzinli
};

export interface PersonelNobetDto {
  id: number;
  personelId: number;
  personelAdSoyad: string;
  tarih: string; // ISO datetime string (DateOnly → toDateTime)
  nobetTuru: NobetTuruValue;
  aciklama?: string | null;
}

export interface AvailablePersonelDto {
  id: number;
  ad: string;
  soyad: string;
}

export interface CreateNobetRequest {
  personelId: number;
  tarih: string; // "yyyy-MM-dd"
  nobetTuru: NobetTuruValue;
  aciklama?: string | null;
}

export interface UpdateNobetRequest {
  id: number;
  personelId: number;
  tarih: string; // "yyyy-MM-dd"
  nobetTuru: NobetTuruValue;
  aciklama?: string | null;
}
