// ──────────────────────────────────────────────
// Şikâyetlerim Sayfası — Öğrenci Görünümü
// Kendi şikâyetlerini listele + yeni oluştur + detay gör
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
  Chip,
  Skeleton,
  Alert,
  alpha,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ReportProblemOutlined,
  AddCircleOutlineOutlined,
  RefreshOutlined,
  VisibilityOutlined,
  CloseOutlined,
} from "@mui/icons-material";
import { sikayetService } from "../../api/sikayetService";
import type { SikayetDto, CreateSikayetRequest } from "../../types";
import { SikayetDurumu } from "../../types";

// ─── Yardımcı ────────────────────────────────

const formatDate = (iso: string | null): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDurumChip = (durum: number | null) => {
  switch (durum) {
    case SikayetDurumu.Beklemede:
      return (
        <Chip
          label="Beklemede"
          size="small"
          color="warning"
          variant="outlined"
        />
      );
    case SikayetDurumu.Cevaplanmis:
      return (
        <Chip
          label="Cevaplanmış"
          size="small"
          color="success"
          variant="outlined"
        />
      );
    case SikayetDurumu.Kapatilmis:
      return (
        <Chip
          label="Kapatılmış"
          size="small"
          color="default"
          variant="outlined"
        />
      );
    default:
      return <Chip label="Bilinmiyor" size="small" variant="outlined" />;
  }
};

const SikayetlerimPage = () => {
  // ─── State ─────────────────────────────────
  const [sikayetler, setSikayetler] = useState<SikayetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Yeni şikâyet dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateSikayetRequest>({
    baslik: "",
    icerik: "",
  });
  const [creating, setCreating] = useState(false);

  // Detay dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSikayet, setSelectedSikayet] = useState<SikayetDto | null>(
    null,
  );

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // ─── Veri çekme ────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await sikayetService.getMySikayetler();
      setSikayetler(data);
    } catch {
      setError("Şikâyetler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Yeni şikâyet oluştur ─────────────────
  const handleCreate = async () => {
    if (!form.baslik.trim() || !form.icerik.trim()) return;
    setCreating(true);
    try {
      await sikayetService.create(form);
      setSnackbar({
        open: true,
        message: "Şikâyet başarıyla gönderildi.",
        severity: "success",
      });
      setCreateOpen(false);
      setForm({ baslik: "", icerik: "" });
      fetchData();
    } catch {
      setSnackbar({
        open: true,
        message: "Şikâyet gönderilemedi.",
        severity: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  // ─── Detay göster ──────────────────────────
  const handleShowDetail = (sikayet: SikayetDto) => {
    setSelectedSikayet(sikayet);
    setDetailOpen(true);
  };

  // ─── Render ────────────────────────────────
  return (
    <Box>
      {/* Başlık */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ReportProblemOutlined sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h5" fontWeight={700}>
            Şikâyetlerim
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Yenile">
            <IconButton onClick={fetchData} disabled={loading}>
              <RefreshOutlined />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            Yeni Şikâyet
          </Button>
        </Box>
      </Box>

      {/* Hata */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tablo */}
      <Card
        sx={(theme) => ({
          border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
        })}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Başlık</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell>Cevap Tarihi</TableCell>
                <TableCell align="center">İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : sikayetler.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      Henüz şikâyet göndermediniz.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sikayetler.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {s.baslik}
                      </Typography>
                    </TableCell>
                    <TableCell>{getDurumChip(s.durum)}</TableCell>
                    <TableCell>{formatDate(s.olusturulmaTarihi)}</TableCell>
                    <TableCell>{formatDate(s.cevaplanmaTarihi)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Detay Gör">
                        <IconButton
                          size="small"
                          onClick={() => handleShowDetail(s)}
                        >
                          <VisibilityOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ─── Yeni Şikâyet Dialogu ─────────── */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Yeni Şikâyet / Geri Bildirim
          <IconButton
            onClick={() => setCreateOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseOutlined />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Başlık"
            value={form.baslik}
            onChange={(e) => setForm((p) => ({ ...p, baslik: e.target.value }))}
            sx={{ mt: 1, mb: 2 }}
            inputProps={{ maxLength: 200 }}
          />
          <TextField
            fullWidth
            label="İçerik"
            value={form.icerik}
            onChange={(e) => setForm((p) => ({ ...p, icerik: e.target.value }))}
            multiline
            rows={5}
            inputProps={{ maxLength: 2000 }}
            helperText={`${form.icerik.length} / 2000`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!form.baslik.trim() || !form.icerik.trim() || creating}
            startIcon={creating ? <CircularProgress size={18} /> : undefined}
          >
            Gönder
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Detay Dialogu ────────────────── */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Şikâyet Detayı
          <IconButton
            onClick={() => setDetailOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseOutlined />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedSikayet && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Başlık
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedSikayet.baslik}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  İçerik
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {selectedSikayet.icerik}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Durum
                  </Typography>
                  <Box>{getDurumChip(selectedSikayet.durum)}</Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Tarih
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedSikayet.olusturulmaTarihi)}
                  </Typography>
                </Box>
              </Box>
              {selectedSikayet.cevap && (
                <Box
                  sx={(theme) => ({
                    p: 2,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.success.main, 0.08),
                  })}
                >
                  <Typography variant="caption" color="text.secondary">
                    Yönetici Cevabı
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {selectedSikayet.cevap}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Cevaplanma: {formatDate(selectedSikayet.cevaplanmaTarihi)}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* ─── Snackbar ────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SikayetlerimPage;
