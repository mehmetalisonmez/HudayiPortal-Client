// ──────────────────────────────────────────────
// Sohbet Grubu Detay Sayfası — 3 Sekme
// Bilgiler | Öğrenciler (Transfer List) | Oturumlar
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  TextField,
  MenuItem,
  Skeleton,
  Alert,
  Snackbar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
} from "@mui/material";
import {
  ArrowBackOutlined,
  GroupsOutlined,
  SaveOutlined,
  AddCircleOutlineOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  RefreshOutlined,
} from "@mui/icons-material";
import { sohbetService } from "../../api/sohbetService";
import type {
  SohbetGrubuFullDto,
  UpdateSohbetGrubuRequest,
  GrupOturumDto,
  CreateSohbetSessionRequest,
  UpdateSohbetSessionRequest,
} from "../../types";
import OgrenciTransferList from "../../components/OgrenciTransferList/OgrenciTransferList";

// ─── Yardımcı ────────────────────────────────

const formatDate = (iso: string | null): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toInputDate = (iso: string | null): string => {
  if (!iso) return "";
  return new Date(iso).toISOString().split("T")[0];
};

const DONEM_OPTIONS = ["Güz", "Bahar"];

// ─── Oturum form state ───────────────────────

interface OturumFormState {
  tarih: string; // YYYY-MM-DD
  konuBasligi: string;
}

const INITIAL_OTURUM_FORM: OturumFormState = {
  tarih: "",
  konuBasligi: "",
};

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning";
}

// ══════════════════════════════════════════════
// Ana Bileşen
// ══════════════════════════════════════════════

const SohbetGrubuDetayPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const grupId = Number(id);

  // ─── Data ──────────────────────────────────
  const [grup, setGrup] = useState<SohbetGrubuFullDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Tab ───────────────────────────────────
  const [activeTab, setActiveTab] = useState(0);

  // ─── Bilgiler formu ────────────────────────
  const [grupAdi, setGrupAdi] = useState("");
  const [sorumluHocaAdi, setSorumluHocaAdi] = useState("");
  const [donem, setDonem] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);

  // ─── Oturum dialog ─────────────────────────
  const [oturumDialogOpen, setOturumDialogOpen] = useState(false);
  const [editingOturum, setEditingOturum] = useState<GrupOturumDto | null>(
    null,
  );
  const [oturumForm, setOturumForm] =
    useState<OturumFormState>(INITIAL_OTURUM_FORM);
  const [savingOturum, setSavingOturum] = useState(false);

  // ─── Oturum silme dialog ───────────────────
  const [deleteOturumDialogOpen, setDeleteOturumDialogOpen] = useState(false);
  const [deletingOturum, setDeletingOturum] = useState<GrupOturumDto | null>(
    null,
  );
  const [deletingOturumLoading, setDeletingOturumLoading] = useState(false);

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

  // ─── Fetch ─────────────────────────────────
  const fetchGrup = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sohbetService.getGrupById(grupId);
      setGrup(res.data);
      setGrupAdi(res.data.grupAdi);
      setSorumluHocaAdi(res.data.sorumluHocaAdi ?? "");
      setDonem(res.data.donem ?? "");
    } catch {
      setError("Grup bilgileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [grupId]);

  useEffect(() => {
    if (!isNaN(grupId)) fetchGrup();
  }, [grupId, fetchGrup]);

  // ─── Bilgiler kaydet ──────────────────────
  const handleSaveInfo = async () => {
    if (!grupAdi.trim()) {
      showSnackbar("Grup adı boş olamaz.", "warning");
      return;
    }
    setSavingInfo(true);
    try {
      const payload: UpdateSohbetGrubuRequest = {
        id: grupId,
        grupAdi: grupAdi.trim(),
        sorumluHocaAdi: sorumluHocaAdi.trim(),
        donem,
      };
      await sohbetService.updateGrup(grupId, payload);
      showSnackbar("Grup bilgileri güncellendi.");
      fetchGrup();
    } catch {
      showSnackbar("Güncelleme sırasında hata oluştu.", "error");
    } finally {
      setSavingInfo(false);
    }
  };

  // ─── Oturum dialog ─────────────────────────
  const openCreateOturum = () => {
    setEditingOturum(null);
    setOturumForm(INITIAL_OTURUM_FORM);
    setOturumDialogOpen(true);
  };

  const openEditOturum = (oturum: GrupOturumDto) => {
    setEditingOturum(oturum);
    setOturumForm({
      tarih: toInputDate(oturum.tarih),
      konuBasligi: oturum.konuBasligi ?? "",
    });
    setOturumDialogOpen(true);
  };

  const closeOturumDialog = () => {
    setOturumDialogOpen(false);
    setEditingOturum(null);
    setOturumForm(INITIAL_OTURUM_FORM);
  };

  const handleSaveOturum = async () => {
    if (!oturumForm.tarih) {
      showSnackbar("Tarih seçiniz.", "warning");
      return;
    }
    if (!oturumForm.konuBasligi.trim()) {
      showSnackbar("Konu başlığı boş olamaz.", "warning");
      return;
    }

    setSavingOturum(true);
    try {
      if (editingOturum) {
        const payload: UpdateSohbetSessionRequest = {
          id: editingOturum.id,
          tarih: new Date(oturumForm.tarih).toISOString(),
          konuBasligi: oturumForm.konuBasligi.trim(),
        };
        await sohbetService.updateOturum(editingOturum.id, payload);
        showSnackbar("Oturum güncellendi.");
      } else {
        const payload: CreateSohbetSessionRequest = {
          sohbetGrupId: grupId,
          tarih: new Date(oturumForm.tarih).toISOString(),
          konuBasligi: oturumForm.konuBasligi.trim(),
        };
        await sohbetService.createOturum(payload);
        showSnackbar("Oturum oluşturuldu.");
      }
      closeOturumDialog();
      fetchGrup();
    } catch {
      showSnackbar("İşlem sırasında hata oluştu.", "error");
    } finally {
      setSavingOturum(false);
    }
  };

  // ─── Oturum silme ──────────────────────────
  const openDeleteOturum = (oturum: GrupOturumDto) => {
    setDeletingOturum(oturum);
    setDeleteOturumDialogOpen(true);
  };

  const handleDeleteOturum = async () => {
    if (!deletingOturum) return;
    setDeletingOturumLoading(true);
    try {
      await sohbetService.deleteOturum(deletingOturum.id);
      showSnackbar("Oturum silindi.");
      setDeleteOturumDialogOpen(false);
      setDeletingOturum(null);
      fetchGrup();
    } catch {
      showSnackbar("Silme sırasında hata oluştu.", "error");
    } finally {
      setDeletingOturumLoading(false);
    }
  };

  // ─── Loading / Error ──────────────────────
  if (loading) {
    return (
      <Box>
        <Skeleton
          variant="rectangular"
          height={56}
          sx={{ borderRadius: 2, mb: 2 }}
        />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (error || !grup) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackOutlined />}
          onClick={() => navigate("/sohbet-gruplari")}
          sx={{ mb: 2, textTransform: "none" }}
        >
          Geri Dön
        </Button>
        <Alert severity="error">{error ?? "Grup bulunamadı."}</Alert>
      </Box>
    );
  }

  // ══════════════════════════════════════════════
  // JSX
  // ══════════════════════════════════════════════

  return (
    <Box>
      {/* ─── Başlık ─── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Tooltip title="Listeye Dön">
          <IconButton
            onClick={() => navigate("/sohbet-gruplari")}
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "primary.main",
                backgroundColor: (t) => alpha(t.palette.primary.main, 0.1),
              },
            }}
          >
            <ArrowBackOutlined />
          </IconButton>
        </Tooltip>

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
          <GroupsOutlined sx={{ color: "#fff", fontSize: 24 }} />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {grup.grupAdi}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontSize: "0.82rem" }}
          >
            {grup.sorumluHocaAdi} · {grup.donem} · Oluşturma:{" "}
            {formatDate(grup.olusturulmaTarihi)}
          </Typography>
        </Box>

        <Tooltip title="Yenile">
          <IconButton
            onClick={fetchGrup}
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

      {/* ─── Tabs ─── */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: 2,
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
          }}
        >
          <Tab label="Grup Bilgileri" />
          <Tab label={`Öğrenciler (${grup.ogrenciler.length})`} />
          <Tab label={`Oturumlar (${grup.oturumlar.length})`} />
        </Tabs>

        {/* ═══ Tab 0: Bilgiler ═══ */}
        {activeTab === 0 && (
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
                maxWidth: 480,
              }}
            >
              <TextField
                label="Grup Adı"
                fullWidth
                size="small"
                value={grupAdi}
                onChange={(e) => setGrupAdi(e.target.value)}
                inputProps={{ maxLength: 150 }}
              />
              <TextField
                label="Sorumlu Hoca"
                fullWidth
                size="small"
                value={sorumluHocaAdi}
                onChange={(e) => setSorumluHocaAdi(e.target.value)}
              />
              <TextField
                label="Dönem"
                select
                fullWidth
                size="small"
                value={donem}
                onChange={(e) => setDonem(e.target.value)}
              >
                {DONEM_OPTIONS.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  onClick={handleSaveInfo}
                  disabled={savingInfo}
                  startIcon={
                    savingInfo ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <SaveOutlined />
                    )
                  }
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  {savingInfo ? "Kaydediliyor..." : "Güncelle"}
                </Button>
              </Box>
            </Box>
          </CardContent>
        )}

        {/* ═══ Tab 1: Öğrenciler (Transfer List) ═══ */}
        {activeTab === 1 && (
          <CardContent sx={{ p: 3 }}>
            <OgrenciTransferList grupId={grupId} onSaved={fetchGrup} />
          </CardContent>
        )}

        {/* ═══ Tab 2: Oturumlar ═══ */}
        {activeTab === 2 && (
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mb: 2,
              }}
            >
              <Button
                variant="contained"
                size="small"
                startIcon={<AddCircleOutlineOutlined />}
                onClick={openCreateOturum}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Yeni Oturum
              </Button>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                      Tarih
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                      Konu Başlığı
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 700, fontSize: "0.82rem" }}
                      align="center"
                    >
                      Yoklama
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 700, fontSize: "0.82rem" }}
                      align="right"
                    >
                      İşlemler
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grup.oturumlar.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          Henüz oturum oluşturulmamış.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    grup.oturumlar.map((oturum) => (
                      <TableRow
                        key={oturum.id}
                        hover
                        sx={{ "&:last-child td": { border: 0 } }}
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontSize: "0.83rem" }}
                          >
                            {formatDate(oturum.tarih)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontSize: "0.83rem" }}
                          >
                            {oturum.konuBasligi ?? "—"}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={oturum.yoklamaSayisi}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              minWidth: 36,
                              backgroundColor: (t) =>
                                alpha(t.palette.success.main, 0.1),
                              color: "success.main",
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              gap: 0.5,
                              justifyContent: "flex-end",
                            }}
                          >
                            <Tooltip title="Düzenle">
                              <IconButton
                                size="small"
                                onClick={() => openEditOturum(oturum)}
                                sx={{
                                  color: "text.secondary",
                                  "&:hover": {
                                    color: "warning.main",
                                    backgroundColor: (t) =>
                                      alpha(t.palette.warning.main, 0.1),
                                  },
                                }}
                              >
                                <EditOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil">
                              <IconButton
                                size="small"
                                onClick={() => openDeleteOturum(oturum)}
                                sx={{
                                  color: "text.secondary",
                                  "&:hover": {
                                    color: "error.main",
                                    backgroundColor: (t) =>
                                      alpha(t.palette.error.main, 0.1),
                                  },
                                }}
                              >
                                <DeleteOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}
      </Card>

      {/* ─── Oturum Form Dialog ─── */}
      <Dialog
        open={oturumDialogOpen}
        onClose={closeOturumDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 700,
          }}
        >
          {editingOturum ? "Oturumu Düzenle" : "Yeni Oturum"}
          <IconButton size="small" onClick={closeOturumDialog}>
            <CloseOutlined />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              mt: 1,
            }}
          >
            <TextField
              label="Tarih"
              type="date"
              fullWidth
              size="small"
              value={oturumForm.tarih}
              onChange={(e) =>
                setOturumForm((prev) => ({ ...prev, tarih: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Konu Başlığı"
              fullWidth
              size="small"
              value={oturumForm.konuBasligi}
              onChange={(e) =>
                setOturumForm((prev) => ({
                  ...prev,
                  konuBasligi: e.target.value,
                }))
              }
              inputProps={{ maxLength: 300 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={closeOturumDialog}
            sx={{ textTransform: "none" }}
            disabled={savingOturum}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveOturum}
            disabled={savingOturum}
            startIcon={
              savingOturum ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveOutlined />
              )
            }
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {savingOturum ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Oturum Silme Dialog ─── */}
      <Dialog
        open={deleteOturumDialogOpen}
        onClose={() => setDeleteOturumDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Oturumu Sil</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            <strong>
              {deletingOturum ? formatDate(deletingOturum.tarih) : ""}
            </strong>{" "}
            tarihli oturumu silmek istediğinize emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDeleteOturumDialogOpen(false)}
            sx={{ textTransform: "none" }}
            disabled={deletingOturumLoading}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteOturum}
            disabled={deletingOturumLoading}
            startIcon={
              deletingOturumLoading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <DeleteOutlined />
              )
            }
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {deletingOturumLoading ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogActions>
      </Dialog>

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

export default SohbetGrubuDetayPage;
