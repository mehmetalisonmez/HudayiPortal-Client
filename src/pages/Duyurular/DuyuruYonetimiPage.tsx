// ──────────────────────────────────────────────
// Duyuru Yönetimi Sayfası — Sadece Admin / Personel
// Duyuru oluşturma, düzenleme ve silme
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  CampaignOutlined,
  AddCircleOutlineOutlined,
  RefreshOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  SaveOutlined,
  PeopleAltOutlined,
} from "@mui/icons-material";
import { duyuruService } from "../../api/duyuruService";
import { rolService } from "../../api/rolService";
import type {
  DuyuruDto,
  RolDto,
  CreateDuyuruRequest,
  UpdateDuyuruRequest,
} from "../../types";

// ─── Yardımcı fonksiyonlar ────────────────────

const formatDate = (iso: string | null): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toInputDatetime = (iso: string | null): string => {
  if (!iso) return "";
  // datetime-local input formatı: YYYY-MM-DDTHH:mm
  return new Date(iso).toISOString().slice(0, 16);
};

// ─── Form state tipi ─────────────────────────

interface FormState {
  baslik: string;
  icerik: string;
  yayinTarihi: string; // datetime-local string veya ''
  hedefRolId: string; // '' = Genel, aksi hâlde rol id string
}

const INITIAL_FORM: FormState = {
  baslik: "",
  icerik: "",
  yayinTarihi: "",
  hedefRolId: "",
};

// ─── Snackbar tipi ───────────────────────────

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

// ══════════════════════════════════════════════
// Ana Bileşen
// ══════════════════════════════════════════════

const DuyuruYonetimiPage = () => {
  // ─── Veri state'leri ───────────────────────
  const [duyurular, setDuyurular] = useState<DuyuruDto[]>([]);
  const [roller, setRoller] = useState<RolDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Form Dialog state'i ───────────────────
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DuyuruDto | null>(null);
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  // ─── Silme Dialog state'i ──────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<DuyuruDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Snackbar state'i ─────────────────────
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  // ─── Veri çekme ───────────────────────────
  const fetchDuyurular = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await duyuruService.getAll();
      setDuyurular(response.data);
    } catch {
      setError("Duyurular yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoller = useCallback(async () => {
    try {
      const response = await rolService.getAll();
      setRoller(response.data);
    } catch {
      // Rol listesi yüklenemezse sessizce devam et; Select boş kalır
    }
  }, []);

  useEffect(() => {
    fetchDuyurular();
    fetchRoller();
  }, [fetchDuyurular, fetchRoller]);

  // ─── Snackbar ─────────────────────────────
  const showSnackbar = (
    message: string,
    severity: SnackbarState["severity"] = "success",
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  // ─── Form Dialog ──────────────────────────
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData(INITIAL_FORM);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (item: DuyuruDto) => {
    setEditingItem(item);
    setFormData({
      baslik: item.baslik,
      icerik: item.icerik,
      yayinTarihi: toInputDatetime(item.yayinTarihi),
      hedefRolId: item.hedefRolId != null ? String(item.hedefRolId) : "",
    });
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    if (submitting) return;
    setFormDialogOpen(false);
    setEditingItem(null);
    setFormData(INITIAL_FORM);
  };

  // ─── Form Gönder ──────────────────────────
  const handleSubmit = async () => {
    if (!formData.baslik.trim()) {
      showSnackbar("Başlık alanı zorunludur.", "warning");
      return;
    }
    if (!formData.icerik.trim()) {
      showSnackbar("İçerik alanı zorunludur.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const yayinTarihi = formData.yayinTarihi
        ? new Date(formData.yayinTarihi).toISOString()
        : null;
      const hedefRolId =
        formData.hedefRolId !== "" ? Number(formData.hedefRolId) : null;

      if (editingItem) {
        const payload: UpdateDuyuruRequest = {
          id: editingItem.id,
          baslik: formData.baslik.trim(),
          icerik: formData.icerik.trim(),
          yayinTarihi,
          gecerlilikTarihi: null,
          hedefRolId,
        };
        await duyuruService.update(editingItem.id, payload);
        showSnackbar("Duyuru başarıyla güncellendi.");
      } else {
        const payload: CreateDuyuruRequest = {
          baslik: formData.baslik.trim(),
          icerik: formData.icerik.trim(),
          yayinTarihi,
          gecerlilikTarihi: null,
          hedefRolId,
        };
        await duyuruService.create(payload);
        showSnackbar("Duyuru başarıyla oluşturuldu.");
      }

      handleCloseFormDialog();
      fetchDuyurular();
    } catch {
      showSnackbar(
        editingItem
          ? "Duyuru güncellenirken bir hata oluştu."
          : "Duyuru oluşturulurken bir hata oluştu.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Silme Dialog ─────────────────────────
  const handleOpenDelete = (item: DuyuruDto) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    if (deleting) return;
    setDeleteDialogOpen(false);
    setDeletingItem(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      await duyuruService.delete(deletingItem.id);
      showSnackbar("Duyuru başarıyla silindi.");
      handleCloseDeleteDialog();
      fetchDuyurular();
    } catch {
      showSnackbar("Duyuru silinirken bir hata oluştu.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ─── Skeleton ─────────────────────────────
  const renderSkeletonRows = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`sk-${i}`}>
        {Array.from({ length: 5 }).map((_, j) => (
          <TableCell key={j}>
            <Skeleton variant="text" width={j === 0 ? 220 : "70%"} />
          </TableCell>
        ))}
      </TableRow>
    ));

  // ══════════════════════════════════════════
  // JSX
  // ══════════════════════════════════════════

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
              background: "linear-gradient(135deg, #06B6D4, #22D3EE)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)",
            }}
          >
            <CampaignOutlined sx={{ color: "#fff", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Duyuru Yönetimi
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontSize: "0.82rem" }}
            >
              {loading ? "..." : `${duyurular.length} duyuru`}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddCircleOutlineOutlined />}
          onClick={handleOpenCreate}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Yeni Duyuru
        </Button>
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

      {/* ─── Tablo Kartı ─── */}
      <Card>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2.5,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, fontSize: "0.95rem" }}
          >
            Tüm Duyurular
          </Typography>
          <Tooltip title="Yenile">
            <IconButton
              onClick={fetchDuyurular}
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

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                  Başlık
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                  İçerik Önizleme
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                  Hedef Kitle
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                  Yayın Tarihi
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, fontSize: "0.82rem" }}
                  align="center"
                >
                  İşlemler
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                renderSkeletonRows()
              ) : duyurular.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Henüz duyuru oluşturulmamış.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                duyurular.map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                    sx={{
                      transition: "background-color 0.15s ease",
                      "&:last-child td": { border: 0 },
                    }}
                  >
                    {/* Başlık */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          color: "text.primary",
                        }}
                      >
                        {item.baslik}
                      </Typography>
                    </TableCell>

                    {/* İçerik Önizleme */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "0.83rem",
                          color: "text.secondary",
                          maxWidth: 300,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.icerik}
                      </Typography>
                    </TableCell>

                    {/* Hedef Kitle */}
                    <TableCell>
                      {item.hedefRolAdi ? (
                        <Chip
                          icon={
                            <PeopleAltOutlined
                              sx={{ fontSize: "14px !important" }}
                            />
                          }
                          label={item.hedefRolAdi}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 500, fontSize: "0.7rem" }}
                        />
                      ) : (
                        <Chip
                          label="Genel"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ fontWeight: 500, fontSize: "0.7rem" }}
                        />
                      )}
                    </TableCell>

                    {/* Yayın Tarihi */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: "0.83rem" }}>
                        {formatDate(item.yayinTarihi ?? item.olusturulmaTarihi)}
                      </Typography>
                    </TableCell>

                    {/* İşlemler */}
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 0.5,
                        }}
                      >
                        <Tooltip title="Düzenle">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEdit(item)}
                            sx={{
                              color: "text.secondary",
                              "&:hover": {
                                color: "info.main",
                                backgroundColor: (t) =>
                                  alpha(t.palette.info.main, 0.1),
                              },
                            }}
                          >
                            <EditOutlined sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDelete(item)}
                            sx={{
                              color: "text.secondary",
                              "&:hover": {
                                color: "error.main",
                                backgroundColor: (t) =>
                                  alpha(t.palette.error.main, 0.1),
                              },
                            }}
                          >
                            <DeleteOutlined sx={{ fontSize: 18 }} />
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

      {/* ═══════════════════════════════════════
          Yeni / Düzenle Dialog
         ═══════════════════════════════════════ */}
      <Dialog
        open={formDialogOpen}
        onClose={handleCloseFormDialog}
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
            pb: 1,
          }}
        >
          {editingItem ? "Duyuru Düzenle" : "Yeni Duyuru Ekle"}
          <IconButton
            onClick={handleCloseFormDialog}
            size="small"
            disabled={submitting}
          >
            <CloseOutlined />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}
          >
            {/* Başlık */}
            <TextField
              label="Başlık"
              placeholder="Duyuru başlığını girin"
              fullWidth
              required
              value={formData.baslik}
              onChange={(e) =>
                setFormData((p) => ({ ...p, baslik: e.target.value }))
              }
              disabled={submitting}
              inputProps={{ maxLength: 200 }}
            />

            {/* İçerik */}
            <TextField
              label="İçerik"
              placeholder="Duyuru içeriğini girin"
              fullWidth
              required
              multiline
              rows={4}
              value={formData.icerik}
              onChange={(e) =>
                setFormData((p) => ({ ...p, icerik: e.target.value }))
              }
              disabled={submitting}
            />

            {/* Yayın Tarihi */}
            <TextField
              label="Yayın Tarihi"
              type="datetime-local"
              fullWidth
              value={formData.yayinTarihi}
              onChange={(e) =>
                setFormData((p) => ({ ...p, yayinTarihi: e.target.value }))
              }
              disabled={submitting}
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="Boş bırakılırsa oluşturulma tarihi esas alınır."
            />

            {/* Hedef Kitle */}
            <FormControl fullWidth disabled={submitting}>
              <InputLabel id="hedef-kitle-label">Hedef Kitle</InputLabel>
              <Select
                labelId="hedef-kitle-label"
                label="Hedef Kitle"
                value={formData.hedefRolId}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    hedefRolId: e.target.value as string,
                  }))
                }
              >
                <MenuItem value="">
                  <em>Genel (Herkese Açık)</em>
                </MenuItem>
                {roller.map((rol) => (
                  <MenuItem key={rol.id} value={String(rol.id)}>
                    {rol.rolAdi}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleCloseFormDialog}
            disabled={submitting}
            sx={{ textTransform: "none" }}
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
            sx={{ textTransform: "none", fontWeight: 600, minWidth: 120 }}
          >
            {submitting
              ? "Kaydediliyor..."
              : editingItem
                ? "Güncelle"
                : "Kaydet"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════════════════════════════════
          Silme Onay Dialog
         ═══════════════════════════════════════ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Duyuruyu Sil</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            <strong>"{deletingItem?.baslik}"</strong> başlıklı duyuruyu silmek
            istediğinize emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            disabled={deleting}
            sx={{ textTransform: "none" }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleting}
            startIcon={
              deleting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <DeleteOutlined />
              )
            }
            sx={{ textTransform: "none", fontWeight: 600, minWidth: 100 }}
          >
            {deleting ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════════════════════════════════
          Snackbar
         ═══════════════════════════════════════ */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
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

export default DuyuruYonetimiPage;
