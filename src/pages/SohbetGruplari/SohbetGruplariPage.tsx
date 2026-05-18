// ──────────────────────────────────────────────
// Sohbet Grupları Yönetim Sayfası — CRUD
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  GroupsOutlined,
  AddCircleOutlineOutlined,
  RefreshOutlined,
  EditOutlined,
  DeleteOutlined,
  OpenInNewOutlined,
  CloseOutlined,
  SaveOutlined,
} from "@mui/icons-material";
import { sohbetService } from "../../api/sohbetService";
import type {
  SohbetGrubuDetailDto,
  CreateSohbetGrubuRequest,
  UpdateSohbetGrubuRequest,
} from "../../types";

// ─── Yardımcı ────────────────────────────────

const formatDate = (iso: string | null): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const DONEM_OPTIONS = ["Güz", "Bahar"];

// ─── Form state ──────────────────────────────

interface FormState {
  grupAdi: string;
  sorumluHocaAdi: string;
  donem: string;
}

const INITIAL_FORM: FormState = {
  grupAdi: "",
  sorumluHocaAdi: "",
  donem: "",
};

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

// ══════════════════════════════════════════════
// Ana Bileşen
// ══════════════════════════════════════════════

const SohbetGruplariPage = () => {
  const navigate = useNavigate();

  // ─── Veri state ────────────────────────────
  const [gruplar, setGruplar] = useState<SohbetGrubuDetailDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Dialog state ──────────────────────────
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SohbetGrubuDetailDto | null>(
    null,
  );
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  // ─── Silme dialog ─────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<SohbetGrubuDetailDto | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

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

  // ─── Veri çekme ────────────────────────────
  const fetchGruplar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await sohbetService.getGruplar();
      setGruplar(response.data);
    } catch {
      setError("Sohbet grupları yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGruplar();
  }, [fetchGruplar]);

  // ─── Form Dialog açma/kapama ───────────────
  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData(INITIAL_FORM);
    setFormDialogOpen(true);
  };

  const openEditDialog = (item: SohbetGrubuDetailDto) => {
    setEditingItem(item);
    setFormData({
      grupAdi: item.grupAdi,
      sorumluHocaAdi: item.sorumluHocaAdi ?? "",
      donem: item.donem ?? "",
    });
    setFormDialogOpen(true);
  };

  const closeFormDialog = () => {
    setFormDialogOpen(false);
    setEditingItem(null);
    setFormData(INITIAL_FORM);
  };

  // ─── Kaydet ────────────────────────────────
  const handleSubmit = async () => {
    if (!formData.grupAdi.trim()) {
      showSnackbar("Grup adı boş olamaz.", "warning");
      return;
    }
    if (!formData.sorumluHocaAdi.trim()) {
      showSnackbar("Sorumlu hoca adı boş olamaz.", "warning");
      return;
    }
    if (!formData.donem) {
      showSnackbar("Dönem seçiniz.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        const payload: UpdateSohbetGrubuRequest = {
          id: editingItem.id,
          grupAdi: formData.grupAdi.trim(),
          sorumluHocaAdi: formData.sorumluHocaAdi.trim(),
          donem: formData.donem,
        };
        await sohbetService.updateGrup(editingItem.id, payload);
        showSnackbar("Grup başarıyla güncellendi.");
      } else {
        const payload: CreateSohbetGrubuRequest = {
          grupAdi: formData.grupAdi.trim(),
          sorumluHocaAdi: formData.sorumluHocaAdi.trim(),
          donem: formData.donem,
        };
        await sohbetService.createGrup(payload);
        showSnackbar("Grup başarıyla oluşturuldu.");
      }
      closeFormDialog();
      fetchGruplar();
    } catch {
      showSnackbar("İşlem sırasında bir hata oluştu.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Silme ─────────────────────────────────
  const openDeleteDialog = (item: SohbetGrubuDetailDto) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      await sohbetService.deleteGrup(deletingItem.id);
      showSnackbar("Grup başarıyla silindi.");
      setDeleteDialogOpen(false);
      setDeletingItem(null);
      fetchGruplar();
    } catch {
      showSnackbar("Silme işlemi sırasında bir hata oluştu.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ─── Skeleton ──────────────────────────────
  const renderSkeletonRows = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`skeleton-${i}`}>
        {Array.from({ length: 6 }).map((_, j) => (
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
            <GroupsOutlined sx={{ color: "#fff", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Sohbet Grupları Yönetimi
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontSize: "0.82rem" }}
            >
              {loading
                ? "Yükleniyor..."
                : `${gruplar.length} grup listeleniyor`}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddCircleOutlineOutlined />}
            onClick={openCreateDialog}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Yeni Grup
          </Button>
          <Tooltip title="Yenile">
            <IconButton
              onClick={fetchGruplar}
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

      {/* ─── Tablo ─── */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                  Grup Adı
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                  Sorumlu Hoca
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                  Dönem
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, fontSize: "0.82rem" }}
                  align="center"
                >
                  Öğrenci
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, fontSize: "0.82rem" }}
                  align="center"
                >
                  Oturum
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
              {loading ? (
                renderSkeletonRows()
              ) : gruplar.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Henüz sohbet grubu oluşturulmamış.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                gruplar.map((grup) => (
                  <TableRow
                    key={grup.id}
                    hover
                    sx={{
                      cursor: "pointer",
                      transition: "background-color 0.15s ease",
                      "&:last-child td": { border: 0 },
                    }}
                    onClick={() => navigate(`/sohbet-gruplari/${grup.id}`)}
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
                        {grup.grupAdi}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        {formatDate(grup.olusturulmaTarihi)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: "0.83rem" }}>
                        {grup.sorumluHocaAdi ?? "—"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {grup.donem ? (
                        <Chip
                          label={grup.donem}
                          size="small"
                          color={grup.donem === "Güz" ? "warning" : "info"}
                          variant="outlined"
                          sx={{ fontWeight: 500, fontSize: "0.75rem" }}
                        />
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={grup.ogrenciSayisi}
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

                    <TableCell align="center">
                      <Chip
                        label={grup.oturumSayisi}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          minWidth: 36,
                          backgroundColor: (t) =>
                            alpha(t.palette.info.main, 0.1),
                          color: "info.main",
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
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip title="Detay">
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(`/sohbet-gruplari/${grup.id}`)
                            }
                            sx={{
                              color: "text.secondary",
                              "&:hover": {
                                color: "primary.main",
                                backgroundColor: (t) =>
                                  alpha(t.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            <OpenInNewOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Düzenle">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(grup)}
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
                            onClick={() => openDeleteDialog(grup)}
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
      </Card>

      {/* ─── Form Dialog ─── */}
      <Dialog
        open={formDialogOpen}
        onClose={closeFormDialog}
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
          {editingItem ? "Grubu Düzenle" : "Yeni Sohbet Grubu"}
          <IconButton size="small" onClick={closeFormDialog}>
            <CloseOutlined />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}
          >
            <TextField
              label="Grup Adı"
              fullWidth
              size="small"
              value={formData.grupAdi}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, grupAdi: e.target.value }))
              }
              inputProps={{ maxLength: 150 }}
            />
            <TextField
              label="Sorumlu Hoca"
              fullWidth
              size="small"
              value={formData.sorumluHocaAdi}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sorumluHocaAdi: e.target.value,
                }))
              }
            />
            <TextField
              label="Dönem"
              select
              fullWidth
              size="small"
              value={formData.donem}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, donem: e.target.value }))
              }
            >
              {DONEM_OPTIONS.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={closeFormDialog}
            sx={{ textTransform: "none" }}
            disabled={submitting}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveOutlined />
              )
            }
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {submitting ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Silme Dialog ─── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Grubu Sil</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            <strong>{deletingItem?.grupAdi}</strong> grubunu silmek istediğinize
            emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ textTransform: "none" }}
            disabled={deleting}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={
              deleting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <DeleteOutlined />
              )
            }
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {deleting ? "Siliniyor..." : "Sil"}
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

export default SohbetGruplariPage;
