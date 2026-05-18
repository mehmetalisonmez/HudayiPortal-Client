// ──────────────────────────────────────────────
// Şikâyet Yönetimi Sayfası — Admin/Personel Görünümü
// Tüm şikâyetleri listele + filtrele + cevap ver
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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  ReportProblemOutlined,
  RefreshOutlined,
  ReplyOutlined,
  VisibilityOutlined,
  CloseOutlined,
} from "@mui/icons-material";
import { sikayetService } from "../../api/sikayetService";
import type {
  SikayetDto,
  SikayetFilterParams,
  UpdateSikayetCevapRequest,
} from "../../types";
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

const durumOptions = [
  { value: "", label: "Tümü" },
  { value: SikayetDurumu.Beklemede, label: "Beklemede" },
  { value: SikayetDurumu.Cevaplanmis, label: "Cevaplanmış" },
  { value: SikayetDurumu.Kapatilmis, label: "Kapatılmış" },
];

const SikayetYonetimiPage = () => {
  // ─── State ─────────────────────────────────
  const [sikayetler, setSikayetler] = useState<SikayetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [durumFilter, setDurumFilter] = useState<string>("");

  // Detay dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSikayet, setSelectedSikayet] = useState<SikayetDto | null>(
    null,
  );

  // Cevap dialog
  const [replyOpen, setReplyOpen] = useState(false);
  const [replySikayet, setReplySikayet] = useState<SikayetDto | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyDurum, setReplyDurum] = useState<number>(
    SikayetDurumu.Cevaplanmis,
  );
  const [replying, setReplying] = useState(false);

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
      const params: SikayetFilterParams = {};
      if (durumFilter !== "") params.durum = Number(durumFilter);
      const { data } = await sikayetService.getAll(params);
      setSikayetler(data);
    } catch {
      setError("Şikâyetler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [durumFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Cevap yaz ────────────────────────────
  const handleOpenReply = (sikayet: SikayetDto) => {
    setReplySikayet(sikayet);
    setReplyText(sikayet.cevap ?? "");
    setReplyDurum(SikayetDurumu.Cevaplanmis);
    setReplyOpen(true);
  };

  const handleReply = async () => {
    if (!replySikayet || !replyText.trim()) return;
    setReplying(true);
    try {
      const payload: UpdateSikayetCevapRequest = {
        sikayetId: replySikayet.id,
        cevap: replyText,
        yeniDurum: replyDurum,
      };
      await sikayetService.updateCevap(payload);
      setSnackbar({
        open: true,
        message: "Cevap başarıyla kaydedildi.",
        severity: "success",
      });
      setReplyOpen(false);
      fetchData();
    } catch {
      setSnackbar({
        open: true,
        message: "Cevap kaydedilemedi.",
        severity: "error",
      });
    } finally {
      setReplying(false);
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
            Şikâyet Yönetimi
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            select
            size="small"
            label="Durum"
            value={durumFilter}
            onChange={(e) => setDurumFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            {durumOptions.map((opt) => (
              <MenuItem key={String(opt.value)} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <Tooltip title="Yenile">
            <IconButton onClick={fetchData} disabled={loading}>
              <RefreshOutlined />
            </IconButton>
          </Tooltip>
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
                <TableCell>Öğrenci</TableCell>
                <TableCell>Başlık</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell align="center">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
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
                      Şikâyet bulunamadı.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sikayetler.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {s.ogrenciAdSoyad}
                      </Typography>
                    </TableCell>
                    <TableCell>{s.baslik}</TableCell>
                    <TableCell>{getDurumChip(s.durum)}</TableCell>
                    <TableCell>{formatDate(s.olusturulmaTarihi)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Detay">
                        <IconButton
                          size="small"
                          onClick={() => handleShowDetail(s)}
                        >
                          <VisibilityOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cevapla">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenReply(s)}
                        >
                          <ReplyOutlined fontSize="small" />
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

      {/* ─── Cevap Dialogu ───────────────────── */}
      <Dialog
        open={replyOpen}
        onClose={() => setReplyOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Şikâyete Cevap Yaz
          <IconButton
            onClick={() => setReplyOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseOutlined />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {replySikayet && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Şikâyet
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {replySikayet.baslik}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {replySikayet.icerik}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            label="Cevabınız"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            fullWidth
            label="Yeni Durum"
            value={replyDurum}
            onChange={(e) => setReplyDurum(Number(e.target.value))}
          >
            <MenuItem value={SikayetDurumu.Cevaplanmis}>Cevaplanmış</MenuItem>
            <MenuItem value={SikayetDurumu.Kapatilmis}>Kapatılmış</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleReply}
            disabled={!replyText.trim() || replying}
            startIcon={replying ? <CircularProgress size={18} /> : undefined}
          >
            Kaydet
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
                  Öğrenci
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedSikayet.ogrenciAdSoyad}
                </Typography>
              </Box>
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
                    Cevap
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

export default SikayetYonetimiPage;
