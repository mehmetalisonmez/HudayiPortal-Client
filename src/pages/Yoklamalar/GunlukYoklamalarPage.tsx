// ──────────────────────────────────────────────
// Günlük Yoklamalar — Genel Yurt Yoklaması (Gece / Sabah Namazı)
// Tarih + Yoklama Türü seçilir, tüm yurt öğrencileri listelenir
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
  FactCheckOutlined,
  RefreshOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  FileDownloadOutlined,
} from "@mui/icons-material";
import { yoklamaService } from "../../api/yoklamaService";
import type {
  YoklamaTuruDto,
  OgrenciYoklamaDurumDto,
  TakeAttendanceRequest,
} from "../../types";

// ─── Yerel satır tipi (düzenlenebilir) ──────

interface YoklamaSatir {
  kullaniciId: number;
  ad: string;
  soyad: string;
  odaNo: string | null;
  durum: boolean;
  aciklama: string;
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

const GunlukYoklamalarPage = () => {
  // ─── Filtre state ──────────────────────────
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [turler, setTurler] = useState<YoklamaTuruDto[]>([]);
  const [selectedTurId, setSelectedTurId] = useState<number | "">("");

  // ─── Tablo state ──────────────────────────
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

  // ─── Yoklama türlerini bir kez çek ────────────
  useEffect(() => {
    yoklamaService
      .getTurler()
      .then((r) => {
        setTurler(r.data);
        if (r.data.length > 0) setSelectedTurId(r.data[0].id);
      })
      .catch(() => showSnackbar("Yoklama türleri yüklenemedi.", "error"));
  }, []);

  // ─── Veri çekme ────────────────────────────
  const fetchYoklama = useCallback(async () => {
    if (!selectedDate || !selectedTurId) return;
    setLoading(true);
    setError(null);
    setHasFetched(true);
    try {
      const response = await yoklamaService.getGunlukYoklama(
        selectedDate,
        selectedTurId as number,
      );
      const mapped: YoklamaSatir[] = response.data.map(
        (o: OgrenciYoklamaDurumDto) => ({
          kullaniciId: o.kullaniciId,
          ad: o.ad,
          soyad: o.soyad,
          odaNo: o.odaNo,
          durum: o.durum ?? true,
          aciklama: o.aciklama ?? "",
        }),
      );
      setSatirlar(mapped);
    } catch {
      setError("Yoklama verileri yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedTurId]);

  // Filtreler değişince otomatik çek
  useEffect(() => {
    if (selectedDate && selectedTurId) fetchYoklama();
  }, [fetchYoklama]);

  // ─── Satır güncelleme ──────────────────────
  const handleDurumChange = (idx: number, val: boolean) => {
    setSatirlar((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, durum: val } : s)),
    );
  };

  const handleAciklamaChange = (idx: number, val: string) => {
    setSatirlar((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, aciklama: val } : s)),
    );
  };

  // ─── Kaydet ────────────────────────────────
  const handleSave = async () => {
    if (!selectedTurId) {
      showSnackbar("Yoklama türü seçiniz.", "warning");
      return;
    }
    if (satirlar.length === 0) {
      showSnackbar("Kaydedilecek öğrenci yok.", "warning");
      return;
    }

    setSaving(true);
    try {
      const payload: TakeAttendanceRequest = {
        yoklamaTurId: selectedTurId as number,
        tarih: selectedDate,
        ogrenciler: satirlar.map((s) => ({
          kullaniciId: s.kullaniciId,
          durum: s.durum,
          aciklama: s.aciklama.trim() || null,
        })),
      };
      await yoklamaService.takeAttendance(payload);
      showSnackbar(
        `${satirlar.length} öğrencinin yoklaması başarıyla kaydedildi.`,
      );
    } catch {
      showSnackbar("Yoklama kaydedilirken bir hata oluştu.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Excel Export ───────────────────────────
  const handleExportExcel = async (period: "weekly" | "monthly") => {
    if (!selectedTurId) {
      showSnackbar("Yoklama türü seçiniz.", "warning");
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
      const response = await yoklamaService.exportGunlukExcel(
        startDate,
        endDate,
        selectedTurId as number,
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GunlukYoklama_${startDate}_${endDate}.xlsx`;
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
              background: "linear-gradient(135deg, #6366F1, #818CF8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
            }}
          >
            <FactCheckOutlined sx={{ color: "#fff", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Günlük Yoklamalar
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontSize: "0.82rem" }}
            >
              {loading
                ? "..."
                : hasFetched
                  ? `${satirlar.length} öğrenci listeleniyor`
                  : "Tarih ve tür seçerek yoklama alın"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FileDownloadOutlined />}
            onClick={() => handleExportExcel("weekly")}
            disabled={!selectedTurId}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Haftalık Excel
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FileDownloadOutlined />}
            onClick={() => handleExportExcel("monthly")}
            disabled={!selectedTurId}
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
            label="Yoklama Türü"
            select
            size="small"
            value={selectedTurId}
            onChange={(e) => setSelectedTurId(Number(e.target.value))}
            sx={{ minWidth: 200 }}
          >
            {turler.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.turAdi}
              </MenuItem>
            ))}
          </TextField>

          <Tooltip title="Yenile">
            <IconButton
              onClick={fetchYoklama}
              disabled={!selectedDate || !selectedTurId}
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
                  Açıklama
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
                      Yoklama almak için tarih ve yoklama türünü seçiniz.
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
                      Aktif öğrenci bulunamadı.
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
                        value={satir.durum}
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
                        placeholder="İzinli, hasta vb."
                        value={satir.aciklama}
                        onChange={(e) =>
                          handleAciklamaChange(idx, e.target.value)
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

export default GunlukYoklamalarPage;
