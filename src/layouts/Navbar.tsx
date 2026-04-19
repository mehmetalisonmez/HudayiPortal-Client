// ──────────────────────────────────────────────
// Navbar — Üst bar (glassmorphism)
// Dinamik sayfa başlığı, arama, bildirim, kullanıcı menüsü, saat
// sidebarWidth prop ile pozisyon senkronizasyonu
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  MenuOutlined,
  LogoutOutlined,
  PersonOutlined,
  NotificationsNoneOutlined,
  SearchOutlined,
  SettingsOutlined,
  AccessTimeOutlined,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  onMenuToggle: () => void;
  /** Desktop sidebar'ın mevcut genişliği (px) */
  sidebarWidth: number;
}

const roleColors: Record<string, 'primary' | 'secondary' | 'success'> = {
  Admin: 'primary',
  Personel: 'secondary',
  'Öğrenci': 'success',
};

// Sayfa başlıkları
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/ogrenciler': 'Öğrenciler',
  '/etkinlikler': 'Etkinlikler',
  '/duyurular': 'Duyurular',
  '/izinler': 'İzin Talepleri',
  '/mali-islemler': 'Mali İşlemler',
  '/sikayetler': 'Şikâyetler',
  '/yoklama': 'Yoklama',
  '/yemek-menu': 'Yemek Menüsü',
  '/personel-nobet': 'Personel Nöbet',
  '/mesajlar': 'Mesajlar',
};

const Navbar = ({ onMenuToggle, sidebarWidth }: NavbarProps) => {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Kullanıcı menüsü
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  // Dijital saat
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Date().toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000); // Her 30 saniye güncelle
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login', { replace: true });
  };

  const displayName = user?.name || 'Kullanıcı';
  const chipColor = role ? roleColors[role] || 'primary' : 'primary';
  const pageTitle = pageTitles[location.pathname] || '';

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { lg: `calc(100% - ${sidebarWidth}px)` },
        ml: { lg: `${sidebarWidth}px` },
        transition: 'width 0.25s ease, margin-left 0.25s ease',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 }, gap: 1 }}>
        {/* Mobil menü butonu */}
        <IconButton
          id="mobile-menu-toggle"
          edge="start"
          onClick={onMenuToggle}
          sx={{ mr: 1, display: { lg: 'none' } }}
        >
          <MenuOutlined />
        </IconButton>

        {/* Sayfa başlığı */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: '1.1rem',
            display: { xs: 'none', sm: 'block' },
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          {pageTitle}
        </Typography>

        {/* Arama çubuğu (placeholder) */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            ml: 2,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            background: (t) => alpha(t.palette.text.secondary, 0.06),
            border: (t) => `1px solid ${alpha(t.palette.text.secondary, 0.08)}`,
            transition: 'all 0.3s ease',
            '&:focus-within': {
              background: (t) => alpha(t.palette.primary.main, 0.08),
              border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
              boxShadow: (t) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.08)}`,
            },
            minWidth: 200,
          }}
        >
          <SearchOutlined sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
          <InputBase
            id="navbar-search"
            placeholder="Ara..."
            sx={{
              fontSize: '0.85rem',
              color: 'text.primary',
              flex: 1,
              '& input::placeholder': {
                opacity: 0.6,
              },
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Saat göstergesi */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
            background: (t) => alpha(t.palette.text.secondary, 0.06),
          }}
        >
          <AccessTimeOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
          >
            {time}
          </Typography>
        </Box>

        {/* Bildirim ikonu (placeholder) */}
        <Tooltip title="Bildirimler">
          <IconButton
            id="notifications-button"
            sx={{
              color: 'text.secondary',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: (t) => alpha(t.palette.primary.main, 0.1),
              },
            }}
          >
            <Badge
              badgeContent={3}
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.65rem',
                  height: 18,
                  minWidth: 18,
                },
              }}
            >
              <NotificationsNoneOutlined sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Rol rozeti */}
        <Chip
          label={role || 'Kullanıcı'}
          color={chipColor}
          size="small"
          variant="outlined"
          sx={{
            display: { xs: 'none', sm: 'flex' },
            fontWeight: 600,
            fontSize: '0.72rem',
          }}
        />

        {/* Kullanıcı avatarı + dropdown menü */}
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            background: (t) => alpha(t.palette.primary.main, 0.08),
            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.15)}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: (t) => alpha(t.palette.primary.main, 0.15),
              border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.25)}`,
            },
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: 'text.primary',
              display: { xs: 'none', md: 'block' },
              fontSize: '0.85rem',
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
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: 2,
                background: (t) => t.palette.background.paper,
                border: (t) => `1px solid ${alpha(t.palette.text.secondary, 0.1)}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              },
            },
          }}
        >
          {/* Kullanıcı bilgisi */}
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {displayName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {user?.email || ''}
            </Typography>
          </Box>
          <Divider sx={{ borderColor: (t) => alpha(t.palette.text.secondary, 0.08) }} />
          <MenuItem onClick={() => setAnchorEl(null)} sx={{ py: 1.2 }}>
            <ListItemIcon>
              <PersonOutlined sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText
              primary="Profil"
              primaryTypographyProps={{ fontSize: '0.85rem' }}
            />
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)} sx={{ py: 1.2 }}>
            <ListItemIcon>
              <SettingsOutlined sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText
              primary="Ayarlar"
              primaryTypographyProps={{ fontSize: '0.85rem' }}
            />
          </MenuItem>
          <Divider sx={{ borderColor: (t) => alpha(t.palette.text.secondary, 0.08) }} />
          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.2,
              color: 'error.main',
              '&:hover': {
                backgroundColor: (t) => alpha(t.palette.error.main, 0.1),
              },
            }}
          >
            <ListItemIcon>
              <LogoutOutlined sx={{ fontSize: 20, color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText
              primary="Çıkış Yap"
              primaryTypographyProps={{ fontSize: '0.85rem' }}
            />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
