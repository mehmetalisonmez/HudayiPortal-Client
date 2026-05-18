// ──────────────────────────────────────────────
// Yemek Tanımları (Yemek Havuzu) Yönetimi Sayfası
// Sekmeli Pano Görünümü — Kahvaltı / Akşam Yemeği
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
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
  Snackbar,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
  Tabs,
  Tab,
  Grid,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  SetMealOutlined,
  AddCircleOutlineOutlined,
  RefreshOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  SaveOutlined,
  LocalFireDepartmentOutlined,
  ImageOutlined,
} from "@mui/icons-material";
import { yemekTanimiService } from "../../api/yemekTanimiService";
import type {
  YemekTanimiFullDto,
  YemekKategorisiDto,
  CreateYemekTanimiRequest,
  UpdateYemekTanimiRequest,
} from "../../types";
import { getToken } from "../../utils/tokenHelper";

// ─── Kategori konfigürasyonu ─────────────────────

interface KategoriConfig {
  id: number;
  label: string;
  color: string;
  bgColor: string;
  tab: number; // 0=Kahvaltı, 1=Akşam Yemeği
}

const KATEGORI_CONFIG: KategoriConfig[] = [
  { id: 1, label: "Çorbalar", color: "#FF6F00", bgColor: "#FFF8E1", tab: 1 },
  {
    id: 2,
    label: "Ana Yemekler",
    color: "#2E7D32",
    bgColor: "#E8F5E9",
    tab: 1,
  },
  {
    id: 3,
    label: "Yardımcı Yemekler",
    color: "#1565C0",
    bgColor: "#E3F2FD",
    tab: 1,
  },
  { id: 4, label: "Ekstralar", color: "#7B1FA2", bgColor: "#F3E5F5", tab: 1 },
  {
    id: 5,
    label: "Kahvaltılık Sıcaklar",
    color: "#C62828",
    bgColor: "#FFEBEE",
    tab: 0,
  },
  {
    id: 6,
    label: "Standart Kahvaltılıklar",
    color: "#00838F",
    bgColor: "#E0F7FA",
    tab: 0,
  },
];

const getKategoriColorByAdi = (adi: string): string => {
  const map: Record<string, string> = {
    Çorba: "#FF6F00",
    "Ana Yemek": "#2E7D32",
    "Yardımcı Yemek": "#1565C0",
    Ekstra: "#7B1FA2",
    "Kahvaltılık Sıcak": "#C62828",
    "Standart Kahvaltılık": "#00838F",
  };
  return map[adi] ?? "#546E7A";
};

// ─── Form state ──────────────────────────────────

interface FormState {
  yemekAdi: string;
  kategoriId: number | "";
  kalori: string;
  resimUrl: string;
}

const INITIAL_FORM: FormState = {
  yemekAdi: "",
  kategoriId: "",
  kalori: "",
  resimUrl: "",
};

// ─── Snackbar tipi ───────────────────────────────

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

// ══════════════════════════════════════════════════
// Ana Bileşen
// ══════════════════════════════════════════════════

const YemekTanimlariPage = () => {
  // ─── Veri state'leri ──────────────────────────
  const [items, setItems] = useState<YemekTanimiFullDto[]>([]);
  const [kategoriler, setKategoriler] = useState<YemekKategorisiDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Sekme state'i ────────────────────────────
  const [activeTab, setActiveTab] = useState(1); // 0=Kahvaltı, 1=Akşam Yemeği

  // ─── Dialog state'leri ────────────────────────
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<YemekTanimiFullDto | null>(
    null,
  );
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  // ─── Resim upload state'i ─────────────────────
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Silme dialog state'i ─────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<YemekTanimiFullDto | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  // ─── Snackbar state'i ─────────────────────────
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  // ─── Veri çekme ───────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsRes, katRes] = await Promise.all([
        yemekTanimiService.getAll(),
        yemekTanimiService.getKategoriler(),
      ]);
      setItems(itemsRes.data);
      setKategoriler(katRes.data);
    } catch {
      setError("Yemek tanımları yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ─── Snackbar göster ──────────────────────────
  const showSnackbar = (
    message: string,
    severity: SnackbarState["severity"] = "success",
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  // ─── Resim Yükleme ────────────────────────────
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Önizleme
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploadLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folderName", "yemek-tanimlari");

      const token = getToken();
      const res = await fetch("/api/upload/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) throw new Error("Upload başarısız");
      const data: { url: string } = await res.json();
      setFormData((prev) => ({ ...prev, resimUrl: data.url }));
    } catch {
      showSnackbar("Resim yüklenemedi.", "error");
      setImagePreview(formData.resimUrl || null);
    } finally {
      setUploadLoading(false);
    }
  };

  // ─── Form Dialog Aç / Kapat ──────────────────
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData(INITIAL_FORM);
    setImagePreview(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (item: YemekTanimiFullDto) => {
    setEditingItem(item);
    setFormData({
      yemekAdi: item.yemekAdi,
      kategoriId: item.kategoriId,
      kalori: item.kalori != null ? String(item.kalori) : "",
      resimUrl: item.resimUrl ?? "",
    });
    setImagePreview(item.resimUrl ?? null);
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    if (submitting) return;
    setFormDialogOpen(false);
    setEditingItem(null);
    setFormData(INITIAL_FORM);
    setImagePreview(null);
  };

  // ─── Form Gönder (Create / Update) ───────────
  const handleSubmit = async () => {
    if (!formData.yemekAdi.trim()) {
      showSnackbar("Yemek adı zorunludur.", "warning");
      return;
    }
    if (!formData.kategoriId) {
      showSnackbar("Kategori seçimi zorunludur.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const kalori = formData.kalori.trim() ? Number(formData.kalori) : null;
      const resimUrl = formData.resimUrl.trim() || null;

      if (editingItem) {
        const payload: UpdateYemekTanimiRequest = {
          id: editingItem.id,
          yemekAdi: formData.yemekAdi.trim(),
          kategoriId: formData.kategoriId as number,
          kalori,
          resimUrl,
        };
        await yemekTanimiService.update(editingItem.id, payload);
        showSnackbar("Yemek tanımı başarıyla güncellendi.");
      } else {
        const payload: CreateYemekTanimiRequest = {
          yemekAdi: formData.yemekAdi.trim(),
          kategoriId: formData.kategoriId as number,
          kalori,
          resimUrl,
        };
        await yemekTanimiService.create(payload);
        showSnackbar("Yemek tanımı başarıyla oluşturuldu.");
      }

      handleCloseFormDialog();
      fetchItems();
    } catch {
      showSnackbar(
        editingItem
          ? "Yemek tanımı güncellenirken bir hata oluştu."
          : "Yemek tanımı oluşturulurken bir hata oluştu.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Silme Dialog Aç / Kapat ─────────────────
  const handleOpenDelete = (item: YemekTanimiFullDto) => {
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
      await yemekTanimiService.delete(deletingItem.id);
      showSnackbar("Yemek tanımı başarıyla silindi.");
      handleCloseDeleteDialog();
      fetchItems();
    } catch {
      showSnackbar("Yemek tanımı silinirken bir hata oluştu.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ─── Aktif sekmeye göre kategori listesi ─────
  const activeKategoriler = KATEGORI_CONFIG.filter((k) => k.tab === activeTab);

  // ─── Kategori Kartı ───────────────────────────
  const renderKategoriKart = (kat: KategoriConfig) => {
    const katItems = items.filter((item) => item.kategoriId === kat.id);

    return (
      <Grid item xs={12} md={6} key={kat.id}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          {/* Kart Başlığı */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2.5,
              py: 1.8,
              backgroundColor: kat.bgColor,
              borderBottom: "1px solid",
              borderColor: alpha(kat.color, 0.2),
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: kat.color,
                flexShrink: 0,
              }}
            />
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontSize: "1rem", color: kat.color }}
            >
              {kat.label}
            </Typography>
            <Chip
              label={katItems.length}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.72rem",
                fontWeight: 700,
                backgroundColor: kat.color,
                color: "#fff",
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          </Box>

          {/* Yemek Listesi */}
          {loading ? (
            <Box sx={{ px: 2, py: 1.5 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Box
                  key={i}
                  sx={{ display: "flex", alignItems: "center", py: 1, gap: 1 }}
                >
                  <Skeleton variant="circular" width={32} height={32} />
                  <Skeleton variant="text" width="60%" height={20} />
                </Box>
              ))}
            </Box>
          ) : katItems.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.disabled">
                Bu kategoride henüz yemek yok.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {katItems.map((item, idx) => (
                <Box key={item.id}>
                  <ListItem
                    disablePadding
                    sx={{
                      px: 2,
                      py: 0.5,
                      "&:hover": {
                        backgroundColor: (t) =>
                          alpha(t.palette.action.hover, 0.04),
                      },
                    }}
                    secondaryAction={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.25,
                        }}
                      >
                        <Tooltip title="Düzenle">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEdit(item)}
                            sx={{
                              color: "text.secondary",
                              p: 0.5,
                              "&:hover": { color: "primary.main" },
                            }}
                          >
                            <EditOutlined sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDelete(item)}
                            sx={{
                              color: "text.secondary",
                              p: 0.5,
                              "&:hover": { color: "error.main" },
                            }}
                          >
                            <DeleteOutlined sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        py: 0.75,
                        pr: 8,
                        minWidth: 0,
                      }}
                    >
                      {item.resimUrl ? (
                        <Box
                          component="img"
                          src={
                            item.resimUrl.startsWith("/")
                              ? item.resimUrl
                              : `/${item.resimUrl}`
                          }
                          alt={item.yemekAdi}
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <Avatar
                          variant="rounded"
                          sx={{
                            width: 36,
                            height: 36,
                            backgroundColor: alpha(kat.color, 0.12),
                            color: kat.color,
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {item.yemekAdi.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.85rem",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.yemekAdi}
                          </Typography>
                        }
                        secondary={
                          item.kalori != null ? (
                            <Box
                              component="span"
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.25,
                              }}
                            >
                              <LocalFireDepartmentOutlined
                                sx={{ fontSize: 12, color: "warning.main" }}
                              />
                              <Typography
                                component="span"
                                variant="caption"
                                color="text.secondary"
                              >
                                {item.kalori} kcal
                              </Typography>
                            </Box>
                          ) : null
                        }
                      />
                    </Box>
                  </ListItem>
                  {idx < katItems.length - 1 && (
                    <Divider sx={{ ml: 7, mr: 2 }} />
                  )}
                </Box>
              ))}
            </List>
          )}
        </Paper>
      </Grid>
    );
  };

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
              background: "linear-gradient(135deg, #FF6F00, #FFA000)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(255, 111, 0, 0.3)",
            }}
          >
            <SetMealOutlined sx={{ color: "#fff", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Yemek Tanımları
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontSize: "0.82rem" }}
            >
              {loading ? "..." : `${items.length} yemek tanımı`}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Tooltip title="Yenile">
            <IconButton
              onClick={fetchItems}
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
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineOutlined />}
            onClick={handleOpenCreate}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Yeni Yemek Ekle
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

      {/* ─── Sekmeler ─── */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
          backgroundColor: "background.paper",
          borderRadius: "12px 12px 0 0",
          px: 1,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v: number) => setActiveTab(v)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: activeTab === 0 ? 700 : 500 }}
                >
                  Kahvaltı
                </Typography>
                <Chip
                  label={
                    items.filter(
                      (i) => i.kategoriId === 5 || i.kategoriId === 6,
                    ).length
                  }
                  size="small"
                  sx={{ height: 18, fontSize: "0.68rem", fontWeight: 600 }}
                />
              </Box>
            }
            value={0}
            sx={{ textTransform: "none", minHeight: 52 }}
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: activeTab === 1 ? 700 : 500 }}
                >
                  Akşam Yemeği
                </Typography>
                <Chip
                  label={
                    items.filter((i) => i.kategoriId >= 1 && i.kategoriId <= 4)
                      .length
                  }
                  size="small"
                  sx={{ height: 18, fontSize: "0.68rem", fontWeight: 600 }}
                />
              </Box>
            }
            value={1}
            sx={{ textTransform: "none", minHeight: 52 }}
          />
        </Tabs>
      </Box>

      {/* ─── Kategori Panoları ─── */}
      <Grid container spacing={3}>
        {activeKategoriler.map((kat) => renderKategoriKart(kat))}
      </Grid>

      {/* ═══════════════════════════════════════════
          Form Dialog (Oluştur / Düzenle)
         ═══════════════════════════════════════════ */}
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
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editingItem ? "Yemek Tanımını Düzenle" : "Yeni Yemek Ekle"}
          </Typography>
          <IconButton onClick={handleCloseFormDialog} disabled={submitting}>
            <CloseOutlined />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2.5 }}
        >
          {/* Yemek Adı */}
          <TextField
            label="Yemek Adı"
            value={formData.yemekAdi}
            onChange={(e) =>
              setFormData((f) => ({ ...f, yemekAdi: e.target.value }))
            }
            fullWidth
            required
            autoFocus
            inputProps={{ maxLength: 100 }}
          />

          {/* Kategori Dropdown */}
          <FormControl fullWidth required>
            <InputLabel id="kategori-select-label">Kategori</InputLabel>
            <Select
              labelId="kategori-select-label"
              label="Kategori"
              value={
                formData.kategoriId === "" ? "" : String(formData.kategoriId)
              }
              onChange={(e: SelectChangeEvent) =>
                setFormData((f) => ({
                  ...f,
                  kategoriId: Number(e.target.value),
                }))
              }
            >
              {kategoriler.map((k) => (
                <MenuItem key={k.id} value={String(k.id)}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: getKategoriColorByAdi(k.kategoriAdi),
                        flexShrink: 0,
                      }}
                    />
                    {k.kategoriAdi}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Kalori */}
          <TextField
            label="Kalori (kcal)"
            value={formData.kalori}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || /^\d+$/.test(val)) {
                setFormData((f) => ({ ...f, kalori: val }));
              }
            }}
            fullWidth
            type="text"
            inputProps={{ inputMode: "numeric" }}
            helperText="Opsiyonel — boş bırakılabilir"
          />

          {/* Resim Yükleme */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 1, fontWeight: 500 }}
            >
              Yemek Görseli
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Önizleme */}
              {imagePreview ? (
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Önizleme"
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    objectFit: "cover",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                />
              ) : (
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: (t) => alpha(t.palette.warning.main, 0.1),
                  }}
                >
                  <ImageOutlined sx={{ color: "warning.main", fontSize: 32 }} />
                </Avatar>
              )}

              <Box>
                {/* Gizli file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={
                    uploadLoading ? (
                      <CircularProgress size={14} />
                    ) : (
                      <ImageOutlined />
                    )
                  }
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadLoading || submitting}
                  sx={{ textTransform: "none" }}
                >
                  {uploadLoading ? "Yükleniyor..." : "Görsel Seç"}
                </Button>
                {formData.resimUrl && (
                  <Button
                    size="small"
                    color="error"
                    sx={{ ml: 1, textTransform: "none" }}
                    disabled={uploadLoading || submitting}
                    onClick={() => {
                      setFormData((f) => ({ ...f, resimUrl: "" }));
                      setImagePreview(null);
                    }}
                  >
                    Kaldır
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
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
            disabled={submitting || uploadLoading}
            startIcon={
              submitting ? <CircularProgress size={18} /> : <SaveOutlined />
            }
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {editingItem ? "Güncelle" : "Kaydet"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════════════════════════════════════
          Silme Onay Dialog
         ═══════════════════════════════════════════ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Yemek Tanımını Sil</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            <strong>{deletingItem?.yemekAdi}</strong> adlı yemek tanımını silmek
            istediğinize emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            disabled={deleting}
            sx={{ textTransform: "none" }}
          >
            Vazgeç
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleting}
            startIcon={
              deleting ? <CircularProgress size={18} /> : <DeleteOutlined />
            }
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Sil
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
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: "100%", borderRadius: 2, fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default YemekTanimlariPage;
