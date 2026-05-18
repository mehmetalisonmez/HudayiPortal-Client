// ──────────────────────────────────────────────
// Etkinlik Yönetimi Sayfası — Admin / Personel
// CRUD tablosu, Katılımcı Yoklama Dialog
// ──────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  Snackbar,
  Avatar,
} from "@mui/material";
import {
  EventNoteOutlined,
  AddCircleOutlineOutlined,
  EditOutlined,
  DeleteOutlined,
  PeopleOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  HourglassEmptyOutlined,
  ImageOutlined,
} from "@mui/icons-material";
import { etkinlikService } from "../../api/etkinlikService";
import { getToken } from "../../utils/tokenHelper";
import type {
  EtkinlikListDto,
  KatilimciDto,
  CreateEtkinlikRequest,
  UpdateEtkinlikRequest,
} from "../../types";

// ─── Yardımcılar ─────────────────────────────────────────────────────────────

const toLocalInput = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const d = new Date(iso);
  // datetime-local input formatı: YYYY-MM-DDTHH:mm
  return d.toISOString().slice(0, 16);
};

const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ─── Boş Form ────────────────────────────────────────────────────────────────

interface EtkinlikForm {
  id: number | null;
  baslik: string;
  aciklama: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  sonKayitTarihi: string;
  isUcretli: boolean;
  ucret: string;
  zorunluMu: boolean;
  resimUrl: string | null;
}

const emptyForm = (): EtkinlikForm => ({
  id: null,
  baslik: "",
  aciklama: "",
  baslangicTarihi: "",
  bitisTarihi: "",
  sonKayitTarihi: "",
  isUcretli: false,
  ucret: "",
  zorunluMu: false,
  resimUrl: null,
});

// ─── Bileşen ─────────────────────────────────────────────────────────────────

const EtkinlikYonetimiPage = () => {
  // ─── Liste ───────────────────────────────────────────────
  const [etkinlikler, setEtkinlikler] = useState<EtkinlikListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── CRUD Dialog ─────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<EtkinlikForm>(emptyForm());
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ─── Resim Upload ─────────────────────────────────────────
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Silme Dialog ─────────────────────────────────────────
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── Katılımcılar Dialog ──────────────────────────────────
  const [katilimciOpen, setKatilimciOpen] = useState(false);
  const [seciliEtkinlik, setSeciliEtkinlik] = useState<EtkinlikListDto | null>(
    null,
  );
  const [katilimcilar, setKatilimcilar] = useState<KatilimciDto[]>([]);
  const [katilimciLoading, setKatilimciLoading] = useState(false);
  const [durumuGuncellemede, setDurumuGuncellemede] = useState<number | null>(
    null,
  );

  // ─── Snackbar ─────────────────────────────────────────────
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    severity: "success" | "error";
  }>({
    open: false,
    msg: "",
    severity: "success",
  });
  const showSnack = (msg: string, severity: "success" | "error" = "success") =>
    setSnack({ open: true, msg, severity });

  // ─── Veri Yükleme ─────────────────────────────────────────
  const fetchEtkinlikler = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await etkinlikService.getEtkinlikler();
      setEtkinlikler(res.data);
    } catch {
      setError("Etkinlikler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEtkinlikler();
  }, []);

  // ─── Form Helpers ─────────────────────────────────────────
  const handleFormOpen = (etkinlik?: EtkinlikListDto) => {
    if (etkinlik) {
      setForm({
        id: etkinlik.id,
        baslik: etkinlik.baslik,
        aciklama: etkinlik.aciklama ?? "",
        baslangicTarihi: toLocalInput(etkinlik.baslangicTarihi),
        bitisTarihi: toLocalInput(etkinlik.bitisTarihi),
        sonKayitTarihi: toLocalInput(etkinlik.sonKayitTarihi),
        isUcretli: etkinlik.ucret != null && etkinlik.ucret > 0,
        ucret:
          etkinlik.ucret != null && etkinlik.ucret > 0
            ? String(etkinlik.ucret)
            : "",
        zorunluMu: etkinlik.zorunluMu ?? false,
        resimUrl: etkinlik.resimUrl,
      });
      setImagePreview(etkinlik.resimUrl);
    } else {
      setForm(emptyForm());
      setImagePreview(null);
    }
    setFormError(null);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setFormError(null);
  };

  // ─── Resim Upload ─────────────────────────────────────────
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
      fd.append("folderName", "etkinlikler");

      // Doğrudan axiosInstance yerine fetch — FormData için
      const token = getToken();
      const res = await fetch("/api/upload/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) throw new Error("Upload başarısız");
      const data: { url: string } = await res.json();
      setForm((prev) => ({ ...prev, resimUrl: data.url }));
    } catch {
      showSnack("Resim yüklenemedi.", "error");
      setImagePreview(form.resimUrl);
    } finally {
      setUploadLoading(false);
    }
  };

  // ─── Kaydet ───────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.baslik.trim()) {
      setFormError("Başlık zorunludur.");
      return;
    }
    if (!form.baslangicTarihi) {
      setFormError("Başlangıç tarihi zorunludur.");
      return;
    }

    setFormSaving(true);
    setFormError(null);

    try {
      if (form.id) {
        const req: UpdateEtkinlikRequest = {
          id: form.id,
          baslik: form.baslik.trim(),
          aciklama: form.aciklama.trim() || null,
          baslangicTarihi: new Date(form.baslangicTarihi).toISOString(),
          bitisTarihi: form.bitisTarihi
            ? new Date(form.bitisTarihi).toISOString()
            : null,
          sonKayitTarihi: form.sonKayitTarihi
            ? new Date(form.sonKayitTarihi).toISOString()
            : null,
          ucret:
            form.ucret !== "" && form.isUcretli ? parseFloat(form.ucret) : null,
          zorunluMu: form.zorunluMu,
          resimUrl: form.resimUrl,
        };
        await etkinlikService.update(form.id, req);
        showSnack("Etkinlik güncellendi.");
      } else {
        const req: CreateEtkinlikRequest = {
          baslik: form.baslik.trim(),
          aciklama: form.aciklama.trim() || null,
          baslangicTarihi: new Date(form.baslangicTarihi).toISOString(),
          bitisTarihi: form.bitisTarihi
            ? new Date(form.bitisTarihi).toISOString()
            : null,
          sonKayitTarihi: form.sonKayitTarihi
            ? new Date(form.sonKayitTarihi).toISOString()
            : null,
          ucret:
            form.ucret !== "" && form.isUcretli ? parseFloat(form.ucret) : null,
          zorunluMu: form.zorunluMu,
          resimUrl: form.resimUrl,
        };
        await etkinlikService.create(req);
        showSnack("Etkinlik oluşturuldu!");
      }
      handleFormClose();
      fetchEtkinlikler();
    } catch {
      setFormError("Kaydetme sırasında bir hata oluştu.");
    } finally {
      setFormSaving(false);
    }
  };

  // ─── Silme ───────────────────────────────────────────────
  const handleDeleteConfirm = (id: number) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await etkinlikService.deleteEtkinlik(deletingId);
      showSnack("Etkinlik silindi.");
      setDeleteConfirmOpen(false);
      fetchEtkinlikler();
    } catch {
      showSnack("Silme işlemi başarısız.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── Katılımcılar ─────────────────────────────────────────
  const handleKatilimcilarAc = async (etkinlik: EtkinlikListDto) => {
    setSeciliEtkinlik(etkinlik);
    setKatilimciOpen(true);
    setKatilimciLoading(true);
    try {
      const res = await etkinlikService.getKatilimcilar(etkinlik.id);
      setKatilimcilar(res.data);
    } catch {
      showSnack("Katılımcılar yüklenemedi.", "error");
    } finally {
      setKatilimciLoading(false);
    }
  };

  const handleKatilimDurumuDegistir = async (
    katilimci: KatilimciDto,
    yeniDurum: boolean | null,
  ) => {
    setDurumuGuncellemede(katilimci.id);
    try {
      await etkinlikService.updateKatilimDurumu(katilimci.id, {
        katilimciId: katilimci.id,
        katilimDurumu: yeniDurum,
      });
      setKatilimcilar((prev) =>
        prev.map((k) =>
          k.id === katilimci.id ? { ...k, katilimDurumu: yeniDurum } : k,
        ),
      );
    } catch {
      showSnack("Durum güncellenemedi.", "error");
    } finally {
      setDurumuGuncellemede(null);
    }
  };

  // ─── Skeleton ─────────────────────────────────────────────
  const renderSkeletonRows = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`sk-${i}`}>
        {Array.from({ length: 7 }).map((_, j) => (
          <TableCell key={j}>
            <Skeleton variant="text" width={j === 0 ? 180 : "60%"} />
          </TableCell>
        ))}
      </TableRow>
    ));

  // ─── Render ───────────────────────────────────────────────
  return (
    <Box>
      {/* Başlık */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              background: "linear-gradient(135deg, #6366F1, #06B6D4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 14px rgba(99,102,241,0.32)",
            }}
          >
            <EventNoteOutlined sx={{ color: "#fff", fontSize: 26 }} />
          </Box>
          <Box>
            <Typography
              sx={{ fontWeight: 700, fontSize: "1.35rem", lineHeight: 1.25 }}
            >
              Etkinlik Yönetimi
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
              Etkinlikleri oluştur, düzenle ve katılımcı yoklaması al
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddCircleOutlineOutlined />}
          onClick={() => handleFormOpen()}
          sx={{
            background: "linear-gradient(135deg, #6366F1, #06B6D4)",
            borderRadius: 2,
            px: 2.5,
            fontWeight: 600,
            boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            "&:hover": {
              boxShadow: "0 6px 18px rgba(99,102,241,0.45)",
            },
          }}
        >
          Yeni Etkinlik
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tablo */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Etkinlik Adı</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Başlangıç</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Bitiş</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ücret</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Zorunlu</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Katılımcı
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  İşlemler
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                renderSkeletonRows()
              ) : etkinlikler.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      Henüz etkinlik oluşturulmamış.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                etkinlikler.map((et) => {
                  const doldu =
                    et.bitisTarihi && new Date(et.bitisTarihi) < new Date();
                  return (
                    <TableRow
                      key={et.id}
                      hover
                      sx={{
                        opacity: doldu ? 0.65 : 1,
                        "&:last-child td": { border: 0 },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {et.baslik}
                        </Typography>
                        {doldu && (
                          <Chip
                            label="Süresi Doldu"
                            size="small"
                            color="default"
                            sx={{ fontSize: "0.68rem", mt: 0.5 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{formatDate(et.baslangicTarihi)}</TableCell>
                      <TableCell>{formatDate(et.bitisTarihi)}</TableCell>
                      <TableCell>
                        {et.ucret === null || et.ucret === 0 ? (
                          <Chip
                            label="Ücretsiz"
                            size="small"
                            sx={{
                              bgcolor: (t) =>
                                alpha(t.palette.success.main, 0.15),
                              color: "success.main",
                            }}
                          />
                        ) : (
                          <Chip
                            label={`${et.ucret} TL`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {et.zorunluMu ? (
                          <Chip label="Zorunlu" size="small" color="error" />
                        ) : (
                          <Chip
                            label="İsteğe Bağlı"
                            size="small"
                            sx={{
                              color: "text.disabled",
                              borderColor: "divider",
                            }}
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {et.katilimciSayisi} kişi
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          justifyContent="center"
                          gap={0.5}
                        >
                          <Tooltip title="Düzenle">
                            <IconButton
                              size="small"
                              onClick={() => handleFormOpen(et)}
                              sx={{ color: "primary.main" }}
                            >
                              <EditOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Katılımcılar">
                            <IconButton
                              size="small"
                              onClick={() => handleKatilimcilarAc(et)}
                              sx={{ color: "info.main" }}
                            >
                              <PeopleOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteConfirm(et.id)}
                              sx={{ color: "error.main" }}
                            >
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ─── Create / Edit Dialog ─── */}
      <Dialog open={formOpen} onClose={handleFormClose} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.5,
                background: "linear-gradient(135deg, #6366F1, #06B6D4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EventNoteOutlined sx={{ color: "#fff", fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
              {form.id ? "Etkinliği Düzenle" : "Yeni Etkinlik"}
            </Typography>
          </Box>
          <IconButton onClick={handleFormClose} size="small">
            <CloseOutlined />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ px: 3, pt: 3, pb: 2 }}>
          <Stack spacing={2.5}>
            {/* Başlık */}
            <TextField
              label="Başlık *"
              fullWidth
              value={form.baslik}
              onChange={(e) =>
                setForm((p) => ({ ...p, baslik: e.target.value }))
              }
            />

            {/* Açıklama */}
            <TextField
              label="Açıklama"
              fullWidth
              multiline
              rows={3}
              value={form.aciklama}
              onChange={(e) =>
                setForm((p) => ({ ...p, aciklama: e.target.value }))
              }
            />

            {/* Başlangıç + Bitiş */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                label="Başlangıç Tarihi *"
                type="datetime-local"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={form.baslangicTarihi}
                onChange={(e) =>
                  setForm((p) => ({ ...p, baslangicTarihi: e.target.value }))
                }
              />
              <TextField
                label="Bitiş Tarihi"
                type="datetime-local"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={form.bitisTarihi}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bitisTarihi: e.target.value }))
                }
              />
            </Box>

            {/* Son Kayıt + Ücretli Switch */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                alignItems: "center",
              }}
            >
              <TextField
                label="Son Kayıt Tarihi"
                type="datetime-local"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={form.sonKayitTarihi}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sonKayitTarihi: e.target.value }))
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isUcretli}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        isUcretli: e.target.checked,
                        ucret: e.target.checked ? p.ucret : "",
                      }))
                    }
                    color="primary"
                  />
                }
                label="Ücretli mi?"
              />
            </Box>

            {/* Ücret — yalnızca ücretli ise */}
            {form.isUcretli && (
              <TextField
                label="Ücret (TL)"
                type="number"
                fullWidth
                slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                value={form.ucret}
                onChange={(e) =>
                  setForm((p) => ({ ...p, ucret: e.target.value }))
                }
              />
            )}

            {/* Zorunlu Katılım */}
            <FormControlLabel
              control={
                <Switch
                  checked={form.zorunluMu}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, zorunluMu: e.target.checked }))
                  }
                  color="error"
                />
              }
              label="Zorunlu Katılım"
            />

            {/* Görsel */}
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1 }}
              >
                Etkinlik Görseli
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                    }}
                  />
                ) : (
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                    }}
                  >
                    <ImageOutlined color="primary" />
                  </Avatar>
                )}
                <Box>
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
                    disabled={uploadLoading}
                  >
                    {uploadLoading ? "Yükleniyor..." : "Görsel Seç"}
                  </Button>
                  {form.resimUrl && (
                    <Button
                      size="small"
                      color="error"
                      sx={{ ml: 1 }}
                      onClick={() => {
                        setForm((p) => ({ ...p, resimUrl: null }));
                        setImagePreview(null);
                      }}
                    >
                      Kaldır
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>

            {formError && <Alert severity="error">{formError}</Alert>}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleFormClose} variant="outlined" color="inherit">
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={formSaving || uploadLoading}
            startIcon={formSaving ? <CircularProgress size={16} /> : undefined}
            sx={{ background: "linear-gradient(135deg, #6366F1, #06B6D4)" }}
          >
            {form.id ? "Güncelle" : "Oluştur"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Silme Onay Dialog ─── */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Etkinliği Sil</DialogTitle>
        <DialogContent>
          <Typography>
            Bu etkinliği silmek istediğinize emin misiniz? Bu işlem geri
            alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            variant="outlined"
            color="inherit"
          >
            İptal
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={deleteLoading}
            startIcon={
              deleteLoading ? (
                <CircularProgress size={16} />
              ) : (
                <DeleteOutlined />
              )
            }
          >
            Evet, Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Katılımcılar Dialog ─── */}
      <Dialog
        open={katilimciOpen}
        onClose={() => setKatilimciOpen(false)}
        fullWidth
        maxWidth="sm"
        scroll="paper"
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Katılımcılar
              </Typography>
              {seciliEtkinlik && (
                <Typography variant="caption" color="text.secondary">
                  {seciliEtkinlik.baslik}
                </Typography>
              )}
            </Box>
            <IconButton onClick={() => setKatilimciOpen(false)} size="small">
              <CloseOutlined />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {katilimciLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : katilimcilar.length === 0 ? (
            <Alert severity="info">
              Bu etkinliğe henüz kayıt olan öğrenci yok.
            </Alert>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Ad Soyad</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Durum
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Yoklama
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {katilimcilar.map((k) => (
                  <TableRow
                    key={k.id}
                    hover
                    sx={{ "&:last-child td": { border: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {k.ad} {k.soyad}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {k.katilimDurumu === true ? (
                        <Chip
                          icon={<CheckCircleOutlined />}
                          label="Katıldı"
                          size="small"
                          sx={{
                            bgcolor: (t) => alpha(t.palette.success.main, 0.15),
                            color: "success.main",
                          }}
                        />
                      ) : k.katilimDurumu === false ? (
                        <Chip
                          icon={<CancelOutlined />}
                          label="Katılmadı"
                          size="small"
                          sx={{
                            bgcolor: (t) => alpha(t.palette.error.main, 0.15),
                            color: "error.main",
                          }}
                        />
                      ) : (
                        <Chip
                          icon={<HourglassEmptyOutlined />}
                          label="Bekleniyor"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {durumuGuncellemede === k.id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Stack
                          direction="row"
                          justifyContent="center"
                          gap={0.5}
                        >
                          <Tooltip title="Katıldı olarak işaretle">
                            <IconButton
                              size="small"
                              disabled={k.katilimDurumu === true}
                              onClick={() =>
                                handleKatilimDurumuDegistir(k, true)
                              }
                              sx={{ color: "success.main" }}
                            >
                              <CheckCircleOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Katılmadı olarak işaretle">
                            <IconButton
                              size="small"
                              disabled={k.katilimDurumu === false}
                              onClick={() =>
                                handleKatilimDurumuDegistir(k, false)
                              }
                              sx={{ color: "error.main" }}
                            >
                              <CancelOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Bekleniyor'a sıfırla">
                            <IconButton
                              size="small"
                              disabled={k.katilimDurumu === null}
                              onClick={() =>
                                handleKatilimDurumuDegistir(k, null)
                              }
                              sx={{ color: "text.secondary" }}
                            >
                              <HourglassEmptyOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setKatilimciOpen(false)}
            variant="outlined"
            color="inherit"
          >
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EtkinlikYonetimiPage;
