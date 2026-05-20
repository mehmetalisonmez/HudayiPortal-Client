/**
 * Axios hata nesnesinden kullanıcı dostu hata mesajı çıkartan yardımcı fonksiyon.
 * Hem camelCase (message, errors) hem de PascalCase (Message, Errors) formatlarını destekler.
 *
 * @param error Axios veya genel hata nesnesi
 * @param fallbackMessage Hata çözümlenemediğinde gösterilecek varsayılan mesaj
 */
export const getErrorMessage = (
  error: any,
  fallbackMessage: string = 'Bir hata oluştu. Lütfen tekrar deneyin.'
): string => {
  if (error && typeof error === 'object') {
    // Sunucu yanıtı varsa (AxiosResponse)
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Sunucu tamamen çökmüşse (500 ve üstü)
      if (status >= 500) {
        return 'Sunucu ile bağlantı kurulamadı, lütfen tekrar deneyin.';
      }

      // Backend'den özel bir mesaj veya açıklama alanı geliyorsa
      const message = data?.message || data?.Message || data?.detail || data?.Detail;
      if (message) {
        return message;
      }

      // Eğer bir validasyon hataları listesi (FluentValidation) varsa
      const errors = data?.errors || data?.Errors;
      if (errors) {
        if (Array.isArray(errors)) {
          return errors.filter(Boolean).join('\n');
        }
        if (typeof errors === 'object') {
          // Key-value sözlüğü şeklinde hata listesi (Örn: {"Email": ["Geçersiz format"]})
          return Object.values(errors)
            .flat()
            .filter(Boolean)
            .join('\n');
        }
        if (typeof errors === 'string') {
          return errors;
        }
      }
    } else if (error.request) {
      // İstek yapıldı ama yanıt alınamadı (Sunucu çevrimdışı veya ağ hatası)
      return 'Sunucu ile bağlantı kurulamadı, lütfen tekrar deneyin.';
    } else if (error.message) {
      // Axios iç hata mesajı (Örn: timeout, network error)
      if (error.message === 'Network Error') {
        return 'Sunucu ile bağlantı kurulamadı, lütfen tekrar deneyin.';
      }
      return error.message;
    }
  }

  return fallbackMessage;
};
