// ──────────────────────────────────────────────
// Navbar — Üst bar (glassmorphism)
// Dinamik sayfa başlığı, arama, bildirim, kullanıcı menüsü, saat
// sidebarWidth prop ile pozisyon senkronizasyonu
// ──────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Chip,
  Avatar,
  Tooltip,
  alpha,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  InputBase,
  Paper,
  List,
  ListItemButton,
  CircularProgress,
} from "@mui/material";
import {
  MenuOutlined,
  LogoutOutlined,
  PersonOutlined,
  NotificationsNoneOutlined,
  SearchOutlined,
  SettingsOutlined,
  AccessTimeOutlined,
  CampaignOutlined,
  ArrowForwardOutlined,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { duyuruService } from "../api/duyuruService";
import type { DuyuruDto } from "../types";

interface NavbarProps {
  onMenuToggle: () => void;
  /** Desktop sidebar'ın mevcut genişliği (px) */
  sidebarWidth: number;
}

const roleColors: Record<string, "primary" | "secondary" | "success"> = {
  Admin: "primary",
  Personel: "secondary",
  Öğrenci: "success",
};

// Sayfa başlıkları
const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/ogrenciler": "Öğrenciler",
  "/etkinlikler": "Etkinlikler",
  "/duyurular": "Duyurular",
  "/izinler": "İzin Talepleri",
  "/mali-islemler": "Mali İşlemler",
  "/sikayetler": "Şikâyetler",
  "/yoklamalar/gunluk": "Günlük Yoklamalar",
  "/yoklamalar/sohbet": "Sohbet Yoklamaları",
  "/yemek-menu": "Yemek Menüsü",
  "/personel-nobet": "Personel Nöbet",
  "/mesajlar": "Mesajlar",
};

// Arama için rota listesi (sidebar'daki tüm rotalar)
interface SearchRoute {
  label: string;
  path: string;
  section: string;
}

const allRoutes: SearchRoute[] = [
  { label: "Dashboard", path: "/dashboard", section: "Ana Menü" },
  { label: "Öğrenciler", path: "/ogrenciler", section: "Ana Menü" },
  { label: "Etkinlikler", path: "/etkinlikler", section: "İçerik Yönetimi" },
  {
    label: "Etkinlik Yönetimi",
    path: "/etkinlik-yonetimi",
    section: "İçerik Yönetimi",
  },
  { label: "Duyurular", path: "/duyurular", section: "İçerik Yönetimi" },
  {
    label: "Duyuru Yönetimi",
    path: "/duyuru-yonetimi",
    section: "İçerik Yönetimi",
  },
  { label: "Yemek Menüsü", path: "/yemek-menu", section: "İçerik Yönetimi" },
  {
    label: "Yemek Tanımları",
    path: "/yemek-tanimlari",
    section: "İçerik Yönetimi",
  },
  { label: "İzin Talepleri", path: "/izinler", section: "Yönetim" },
  { label: "Finans Dashboard", path: "/finans-dashboard", section: "Yönetim" },
  { label: "Mali İşlemler", path: "/mali-islemler", section: "Yönetim" },
  { label: "Şikâyetler", path: "/sikayetler", section: "Yönetim" },
  {
    label: "Günlük Yoklamalar",
    path: "/yoklamalar/gunluk",
    section: "Yoklama",
  },
  {
    label: "Sohbet Yoklamaları",
    path: "/yoklamalar/sohbet",
    section: "Yoklama",
  },
  { label: "Nöbet Yönetimi", path: "/nobet-yonetimi", section: "Yönetim" },
  { label: "Nöbetlerim", path: "/nobetlerim", section: "Yönetim" },
  { label: "Sohbet Grupları", path: "/sohbet-gruplari", section: "Yönetim" },
  { label: "Oda Yönetimi", path: "/oda-yonetimi", section: "Yönetim" },
  { label: "Mesajlar", path: "/mesajlar", section: "İletişim" },
  { label: "Rol Yönetimi", path: "/roller", section: "Sistem" },
];

const Navbar = ({ onMenuToggle, sidebarWidth }: NavbarProps) => {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Kullanıcı menüsü
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  // Dijital saat
  const [time, setTime] = useState("");

  // Arama
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchRoute[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Bildirimler (duyurular)
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const notifOpen = Boolean(notifAnchorEl);
  const [duyurular, setDuyurular] = useState<DuyuruDto[]>([]);
  const [duyuruLoading, setDuyuruLoading] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Date().toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000); // Her 30 saniye güncelle
    return () => clearInterval(interval);
  }, []);

  // Arama mantığı
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    const results = allRoutes.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.section.toLowerCase().includes(q),
    );
    setSearchResults(results);
    setSearchOpen(true);
  }, [searchQuery]);

  // Dışarı tıklayınca dropdown kapat
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSelect = (path: string) => {
    setSearchQuery("");
    setSearchOpen(false);
    navigate(path);
  };

  const handleNotifOpen = async (e: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(e.currentTarget);
    if (duyurular.length === 0) {
      setDuyuruLoading(true);
      try {
        const res = await duyuruService.getAll();
        // Son 3 aktif duyuruyu al (gecerlilikTarihi geçmemiş veya null olanlar)
        const now = new Date();
        const aktif = res.data
          .filter(
            (d) => !d.gecerlilikTarihi || new Date(d.gecerlilikTarihi) >= now,
          )
          .slice(0, 3);
        setDuyurular(aktif);
      } catch {
        setDuyurular([]);
      } finally {
        setDuyuruLoading(false);
      }
    }
  };

  const handleNotifClose = () => setNotifAnchorEl(null);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate("/login", { replace: true });
  };

  const displayName = user?.name || "Kullanıcı";
  const chipColor = role ? roleColors[role] || "primary" : "primary";
  const pageTitle = pageTitles[location.pathname] || "";

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { lg: `calc(100% - ${sidebarWidth}px)` },
        ml: { lg: `${sidebarWidth}px` },
        transition: "width 0.25s ease, margin-left 0.25s ease",
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 }, gap: 1 }}>
        {/* Mobil menü butonu */}
        <IconButton
          id="mobile-menu-toggle"
          edge="start"
          onClick={onMenuToggle}
          sx={{ mr: 1, display: { lg: "none" } }}
        >
          <MenuOutlined />
        </IconButton>

        {/* Sayfa başlığı */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: "1.1rem",
            display: { xs: "none", sm: "block" },
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          {pageTitle}
        </Typography>

        {/* Arama çubuğu — işlevsel */}
        <Box
          ref={searchRef}
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            ml: 2,
            position: "relative",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              background: (t) => alpha(t.palette.text.secondary, 0.06),
              border: (t) =>
                `1px solid ${alpha(t.palette.text.secondary, 0.08)}`,
              transition: "all 0.3s ease",
              "&:focus-within": {
                background: (t) => alpha(t.palette.primary.main, 0.08),
                border: (t) =>
                  `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
                boxShadow: (t) =>
                  `0 0 0 3px ${alpha(t.palette.primary.main, 0.08)}`,
              },
              minWidth: 220,
            }}
          >
            <SearchOutlined
              sx={{ fontSize: 18, color: "text.secondary", mr: 1 }}
            />
            <InputBase
              id="navbar-search"
              placeholder="Sayfada ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setSearchOpen(true)}
              sx={{
                fontSize: "0.85rem",
                color: "text.primary",
                flex: 1,
                "& input::placeholder": { opacity: 0.6 },
              }}
            />
          </Box>

          {/* Arama Sonuçları Dropdown */}
          {searchOpen && searchResults.length > 0 && (
            <Paper
              elevation={8}
              sx={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                right: 0,
                zIndex: 9999,
                borderRadius: 2,
                overflow: "hidden",
                border: (t) =>
                  `1px solid ${alpha(t.palette.text.secondary, 0.1)}`,
                maxHeight: 320,
                overflowY: "auto",
              }}
            >
              <List dense disablePadding>
                {searchResults.map((route) => (
                  <ListItemButton
                    key={route.path}
                    onClick={() => handleSearchSelect(route.path)}
                    sx={{
                      py: 1,
                      px: 2,
                      "&:hover": {
                        background: (t) => alpha(t.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    <SearchOutlined
                      sx={{ fontSize: 16, color: "text.disabled", mr: 1.5 }}
                    />
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, lineHeight: 1.3 }}
                      >
                        {route.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        {route.section}
                      </Typography>
                    </Box>
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          )}

          {searchOpen && searchQuery && searchResults.length === 0 && (
            <Paper
              elevation={8}
              sx={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                right: 0,
                zIndex: 9999,
                borderRadius: 2,
                px: 2,
                py: 1.5,
                border: (t) =>
                  `1px solid ${alpha(t.palette.text.secondary, 0.1)}`,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontSize: "0.82rem" }}
              >
                Sonuç bulunamadı.
              </Typography>
            </Paper>
          )}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Saat göstergesi */}
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
            background: (t) => alpha(t.palette.text.secondary, 0.06),
          }}
        >
          <AccessTimeOutlined sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              fontSize: "0.78rem",
              color: "text.secondary",
            }}
          >
            {time}
          </Typography>
        </Box>

        {/* Bildirim ikonu — son duyurular */}
        <Tooltip title="Bildirimler">
          <IconButton
            id="notifications-button"
            onClick={handleNotifOpen}
            sx={{
              color: "text.secondary",
              transition: "all 0.2s ease",
              "&:hover": {
                color: "primary.main",
                backgroundColor: (t) => alpha(t.palette.primary.main, 0.1),
              },
            }}
          >
            <Badge
              badgeContent={duyurular.length || undefined}
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.65rem",
                  height: 18,
                  minWidth: 18,
                },
              }}
            >
              <NotificationsNoneOutlined sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Bildirim Dropdown Menüsü */}
        <Menu
          anchorEl={notifAnchorEl}
          open={notifOpen}
          onClose={handleNotifClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 320,
                maxWidth: 360,
                borderRadius: 2,
                border: (t) =>
                  `1px solid ${alpha(t.palette.text.secondary, 0.1)}`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              },
            },
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CampaignOutlined sx={{ color: "primary.main", fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Son Duyurular
            </Typography>
          </Box>
          <Divider
            sx={{ borderColor: (t) => alpha(t.palette.text.secondary, 0.08) }}
          />

          {duyuruLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {!duyuruLoading && duyurular.length === 0 && (
            <Box sx={{ px: 2, py: 2 }}>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontSize: "0.82rem" }}
              >
                Aktif duyuru bulunmuyor.
              </Typography>
            </Box>
          )}

          {!duyuruLoading &&
            duyurular.map((d) => (
              <MenuItem
                key={d.id}
                onClick={() => {
                  handleNotifClose();
                  navigate("/duyurular");
                }}
                sx={{
                  py: 1.2,
                  px: 2,
                  whiteSpace: "normal",
                  alignItems: "flex-start",
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, lineHeight: 1.4, mb: 0.3 }}
                  >
                    {d.baslik}
                  </Typography>
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
                </Box>
              </MenuItem>
            ))}

          {!duyuruLoading && duyurular.length > 0 && (
            <>
              <Divider
                sx={{
                  borderColor: (t) => alpha(t.palette.text.secondary, 0.08),
                }}
              />
              <MenuItem
                onClick={() => {
                  handleNotifClose();
                  navigate("/duyurular");
                }}
                sx={{ py: 1, justifyContent: "center", color: "primary.main" }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Tüm Duyurular
                </Typography>
                <ArrowForwardOutlined sx={{ fontSize: 14, ml: 0.5 }} />
              </MenuItem>
            </>
          )}
        </Menu>

        {/* Rol rozeti */}
        <Chip
          label={role || "Kullanıcı"}
          color={chipColor}
          size="small"
          variant="outlined"
          sx={{
            display: { xs: "none", sm: "flex" },
            fontWeight: 600,
            fontSize: "0.72rem",
          }}
        />

        {/* Kullanıcı avatarı + dropdown menü */}
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            background: (t) => alpha(t.palette.primary.main, 0.08),
            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.15)}`,
            cursor: "pointer",
            transition: "all 0.2s ease",
            "&:hover": {
              background: (t) => alpha(t.palette.primary.main, 0.15),
              border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.25)}`,
            },
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #6366F1, #06B6D4)",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: "text.primary",
              display: { xs: "none", md: "block" },
              fontSize: "0.85rem",
            }}
          >
            {displayName}
          </Typography>
        </Box>

        {/* Kullanıcı Dropdown Menüsü */}
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: 2,
                background: (t) => t.palette.background.paper,
                border: (t) =>
                  `1px solid ${alpha(t.palette.text.secondary, 0.1)}`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              },
            },
          }}
        >
          {/* Kullanıcı bilgisi */}
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {displayName}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {user?.email || ""}
            </Typography>
          </Box>
          <Divider
            sx={{ borderColor: (t) => alpha(t.palette.text.secondary, 0.08) }}
          />
          <MenuItem onClick={() => setAnchorEl(null)} sx={{ py: 1.2 }}>
            <ListItemIcon>
              <PersonOutlined sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText
              primary="Profil"
              primaryTypographyProps={{ fontSize: "0.85rem" }}
            />
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)} sx={{ py: 1.2 }}>
            <ListItemIcon>
              <SettingsOutlined sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText
              primary="Ayarlar"
              primaryTypographyProps={{ fontSize: "0.85rem" }}
            />
          </MenuItem>
          <Divider
            sx={{ borderColor: (t) => alpha(t.palette.text.secondary, 0.08) }}
          />
          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.2,
              color: "error.main",
              "&:hover": {
                backgroundColor: (t) => alpha(t.palette.error.main, 0.1),
              },
            }}
          >
            <ListItemIcon>
              <LogoutOutlined sx={{ fontSize: 20, color: "error.main" }} />
            </ListItemIcon>
            <ListItemText
              primary="Çıkış Yap"
              primaryTypographyProps={{ fontSize: "0.85rem" }}
            />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
