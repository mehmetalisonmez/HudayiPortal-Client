// ──────────────────────────────────────────────
// Tarih, para ve durum formatlama yardımcıları
// ──────────────────────────────────────────────

/**
 * ISO 8601 tarih string'ini Türkçe formatta gösterir.
 * Örnek: "2026-04-18T14:30:00" → "18 Nisan 2026"
 */
export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * ISO 8601 tarih string'ini Türkçe tarih-saat formatında gösterir.
 * Örnek: "2026-04-18T14:30:00" → "18 Nisan 2026, 14:30"
 */
export const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Sayıyı Türk Lirası formatında gösterir.
 * Örnek: 1500.50 → "₺1.500,50"
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
};

/**
 * İzin onay durumu kodunu okunabilir metne çevirir.
 */
export const getOnayDurumuLabel = (durum: number): string => {
  const labels: Record<number, string> = {
    0: 'Beklemede',
    1: 'Onaylandı',
    2: 'Reddedildi',
  };
  return labels[durum] ?? 'Bilinmiyor';
};

/**
 * Şikâyet durumu kodunu okunabilir metne çevirir.
 */
export const getSikayetDurumuLabel = (durum: number | null | undefined): string => {
  if (durum === null || durum === undefined) return 'Beklemede';
  const labels: Record<number, string> = {
    0: 'Beklemede',
    1: 'Cevaplanmış',
    2: 'Kapatılmış',
  };
  return labels[durum] ?? 'Bilinmiyor';
};
