// ----------------------------------------------
// Etkinlikler Sayfası — Sosyal Akış (Tüm Roller)
// Tab filtresi, Kart Grid, Detay Dialog, Like/Yorum/Katıl
// ----------------------------------------------

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  CardHeader,
  Chip,
  Skeleton,
  Alert,
  alpha,
  IconButton,
  Tooltip,
  Button,
  Paper,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  TextField,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  EventOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  CommentOutlined,
  PersonAddOutlined,
  PersonRemoveOutlined,
  SendOutlined,
  CloseOutlined,
  PeopleOutlined,
} from "@mui/icons-material";
import { etkinlikService } from "../../api/etkinlikService";
import type { EtkinlikListDto, EtkinlikDetayDto } from "../../types";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

/** Tarih formatlayıcı */
const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/** Tarih + Saat formatlayıcı */
const formatDateTime = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Resim URL'sini normalize et — relative /uploads/... → aynı origin */
const getImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  // Zaten mutlak URL ise olduğu gibi döndür
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // /uploads/... gibi relative path → Vite proxy veya aynı origin tarafından sunulur
  return path.startsWith("/") ? path : `/${path}`;
};

// Tab değerleri
const TAB_TUMU = 0;
const TAB_AKTIF = 1;
const TAB_GECMIS = 2;

const EtkinliklerPage = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const isAdmin = role === "Admin" || role === "Personel";

  // --- Liste Durumu ---------------------------------------
  const [etkinlikler, setEtkinlikler] = useState<EtkinlikListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Filtreler ------------------------------------------
  const [tab, setTab] = useState<number>(TAB_AKTIF);
  const [ucretsizSwitch, setUcretsizSwitch] = useState(false);

  // --- Detay Dialog ---------------------------------------
  const [detayOpen, setDetayOpen] = useState(false);
  const [detay, setDetay] = useState<EtkinlikDetayDto | null>(null);
  const [detayLoading, setDetayLoading] = useState(false);

  // --- Yorum ----------------------------------------------
  const [yeniYorum, setYeniYorum] = useState("");
  const [yorumLoading, setYorumLoading] = useState(false);

  // --- Snackbar -------------------------------------------
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

  // --- Veri Yükleme ---------------------------------------
  const fetchEtkinlikler = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const aktif =
        tab === TAB_AKTIF ? true : tab === TAB_GECMIS ? false : undefined;
      const ucretsiz = ucretsizSwitch ? true : undefined;
      const res = await etkinlikService.getEtkinlikler({ aktif, ucretsiz });
      setEtkinlikler(res.data);
    } catch {
      setError("Etkinlikler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [tab, ucretsizSwitch]);

  useEffect(() => {
    fetchEtkinlikler();
  }, [fetchEtkinlikler]);

  // --- Detay Aç -------------------------------------------
  const handleDetayAc = async (id: number) => {
    setDetayOpen(true);
    setDetay(null);
    setDetayLoading(true);
    setYeniYorum("");
    try {
      const res = await etkinlikService.getDetay(id);
      setDetay(res.data);
    } catch {
      showSnack("Detay yüklenemedi.", "error");
      setDetayOpen(false);
    } finally {
      setDetayLoading(false);
    }
  };

  const handleDetayKapat = () => {
    setDetayOpen(false);
    setDetay(null);
  };

  // --- Like Toggle ----------------------------------------
  const handleLike = async (e: React.MouseEvent, etkinlikId: number) => {
    e.stopPropagation();
    // Optimistic UI
    setEtkinlikler((prev) =>
      prev.map((et) =>
        et.id === etkinlikId
          ? {
              ...et,
              isLiked: !et.isLiked,
              begeniSayisi: et.isLiked
                ? et.begeniSayisi - 1
                : et.begeniSayisi + 1,
            }
          : et,
      ),
    );
    try {
      await etkinlikService.toggleLike(etkinlikId);
      // Detay açıksa onu da güncelle
      if (detay?.id === etkinlikId) {
        const res = await etkinlikService.getDetay(etkinlikId);
        setDetay(res.data);
      }
    } catch {
      // Geri al
      setEtkinlikler((prev) =>
        prev.map((et) =>
          et.id === etkinlikId
            ? {
                ...et,
                isLiked: !et.isLiked,
                begeniSayisi: et.isLiked
                  ? et.begeniSayisi - 1
                  : et.begeniSayisi + 1,
              }
            : et,
        ),
      );
      showSnack("Beğeni işlemi başarısız oldu.", "error");
    }
  };

  // --- Katıl / Ayrıl -------------------------------------
  const handleKatilToggle = async (
    e: React.MouseEvent,
    etkinlik: EtkinlikListDto,
  ) => {
    e.stopPropagation();
    try {
      if (etkinlik.isJoined) {
        await etkinlikService.leave({ etkinlikId: etkinlik.id });
        showSnack("Etkinlikten ayrıldınız.");
      } else {
        await etkinlikService.join({ etkinlikId: etkinlik.id });
        showSnack("Etkinliğe kayıt oldunuz!");
      }
      fetchEtkinlikler();
      if (detay?.id === etkinlik.id) {
        const res = await etkinlikService.getDetay(etkinlik.id);
        setDetay(res.data);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { errors?: string[] } } })?.response?.data
          ?.errors?.[0] ?? "İşlem sırasında bir hata oluştu.";
      showSnack(msg, "error");
    }
  };

  // --- Yorum Gönder ---------------------------------------
  const handleYorumGonder = async () => {
    if (!detay || !yeniYorum.trim()) return;
    setYorumLoading(true);
    try {
      await etkinlikService.addYorum({
        etkinlikId: detay.id,
        yorumMetni: yeniYorum.trim(),
      });
      setYeniYorum("");
      const res = await etkinlikService.getDetay(detay.id);
      setDetay(res.data);
    } catch {
      showSnack("Yorum gönderilemedi.", "error");
    } finally {
      setYorumLoading(false);
    }
  };

  // --- Kart Render ----------------------------------------
  const now = new Date();
  const suresiDoldu = (et: EtkinlikListDto) =>
    et.bitisTarihi != null && new Date(et.bitisTarihi) < now;

  const renderSkeletonCards = () =>
    Array.from({ length: 6 }).map((_, i) => (
      <Grid
        size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
        key={`sk-${i}`}
        sx={{ display: "flex" }}
      >
        <Card sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
          <Skeleton variant="rectangular" height={180} />
          <CardContent>
            <Skeleton width="70%" />
            <Skeleton width="50%" />
          </CardContent>
          <CardActions>
            <Skeleton width={80} />
          </CardActions>
        </Card>
      </Grid>
    ));

  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      {/* --- Başlık --- */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        mb={3}
        pr={isAdmin ? 18 : 0}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            background: "linear-gradient(135deg, #6366F1, #06B6D4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <EventOutlined sx={{ color: "#fff", fontSize: 22 }} />
        </Box>
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            letterSpacing={-0.5}
            lineHeight={1.2}
          >
            Etkinlikler
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            letterSpacing={0.1}
            mt={0.25}
          >
            Tüm etkinlikleri keşfet, katıl ve yorum yap
          </Typography>
        </Box>
      </Stack>

      {/* Yönet Butonu — sağ üst köşe */}
      {isAdmin && (
        <Button
          variant="contained"
          onClick={() => navigate("/etkinlik-yonetimi")}
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "linear-gradient(135deg, #6366F1, #06B6D4)",
            borderRadius: 2,
            fontWeight: 600,
            letterSpacing: 0.3,
            textTransform: "none",
            px: 2.5,
          }}
        >
          Etkinlikleri Yönet
        </Button>
      )}

      {/* --- Filtreler --- */}
      <Paper
        sx={{ px: 2, pt: 1, pb: 1.5, mb: 3, borderRadius: 3, width: "100%" }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ sm: "center" }}
          gap={2}
          flexWrap="wrap"
          sx={{ width: "100%" }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ "& .MuiTab-root": { minWidth: 80, fontSize: "0.85rem" } }}
          >
            <Tab label="Tümü" />
            <Tab label="Aktif" />
            <Tab label="Tarihi Geçmiş" />
          </Tabs>
          <FormControlLabel
            control={
              <Switch
                checked={ucretsizSwitch}
                onChange={(e) => setUcretsizSwitch(e.target.checked)}
                color="primary"
              />
            }
            label="Yalnızca Ücretsiz"
            sx={{ ml: { sm: "auto" } }}
          />
        </Stack>
      </Paper>

      {/* --- Hata --- */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* --- Kartlar --- */}
      <Grid container spacing={3} alignItems="stretch">
        {loading ? (
          renderSkeletonCards()
        ) : etkinlikler.length === 0 ? (
          <Grid size={12}>
            <Alert severity="info">Bu filtre için etkinlik bulunamadı.</Alert>
          </Grid>
        ) : (
          etkinlikler.map((et) => {
            const doldu = suresiDoldu(et);
            return (
              <Grid
                size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                key={et.id}
                sx={{ display: "flex", minWidth: 0 }}
              >
                <Card
                  onClick={() => handleDetayAc(et.id)}
                  sx={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    cursor: "pointer",
                    opacity: doldu ? 0.6 : 1,
                    borderColor: (t) => alpha(t.palette.common.white, 0.08),
                    background:
                      "linear-gradient(180deg, rgba(51,65,85,0.28) 0%, rgba(30,41,59,0.96) 22%, rgba(30,41,59,1) 100%)",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "translateY(-4px)" },
                  }}
                >
                  {/* Süresi Doldu Overlay */}
                  {doldu && (
                    <Chip
                      label="Süresi Doldu"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        zIndex: 2,
                        bgcolor: (t) => alpha(t.palette.error.main, 0.85),
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    />
                  )}

                  {/* Resim */}
                  <Box
                    sx={{
                      width: "100%",
                      height: 180,
                      overflow: "hidden",
                      flexShrink: 0,
                      bgcolor: (t) => alpha(t.palette.common.black, 0.18),
                    }}
                  >
                    {et.resimUrl ? (
                      <CardMedia
                        component="img"
                        image={getImageUrl(et.resimUrl)!}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center 22%",
                          display: "block",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: "100%",
                          background:
                            "linear-gradient(135deg, #6366F120, #06B6D420)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <EventOutlined
                          sx={{
                            fontSize: 64,
                            color: "primary.main",
                            opacity: 0.4,
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Başlık + Zorunlu Badge */}
                  <CardHeader
                    title={
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: "2.9em",
                          lineHeight: 1.45,
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {et.baslik}
                      </Typography>
                    }
                    subheader={formatDate(et.baslangicTarihi)}
                    action={
                      et.zorunluMu ? (
                        <Chip
                          label="Zorunlu Katılım"
                          color="error"
                          size="small"
                          sx={{ fontWeight: 700, fontSize: "0.7rem", mt: 0.5 }}
                        />
                      ) : null
                    }
                    sx={{
                      pb: 0.5,
                      minHeight: 92,
                      alignItems: "flex-start",
                      "& .MuiCardHeader-content": {
                        minWidth: 0,
                        overflow: "hidden",
                      },
                      "& .MuiCardHeader-action": {
                        m: 0,
                        ml: 1,
                        alignSelf: "flex-start",
                      },
                    }}
                  />

                  <CardContent
                    sx={{
                      flexGrow: 1,
                      pt: 0.5,
                      pb: 1.5,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    {/* Ücret */}
                    {et.ucret === null || et.ucret === 0 ? (
                      <Chip
                        label="Ücretsiz"
                        size="small"
                        sx={{
                          width: "fit-content",
                          alignSelf: "flex-start",
                          bgcolor: (t) => alpha(t.palette.success.main, 0.15),
                          color: "success.main",
                          fontWeight: 700,
                        }}
                      />
                    ) : (
                      <Chip
                        label={`${et.ucret} TL`}
                        size="small"
                        variant="outlined"
                        sx={{
                          width: "fit-content",
                          alignSelf: "flex-start",
                          fontWeight: 700,
                        }}
                      />
                    )}

                    {/* Kısa Açıklama */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "2.8em",
                        lineHeight: 1.4,
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {et.aciklama ?? "Açıklama yok."}
                    </Typography>
                  </CardContent>

                  {/* Sosyal Aksiyonlar */}
                  <CardActions
                    sx={{
                      px: 2,
                      pb: 2,
                      pt: 1.25,
                      mt: "auto",
                      justifyContent: "space-between",
                      borderTop: "1px solid",
                      borderColor: (t) => alpha(t.palette.common.white, 0.08),
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      {/* Like */}
                      <Tooltip title={et.isLiked ? "Beğeniyi Kaldır" : "Beğen"}>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                          onClick={(e) => handleLike(e, et.id)}
                          sx={{ cursor: "pointer" }}
                        >
                          <IconButton
                            size="small"
                            disableRipple
                            sx={{
                              color: et.isLiked
                                ? "error.main"
                                : "text.secondary",
                              p: 0,
                            }}
                          >
                            {et.isLiked ? (
                              <FavoriteOutlined fontSize="small" />
                            ) : (
                              <FavoriteBorderOutlined fontSize="small" />
                            )}
                          </IconButton>
                          <Typography variant="body2" color="text.secondary">
                            {et.begeniSayisi}
                          </Typography>
                        </Stack>
                      </Tooltip>

                      {/* Yorum — tıklayınca detay açılır */}
                      <Tooltip title="Yorumları gör">
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDetayAc(et.id);
                          }}
                          sx={{ cursor: "pointer" }}
                        >
                          <CommentOutlined
                            fontSize="small"
                            sx={{ color: "text.secondary" }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {et.yorumSayisi}
                          </Typography>
                        </Stack>
                      </Tooltip>
                    </Stack>

                    {/* Katıl / Ayrıl */}
                    {!doldu && (
                      <Button
                        size="small"
                        variant={et.isJoined ? "outlined" : "contained"}
                        color={et.isJoined ? "inherit" : "primary"}
                        startIcon={
                          et.isJoined ? (
                            <PersonRemoveOutlined />
                          ) : (
                            <PersonAddOutlined />
                          )
                        }
                        onClick={(e) => handleKatilToggle(e, et)}
                        sx={{ borderRadius: 2, px: 1.5, fontSize: "0.75rem" }}
                      >
                        {et.isJoined ? "Ayrıl" : "Katıl"}
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

      {/* --- Detay Dialog --- */}
      <Dialog
        open={detayOpen}
        onClose={handleDetayKapat}
        fullWidth
        maxWidth="md"
        scroll="paper"
        PaperProps={{
          sx: {
            overflow: "hidden",
            borderRadius: 3,
            border: "1px solid",
            borderColor: (t) => alpha(t.palette.common.white, 0.08),
            backgroundImage:
              "linear-gradient(180deg, rgba(51,65,85,0.18) 0%, rgba(30,41,59,1) 16%, rgba(30,41,59,1) 100%)",
          },
        }}
      >
        {detayLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
            }}
          >
            <CircularProgress />
          </Box>
        ) : detay ? (
          <>
            {/* Resim */}
            {detay.resimUrl ? (
              <Box
                sx={{
                  position: "relative",
                  minHeight: { xs: 220, sm: 280 },
                  maxHeight: 360,
                  overflow: "hidden",
                  bgcolor: (t) => alpha(t.palette.common.black, 0.22),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderBottom: "1px solid",
                  borderColor: (t) => alpha(t.palette.common.white, 0.08),
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(circle at top, rgba(99,102,241,0.16), transparent 52%), linear-gradient(180deg, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0.08) 100%)",
                  }}
                />
                <CardMedia
                  component="img"
                  image={getImageUrl(detay.resimUrl)!}
                  alt={detay.baslik}
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    width: "100%",
                    height: "100%",
                    maxHeight: { xs: 220, sm: 320 },
                    objectFit: "contain",
                    objectPosition: "center center",
                    p: { xs: 1.5, sm: 2 },
                  }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  minHeight: { xs: 220, sm: 280 },
                  background: "linear-gradient(135deg, #6366F120, #06B6D420)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderBottom: "1px solid",
                  borderColor: (t) => alpha(t.palette.common.white, 0.08),
                }}
              >
                <EventOutlined
                  sx={{ fontSize: 72, color: "primary.main", opacity: 0.3 }}
                />
              </Box>
            )}

            <DialogTitle
              sx={{
                position: "relative",
                pr: 6,
                pb: 1.5,
                borderBottom: "1px solid",
                borderColor: (t) => alpha(t.palette.common.white, 0.08),
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                {detay.baslik}
              </Typography>
              {detay.zorunluMu && (
                <Chip
                  label="Zorunlu Katılım"
                  color="error"
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              )}
              <IconButton
                onClick={handleDetayKapat}
                size="small"
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseOutlined />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
              {/* Açıklama */}
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
                sx={{ textTransform: "uppercase", letterSpacing: 0.8 }}
              >
                Açıklama
              </Typography>
              <Typography
                variant="body1"
                color="text.primary"
                paragraph
                sx={{ lineHeight: 1.75, mb: 2.5 }}
              >
                {detay.aciklama ?? "Açıklama yok."}
              </Typography>

              {/* Etkinlik Detayları — 2 kolonlu kompakt grid */}
              <Box
                sx={{
                  bgcolor: "background.default",
                  borderRadius: 2,
                  p: { xs: 1.75, sm: 2.25 },
                  mb: 3,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      fontWeight={600}
                    >
                      Başlangıç
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatDateTime(detay.baslangicTarihi)}
                    </Typography>
                  </Grid>

                  {detay.bitisTarihi && (
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        fontWeight={600}
                      >
                        Bitiş
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formatDateTime(detay.bitisTarihi)}
                      </Typography>
                    </Grid>
                  )}

                  {detay.sonKayitTarihi && (
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        fontWeight={600}
                      >
                        Son Kayıt
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formatDateTime(detay.sonKayitTarihi)}
                      </Typography>
                    </Grid>
                  )}

                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      fontWeight={600}
                    >
                      Ücret
                    </Typography>
                    {detay.ucret === null || detay.ucret === 0 ? (
                      <Chip
                        label="Ücretsiz"
                        size="small"
                        sx={{
                          width: "fit-content",
                          bgcolor: (t) => alpha(t.palette.success.main, 0.15),
                          color: "success.main",
                          fontWeight: 700,
                        }}
                      />
                    ) : (
                      <Typography variant="body2" fontWeight={500}>
                        {detay.ucret} TL
                      </Typography>
                    )}
                  </Grid>

                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      fontWeight={600}
                    >
                      Katılımcı Sayısı
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <PeopleOutlined fontSize="small" color="primary" />
                      <Typography variant="body2" fontWeight={500}>
                        {detay.katilimciSayisi} kişi
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Yorumlar */}
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Yorumlar ({detay.yorumlar.length})
              </Typography>

              {detay.yorumlar.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Henüz yorum yapılmamış. İlk yorumu sen yap!
                </Typography>
              ) : (
                <Stack spacing={1.5} mt={1} mb={3}>
                  {detay.yorumlar.map((y) => (
                    <Paper
                      key={y.id}
                      variant="outlined"
                      sx={{ px: 2, py: 1.5, borderRadius: 2 }}
                    >
                      <Typography variant="body2">{y.yorumMetni}</Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: "block" }}
                      >
                        {y.kullaniciAdSoyad} • {formatDate(y.olusturulmaTarihi)}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              )}

              {/* Yeni Yorum */}
              <Stack direction="row" gap={1} mt={3} alignItems="center">
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Yorum yaz..."
                  value={yeniYorum}
                  onChange={(e) => setYeniYorum(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleYorumGonder()
                  }
                  disabled={yorumLoading}
                />
                <IconButton
                  color="primary"
                  onClick={handleYorumGonder}
                  disabled={!yeniYorum.trim() || yorumLoading}
                >
                  {yorumLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <SendOutlined />
                  )}
                </IconButton>
              </Stack>
            </DialogContent>

            <DialogActions
              sx={{
                px: { xs: 2, sm: 3 },
                py: 2,
                gap: 1.25,
                flexWrap: "wrap",
                borderTop: "1px solid",
                borderColor: (t) => alpha(t.palette.common.white, 0.08),
              }}
            >
              {/* Like & Yorum sayıları */}
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ flexGrow: 1, minWidth: 0 }}
              >
                <Tooltip title={detay.isLiked ? "Beğeniyi Kaldır" : "Beğen"}>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    onClick={(e) => handleLike(e, detay.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <IconButton
                      size="small"
                      disableRipple
                      sx={{
                        color: detay.isLiked ? "error.main" : "text.secondary",
                        p: 0,
                      }}
                    >
                      {detay.isLiked ? (
                        <FavoriteOutlined />
                      ) : (
                        <FavoriteBorderOutlined />
                      )}
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                      {detay.begeniSayisi}
                    </Typography>
                  </Stack>
                </Tooltip>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <CommentOutlined
                    fontSize="small"
                    sx={{ color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {detay.yorumSayisi}
                  </Typography>
                </Stack>
              </Stack>

              <Button
                onClick={handleDetayKapat}
                variant="outlined"
                color="inherit"
              >
                Kapat
              </Button>
              {suresiDoldu(detay) ? null : (
                <Button
                  variant={detay.isJoined ? "outlined" : "contained"}
                  color={detay.isJoined ? "inherit" : "primary"}
                  startIcon={
                    detay.isJoined ? (
                      <PersonRemoveOutlined />
                    ) : (
                      <PersonAddOutlined />
                    )
                  }
                  onClick={(e) => handleKatilToggle(e, detay)}
                  sx={{
                    px: 2,
                    background: detay.isJoined
                      ? undefined
                      : "linear-gradient(135deg, #6366F1, #06B6D4)",
                  }}
                >
                  {detay.isJoined ? "Etkinlikten Ayrıl" : "Etkinliğe Katıl"}
                </Button>
              )}
            </DialogActions>
          </>
        ) : null}
      </Dialog>

      {/* --- Snackbar --- */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          variant="filled"
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EtkinliklerPage;
