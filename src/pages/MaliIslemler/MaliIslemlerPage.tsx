// ──────────────────────────────────────────────
// Mali İşlemler Sayfası — Liste + CRUD Dialog
// Admin & Personel erişimine açık
// Filtreler: Ay/Yıl, Yön, Kategori
// Belge yükleme akışı: /api/upload → URL → kaydet
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
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
  Snackbar,
  CircularProgress,
  MenuItem,
  TextField,
  Stack,
  Paper,
  Select,
  FormControl,
  InputLabel,
  useTheme,
} from "@mui/material";
import {
  AccountBalanceWalletOutlined,
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  SaveOutlined,
  ReceiptLongOutlined,
  UploadFileOutlined,
  RefreshOutlined,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import { maliIslemService } from "../../api/maliIslemService";
import { islemKategorisiService } from "../../api/islemKategorisiService";
import api from "../../api/axiosInstance";
import { API } from "../../api/endpoints";
import type {
  MaliIslemDto,
  CreateMaliIslemRequest,
  UpdateMaliIslemRequest,
  IslemKategorisiDto,
} from "../../types";

// ─── Yön seçenekleri ──────────────────────────
const YON_SECENEKLER = [
  { id: 1, adi: "Gelir" },
  { id: 2, adi: "Gider" },
];

// ─── Para formatla ────────────────────────────
const formatTL = (val: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
    val,
  );

// ─── Form state ───────────────────────────────
interface FormState {
  yonId: number | "";
  baslik: string;
  aciklama: string;
  tutar: string;
  islemTarihi: string;
  ilgiliKullaniciId: string;
  kategoriId: number | "";
  belgeUrl: string;
}

const INITIAL_FORM: FormState = {
  yonId: "",
  baslik: "",
  aciklama: "",
  tutar: "",
  islemTarihi: new Date().toISOString().split("T")[0],
  ilgiliKullaniciId: "",
  kategoriId: "",
  belgeUrl: "",
};

// ─── Snackbar state ───────────────────────────
interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

// ═══════════════════════════════════════════════
// Ana Bileşen
// ═══════════════════════════════════════════════
const MaliIslemlerPage = () => {
  const { role } = useAuth();
  const theme = useTheme();
  const isAdmin = role === "Admin";
  const isAdminOrPersonel = role === "Admin" || role === "Personel";

  // ─── Veri state'leri ──────────────────────────
  const [islemler, setIslemler] = useState<MaliIslemDto[]>([]);
  const [kategoriler, setKategoriler] = useState<IslemKategorisiDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Filtre state'leri ────────────────────────
  const [filterAy, setFilterAy] = useState(""); // "yyyy-MM"
  const [filterYon, setFilterYon] = useState<number | "">("");
  const [filterKategori, setFilterKategori] = useState<number | "">("");

  // ─── Form dialog state'leri ───────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MaliIslemDto | null>(null);
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Filtrelenmiş kategoriler (yönId'e göre) ─
  const filteredFormKategoriler = kategoriler.filter(
    (k) => k.yonId === formData.yonId,
  );

  // ─── Filtre çubuğundaki kategoriler ──────────
  const filteredFilterKategoriler = kategoriler.filter(
    (k) => filterYon === "" || k.yonId === filterYon,
  );

  // ─── Delete dialog state'leri ─────────────────
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<MaliIslemDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Snackbar ─────────────────────────────────
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });
  const showSnackbar = (
    message: string,
    severity: SnackbarState["severity"] = "success",
  ) => setSnackbar({ open: true, message, severity });

  // ─── Veri çek ─────────────────────────────────
  const fetchIslemler = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = {};
      if (filterYon !== "") params.yonId = filterYon;
      if (filterKategori !== "") params.kategoriId = filterKategori;
      if (filterAy) {
        const [year, month] = filterAy.split("-");
        const start = new Date(Number(year), Number(month) - 1, 1);
        const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
        params.baslangicTarihi = start.toISOString();
        params.bitisTarihi = end.toISOString();
      }
      const res = await maliIslemService.getAll(params as never);
      setIslemler(res.data);
    } catch {
      setError("Mali işlemler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [filterYon, filterKategori, filterAy]);

  const fetchKategoriler = useCallback(async () => {
    try {
      const res = await islemKategorisiService.getAll();
      setKategoriler(res.data);
    } catch {
      // sessizce geç
    }
  }, []);

  useEffect(() => {
    fetchIslemler();
  }, [fetchIslemler]);

  useEffect(() => {
    fetchKategoriler();
  }, [fetchKategoriler]);

  // ─── Dosya yükle ──────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("folderName", "belgeler");
      const res = await api.post<{ Url: string }>(API.UPLOAD.FILE, formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((p) => ({ ...p, belgeUrl: res.data.Url }));
      setUploadedFileName(file.name);
      showSnackbar("Belge başarıyla yüklendi.", "success");
    } catch {
      showSnackbar("Belge yüklenirken hata oluştu.", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ─── Form dialog aç ───────────────────────────
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData(INITIAL_FORM);
    setUploadedFileName("");
    setFormOpen(true);
  };

  const handleOpenEdit = (item: MaliIslemDto) => {
    setEditingItem(item);
    setFormData({
      yonId: item.yonId,
      baslik: item.baslik,
      aciklama: item.aciklama ?? "",
      tutar: item.tutar.toString(),
      islemTarihi: item.islemTarihi.split("T")[0],
      ilgiliKullaniciId: "",
      kategoriId: item.kategoriId ?? "",
      belgeUrl: item.belgeUrl ?? "",
    });
    setUploadedFileName(item.belgeUrl ? "Mevcut belge" : "");
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    if (submitting) return;
    setFormOpen(false);
    setEditingItem(null);
    setUploadedFileName("");
  };

  // ─── Yön değişince kategoriyi sıfırla ─────────
  // Gelir (1) seçilirse belge alanı gereksiz — temizle
  const handleYonChange = (val: number | "") => {
    if (val === 1) {
      setFormData((p) => ({ ...p, yonId: val, kategoriId: "", belgeUrl: "" }));
      setUploadedFileName("");
    } else {
      setFormData((p) => ({ ...p, yonId: val, kategoriId: "" }));
    }
  };

  // ─── Form kaydet ──────────────────────────────
  const handleSubmit = async () => {
    if (formData.yonId === "") {
      showSnackbar("Yön seçiniz.", "warning");
      return;
    }
    if (!formData.baslik.trim()) {
      showSnackbar("Başlık zorunludur.", "warning");
      return;
    }
    if (
      !formData.tutar ||
      isNaN(Number(formData.tutar)) ||
      Number(formData.tutar) <= 0
    ) {
      showSnackbar("Geçerli bir tutar giriniz.", "warning");
      return;
    }
    if (!formData.islemTarihi) {
      showSnackbar("İşlem tarihi zorunludur.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        const payload: UpdateMaliIslemRequest = {
          id: editingItem.id,
          yonId: formData.yonId as number,
          baslik: formData.baslik.trim(),
          aciklama: formData.aciklama.trim() || null,
          tutar: Number(formData.tutar),
          islemTarihi: new Date(formData.islemTarihi).toISOString(),
          ilgiliKullaniciId: formData.ilgiliKullaniciId
            ? Number(formData.ilgiliKullaniciId)
            : null,
          kategoriId:
            formData.kategoriId !== "" ? (formData.kategoriId as number) : null,
          belgeUrl: formData.belgeUrl || null,
        };
        await maliIslemService.update(editingItem.id, payload);
        showSnackbar("Mali işlem başarıyla güncellendi.");
      } else {
        const payload: CreateMaliIslemRequest = {
          yonId: formData.yonId as number,
          baslik: formData.baslik.trim(),
          aciklama: formData.aciklama.trim() || null,
          tutar: Number(formData.tutar),
          islemTarihi: new Date(formData.islemTarihi).toISOString(),
          ilgiliKullaniciId: formData.ilgiliKullaniciId
            ? Number(formData.ilgiliKullaniciId)
            : null,
          kategoriId:
            formData.kategoriId !== "" ? (formData.kategoriId as number) : null,
          belgeUrl: formData.belgeUrl || null,
        };
        await maliIslemService.create(payload);
        showSnackbar("Mali işlem başarıyla oluşturuldu.");
      }
      handleCloseForm();
      fetchIslemler();
    } catch {
      showSnackbar("İşlem kaydedilirken hata oluştu.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Sil ──────────────────────────────────────
  const handleOpenDelete = (item: MaliIslemDto) => {
    setDeletingItem(item);
    setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    if (deleting) return;
    setDeleteOpen(false);
    setDeletingItem(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      await maliIslemService.delete(deletingItem.id);
      showSnackbar("Mali işlem başarıyla silindi.");
      handleCloseDelete();
      fetchIslemler();
    } catch {
      showSnackbar("Silme işleminde hata oluştu.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ─── Skeleton satırları ───────────────────────
  const renderSkeleton = () =>
    Array.from({ length: 6 }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: 8 }).map((__, j) => (
          <TableCell key={j}>
            <Skeleton variant="text" />
          </TableCell>
        ))}
      </TableRow>
    ));

  // ─── Yön chip ─────────────────────────────────
  const yonChip = (item: MaliIslemDto) => (
    <Chip
      label={item.yonAdi}
      size="small"
      sx={{
        bgcolor:
          item.yonId === 1
            ? alpha(theme.palette.success.main, 0.15)
            : alpha(theme.palette.error.main, 0.15),
        color:
          item.yonId === 1
            ? theme.palette.success.main
            : theme.palette.error.main,
        fontWeight: 600,
        fontSize: 11,
      }}
    />
  );

  return (
    <Box>
      {/* ══════════════════════════════════════════
          Başlık + Yeni Ekle
         ══════════════════════════════════════════ */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              background: alpha(theme.palette.primary.main, 0.15),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.palette.primary.main,
            }}
          >
            <AccountBalanceWalletOutlined />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Mali İşlemler
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gelir, Gider ve Bütçe Yönetimi
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Yenile">
            <IconButton onClick={fetchIslemler} disabled={loading}>
              <RefreshOutlined />
            </IconButton>
          </Tooltip>
          {isAdminOrPersonel && (
            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={handleOpenCreate}
              sx={{ borderRadius: 2 }}
            >
              Yeni İşlem
            </Button>
          )}
        </Box>
      </Box>

      {/* ══════════════════════════════════════════
          Filtre Çubuğu
         ══════════════════════════════════════════ */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          background: theme.palette.background.paper,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          label="Ay / Yıl"
          type="month"
          size="small"
          value={filterAy}
          onChange={(e) => setFilterAy(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Yön</InputLabel>
          <Select
            value={filterYon}
            label="Yön"
            onChange={(e) => {
              setFilterYon(e.target.value as number | "");
              setFilterKategori("");
            }}
          >
            <MenuItem value="">Tümü</MenuItem>
            {YON_SECENEKLER.map((y) => (
              <MenuItem key={y.id} value={y.id}>
                {y.adi}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Kategori</InputLabel>
          <Select
            value={filterKategori}
            label="Kategori"
            onChange={(e) => setFilterKategori(e.target.value as number | "")}
          >
            <MenuItem value="">Tümü</MenuItem>
            {filteredFilterKategoriler.map((k) => (
              <MenuItem key={k.id} value={k.id}>
                {k.kategoriAdi}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setFilterAy("");
            setFilterYon("");
            setFilterKategori("");
          }}
          sx={{ borderRadius: 2 }}
        >
          Sıfırla
        </Button>
      </Paper>

      {/* ── Hata ── */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* ══════════════════════════════════════════
          Tablo
         ══════════════════════════════════════════ */}
      <Card
        sx={{ background: theme.palette.background.paper, borderRadius: 3 }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  "Tarih",
                  "Başlık",
                  "Kategori",
                  "Yön",
                  "Tutar",
                  "İlgili Kişi",
                  "Belge",
                  "İşlem",
                ].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      fontWeight: 600,
                      fontSize: 12,
                      textTransform: "uppercase",
                      color: "text.secondary",
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                renderSkeleton()
              ) : islemler.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ py: 6, color: "text.secondary" }}
                  >
                    İşlem bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                islemler.map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                    sx={{
                      "&:hover": {
                        background: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    <TableCell sx={{ fontSize: 13 }}>
                      {new Date(item.islemTarihi).toLocaleDateString("tr-TR")}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, fontSize: 13 }}>
                      {item.baslik}
                    </TableCell>
                    <TableCell>
                      {item.kategoriAdi ? (
                        <Chip
                          label={item.kategoriAdi}
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            color: theme.palette.primary.main,
                            fontSize: 11,
                          }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{yonChip(item)}</TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color:
                          item.yonId === 1
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                        fontSize: 13,
                      }}
                    >
                      {item.yonId === 2 ? "-" : "+"}
                      {formatTL(item.tutar)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: "text.secondary" }}>
                      {item.ilgiliKullaniciAdSoyad ?? "—"}
                    </TableCell>
                    <TableCell>
                      {item.belgeUrl ? (
                        <Tooltip title="Belgeyi Görüntüle">
                          <IconButton
                            size="small"
                            onClick={() =>
                              window.open(item.belgeUrl!, "_blank")
                            }
                            sx={{ color: theme.palette.secondary.main }}
                          >
                            <ReceiptLongOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {isAdmin && (
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Düzenle">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(item)}
                            >
                              <EditOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDelete(item)}
                              sx={{ color: theme.palette.error.main }}
                            >
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ══════════════════════════════════════════
          Create / Edit Dialog
         ══════════════════════════════════════════ */}
      <Dialog
        open={formOpen}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, background: theme.palette.background.paper },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            {editingItem ? "İşlemi Düzenle" : "Yeni Mali İşlem"}
          </Typography>
          <IconButton
            onClick={handleCloseForm}
            disabled={submitting}
            size="small"
          >
            <CloseOutlined />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 3 }}
        >
          {/* Yön */}
          <FormControl fullWidth size="small" required>
            <InputLabel>Yön *</InputLabel>
            <Select
              value={formData.yonId}
              label="Yön *"
              onChange={(e) => handleYonChange(e.target.value as number | "")}
            >
              {YON_SECENEKLER.map((y) => (
                <MenuItem key={y.id} value={y.id}>
                  {y.adi}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Kategori */}
          <FormControl fullWidth size="small">
            <InputLabel>Kategori</InputLabel>
            <Select
              value={formData.kategoriId}
              label="Kategori"
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  kategoriId: e.target.value as number | "",
                }))
              }
              disabled={formData.yonId === ""}
            >
              <MenuItem value="">
                <em>Seçiniz</em>
              </MenuItem>
              {filteredFormKategoriler.map((k) => (
                <MenuItem key={k.id} value={k.id}>
                  {k.kategoriAdi}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Başlık */}
          <TextField
            label="Başlık *"
            size="small"
            fullWidth
            value={formData.baslik}
            onChange={(e) =>
              setFormData((p) => ({ ...p, baslik: e.target.value }))
            }
            inputProps={{ maxLength: 150 }}
          />

          {/* Açıklama */}
          <TextField
            label="Açıklama"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={formData.aciklama}
            onChange={(e) =>
              setFormData((p) => ({ ...p, aciklama: e.target.value }))
            }
            inputProps={{ maxLength: 500 }}
          />

          {/* Tutar + Tarih */}
          <Stack direction="row" spacing={2}>
            <TextField
              label="Tutar (₺) *"
              size="small"
              fullWidth
              type="number"
              value={formData.tutar}
              onChange={(e) =>
                setFormData((p) => ({ ...p, tutar: e.target.value }))
              }
              inputProps={{ min: 0, step: "0.01" }}
            />
            <TextField
              label="İşlem Tarihi *"
              size="small"
              fullWidth
              type="date"
              value={formData.islemTarihi}
              onChange={(e) =>
                setFormData((p) => ({ ...p, islemTarihi: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          {/* Belge Yükle — sadece Gider (YonId=2) için göster */}
          {formData.yonId === 2 && (
            <Box>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*,application/pdf"
                onChange={handleFileChange}
              />
              <Button
                variant="outlined"
                startIcon={
                  uploading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <UploadFileOutlined />
                  )
                }
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                {uploading ? "Yükleniyor..." : "Fatura / Fiş Yükle"}
              </Button>
              {(uploadedFileName || formData.belgeUrl) && (
                <Typography
                  variant="caption"
                  color="success.main"
                  sx={{ ml: 1.5 }}
                >
                  {uploadedFileName || "Belge mevcut"}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseForm}
            disabled={submitting}
            sx={{ borderRadius: 2 }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            startIcon={
              submitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SaveOutlined />
              )
            }
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ borderRadius: 2 }}
          >
            {submitting ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════
          Silme Onay Dialog
         ══════════════════════════════════════════ */}
      <Dialog
        open={deleteOpen}
        onClose={handleCloseDelete}
        PaperProps={{
          sx: { borderRadius: 3, background: theme.palette.background.paper },
        }}
      >
        <DialogTitle fontWeight={600}>İşlemi Sil</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{deletingItem?.baslik}</strong> işlemi kalıcı olarak
            silinecek. Emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseDelete}
            disabled={deleting}
            sx={{ borderRadius: 2 }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={
              deleting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DeleteOutlined />
              )
            }
            onClick={handleConfirmDelete}
            disabled={deleting}
            sx={{ borderRadius: 2 }}
          >
            {deleting ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════
          Snackbar
         ══════════════════════════════════════════ */}
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

export default MaliIslemlerPage;
