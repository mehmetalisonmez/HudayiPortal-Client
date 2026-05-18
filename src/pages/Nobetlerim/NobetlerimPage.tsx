// ──────────────────────────────────────────────
// NobetlerimPage — Personelin kendi nöbetlerini
// salt okunur (read-only) takvimde görüntülediği sayfa
// ──────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { Calendar, type Event } from "react-big-calendar";
import { format } from "date-fns";
import { Alert, Box, CircularProgress, Paper, Typography } from "@mui/material";
import { calendarLocalizer } from "../../utils/calendarLocalizer";
import nobetService from "../../api/nobetService";
import {
  NobetTuruLabel,
  NobetTuruRenk,
  type NobetTuruValue,
  type PersonelNobetDto,
} from "../../types/nobet";

// ─── Calendar event shape ───────────────────────────
interface NobetCalendarEvent extends Event {
  id: number;
  resource: PersonelNobetDto;
}

// ─── Takvim mesajları (Türkçe) ───────────────────────
const calendarMessages = {
  next: "İleri",
  previous: "Geri",
  today: "Bugün",
  month: "Ay",
  week: "Hafta",
  day: "Gün",
  agenda: "Ajanda",
  date: "Tarih",
  time: "Saat",
  event: "Nöbet",
  noEventsInRange: "Bu aralıkta nöbet kaydınız yok.",
};

export default function NobetlerimPage() {
  const [nobetler, setNobetler] = useState<PersonelNobetDto[]>([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getMonthRange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
    };
  };

  const fetchMyNobetler = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = getMonthRange(date);
      const res = await nobetService.getMyNobetler(startDate, endDate);
      setNobetler(res.data);
    } catch {
      setError("Nöbet bilgileri yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyNobetler(calendarDate);
  }, []);

  const handleNavigate = (date: Date) => {
    setCalendarDate(date);
    fetchMyNobetler(date);
  };

  const events: NobetCalendarEvent[] = nobetler.map((n) => {
    const start = new Date(n.tarih);
    const end = new Date(n.tarih);
    end.setDate(end.getDate() + 1);
    return {
      id: n.id,
      title: NobetTuruLabel[n.nobetTuru],
      start,
      end,
      allDay: true,
      resource: n,
    };
  });

  const eventPropGetter = (event: NobetCalendarEvent) => ({
    style: {
      backgroundColor: NobetTuruRenk[event.resource.nobetTuru],
      border: "none",
      borderRadius: 4,
      color: "#fff",
      fontSize: 12,
      padding: "1px 4px",
      cursor: "default",
    },
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Başlık */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Nöbet Çizelgem
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Aylık nöbet programınızı görüntüleyebilirsiniz.
        </Typography>
      </Box>

      {/* Renk Açıklaması */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        {(Object.entries(NobetTuruLabel) as [string, string][]).map(
          ([key, label]) => (
            <Box
              key={key}
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: 1,
                  bgcolor: NobetTuruRenk[Number(key) as NobetTuruValue],
                }}
              />
              <Typography variant="caption">{label}</Typography>
            </Box>
          ),
        )}
      </Box>

      {/* Hata */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Takvim */}
      <Paper sx={{ p: 2, position: "relative", minHeight: 600 }}>
        {loading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255,255,255,0.6)",
              zIndex: 10,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <Calendar<NobetCalendarEvent>
          localizer={calendarLocalizer}
          events={events}
          date={calendarDate}
          onNavigate={handleNavigate}
          defaultView="month"
          views={["month", "week", "agenda"]}
          selectable={false}
          eventPropGetter={eventPropGetter}
          messages={calendarMessages}
          culture="tr"
          style={{ height: 600 }}
        />
      </Paper>
    </Box>
  );
}
