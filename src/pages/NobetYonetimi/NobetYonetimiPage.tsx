// ──────────────────────────────────────────────
// NobetYonetimiPage — Admin nöbet takvimi yönetimi
// react-big-calendar ile aylık takvim görünümü
// Boş güne tıkla → Oluştur, event'e tıkla → Düzenle/Sil
// ──────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { Calendar, type SlotInfo, type Event } from "react-big-calendar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { AddOutlined } from "@mui/icons-material";
import { calendarLocalizer } from "../../utils/calendarLocalizer";
import nobetService from "../../api/nobetService";
import {
  NobetTuruEnum,
  NobetTuruLabel,
  NobetTuruRenk,
  type AvailablePersonelDto,
  type NobetTuruValue,
  type PersonelNobetDto,
} from "../../types/nobet";

// ─── Calendar event shape ───────────────────────────
interface NobetCalendarEvent extends Event {
  id: number;
  resource: PersonelNobetDto;
}

// ─── Form state ─────────────────────────────────────
interface NobetForm {
  id: number | null;
  personelId: string;
  tarih: string;
  nobetTuru: NobetTuruValue;
  aciklama: string;
}

const emptyForm = (): NobetForm => ({
  id: null,
  personelId: "",
  tarih: format(new Date(), "yyyy-MM-dd"),
  nobetTuru: NobetTuruEnum.Nobetci,
  aciklama: "",
});

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
  noEventsInRange: "Bu aralıkta nöbet kaydı yok.",
};

export default function NobetYonetimiPage() {
  const [nobetler, setNobetler] = useState<PersonelNobetDto[]>([]);
  const [personelListesi, setPersonelListesi] = useState<
    AvailablePersonelDto[]
  >([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<NobetForm>(emptyForm());
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    severity: "success" | "error";
  }>({ open: false, msg: "", severity: "success" });

  // ─── Yardımcı: ayın başı/sonu ───────────────────────
  const getMonthRange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
    };
  };

  // ─── Nöbetleri yükle ─────────────────────────────────
  const fetchNobetler = useCallback(async (date: Date) => {
    setLoading(true);
    setPageError(null);
    try {
      const { startDate, endDate } = getMonthRange(date);
      const res = await nobetService.getNobetler(startDate, endDate);
      setNobetler(res.data);
    } catch {
      setPageError("Nöbet verileri yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Personel listesini yükle (bir kez) ─────────────
  const fetchPersonel = useCallback(async () => {
    try {
      const res = await nobetService.getAvailablePersonel();
      setPersonelListesi(res.data);
    } catch {
      // personel listesi yüklenemedi — dialog'da boş kalır
    }
  }, []);

  useEffect(() => {
    fetchNobetler(calendarDate);
    fetchPersonel();
  }, []);

  // ─── Takvim görünümü değişince refetch ──────────────
  const handleNavigate = (date: Date) => {
    setCalendarDate(date);
    fetchNobetler(date);
  };

  // ─── Olayları Calendar formatına dönüştür ───────────
  const events: NobetCalendarEvent[] = nobetler.map((n) => {
    const start = new Date(n.tarih);
    const end = new Date(n.tarih);
    end.setDate(end.getDate() + 1); // all-day için bitiş = ertesi gün başlangıcı
    return {
      id: n.id,
      title: `${n.personelAdSoyad} — ${NobetTuruLabel[n.nobetTuru]}`,
      start,
      end,
      allDay: true,
      resource: n,
    };
  });

  // ─── Renk kodlaması ─────────────────────────────────
  const eventPropGetter = (event: NobetCalendarEvent) => ({
    style: {
      backgroundColor: NobetTuruRenk[event.resource.nobetTuru],
      border: "none",
      borderRadius: 4,
      color: "#fff",
      fontSize: 12,
      padding: "1px 4px",
    },
  });

  // ─── Boş güne tıkla → Oluştur ───────────────────────
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    const f = emptyForm();
    f.tarih = format(slotInfo.start, "yyyy-MM-dd");
    setForm(f);
    setFormError(null);
    setFormOpen(true);
  };

  // ─── Var olan event'e tıkla → Düzenle ───────────────
  const handleSelectEvent = (event: NobetCalendarEvent) => {
    const n = event.resource;
    setForm({
      id: n.id,
      personelId: String(n.personelId),
      tarih: format(new Date(n.tarih), "yyyy-MM-dd"),
      nobetTuru: n.nobetTuru,
      aciklama: n.aciklama ?? "",
    });
    setFormError(null);
    setFormOpen(true);
  };

  // ─── Dialog kapat ────────────────────────────────────
  const handleFormClose = () => {
    setFormOpen(false);
    setFormError(null);
  };

  // ─── Kaydet (Oluştur / Güncelle) ────────────────────
  const handleSave = async () => {
    if (!form.personelId) {
      setFormError("Lütfen bir personel seçiniz.");
      return;
    }
    setFormSaving(true);
    setFormError(null);
    try {
      const req = {
        personelId: Number(form.personelId),
        tarih: form.tarih,
        nobetTuru: form.nobetTuru,
        aciklama: form.aciklama || null,
      };
      if (form.id) {
        await nobetService.updateNobet(form.id, { id: form.id, ...req });
        setSnack({
          open: true,
          msg: "Nöbet güncellendi.",
          severity: "success",
        });
      } else {
        await nobetService.createNobet(req);
        setSnack({
          open: true,
          msg: "Nöbet oluşturuldu.",
          severity: "success",
        });
      }
      handleFormClose();
      fetchNobetler(calendarDate);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Kayıt sırasında hata oluştu.";
      setFormError(msg);
    } finally {
      setFormSaving(false);
    }
  };

  // ─── Sil onay dialog ─────────────────────────────────
  const handleDeleteClick = () => {
    if (form.id) {
      setDeletingId(form.id);
      setDeleteConfirmOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await nobetService.deleteNobet(deletingId);
      setSnack({ open: true, msg: "Nöbet silindi.", severity: "success" });
      setDeleteConfirmOpen(false);
      setFormOpen(false);
      fetchNobetler(calendarDate);
    } catch {
      setSnack({
        open: true,
        msg: "Silme işlemi başarısız.",
        severity: "error",
      });
      setDeleteConfirmOpen(false);
    }
  };

  // ─── Render ──────────────────────────────────────────
  return (
    <Box sx={{ p: 3 }}>
      {/* Başlık */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Nöbet Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => {
            setForm(emptyForm());
            setFormError(null);
            setFormOpen(true);
          }}
        >
          Nöbet Ekle
        </Button>
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
      {pageError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {pageError}
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
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventPropGetter}
          messages={calendarMessages}
          culture="tr"
          style={{ height: 600 }}
        />
      </Paper>

      {/* Oluştur / Düzenle Dialog */}
      <Dialog open={formOpen} onClose={handleFormClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {form.id ? "Nöbeti Düzenle" : "Yeni Nöbet Ekle"}
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: "16px !important",
          }}
        >
          {formError && <Alert severity="error">{formError}</Alert>}

          {/* Personel */}
          <FormControl fullWidth required>
            <InputLabel>Personel</InputLabel>
            <Select
              value={form.personelId}
              label="Personel"
              onChange={(e) =>
                setForm((f) => ({ ...f, personelId: e.target.value }))
              }
            >
              {personelListesi.map((p) => (
                <MenuItem key={p.id} value={String(p.id)}>
                  {p.ad} {p.soyad}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Tarih */}
          <TextField
            label="Tarih"
            type="date"
            value={form.tarih}
            onChange={(e) => setForm((f) => ({ ...f, tarih: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />

          {/* Nöbet Türü */}
          <FormControl fullWidth required>
            <InputLabel>Nöbet Türü</InputLabel>
            <Select
              value={form.nobetTuru}
              label="Nöbet Türü"
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  nobetTuru: e.target.value as NobetTuruValue,
                }))
              }
            >
              {(Object.entries(NobetTuruLabel) as [string, string][]).map(
                ([key, label]) => (
                  <MenuItem key={key} value={Number(key)}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: NobetTuruRenk[Number(key) as NobetTuruValue],
                        }}
                      />
                      {label}
                    </Box>
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>

          {/* Açıklama */}
          <TextField
            label="Açıklama (opsiyonel)"
            multiline
            rows={2}
            value={form.aciklama}
            onChange={(e) =>
              setForm((f) => ({ ...f, aciklama: e.target.value }))
            }
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          {form.id && (
            <Button
              color="error"
              onClick={handleDeleteClick}
              sx={{ mr: "auto" }}
            >
              Sil
            </Button>
          )}
          <Button onClick={handleFormClose} disabled={formSaving}>
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={formSaving}
          >
            {formSaving ? (
              <CircularProgress size={20} />
            ) : form.id ? (
              "Güncelle"
            ) : (
              "Kaydet"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme onay Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Nöbeti Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu nöbet kaydını silmek istediğinizden emin misiniz? Bu işlem geri
            alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>İptal</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteConfirm}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
