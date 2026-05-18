// ──────────────────────────────────────────────
// Eğitim / Sohbet Yoklamaları — SohbetYoklamalar tablosu
// Tarih + Sohbet Grubu seçilir → oturum otomatik bulunur/oluşturulur
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Alert,
  alpha,
  IconButton,
  Tooltip,
  Button,
  Snackbar,
  CircularProgress,
  MenuItem,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  SchoolOutlined,
  RefreshOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  FileDownloadOutlined,
} from "@mui/icons-material";
import { sohbetYoklamaService } from "../../api/sohbetYoklamaService";
import type {
  SohbetGrubuDto,
  SohbetOgrenciDurumDto,
  TakeSohbetAttendanceRequest,
} from "../../types";

// ─── Yerel satır tipi (düzenlenebilir) ──────

interface YoklamaSatir {
  kullaniciId: number;
  ad: string;
  soyad: string;
  odaNo: string | null;
  katilimDurumu: boolean;
  mazeretAciklamasi: string;
}

// ─── Snackbar tipi ──────────────────────────

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

// ─── Bugünün tarihi (YYYY-MM-DD) ────────────

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// ══════════════════════════════════════════════════
// Ana Bileşen
// ══════════════════════════════════════════════════

const SohbetYoklamalariPage = () => {
  // ─── Filtre state ──────────────────────────
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [gruplar, setGruplar] = useState<SohbetGrubuDto[]>([]);
  const [selectedGrupId, setSelectedGrupId] = useState<number | "">("");

  // ─── Tablo state ──────────────────────────
  const [sohbetId, setSohbetId] = useState<number | null>(null);
  const [satirlar, setSatirlar] = useState<YoklamaSatir[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // ─── Snackbar ──────────────────────────────
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });
  const showSnackbar = (
    message: string,
    severity: SnackbarState["severity"] = "success",
  ) => setSnackbar({ open: true, message, severity });

  // ─── Grupları bir kez çek ──────────────────
  useEffect(() => {
    sohbetYoklamaService
      .getGruplar()
      .then((r) => setGruplar(r.data))
      .catch(() => showSnackbar("Sohbet grupları yüklenemedi.", "error"));
  }, []);

  // Grup veya tarih değişince tabloyu sıfırla
  useEffect(() => {
    setSatirlar([]);
    setSohbetId(null);
    setHasFetched(false);
  }, [selectedGrupId, selectedDate]);

  // ─── Veri çekme ────────────────────────────
  const fetchYoklama = useCallback(async () => {
    if (!selectedDate || !selectedGrupId) return;
    setLoading(true);
    setError(null);
    setHasFetched(true);
    try {
      const response = await sohbetYoklamaService.getSohbetYoklama(
        selectedDate,
        selectedGrupId as number,
      );
      setSohbetId(response.data.sohbetId);
      const mapped: YoklamaSatir[] = response.data.ogrenciler.map(
        (o: SohbetOgrenciDurumDto) => ({
          kullaniciId: o.kullaniciId,
          ad: o.ad,
          soyad: o.soyad,
          odaNo: o.odaNo,
          katilimDurumu: o.katilimDurumu ?? true,
          mazeretAciklamasi: o.mazeretAciklamasi ?? "",
        }),
      );
      setSatirlar(mapped);
    } catch {
      setError("Yoklama verileri yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedGrupId]);

  // Filtreler değişince otomatik çek
  useEffect(() => {
    if (selectedDate && selectedGrupId) fetchYoklama();
  }, [fetchYoklama]);

  // ─── Satır güncelleme ──────────────────────
  const handleDurumChange = (idx: number, val: boolean) => {
    setSatirlar((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, katilimDurumu: val } : s)),
    );
  };

  const handleMazeretChange = (idx: number, val: string) => {
    setSatirlar((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, mazeretAciklamasi: val } : s)),
    );
  };

  // ─── Kaydet ────────────────────────────────
  const handleSave = async () => {
    if (!sohbetId) {
      showSnackbar("Sohbet oturumu bulunamadı.", "warning");
      return;
    }
    if (!selectedGrupId) {
      showSnackbar("Sohbet grubu seçiniz.", "warning");
      return;
    }
    if (satirlar.length === 0) {
      showSnackbar("Kaydedilecek öğrenci yok.", "warning");
      return;
    }

    setSaving(true);
    try {
      const payload: TakeSohbetAttendanceRequest = {
        sohbetId,
        ogrenciler: satirlar.map((s) => ({
          kullaniciId: s.kullaniciId,
          katilimDurumu: s.katilimDurumu,
          mazeretAciklamasi: s.mazeretAciklamasi.trim() || null,
        })),
      };
      await sohbetYoklamaService.takeSohbetAttendance(payload);
      showSnackbar(
        `${satirlar.length} öğrencinin sohbet yoklaması başarıyla kaydedildi.`,
      );
    } catch {
      showSnackbar("Yoklama kaydedilirken bir hata oluştu.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Excel Export ───────────────────────────
  const handleExportExcel = async (period: "weekly" | "monthly") => {
    if (!selectedGrupId) {
      showSnackbar("Sohbet grubu seçiniz.", "warning");
      return;
    }
    const today = new Date();
    let startDate: string;
    let endDate: string;

    if (period === "weekly") {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 6);
      startDate = weekAgo.toISOString().split("T")[0];
      endDate = today.toISOString().split("T")[0];
    } else {
      const y = today.getFullYear();
      const m = today.getMonth();
      startDate = new Date(y, m, 1).toISOString().split("T")[0];
      endDate = new Date(y, m + 1, 0).toISOString().split("T")[0];
    }

    try {
      const response = await sohbetYoklamaService.exportSohbetExcel(
        startDate,
        endDate,
        selectedGrupId as number,
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SohbetYoklama_${startDate}_${endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showSnackbar(
        period === "weekly"
          ? "Haftalık Excel başarıyla indirildi."
          : "Aylık Excel başarıyla indirildi.",
      );
    } catch {
      showSnackbar("Excel dosyası oluşturulurken bir hata oluştu.", "error");
    }
  };

  // ─── Skeleton ──────────────────────────────
  const renderSkeletonRows = () =>
    Array.from({ length: 6 }).map((_, i) => (
      <TableRow key={`skeleton-${i}`}>
        {Array.from({ length: 4 }).map((_, j) => (
          <TableCell key={j}>
            <Skeleton variant="text" width={j === 0 ? 180 : "60%"} />
          </TableCell>
        ))}
      </TableRow>
    ));

  // ══════════════════════════════════════════════
  // JSX
  // ══════════════════════════════════════════════

  return (
    <Box>
      {/* ─── Sayfa Başlığı ─── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #10B981, #34D399)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
            }}
          >
            <SchoolOutlined sx={{ color: "#fff", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Eğitim / Sohbet Yoklamaları
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontSize: "0.82rem" }}
            >
              {loading
                ? "..."
                : hasFetched
                  ? `${satirlar.length} öğrenci listeleniyor`
                  : "Grup seçerek yoklama alın"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FileDownloadOutlined />}
            onClick={() => handleExportExcel("weekly")}
            disabled={!selectedGrupId}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Haftalık Excel
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FileDownloadOutlined />}
            onClick={() => handleExportExcel("monthly")}
            disabled={!selectedGrupId}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Aylık Excel
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* ─── Filtreler ─── */}
      <Card sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2.5,
            flexWrap: "wrap",
          }}
        >
          <TextField
            label="Tarih"
            type="date"
            size="small"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 180 }}
          />

          <TextField
            label="Sohbet Grubu"
            select
            size="small"
            value={selectedGrupId}
            onChange={(e) => setSelectedGrupId(Number(e.target.value))}
            sx={{ minWidth: 200 }}
          >
            {gruplar.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.grupAdi}
              </MenuItem>
            ))}
          </TextField>

          <Tooltip title="Yenile">
            <IconButton
              onClick={fetchYoklama}
              disabled={!selectedDate || !selectedGrupId}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "primary.main",
                  backgroundColor: (t) => alpha(t.palette.primary.main, 0.1),
                },
              }}
            >
              <RefreshOutlined />
            </IconButton>
          </Tooltip>
        </Box>
      </Card>

      {/* ─── Yoklama Tablosu ─── */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                  Öğrenci
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                  Oda
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                  Durum
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                  Mazeret
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                renderSkeletonRows()
              ) : !hasFetched ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Yoklama almak için yukarıdan sohbet grubunu seçiniz.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : satirlar.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Bu grupta aktif öğrenci bulunamadı.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                satirlar.map((satir, idx) => (
                  <TableRow
                    key={satir.kullaniciId}
                    hover
                    sx={{
                      transition: "background-color 0.15s ease",
                      "&:last-child td": { border: 0 },
                    }}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          color: "text.primary",
                        }}
                      >
                        {satir.ad} {satir.soyad}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: "0.83rem" }}>
                        {satir.odaNo ?? "—"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <ToggleButtonGroup
                        value={satir.katilimDurumu}
                        exclusive
                        onChange={(_, val) => {
                          if (val !== null) handleDurumChange(idx, val);
                        }}
                        size="small"
                        sx={{
                          "& .MuiToggleButton-root": {
                            textTransform: "none",
                            fontSize: "0.76rem",
                            fontWeight: 500,
                            px: 1.5,
                            py: 0.3,
                            borderColor: (t) =>
                              alpha(t.palette.text.secondary, 0.15),
                          },
                        }}
                      >
                        <ToggleButton
                          value={true}
                          sx={{
                            "&.Mui-selected": {
                              backgroundColor: (t) =>
                                alpha(t.palette.success.main, 0.15),
                              color: "success.main",
                              fontWeight: 600,
                              borderColor: (t) =>
                                alpha(t.palette.success.main, 0.4),
                              "&:hover": {
                                backgroundColor: (t) =>
                                  alpha(t.palette.success.main, 0.25),
                              },
                            },
                          }}
                        >
                          <CheckCircleOutlined sx={{ fontSize: 16, mr: 0.5 }} />{" "}
                          Var
                        </ToggleButton>
                        <ToggleButton
                          value={false}
                          sx={{
                            "&.Mui-selected": {
                              backgroundColor: (t) =>
                                alpha(t.palette.error.main, 0.15),
                              color: "error.main",
                              fontWeight: 600,
                              borderColor: (t) =>
                                alpha(t.palette.error.main, 0.4),
                              "&:hover": {
                                backgroundColor: (t) =>
                                  alpha(t.palette.error.main, 0.25),
                              },
                            },
                          }}
                        >
                          <CancelOutlined sx={{ fontSize: 16, mr: 0.5 }} /> Yok
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </TableCell>

                    <TableCell>
                      <TextField
                        size="small"
                        placeholder="Mazeret açıklaması..."
                        value={satir.mazeretAciklamasi}
                        onChange={(e) =>
                          handleMazeretChange(idx, e.target.value)
                        }
                        sx={{ minWidth: 180 }}
                        slotProps={{ htmlInput: { maxLength: 250 } }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {hasFetched && satirlar.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2.5 }}>
            <Button
              variant="contained"
              startIcon={
                saving ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SaveOutlined />
                )
              }
              onClick={handleSave}
              disabled={saving}
              sx={{ textTransform: "none", fontWeight: 600, px: 4 }}
            >
              {saving ? "Kaydediliyor..." : "Yoklamayı Kaydet"}
            </Button>
          </Box>
        )}
      </Card>

      {/* ─── Snackbar ─── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SohbetYoklamalariPage;
