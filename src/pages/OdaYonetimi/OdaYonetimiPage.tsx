// ──────────────────────────────────────────────
// Oda Yerleşim Yönetimi Sayfası
// Kartlarda oda bilgileri + kapasite barı + öğrenci listesi
// Odasız öğrenci havuzu + atama/çıkarma işlemleri
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  TextField,
  Skeleton,
  Alert,
  Snackbar,
  alpha,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  MeetingRoomOutlined,
  PersonRemoveOutlined,
  PersonAddAlt1Outlined,
  RefreshOutlined,
  PhoneOutlined,
} from "@mui/icons-material";
import { odaService } from "../../api/odaService";
import type { OdaDetailDto, OdasizOgrenciDto } from "../../types";

// ─── Kapasite renk yardımcısı ───────────────
const getCapacityColor = (mevcut: number, kapasite: number) => {
  const ratio = mevcut / kapasite;
  if (ratio >= 1) return "error";
  if (ratio >= 0.75) return "warning";
  return "success";
};

const OdaYonetimiPage = () => {
  // ─── State ─────────────────────────────────
  const [odalar, setOdalar] = useState<OdaDetailDto[]>([]);
  const [odasizOgrenciler, setOdasizOgrenciler] = useState<OdasizOgrenciDto[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assign dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedOdaId, setSelectedOdaId] = useState<number | null>(null);
  const [selectedOgrenci, setSelectedOgrenci] =
    useState<OdasizOgrenciDto | null>(null);
  const [assigning, setAssigning] = useState(false);

  // Remove confirm dialog
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{
    kullaniciId: number;
    ad: string;
    odaNo: string;
  } | null>(null);
  const [removing, setRemoving] = useState(false);

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
      const { data } = await odaService.getYerlesim();
      setOdalar(data.odalar);
      setOdasizOgrenciler(data.odasizOgrenciler);
    } catch {
      setError("Oda bilgileri yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Atama işlemi ──────────────────────────
  const handleOpenAssign = (odaId: number) => {
    setSelectedOdaId(odaId);
    setSelectedOgrenci(null);
    setAssignDialogOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedOdaId || !selectedOgrenci) return;
    setAssigning(true);
    try {
      await odaService.assignStudent({
        kullaniciId: selectedOgrenci.kullaniciId,
        odaId: selectedOdaId,
      });
      setSnackbar({
        open: true,
        message: "Öğrenci odaya atandı.",
        severity: "success",
      });
      setAssignDialogOpen(false);
      fetchData();
    } catch {
      setSnackbar({
        open: true,
        message: "Atama sırasında hata oluştu.",
        severity: "error",
      });
    } finally {
      setAssigning(false);
    }
  };

  // ─── Çıkarma işlemi ───────────────────────
  const handleOpenRemove = (kullaniciId: number, ad: string, odaNo: string) => {
    setRemoveTarget({ kullaniciId, ad, odaNo });
    setRemoveDialogOpen(true);
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await odaService.assignStudent({
        kullaniciId: removeTarget.kullaniciId,
        odaId: null,
      });
      setSnackbar({
        open: true,
        message: "Öğrenci odadan çıkarıldı.",
        severity: "success",
      });
      setRemoveDialogOpen(false);
      fetchData();
    } catch {
      setSnackbar({
        open: true,
        message: "Çıkarma sırasında hata oluştu.",
        severity: "error",
      });
    } finally {
      setRemoving(false);
    }
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
          <MeetingRoomOutlined sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h5" fontWeight={700}>
            Oda Yerleşim Yönetimi
          </Typography>
        </Box>
        <Tooltip title="Yenile">
          <IconButton onClick={fetchData} disabled={loading}>
            <RefreshOutlined />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Hata */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* İstatistik */}
      {!loading && !error && (
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <Chip
            label={`${odalar.length} Oda`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${odasizOgrenciler.length} Odasız Öğrenci`}
            color="warning"
            variant="outlined"
          />
          <Chip
            label={`Toplam: ${odalar.reduce((s, o) => s + o.mevcutSayi, 0)} / ${odalar.reduce((s, o) => s + o.kapasite, 0)} kişi`}
            color="info"
            variant="outlined"
          />
        </Box>
      )}

      {/* Oda Kartları */}
      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rounded" height={220} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {odalar.map((oda) => {
            const capacityColor = getCapacityColor(
              oda.mevcutSayi,
              oda.kapasite,
            );
            const isFull = oda.mevcutSayi >= oda.kapasite;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={oda.id}>
                <Card
                  sx={(theme) => ({
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    border: `1px solid ${alpha(theme.palette[capacityColor].main, 0.3)}`,
                  })}
                >
                  <CardHeader
                    title={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={700}>
                          Oda {oda.odaNo}
                        </Typography>
                        <Chip
                          label={`Kat ${oda.kat}`}
                          size="small"
                          variant="outlined"
                          color="default"
                        />
                      </Box>
                    }
                    subheader={
                      <Box sx={{ mt: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Doluluk
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {oda.mevcutSayi} / {oda.kapasite}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(
                            (oda.mevcutSayi / oda.kapasite) * 100,
                            100,
                          )}
                          color={capacityColor}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    }
                    sx={{ pb: 0 }}
                  />
                  <CardContent sx={{ flex: 1, pt: 1 }}>
                    {oda.ogrenciler.length === 0 ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: "italic", py: 1 }}
                      >
                        Bu odada öğrenci yok
                      </Typography>
                    ) : (
                      <List dense disablePadding>
                        {oda.ogrenciler.map((ogr) => (
                          <ListItem key={ogr.kullaniciId} disableGutters>
                            <ListItemText
                              primary={`${ogr.ad} ${ogr.soyad}`}
                              secondary={
                                ogr.telefon ? (
                                  <Box
                                    component="span"
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <PhoneOutlined sx={{ fontSize: 14 }} />
                                    {ogr.telefon}
                                  </Box>
                                ) : null
                              }
                            />
                            <ListItemSecondaryAction>
                              <Tooltip title="Odadan Çıkar">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    handleOpenRemove(
                                      ogr.kullaniciId,
                                      `${ogr.ad} ${ogr.soyad}`,
                                      oda.odaNo,
                                    )
                                  }
                                >
                                  <PersonRemoveOutlined fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </CardContent>
                  <Divider />
                  <Box
                    sx={{ p: 1, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      size="small"
                      startIcon={<PersonAddAlt1Outlined />}
                      onClick={() => handleOpenAssign(oda.id)}
                      disabled={isFull || odasizOgrenciler.length === 0}
                    >
                      Öğrenci Ekle
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ─── Atama Dialogu ──────────────────── */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Odaya Öğrenci Ata</DialogTitle>
        <DialogContent>
          <Autocomplete
            sx={{ mt: 1 }}
            options={odasizOgrenciler}
            getOptionLabel={(opt) => `${opt.ad} ${opt.soyad}`}
            value={selectedOgrenci}
            onChange={(_, val) => setSelectedOgrenci(val)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Öğrenci Seç"
                placeholder="Ad veya soyad yazın..."
              />
            )}
            isOptionEqualToValue={(opt, val) =>
              opt.kullaniciId === val.kullaniciId
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={!selectedOgrenci || assigning}
            startIcon={assigning ? <CircularProgress size={18} /> : undefined}
          >
            Ata
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Çıkarma Onay Dialogu ────────────── */}
      <Dialog
        open={removeDialogOpen}
        onClose={() => setRemoveDialogOpen(false)}
      >
        <DialogTitle>Öğrenciyi Odadan Çıkar</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{removeTarget?.ad}</strong> adlı öğrenciyi{" "}
            <strong>Oda {removeTarget?.odaNo}</strong>'dan çıkarmak istediğinize
            emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveDialogOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRemove}
            disabled={removing}
            startIcon={removing ? <CircularProgress size={18} /> : undefined}
          >
            Çıkar
          </Button>
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

export default OdaYonetimiPage;
