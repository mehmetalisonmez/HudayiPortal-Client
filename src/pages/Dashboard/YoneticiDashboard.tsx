// ──────────────────────────────────────────────
// Yönetici Dashboard — Admin & Personel görünümü
// Modüler widget yapısı: İstatistikler, Duyurular,
// Günün Menüsü, Nöbetçiler, Yaklaşan Etkinlikler
// ──────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Skeleton,
  Alert,
  Chip,
  alpha,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Tabs,
  Tab,
  IconButton,
} from "@mui/material";
import {
  PeopleOutlined,
  ReportProblemOutlined,
  CampaignOutlined,
  EventOutlined,
  CalendarTodayOutlined,
  ArrowForwardOutlined,
  RestaurantMenuOutlined,
  SecurityOutlined,
  AccessTimeOutlined,
  LocationOnOutlined,
  ChevronLeftOutlined,
  ChevronRightOutlined,
} from "@mui/icons-material";
import StatCard from "../../components/StatCard/StatCard";
import { dashboardService } from "../../api/dashboardService";
import { duyuruService } from "../../api/duyuruService";
import nobetService from "../../api/nobetService";
import { etkinlikService } from "../../api/etkinlikService";
import type { YoneticiDashboard as YoneticiDashboardType } from "../../types";
import type { DuyuruDto } from "../../types/duyuru";
import type { PersonelNobetDto } from "../../types/nobet";
import type { EtkinlikListDto } from "../../types/etkinlik";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

// Mock menü verisi — API entegrasyonu sonraya bırakıldı
const MOCK_MENU = [
  {
    tab: "Kahvaltı",
    ogeler: [
      "Menemen",
      "Beyaz Peynir",
      "Zeytin",
      "Domates",
      "Salatalık",
      "Çay",
    ],
  },
  {
    tab: "Öğle",
    ogeler: [
      "Mercimek Çorbası",
      "Tavuk Sote",
      "Pilav",
      "Mevsim Salata",
      "Ayran",
    ],
  },
  {
    tab: "Akşam",
    ogeler: ["Şehriye Çorbası", "Kuru Fasulye", "Bulgur Pilavı", "Turşu", "Su"],
  },
];

const YoneticiDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<YoneticiDashboardType | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [duyurular, setDuyurular] = useState<DuyuruDto[]>([]);
  const [duyuruLoading, setDuyuruLoading] = useState(true);

  const [nobetler, setNobetler] = useState<PersonelNobetDto[]>([]);
  const [nobetLoading, setNobetLoading] = useState(true);

  const [etkinlikler, setEtkinlikler] = useState<EtkinlikListDto[]>([]);
  const [etkinlikLoading, setEtkinlikLoading] = useState(true);

  const [menuDate, setMenuDate] = useState(new Date());
  const [menuTab, setMenuTab] = useState(0);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // "yyyy-MM-dd"
  const todayDisplay = today.toLocaleDateString("tr-TR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    // İstatistikler
    dashboardService
      .getYoneticiDashboard()
      .then((res) => setData(res.data))
      .catch(() => setStatsError("İstatistikler yüklenemedi."))
      .finally(() => setStatsLoading(false));

    // Son 3 aktif duyuru
    duyuruService
      .getAll()
      .then((res) => {
        const now = new Date();
        const aktif = res.data
          .filter(
            (d) => !d.gecerlilikTarihi || new Date(d.gecerlilikTarihi) >= now,
          )
          .slice(0, 3);
        setDuyurular(aktif);
      })
      .catch(() => setDuyurular([]))
      .finally(() => setDuyuruLoading(false));

    // Bugünün nöbetleri
    nobetService
      .getNobetler(todayStr, todayStr)
      .then((res) => setNobetler(res.data))
      .catch(() => setNobetler([]))
      .finally(() => setNobetLoading(false));

    // Yaklaşan ilk 3 etkinlik
    etkinlikService
      .getEtkinlikler({ aktif: true })
      .then((res) => {
        const upcoming = res.data
          .filter((e) => new Date(e.baslangicTarihi) >= today)
          .sort(
            (a, b) =>
              new Date(a.baslangicTarihi).getTime() -
              new Date(b.baslangicTarihi).getTime(),
          )
          .slice(0, 3);
        setEtkinlikler(upcoming);
      })
      .catch(() => setEtkinlikler([]))
      .finally(() => setEtkinlikLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      {/* ─── Hoşgeldin Başlığı ─── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Hoş geldin, {user?.name || "Yönetici"} 👋
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarTodayOutlined
            sx={{ fontSize: 15, color: "text.secondary" }}
          />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {todayDisplay}
          </Typography>
        </Box>
      </Box>

      {statsError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {statsError}
        </Alert>
      )}

      {/* ─── SATIR 1: İstatistik Kartları ─── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          {
            title: "Toplam Öğrenci",
            value: data?.toplamOgrenciSayisi ?? 0,
            icon: <PeopleOutlined />,
            gradient: "linear-gradient(135deg, #6366F1, #818CF8)",
            subtitle: "Aktif kayıtlı",
          },
          {
            title: "Bekleyen Şikâyet",
            value: data?.bekleyenSikayetSayisi ?? 0,
            icon: <ReportProblemOutlined />,
            gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)",
            subtitle: "Cevaplanmayı bekliyor",
          },
          {
            title: "Aktif Duyuru",
            value: data?.aktifDuyuruSayisi ?? 0,
            icon: <CampaignOutlined />,
            gradient: "linear-gradient(135deg, #06B6D4, #22D3EE)",
            subtitle: "Yayında",
          },
          {
            title: "Yaklaşan Etkinlik",
            value: data?.yaklasanEtkinlikSayisi ?? 0,
            icon: <EventOutlined />,
            gradient: "linear-gradient(135deg, #10B981, #34D399)",
            subtitle: "Önümüzdeki 7 gün",
          },
        ].map((card, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            {statsLoading ? (
              <Skeleton
                variant="rounded"
                height={120}
                sx={{ borderRadius: 3 }}
              />
            ) : (
              <StatCard {...card} />
            )}
          </Grid>
        ))}
      </Grid>

      {/* ─── SATIR 2: Duyurular + Günün Menüsü ─── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Sol: Güncel Duyurular */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ p: 2.5, flex: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Box
                  sx={{
                    p: 0.8,
                    borderRadius: 1.5,
                    background: (t) => alpha(t.palette.info.main, 0.12),
                    display: "flex",
                  }}
                >
                  <CampaignOutlined sx={{ color: "info.main", fontSize: 20 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, fontSize: "1rem" }}
                >
                  Güncel Duyurular
                </Typography>
              </Box>

              {duyuruLoading && (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  {[1, 2, 3].map((n) => (
                    <Skeleton
                      key={n}
                      variant="rounded"
                      height={56}
                      sx={{ borderRadius: 2 }}
                    />
                  ))}
                </Box>
              )}

              {!duyuruLoading && duyurular.length === 0 && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    py: 3,
                    gap: 1,
                    opacity: 0.6,
                  }}
                >
                  <CampaignOutlined
                    sx={{ fontSize: 36, color: "text.disabled" }}
                  />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Şu anda aktif duyuru bulunmuyor.
                  </Typography>
                </Box>
              )}

              {!duyuruLoading && duyurular.length > 0 && (
                <List disablePadding>
                  {duyurular.map((d, idx) => (
                    <Box
                      key={d.id}
                      onClick={() => navigate("/duyurular")}
                      sx={{
                        borderRadius: 1,
                        cursor: "pointer",
                        "&:hover": { bgcolor: "action.hover" },
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <ListItem disablePadding sx={{ py: 0.8 }}>
                        <ListItemAvatar sx={{ minWidth: 40 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              background: (t) =>
                                alpha(t.palette.info.main, 0.15),
                            }}
                          >
                            <CampaignOutlined
                              sx={{ fontSize: 16, color: "info.main" }}
                            />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, lineHeight: 1.4 }}
                            >
                              {d.baslik}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {d.icerik}
                            </Typography>
                          }
                        />
                        {d.hedefRolAdi && (
                          <Chip
                            label={d.hedefRolAdi}
                            size="small"
                            variant="outlined"
                            sx={{ ml: 1, fontSize: "0.68rem", height: 20 }}
                          />
                        )}
                      </ListItem>
                      {idx < duyurular.length - 1 && (
                        <Divider
                          sx={{
                            borderColor: (t) =>
                              alpha(t.palette.text.secondary, 0.07),
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
            <CardActions sx={{ px: 2.5, pb: 2 }}>
              <Button
                size="small"
                endIcon={<ArrowForwardOutlined />}
                onClick={() => navigate("/duyurular")}
                sx={{
                  "& .MuiButton-endIcon": { transition: "transform 0.2s ease" },
                  "&:hover .MuiButton-endIcon": {
                    transform: "translateX(4px)",
                  },
                }}
              >
                Tüm Duyurular
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Sağ: Günün Menüsü */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              background: (t) =>
                `linear-gradient(145deg, ${alpha(t.palette.secondary.main, 0.08)} 0%, ${alpha(t.palette.primary.main, 0.05)} 100%)`,
              border: (t) =>
                `1px solid ${alpha(t.palette.secondary.main, 0.15)}`,
            }}
          >
            <CardContent sx={{ p: 2.5, flex: 1 }}>
              {/* Başlık + Tarih Navigasyonu */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
              >
                <Box
                  sx={{
                    p: 0.8,
                    borderRadius: 1.5,
                    background: (t) => alpha(t.palette.secondary.main, 0.12),
                    display: "flex",
                  }}
                >
                  <RestaurantMenuOutlined
                    sx={{ color: "secondary.main", fontSize: 20 }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, fontSize: "1rem" }}
                >
                  Günün Menüsü
                </Typography>
                <Box
                  sx={{
                    ml: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.2,
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{ p: 0.4 }}
                    onClick={() =>
                      setMenuDate((d) => {
                        const n = new Date(d);
                        n.setDate(n.getDate() - 1);
                        return n;
                      })
                    }
                  >
                    <ChevronLeftOutlined sx={{ fontSize: 18 }} />
                  </IconButton>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      minWidth: 68,
                      textAlign: "center",
                      fontSize: "0.78rem",
                    }}
                  >
                    {menuDate.toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{ p: 0.4 }}
                    onClick={() =>
                      setMenuDate((d) => {
                        const n = new Date(d);
                        n.setDate(n.getDate() + 1);
                        return n;
                      })
                    }
                  >
                    <ChevronRightOutlined sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>

              {/* Öğün Sekmeleri */}
              <Tabs
                value={menuTab}
                onChange={(_, v: number) => setMenuTab(v)}
                sx={{
                  mb: 1.5,
                  minHeight: 34,
                  "& .MuiTab-root": {
                    minHeight: 34,
                    py: 0.5,
                    fontSize: "0.78rem",
                    minWidth: 0,
                  },
                }}
              >
                <Tab label="Kahvaltı" />
                <Tab label="Öğle" />
                <Tab label="Akşam" />
              </Tabs>

              {/* Menü Öğeleri (Mock) */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.9 }}>
                {MOCK_MENU[menuTab].ogeler.map((item, i) => (
                  <Box
                    key={i}
                    sx={{ display: "flex", alignItems: "center", gap: 1.2 }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: "linear-gradient(135deg, #6366F1, #06B6D4)",
                      }}
                    />
                    <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
            <CardActions sx={{ px: 2.5, pb: 2 }}>
              <Button
                size="small"
                endIcon={<ArrowForwardOutlined />}
                onClick={() => navigate("/yemek-menu")}
                sx={{
                  "& .MuiButton-endIcon": { transition: "transform 0.2s ease" },
                  "&:hover .MuiButton-endIcon": {
                    transform: "translateX(4px)",
                  },
                }}
              >
                Yemek Menüsü
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* ─── SATIR 3: Nöbetçiler + Yaklaşan Etkinlikler (Admin/Personel) ─── */}
      <Grid container spacing={2.5}>
        {/* Sol: Bugünün Nöbetçileri */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ p: 2.5, flex: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Box
                  sx={{
                    p: 0.8,
                    borderRadius: 1.5,
                    background: (t) => alpha(t.palette.warning.main, 0.12),
                    display: "flex",
                  }}
                >
                  <SecurityOutlined
                    sx={{ color: "warning.main", fontSize: 20 }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, fontSize: "1rem" }}
                >
                  Bugünün Nöbetçileri
                </Typography>
              </Box>

              {nobetLoading && (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}
                >
                  {[1, 2].map((n) => (
                    <Skeleton
                      key={n}
                      variant="rounded"
                      height={48}
                      sx={{ borderRadius: 2 }}
                    />
                  ))}
                </Box>
              )}

              {!nobetLoading && nobetler.length === 0 && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    py: 3,
                    gap: 1,
                    opacity: 0.6,
                  }}
                >
                  <SecurityOutlined
                    sx={{ fontSize: 36, color: "text.disabled" }}
                  />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Bugün için nöbet kaydı bulunamadı.
                  </Typography>
                </Box>
              )}

              {!nobetLoading && nobetler.length > 0 && (
                <List disablePadding>
                  {nobetler.map((n, idx) => (
                    <Box
                      key={n.id}
                      onClick={() => navigate("/nobet-yonetimi")}
                      sx={{
                        borderRadius: 1,
                        cursor: "pointer",
                        "&:hover": { bgcolor: "action.hover" },
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <ListItem disablePadding sx={{ py: 0.8 }}>
                        <ListItemAvatar sx={{ minWidth: 44 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              background:
                                "linear-gradient(135deg, #F59E0B, #FBBF24)",
                              fontSize: "0.85rem",
                              fontWeight: 700,
                            }}
                          >
                            {n.personelAdSoyad.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {n.personelAdSoyad}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              sx={{ color: "text.secondary" }}
                            >
                              {n.nobetTuru === 1
                                ? "Nöbetçi"
                                : n.nobetTuru === 2
                                  ? "Yarım Gün"
                                  : "İzinli"}
                            </Typography>
                          }
                        />
                        <Chip
                          label={
                            n.nobetTuru === 1
                              ? "Aktif"
                              : n.nobetTuru === 2
                                ? "Yarım"
                                : "İzin"
                          }
                          size="small"
                          sx={{
                            fontSize: "0.68rem",
                            height: 20,
                            background:
                              n.nobetTuru === 1
                                ? alpha("#1565c0", 0.12)
                                : n.nobetTuru === 2
                                  ? alpha("#e65100", 0.12)
                                  : alpha("#616161", 0.12),
                            color:
                              n.nobetTuru === 1
                                ? "#1565c0"
                                : n.nobetTuru === 2
                                  ? "#e65100"
                                  : "#616161",
                          }}
                        />
                      </ListItem>
                      {idx < nobetler.length - 1 && (
                        <Divider
                          sx={{
                            borderColor: (t) =>
                              alpha(t.palette.text.secondary, 0.07),
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
            <CardActions sx={{ px: 2.5, pb: 2 }}>
              <Button
                size="small"
                endIcon={<ArrowForwardOutlined />}
                onClick={() => navigate("/nobet-yonetimi")}
                sx={{
                  "& .MuiButton-endIcon": { transition: "transform 0.2s ease" },
                  "&:hover .MuiButton-endIcon": {
                    transform: "translateX(4px)",
                  },
                }}
              >
                Nöbet Yönetimi
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Sağ: Yaklaşan Etkinlikler */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ p: 2.5, flex: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Box
                  sx={{
                    p: 0.8,
                    borderRadius: 1.5,
                    background: (t) => alpha(t.palette.success.main, 0.12),
                    display: "flex",
                  }}
                >
                  <EventOutlined sx={{ color: "success.main", fontSize: 20 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, fontSize: "1rem" }}
                >
                  Yaklaşan Etkinlikler
                </Typography>
              </Box>

              {etkinlikLoading && (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}
                >
                  {[1, 2, 3].map((n) => (
                    <Skeleton
                      key={n}
                      variant="rounded"
                      height={48}
                      sx={{ borderRadius: 2 }}
                    />
                  ))}
                </Box>
              )}

              {!etkinlikLoading && etkinlikler.length === 0 && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    py: 3,
                    gap: 1,
                    opacity: 0.6,
                  }}
                >
                  <EventOutlined
                    sx={{ fontSize: 36, color: "text.disabled" }}
                  />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Yaklaşan etkinlik bulunamadı.
                  </Typography>
                </Box>
              )}

              {!etkinlikLoading && etkinlikler.length > 0 && (
                <List disablePadding>
                  {etkinlikler.map((e, idx) => {
                    const tarih = new Date(e.baslangicTarihi);
                    return (
                      <Box
                        key={e.id}
                        onClick={() => navigate("/etkinlikler")}
                        sx={{
                          borderRadius: 1,
                          cursor: "pointer",
                          "&:hover": { bgcolor: "action.hover" },
                          transition: "background-color 0.15s ease",
                        }}
                      >
                        <ListItem disablePadding sx={{ py: 0.8 }}>
                          <ListItemAvatar sx={{ minWidth: 44 }}>
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                background:
                                  "linear-gradient(135deg, #10B981, #34D399)",
                                flexDirection: "column",
                                borderRadius: 1.5,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "0.65rem",
                                  fontWeight: 700,
                                  lineHeight: 1,
                                }}
                              >
                                {tarih.getDate()}
                              </Typography>
                              <Typography
                                sx={{ fontSize: "0.55rem", lineHeight: 1 }}
                              >
                                {tarih.toLocaleDateString("tr-TR", {
                                  month: "short",
                                })}
                              </Typography>
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, lineHeight: 1.3 }}
                              >
                                {e.baslik}
                              </Typography>
                            }
                            secondary={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  mt: 0.2,
                                }}
                              >
                                <AccessTimeOutlined
                                  sx={{ fontSize: 11, color: "text.disabled" }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{ color: "text.secondary" }}
                                >
                                  {tarih.toLocaleTimeString("tr-TR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </Typography>
                                {e.ucret !== null && e.ucret > 0 && (
                                  <>
                                    <LocationOnOutlined
                                      sx={{
                                        fontSize: 11,
                                        color: "text.disabled",
                                        ml: 0.5,
                                      }}
                                    />
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "text.secondary" }}
                                    >
                                      {e.ucret} ₺
                                    </Typography>
                                  </>
                                )}
                              </Box>
                            }
                          />
                          {e.zorunluMu && (
                            <Chip
                              label="Zorunlu"
                              size="small"
                              color="error"
                              variant="outlined"
                              sx={{ fontSize: "0.65rem", height: 20 }}
                            />
                          )}
                        </ListItem>
                        {idx < etkinlikler.length - 1 && (
                          <Divider
                            sx={{
                              borderColor: (t) =>
                                alpha(t.palette.text.secondary, 0.07),
                            }}
                          />
                        )}
                      </Box>
                    );
                  })}
                </List>
              )}
            </CardContent>
            <CardActions sx={{ px: 2.5, pb: 2 }}>
              <Button
                size="small"
                endIcon={<ArrowForwardOutlined />}
                onClick={() => navigate("/etkinlikler")}
                sx={{
                  "& .MuiButton-endIcon": { transition: "transform 0.2s ease" },
                  "&:hover .MuiButton-endIcon": {
                    transform: "translateX(4px)",
                  },
                }}
              >
                Tüm Etkinlikler
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default YoneticiDashboard;
