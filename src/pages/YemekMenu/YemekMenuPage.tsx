// ──────────────────────────────────────────────
// Yemek Menü Sayfası — Aylık Listeleme, CRUD, Excel Export
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo } from "react";
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
  Snackbar,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
  type SelectChangeEvent,
} from "@mui/material";
import {
  RestaurantMenuOutlined,
  AddCircleOutlineOutlined,
  RefreshOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  SaveOutlined,
  FileDownloadOutlined,
  DateRangeOutlined,
} from "@mui/icons-material";
import { yemekMenuService } from "../../api/yemekMenuService";
import type {
  YemekMenuDto,
  CreateYemekMenuRequest,
  UpdateYemekMenuRequest,
  YemekTanimiListItem,
  BulkCreateYemekMenuRequest,
  StandartKahvaltiItem,
} from "../../types";
import { useAuth } from "../../hooks/useAuth";

// ─── Öğün türü eşlemeleri ─────────────────────

const OGUN_TURLERI: Record<
  number,
  { label: string; color: "warning" | "success" | "info" }
> = {
  1: { label: "Kahvaltı", color: "warning" },
  3: { label: "Akşam Yemeği", color: "info" },
};

const getOgunLabel = (id: number) => OGUN_TURLERI[id]?.label ?? `Öğün ${id}`;
const getOgunColor = (id: number) => OGUN_TURLERI[id]?.color ?? "default";

// ─── Tarih formatlayıcı ──────────────────────

const formatDate = (dateStr: string): string => {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return d.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ─── Ay listesi ──────────────────────────────

const AY_ISIMLERI = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

// ─── Form başlangıç değerleri ────────────────

interface FormState {
  tarih: string;
  ogunTuruId: number;
  corbaId: number | null;
  anaYemekId: number | null;
  yardimciYemekId: number | null;
  ekstraId: number | null;
  kahvaltiSicak1Id: number | null;
  kahvaltiSicak2Id: number | null;
}

const INITIAL_FORM: FormState = {
  tarih: "",
  ogunTuruId: 3,
  corbaId: null,
  anaYemekId: null,
  yardimciYemekId: null,
  ekstraId: null,
  kahvaltiSicak1Id: null,
  kahvaltiSicak2Id: null,
};

// ─── Bulk (Haftalık) satır yapısı ────────────

interface BulkRowState {
  tarih: string; // "YYYY-MM-DD"
  gunAdi: string;
  corbaId: number | null;
  anaYemekId: number | null;
  yardimciYemekId: number | null;
  ekstraId: number | null;
  kahvaltiSicak1Id: number | null;
  kahvaltiSicak2Id: number | null;
}

const GUN_ISIMLERI = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
];

/** Başlangıç tarihinden itibaren 7 günlük boş satır dizisi üretir */
const buildBulkRows = (startDate: string): BulkRowState[] => {
  if (!startDate) return [];
  const base = new Date(startDate + "T00:00:00");
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return {
      tarih: `${yyyy}-${mm}-${dd}`,
      gunAdi: GUN_ISIMLERI[d.getDay()],
      corbaId: null,
      anaYemekId: null,
      yardimciYemekId: null,
      ekstraId: null,
      kahvaltiSicak1Id: null,
      kahvaltiSicak2Id: null,
    };
  });
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

const YemekMenuPage = () => {
  const { role } = useAuth();
  const now = new Date();

  // ─── Filtre state'leri ────────────────────
  const [yil, setYil] = useState(now.getFullYear());
  const [ay, setAy] = useState(now.getMonth() + 1);

  // ─── Veri state'leri ──────────────────────
  const [menuler, setMenuler] = useState<YemekMenuDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Yemek tanımları (Autocomplete) ───────
  const [yemekTanimlari, setYemekTanimlari] = useState<YemekTanimiListItem[]>(
    [],
  );

  // ─── Standart kahvaltı ürünleri ───────────
  const [standartKahvalti, setStandartKahvalti] = useState<
    StandartKahvaltiItem[]
  >([]);

  // ─── Dialog state'leri ────────────────────
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<YemekMenuDto | null>(null);
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  // ─── Silme dialog state'i ─────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<YemekMenuDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Snackbar state'i ─────────────────────
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  // ─── Excel export state ───────────────────
  const [exporting, setExporting] = useState(false);

  // ─── Bulk (Haftalık) dialog state ─────────
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkStartDate, setBulkStartDate] = useState("");
  const [bulkOgunTuruId, setBulkOgunTuruId] = useState(3);
  const [bulkRows, setBulkRows] = useState<BulkRowState[]>([]);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const isAdmin = role === "Admin" || role === "Personel";

  // ─── Veri çekme ───────────────────────────
  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await yemekMenuService.getAylikMenu({ yil, ay });
      setMenuler(response.data);
    } catch {
      setError("Yemek menüsü yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [yil, ay]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // ─── Yemek tanımlarını çek ────────────────
  useEffect(() => {
    yemekMenuService
      .getYemekTanimlari()
      .then((res) => setYemekTanimlari(res.data))
      .catch(() => {});
    yemekMenuService
      .getStandartKahvalti()
      .then((res) => setStandartKahvalti(res.data))
      .catch(() => {});
  }, []);

  /** Yemek adından ID bul (düzenleme modunda kullanılır) */
  const findYemekIdByName = useCallback(
    (name: string | null): number | null => {
      if (!name) return null;
      return yemekTanimlari.find((y) => y.yemekAdi === name)?.id ?? null;
    },
    [yemekTanimlari],
  );

  // ─── Kategori bazlı filtrelenmiş listeler ─
  const corbalar = useMemo(
    () => yemekTanimlari.filter((y) => y.kategoriId === 1),
    [yemekTanimlari],
  );
  const anaYemekler = useMemo(
    () => yemekTanimlari.filter((y) => y.kategoriId === 2),
    [yemekTanimlari],
  );
  const yardimcilar = useMemo(
    () => yemekTanimlari.filter((y) => y.kategoriId === 3),
    [yemekTanimlari],
  );
  const ekstralar = useMemo(
    () => yemekTanimlari.filter((y) => y.kategoriId === 4),
    [yemekTanimlari],
  );
  const kahvaltiliklar = useMemo(
    () => yemekTanimlari.filter((y) => y.kategoriId === 5),
    [yemekTanimlari],
  );

  // ─── Pivot: Tarihe göre gruplanmış menüler ─
  interface PivotRow {
    tarih: string;
    kahvalti: YemekMenuDto | null;
    ogle: YemekMenuDto | null;
    aksam: YemekMenuDto | null;
  }
  const pivotRows = useMemo<PivotRow[]>(() => {
    const map = new Map<
      string,
      {
        kahvalti: YemekMenuDto | null;
        ogle: YemekMenuDto | null;
        aksam: YemekMenuDto | null;
      }
    >();
    for (const m of menuler) {
      if (!map.has(m.tarih)) {
        map.set(m.tarih, { kahvalti: null, ogle: null, aksam: null });
      }
      const entry = map.get(m.tarih)!;
      if (m.ogunTuruId === 1) entry.kahvalti = m;
      else if (m.ogunTuruId === 2) entry.ogle = m;
      else if (m.ogunTuruId === 3) entry.aksam = m;
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([tarih, meals]) => ({ tarih, ...meals }));
  }, [menuler]);

  /** Kahvaltı mı? (Koşullu form alanları için) */
  const isKahvalti = formData.ogunTuruId === 1;

  // ─── Snackbar göster ──────────────────────
  const showSnackbar = (
    message: string,
    severity: SnackbarState["severity"] = "success",
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  // ─── Excel Export ─────────────────────────
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await yemekMenuService.exportExcel({ yil, ay });
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `YemekMenu_${yil}_${String(ay).padStart(2, "0")}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      showSnackbar("Excel dosyası indirildi.");
    } catch {
      showSnackbar("Excel dışa aktarımında hata oluştu.", "error");
    } finally {
      setExporting(false);
    }
  };

  // ─── Bulk Dialog Aç / Kapat ──────────────
  const handleOpenBulk = () => {
    setBulkStartDate("");
    setBulkOgunTuruId(3);
    setBulkRows([]);
    setBulkDialogOpen(true);
  };

  const handleCloseBulkDialog = () => {
    if (bulkSubmitting) return;
    setBulkDialogOpen(false);
    setBulkStartDate("");
    setBulkOgunTuruId(3);
    setBulkRows([]);
  };

  const handleBulkStartDateChange = (date: string) => {
    setBulkStartDate(date);
    setBulkRows(buildBulkRows(date));
  };

  const handleBulkRowChange = (
    index: number,
    field: keyof BulkRowState,
    value: number | null,
  ) => {
    setBulkRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const handleBulkSubmit = async () => {
    if (!bulkStartDate) {
      showSnackbar("Başlangıç tarihi seçiniz.", "warning");
      return;
    }

    const isBulkKahvalti = bulkOgunTuruId === 1;

    // En az bir satırda yemek seçilmiş olmalı
    const filledRows = bulkRows.filter(
      (r) =>
        r.corbaId !== null ||
        r.anaYemekId !== null ||
        r.yardimciYemekId !== null ||
        r.ekstraId !== null ||
        r.kahvaltiSicak1Id !== null ||
        r.kahvaltiSicak2Id !== null,
    );

    if (filledRows.length === 0) {
      showSnackbar("En az bir gün için yemek seçimi yapınız.", "warning");
      return;
    }

    setBulkSubmitting(true);
    try {
      const menuler: CreateYemekMenuRequest[] = filledRows.map((r) => ({
        tarih: r.tarih,
        ogunTuruId: bulkOgunTuruId,
        corbaId: isBulkKahvalti ? null : r.corbaId,
        anaYemekId: isBulkKahvalti ? null : r.anaYemekId,
        yardimciYemekId: isBulkKahvalti ? null : r.yardimciYemekId,
        ekstraId: isBulkKahvalti ? null : r.ekstraId,
        kahvaltiSicak1Id: isBulkKahvalti ? r.kahvaltiSicak1Id : null,
        kahvaltiSicak2Id: isBulkKahvalti ? r.kahvaltiSicak2Id : null,
      }));

      const payload: BulkCreateYemekMenuRequest = { menuler };
      const response = await yemekMenuService.bulkCreate(payload);
      showSnackbar(`${response.data} menü başarıyla oluşturuldu.`);
      handleCloseBulkDialog();
      fetchMenu();
    } catch {
      showSnackbar("Toplu menü oluşturulurken bir hata oluştu.", "error");
    } finally {
      setBulkSubmitting(false);
    }
  };

  // ─── Form Dialog Aç / Kapat ──────────────
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData(INITIAL_FORM);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (item: YemekMenuDto) => {
    setEditingItem(item);
    setFormData({
      tarih: item.tarih,
      ogunTuruId: item.ogunTuruId,
      corbaId: findYemekIdByName(item.corbaAdi),
      anaYemekId: findYemekIdByName(item.anaYemekAdi),
      yardimciYemekId: findYemekIdByName(item.yardimciYemekAdi),
      ekstraId: findYemekIdByName(item.ekstraAdi),
      kahvaltiSicak1Id: findYemekIdByName(item.kahvaltiSicak1Adi),
      kahvaltiSicak2Id: findYemekIdByName(item.kahvaltiSicak2Adi),
    });
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    if (submitting) return;
    setFormDialogOpen(false);
    setEditingItem(null);
    setFormData(INITIAL_FORM);
  };

  // ─── Form Gönder (Create / Update) ───────
  const handleSubmit = async () => {
    if (!formData.tarih) {
      showSnackbar("Tarih alanı zorunludur.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      // Gizli alanları payload'a dahil etme
      const corbaId = isKahvalti ? null : formData.corbaId;
      const anaYemekId = isKahvalti ? null : formData.anaYemekId;
      const yardimciYemekId = isKahvalti ? null : formData.yardimciYemekId;
      const ekstraId = isKahvalti ? null : formData.ekstraId;
      const kahvaltiSicak1Id = isKahvalti ? formData.kahvaltiSicak1Id : null;
      const kahvaltiSicak2Id = isKahvalti ? formData.kahvaltiSicak2Id : null;

      if (editingItem) {
        const payload: UpdateYemekMenuRequest = {
          id: editingItem.id,
          tarih: formData.tarih,
          ogunTuruId: formData.ogunTuruId,
          corbaId,
          anaYemekId,
          yardimciYemekId,
          ekstraId,
          kahvaltiSicak1Id,
          kahvaltiSicak2Id,
        };
        await yemekMenuService.update(editingItem.id, payload);
        showSnackbar("Menü başarıyla güncellendi.");
      } else {
        const payload: CreateYemekMenuRequest = {
          tarih: formData.tarih,
          ogunTuruId: formData.ogunTuruId,
          corbaId,
          anaYemekId,
          yardimciYemekId,
          ekstraId,
          kahvaltiSicak1Id,
          kahvaltiSicak2Id,
        };
        await yemekMenuService.create(payload);
        showSnackbar("Menü başarıyla oluşturuldu.");
      }

      handleCloseFormDialog();
      fetchMenu();
    } catch {
      showSnackbar(
        editingItem
          ? "Menü güncellenirken bir hata oluştu."
          : "Menü oluşturulurken bir hata oluştu.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Silme Dialog Aç / Kapat ─────────────
  const handleOpenDelete = (item: YemekMenuDto) => {
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
      await yemekMenuService.delete(deletingItem.id);
      showSnackbar("Menü başarıyla silindi.");
      handleCloseDeleteDialog();
      fetchMenu();
    } catch {
      showSnackbar("Menü silinirken bir hata oluştu.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ─── Skeleton Satırları ───────────────────
  const renderSkeletonRows = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`skeleton-${i}`}>
        {Array.from({ length: isAdmin ? 8 : 7 }).map((_, j) => (
          <TableCell key={j}>
            <Skeleton variant="text" width={j === 0 ? 100 : "70%"} />
          </TableCell>
        ))}
      </TableRow>
    ));

  // ─── Yıl seçenekleri ─────────────────────
  const yilSecenekleri = Array.from(
    { length: 5 },
    (_, i) => now.getFullYear() - 2 + i,
  );

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
              background: "linear-gradient(135deg, #10B981, #34D399)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
            }}
          >
            <RestaurantMenuOutlined sx={{ color: "#fff", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Yemek Menüsü
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontSize: "0.82rem" }}
            >
              {loading
                ? "..."
                : `${AY_ISIMLERI[ay - 1]} ${yil} — ${menuler.length} kayıt`}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          {isAdmin && (
            <>
              <Button
                variant="outlined"
                startIcon={
                  exporting ? (
                    <CircularProgress size={18} />
                  ) : (
                    <FileDownloadOutlined />
                  )
                }
                onClick={handleExportExcel}
                disabled={exporting || loading}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Excel
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<DateRangeOutlined />}
                onClick={handleOpenBulk}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Haftalık Menü
              </Button>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineOutlined />}
                onClick={handleOpenCreate}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Yeni Menü
              </Button>
            </>
          )}
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

      {/* ─── Tablo Kartı ─── */}
      <Card>
        {/* Araç çubuğu — Filtreler + Yenile */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2.5,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Yıl</InputLabel>
              <Select
                value={yil}
                label="Yıl"
                onChange={(e: SelectChangeEvent<number>) =>
                  setYil(e.target.value as number)
                }
              >
                {yilSecenekleri.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Ay</InputLabel>
              <Select
                value={ay}
                label="Ay"
                onChange={(e: SelectChangeEvent<number>) =>
                  setAy(e.target.value as number)
                }
              >
                {AY_ISIMLERI.map((isim, idx) => (
                  <MenuItem key={idx + 1} value={idx + 1}>
                    {isim}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Tooltip title="Yenile">
            <IconButton
              onClick={fetchMenu}
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
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: 700, fontSize: "0.82rem", minWidth: 120 }}
                  rowSpan={2}
                >
                  Tarih
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    textAlign: "center",
                    backgroundColor: (t) => alpha(t.palette.warning.main, 0.12),
                  }}
                  colSpan={2}
                >
                  Kahvaltı
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    textAlign: "center",
                    backgroundColor: (t) => alpha(t.palette.info.main, 0.12),
                  }}
                  colSpan={4}
                >
                  Akşam Yemeği
                </TableCell>
                {isAdmin && (
                  <TableCell
                    sx={{ fontWeight: 700, fontSize: "0.82rem" }}
                    align="center"
                    rowSpan={2}
                  >
                    İşlem
                  </TableCell>
                )}
              </TableRow>
              <TableRow>
                {/* Kahvaltı alt başlıklar */}
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.76rem",
                    backgroundColor: (t) => alpha(t.palette.warning.main, 0.06),
                  }}
                >
                  Sıcak 1
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.76rem",
                    backgroundColor: (t) => alpha(t.palette.warning.main, 0.06),
                  }}
                >
                  Sıcak 2
                </TableCell>
                {/* Akşam alt başlıklar */}
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.76rem",
                    backgroundColor: (t) => alpha(t.palette.info.main, 0.06),
                  }}
                >
                  Çorba
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.76rem",
                    backgroundColor: (t) => alpha(t.palette.info.main, 0.06),
                  }}
                >
                  Ana Yemek
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.76rem",
                    backgroundColor: (t) => alpha(t.palette.info.main, 0.06),
                  }}
                >
                  Yardımcı
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.76rem",
                    backgroundColor: (t) => alpha(t.palette.info.main, 0.06),
                  }}
                >
                  Ekstra
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                renderSkeletonRows()
              ) : pivotRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 8 : 7}
                    align="center"
                    sx={{ py: 6 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Bu ay için yemek menüsü bulunmamaktadır.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pivotRows.map((row) => {
                  const mealIds = [row.kahvalti?.id, row.aksam?.id].filter(
                    Boolean,
                  );

                  return (
                    <TableRow
                      key={row.tarih}
                      hover
                      sx={{
                        transition: "background-color 0.15s ease",
                        "&:last-child td": { border: 0 },
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, fontSize: "0.85rem" }}
                        >
                          {formatDate(row.tarih)}
                        </Typography>
                      </TableCell>
                      {/* Kahvaltı */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "0.83rem" }}
                        >
                          {row.kahvalti?.kahvaltiSicak1Adi ?? "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "0.83rem" }}
                        >
                          {row.kahvalti?.kahvaltiSicak2Adi ?? "—"}
                        </Typography>
                      </TableCell>
                      {/* Akşam */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "0.83rem" }}
                        >
                          {row.aksam?.corbaAdi ?? "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "0.83rem" }}
                        >
                          {row.aksam?.anaYemekAdi ?? "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "0.83rem" }}
                        >
                          {row.aksam?.yardimciYemekAdi ?? "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "0.83rem" }}
                        >
                          {row.aksam?.ekstraAdi ?? "—"}
                        </Typography>
                      </TableCell>
                      {isAdmin && (
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              flexWrap: "nowrap",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {[row.kahvalti, row.aksam]
                              .filter(Boolean)
                              .map((item) => (
                                <Box
                                  key={item!.id}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.25,
                                  }}
                                >
                                  <Chip
                                    label={getOgunLabel(item!.ogunTuruId)}
                                    size="small"
                                    color={
                                      getOgunColor(item!.ogunTuruId) as
                                        | "warning"
                                        | "success"
                                        | "info"
                                    }
                                    sx={{
                                      fontSize: "0.62rem",
                                      height: 20,
                                      "& .MuiChip-label": { px: 0.5 },
                                    }}
                                  />
                                  <Tooltip title="Düzenle">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenEdit(item!)}
                                      sx={{
                                        color: "text.secondary",
                                        p: 0.25,
                                        "&:hover": {
                                          color: "info.main",
                                          backgroundColor: (t) =>
                                            alpha(t.palette.info.main, 0.1),
                                        },
                                      }}
                                    >
                                      <EditOutlined sx={{ fontSize: 15 }} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Sil">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenDelete(item!)}
                                      sx={{
                                        color: "text.secondary",
                                        p: 0.25,
                                        "&:hover": {
                                          color: "error.main",
                                          backgroundColor: (t) =>
                                            alpha(t.palette.error.main, 0.1),
                                        },
                                      }}
                                    >
                                      <DeleteOutlined sx={{ fontSize: 15 }} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              ))}
                            {mealIds.length === 0 && (
                              <Typography
                                variant="caption"
                                sx={{ color: "text.disabled" }}
                              >
                                —
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ═══════════════════════════════════════════
          Yeni / Düzenle Dialog
         ═══════════════════════════════════════════ */}
      <Dialog
        open={formDialogOpen}
        onClose={handleCloseFormDialog}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
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
          {editingItem ? "Menü Düzenle" : "Yeni Menü Ekle"}
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
            <TextField
              label="Tarih"
              type="date"
              fullWidth
              required
              value={formData.tarih}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tarih: e.target.value }))
              }
              disabled={submitting}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <FormControl fullWidth required>
              <InputLabel>Öğün Türü</InputLabel>
              <Select
                value={formData.ogunTuruId}
                label="Öğün Türü"
                onChange={(e: SelectChangeEvent<number>) => {
                  const yeniOgun = e.target.value as number;
                  setFormData((prev) => ({
                    ...prev,
                    ogunTuruId: yeniOgun,
                    // Kahvaltıya geçilince öğle/akşam alanlarını sıfırla
                    ...(yeniOgun === 1 && {
                      corbaId: null,
                      anaYemekId: null,
                      yardimciYemekId: null,
                      ekstraId: null,
                    }),
                    // Öğle/Akşama geçilince kahvaltı alanlarını sıfırla
                    ...(yeniOgun !== 1 && {
                      kahvaltiSicak1Id: null,
                      kahvaltiSicak2Id: null,
                    }),
                  }));
                }}
                disabled={submitting}
              >
                <MenuItem value={1}>Kahvaltı</MenuItem>
                <MenuItem value={3}>Akşam Yemeği</MenuItem>
              </Select>
            </FormControl>

            {/* ─── Akşam alanları ─── */}
            {!isKahvalti && (
              <>
                <Autocomplete
                  options={corbalar}
                  getOptionLabel={(o) => o.yemekAdi}
                  value={
                    corbalar.find((y) => y.id === formData.corbaId) ?? null
                  }
                  onChange={(_, v) =>
                    setFormData((prev) => ({ ...prev, corbaId: v?.id ?? null }))
                  }
                  disabled={submitting}
                  renderInput={(params) => (
                    <TextField {...params} label="Çorba" fullWidth />
                  )}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  noOptionsText="Yemek bulunamadı"
                />

                <Autocomplete
                  options={anaYemekler}
                  getOptionLabel={(o) => o.yemekAdi}
                  value={
                    anaYemekler.find((y) => y.id === formData.anaYemekId) ??
                    null
                  }
                  onChange={(_, v) =>
                    setFormData((prev) => ({
                      ...prev,
                      anaYemekId: v?.id ?? null,
                    }))
                  }
                  disabled={submitting}
                  renderInput={(params) => (
                    <TextField {...params} label="Ana Yemek" fullWidth />
                  )}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  noOptionsText="Yemek bulunamadı"
                />

                <Autocomplete
                  options={yardimcilar}
                  getOptionLabel={(o) => o.yemekAdi}
                  value={
                    yardimcilar.find(
                      (y) => y.id === formData.yardimciYemekId,
                    ) ?? null
                  }
                  onChange={(_, v) =>
                    setFormData((prev) => ({
                      ...prev,
                      yardimciYemekId: v?.id ?? null,
                    }))
                  }
                  disabled={submitting}
                  renderInput={(params) => (
                    <TextField {...params} label="Yardımcı Yemek" fullWidth />
                  )}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  noOptionsText="Yemek bulunamadı"
                />
              </>
            )}

            {/* ─── Ekstra (sadece öğle/akşam) ─── */}
            {!isKahvalti && (
              <Autocomplete
                options={ekstralar}
                getOptionLabel={(o) => o.yemekAdi}
                value={
                  ekstralar.find((y) => y.id === formData.ekstraId) ?? null
                }
                onChange={(_, v) =>
                  setFormData((prev) => ({ ...prev, ekstraId: v?.id ?? null }))
                }
                disabled={submitting}
                renderInput={(params) => (
                  <TextField {...params} label="Ekstra" fullWidth />
                )}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                noOptionsText="Yemek bulunamadı"
              />
            )}

            {/* ─── Kahvaltı alanları ─── */}
            {isKahvalti && (
              <>
                <Autocomplete
                  options={kahvaltiliklar}
                  getOptionLabel={(o) => o.yemekAdi}
                  value={
                    kahvaltiliklar.find(
                      (y) => y.id === formData.kahvaltiSicak1Id,
                    ) ?? null
                  }
                  onChange={(_, v) =>
                    setFormData((prev) => ({
                      ...prev,
                      kahvaltiSicak1Id: v?.id ?? null,
                    }))
                  }
                  disabled={submitting}
                  renderInput={(params) => (
                    <TextField {...params} label="Kahvaltı Sıcak 1" fullWidth />
                  )}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  noOptionsText="Yemek bulunamadı"
                />

                <Autocomplete
                  options={kahvaltiliklar}
                  getOptionLabel={(o) => o.yemekAdi}
                  value={
                    kahvaltiliklar.find(
                      (y) => y.id === formData.kahvaltiSicak2Id,
                    ) ?? null
                  }
                  onChange={(_, v) =>
                    setFormData((prev) => ({
                      ...prev,
                      kahvaltiSicak2Id: v?.id ?? null,
                    }))
                  }
                  disabled={submitting}
                  renderInput={(params) => (
                    <TextField {...params} label="Kahvaltı Sıcak 2" fullWidth />
                  )}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  noOptionsText="Yemek bulunamadı"
                />

                {/* ─── Standart kahvaltı ürünleri (salt okunur) ─── */}
                {standartKahvalti.length > 0 && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: (t) =>
                        alpha(t.palette.warning.main, 0.08),
                      border: (t) =>
                        `1px solid ${alpha(t.palette.warning.main, 0.25)}`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: "text.secondary",
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      Standart Kahvaltı Ürünleri (her gün otomatik)
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {standartKahvalti.map((sk) => (
                        <Chip
                          key={sk.id}
                          label={sk.yemekAdi}
                          size="small"
                          variant="outlined"
                          color="warning"
                          sx={{ fontSize: "0.72rem" }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </>
            )}
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

      {/* ═══════════════════════════════════════════
          Silme Onay Dialog
         ═══════════════════════════════════════════ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Menüyü Sil</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            <strong>
              {deletingItem
                ? `${formatDate(deletingItem.tarih)} — ${getOgunLabel(deletingItem.ogunTuruId)}`
                : ""}
            </strong>{" "}
            menüsünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
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

      {/* ═══════════════════════════════════════════
          Haftalık (Toplu) Menü Dialog
         ═══════════════════════════════════════════ */}
      <Dialog
        open={bulkDialogOpen}
        onClose={handleCloseBulkDialog}
        maxWidth="lg"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
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
          Haftalık Menü Oluştur
          <IconButton
            onClick={handleCloseBulkDialog}
            size="small"
            disabled={bulkSubmitting}
          >
            <CloseOutlined />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 3,
              mt: 1,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <TextField
              label="Başlangıç Tarihi"
              type="date"
              value={bulkStartDate}
              onChange={(e) => handleBulkStartDateChange(e.target.value)}
              disabled={bulkSubmitting}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 200 }}
            />

            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Öğün Türü</InputLabel>
              <Select
                value={bulkOgunTuruId}
                label="Öğün Türü"
                onChange={(e: SelectChangeEvent<number>) => {
                  const v = e.target.value as number;
                  setBulkOgunTuruId(v);
                  // Öğün değişince mevcut satırların ilgisiz alanlarını sıfırla
                  setBulkRows((prev) =>
                    prev.map((row) => ({
                      ...row,
                      ...(v === 1 && {
                        corbaId: null,
                        anaYemekId: null,
                        yardimciYemekId: null,
                      }),
                      ...(v !== 1 && {
                        kahvaltiSicak1Id: null,
                        kahvaltiSicak2Id: null,
                      }),
                    })),
                  );
                }}
                disabled={bulkSubmitting}
              >
                <MenuItem value={1}>Kahvaltı</MenuItem>
                <MenuItem value={3}>Akşam Yemeği</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {bulkRows.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        minWidth: 130,
                      }}
                    >
                      Gün
                    </TableCell>
                    {bulkOgunTuruId !== 1 && (
                      <>
                        <TableCell
                          sx={{ fontWeight: 700, fontSize: "0.82rem" }}
                        >
                          Çorba
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 700, fontSize: "0.82rem" }}
                        >
                          Ana Yemek
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 700, fontSize: "0.82rem" }}
                        >
                          Yardımcı
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 700, fontSize: "0.82rem" }}
                        >
                          Ekstra
                        </TableCell>
                      </>
                    )}
                    {bulkOgunTuruId === 1 && (
                      <>
                        <TableCell
                          sx={{ fontWeight: 700, fontSize: "0.82rem" }}
                        >
                          K. Sıcak 1
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 700, fontSize: "0.82rem" }}
                        >
                          K. Sıcak 2
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bulkRows.map((row, idx) => (
                    <TableRow key={row.tarih}>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, fontSize: "0.85rem" }}
                        >
                          {row.gunAdi}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          {formatDate(row.tarih)}
                        </Typography>
                      </TableCell>

                      {bulkOgunTuruId !== 1 && (
                        <>
                          <TableCell sx={{ minWidth: 160 }}>
                            <Autocomplete
                              size="small"
                              options={corbalar}
                              getOptionLabel={(o) => o.yemekAdi}
                              value={
                                corbalar.find((y) => y.id === row.corbaId) ??
                                null
                              }
                              onChange={(_, v) =>
                                handleBulkRowChange(
                                  idx,
                                  "corbaId",
                                  v?.id ?? null,
                                )
                              }
                              disabled={bulkSubmitting}
                              renderInput={(params) => (
                                <TextField {...params} placeholder="Çorba" />
                              )}
                              isOptionEqualToValue={(opt, val) =>
                                opt.id === val.id
                              }
                              noOptionsText="Yemek bulunamadı"
                            />
                          </TableCell>
                          <TableCell sx={{ minWidth: 160 }}>
                            <Autocomplete
                              size="small"
                              options={anaYemekler}
                              getOptionLabel={(o) => o.yemekAdi}
                              value={
                                anaYemekler.find(
                                  (y) => y.id === row.anaYemekId,
                                ) ?? null
                              }
                              onChange={(_, v) =>
                                handleBulkRowChange(
                                  idx,
                                  "anaYemekId",
                                  v?.id ?? null,
                                )
                              }
                              disabled={bulkSubmitting}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Ana Yemek"
                                />
                              )}
                              isOptionEqualToValue={(opt, val) =>
                                opt.id === val.id
                              }
                              noOptionsText="Yemek bulunamadı"
                            />
                          </TableCell>
                          <TableCell sx={{ minWidth: 160 }}>
                            <Autocomplete
                              size="small"
                              options={yardimcilar}
                              getOptionLabel={(o) => o.yemekAdi}
                              value={
                                yardimcilar.find(
                                  (y) => y.id === row.yardimciYemekId,
                                ) ?? null
                              }
                              onChange={(_, v) =>
                                handleBulkRowChange(
                                  idx,
                                  "yardimciYemekId",
                                  v?.id ?? null,
                                )
                              }
                              disabled={bulkSubmitting}
                              renderInput={(params) => (
                                <TextField {...params} placeholder="Yardımcı" />
                              )}
                              isOptionEqualToValue={(opt, val) =>
                                opt.id === val.id
                              }
                              noOptionsText="Yemek bulunamadı"
                            />
                          </TableCell>
                        </>
                      )}

                      {bulkOgunTuruId !== 1 && (
                        <TableCell sx={{ minWidth: 160 }}>
                          <Autocomplete
                            size="small"
                            options={ekstralar}
                            getOptionLabel={(o) => o.yemekAdi}
                            value={
                              ekstralar.find((y) => y.id === row.ekstraId) ??
                              null
                            }
                            onChange={(_, v) =>
                              handleBulkRowChange(
                                idx,
                                "ekstraId",
                                v?.id ?? null,
                              )
                            }
                            disabled={bulkSubmitting}
                            renderInput={(params) => (
                              <TextField {...params} placeholder="Ekstra" />
                            )}
                            isOptionEqualToValue={(opt, val) =>
                              opt.id === val.id
                            }
                            noOptionsText="Yemek bulunamadı"
                          />
                        </TableCell>
                      )}

                      {bulkOgunTuruId === 1 && (
                        <>
                          <TableCell sx={{ minWidth: 160 }}>
                            <Autocomplete
                              size="small"
                              options={kahvaltiliklar}
                              getOptionLabel={(o) => o.yemekAdi}
                              value={
                                kahvaltiliklar.find(
                                  (y) => y.id === row.kahvaltiSicak1Id,
                                ) ?? null
                              }
                              onChange={(_, v) =>
                                handleBulkRowChange(
                                  idx,
                                  "kahvaltiSicak1Id",
                                  v?.id ?? null,
                                )
                              }
                              disabled={bulkSubmitting}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="K. Sıcak 1"
                                />
                              )}
                              isOptionEqualToValue={(opt, val) =>
                                opt.id === val.id
                              }
                              noOptionsText="Yemek bulunamadı"
                            />
                          </TableCell>
                          <TableCell sx={{ minWidth: 160 }}>
                            <Autocomplete
                              size="small"
                              options={kahvaltiliklar}
                              getOptionLabel={(o) => o.yemekAdi}
                              value={
                                kahvaltiliklar.find(
                                  (y) => y.id === row.kahvaltiSicak2Id,
                                ) ?? null
                              }
                              onChange={(_, v) =>
                                handleBulkRowChange(
                                  idx,
                                  "kahvaltiSicak2Id",
                                  v?.id ?? null,
                                )
                              }
                              disabled={bulkSubmitting}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="K. Sıcak 2"
                                />
                              )}
                              isOptionEqualToValue={(opt, val) =>
                                opt.id === val.id
                              }
                              noOptionsText="Yemek bulunamadı"
                            />
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {bulkRows.length === 0 && bulkStartDate === "" && (
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", textAlign: "center", py: 4 }}
            >
              Başlangıç tarihi seçerek 7 günlük menü oluşturabilirsiniz.
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleCloseBulkDialog}
            disabled={bulkSubmitting}
            sx={{ textTransform: "none" }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleBulkSubmit}
            disabled={bulkSubmitting || bulkRows.length === 0}
            startIcon={
              bulkSubmitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveOutlined />
              )
            }
            sx={{ textTransform: "none", fontWeight: 600, minWidth: 140 }}
          >
            {bulkSubmitting ? "Kaydediliyor..." : "Tümünü Kaydet"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════════════════════════════════════
          Snackbar Bildirim
         ═══════════════════════════════════════════ */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
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

export default YemekMenuPage;
