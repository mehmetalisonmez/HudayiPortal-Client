// ──────────────────────────────────────────────
// Sidebar — Sol navigasyon menüsü
// Desktop: Collapsible (tam genişlik ↔ ikon modu)
// Mobil: Temporary Drawer (aç/kapa)
// Bölüm başlıkları, rol bazlı filtreleme, glow efekti
// ──────────────────────────────────────────────

import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Tooltip,
  alpha,
  IconButton,
} from '@mui/material';
import {
  DashboardOutlined,
  PeopleOutlined,
  EventOutlined,
  CampaignOutlined,
  EventBusyOutlined,
  AccountBalanceWalletOutlined,
  ReportProblemOutlined,
  FactCheckOutlined,
  RestaurantMenuOutlined,
  SecurityOutlined,
  ChatOutlined,
  SchoolOutlined,
  LogoutOutlined,
  ChevronLeftOutlined,
  ChevronRightOutlined,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

/** Sidebar tam genişliği */
export const SIDEBAR_WIDTH = 260;
/** Sidebar daraltılmış (ikon) genişliği */
export const SIDEBAR_COLLAPSED_WIDTH = 72;

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  /** Desktop'ta sidebar açık mı? */
  desktopOpen: boolean;
  /** Desktop toggle callback */
  onDesktopToggle: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[]; // Boşsa herkese açık
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'ANA MENÜ',
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: <DashboardOutlined />,
      },
      {
        label: 'Öğrenciler',
        path: '/ogrenciler',
        icon: <PeopleOutlined />,
        roles: ['Admin', 'Personel'],
      },
    ],
  },
  {
    title: 'İÇERİK YÖNETİMİ',
    items: [
      {
        label: 'Etkinlikler',
        path: '/etkinlikler',
        icon: <EventOutlined />,
      },
      {
        label: 'Duyurular',
        path: '/duyurular',
        icon: <CampaignOutlined />,
      },
      {
        label: 'Yemek Menüsü',
        path: '/yemek-menu',
        icon: <RestaurantMenuOutlined />,
      },
    ],
  },
  {
    title: 'YÖNETİM',
    items: [
      {
        label: 'İzin Talepleri',
        path: '/izinler',
        icon: <EventBusyOutlined />,
      },
      {
        label: 'Mali İşlemler',
        path: '/mali-islemler',
        icon: <AccountBalanceWalletOutlined />,
        roles: ['Admin', 'Personel'],
      },
      {
        label: 'Şikâyetler',
        path: '/sikayetler',
        icon: <ReportProblemOutlined />,
      },
      {
        label: 'Yoklama',
        path: '/yoklama',
        icon: <FactCheckOutlined />,
        roles: ['Admin', 'Personel'],
      },
      {
        label: 'Personel Nöbet',
        path: '/personel-nobet',
        icon: <SecurityOutlined />,
        roles: ['Admin', 'Personel'],
      },
    ],
  },
  {
    title: 'İLETİŞİM',
    items: [
      {
        label: 'Mesajlar',
        path: '/mesajlar',
        icon: <ChatOutlined />,
      },
    ],
  },
];

const Sidebar = ({ mobileOpen, onMobileClose, desktopOpen, onDesktopToggle }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Bölüm içindeki menü öğelerini kullanıcının rolüne göre filtrele
  const getVisibleItems = (items: NavItem[]) =>
    items.filter((item) => !item.roles || (role && item.roles.includes(role)));

  const displayName = user?.name || 'Kullanıcı';
  const displayEmail = user?.email || '';

  /** Geçiş süresi (ms) */
  const transitionDuration = '0.25s';

  /** Desktop sidebar'ın mevcut genişliği */
  const currentWidth = desktopOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  // ────────────────────────────────────────
  // Drawer İç İçerik
  // ────────────────────────────────────────
  const drawerContent = (collapsed: boolean) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* ─── Logo / Başlık ─── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : 1.5,
          px: collapsed ? 0 : 2.5,
          py: 2.5,
          minHeight: 64,
          justifyContent: collapsed ? 'center' : 'flex-start',
          transition: `all ${transitionDuration} ease`,
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            animation: 'pulse 4s ease-in-out infinite',
          }}
        >
          <SchoolOutlined sx={{ fontSize: 22, color: '#fff' }} />
        </Box>
        {!collapsed && (
          <Box sx={{ animation: 'fadeIn 0.2s ease-out', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Hüdayi
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
              Yurt Yönetim Sistemi
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: (t) => alpha(t.palette.text.secondary, 0.08) }} />

      {/* ─── Navigasyon Menüsü ─── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          py: 1,
          // Özel scrollbar
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: (t) => alpha(t.palette.text.secondary, 0.15),
            borderRadius: 2,
          },
        }}
      >
        {navSections.map((section) => {
          const visibleItems = getVisibleItems(section.items);
          if (visibleItems.length === 0) return null;

          return (
            <Box key={section.title} sx={{ mb: 0.5 }}>
              {/* Bölüm başlığı — collapsed modda gizle */}
              {!collapsed && (
                <Typography
                  variant="overline"
                  sx={{
                    px: 2.5,
                    pt: 2,
                    pb: 0.5,
                    display: 'block',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: 'text.secondary',
                    letterSpacing: '0.1em',
                    opacity: 0.7,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {section.title}
                </Typography>
              )}

              {/* Collapsed modda bölüm ayırıcı (ince çizgi) */}
              {collapsed && (
                <Divider
                  sx={{
                    mx: 1.5,
                    my: 1,
                    borderColor: (t) => alpha(t.palette.text.secondary, 0.08),
                  }}
                />
              )}

              <List sx={{ px: collapsed ? 0.5 : 1, py: 0 }}>
                {visibleItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Tooltip
                      key={item.path}
                      title={collapsed ? item.label : ''}
                      placement="right"
                      arrow
                    >
                      <ListItemButton
                        selected={isActive}
                        onClick={() => {
                          navigate(item.path);
                          onMobileClose();
                        }}
                        sx={{
                          mb: 0.3,
                          position: 'relative',
                          transition: `all 0.2s ease`,
                          justifyContent: collapsed ? 'center' : 'flex-start',
                          px: collapsed ? 1 : 2,
                          minHeight: 44,
                          '& .MuiListItemIcon-root': {
                            color: isActive ? 'primary.main' : 'text.secondary',
                            minWidth: collapsed ? 0 : 40,
                            mr: collapsed ? 0 : 1,
                            transition: 'color 0.2s ease',
                          },
                          '&:hover .MuiListItemIcon-root': {
                            color: 'primary.light',
                          },
                          // Aktif öğe glow efekti
                          ...(isActive && {
                            animation: 'glow 3s ease-in-out infinite',
                          }),
                        }}
                      >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        {!collapsed && (
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              fontSize: '0.855rem',
                              fontWeight: isActive ? 600 : 400,
                              color: isActive ? 'primary.main' : 'text.primary',
                              whiteSpace: 'nowrap',
                            }}
                          />
                        )}
                        {/* Aktif gösterge çubuğu */}
                        {isActive && (
                          <Box
                            sx={{
                              width: 3,
                              height: 24,
                              borderRadius: 2,
                              background: 'linear-gradient(180deg, #6366F1, #06B6D4)',
                              position: 'absolute',
                              right: collapsed ? 4 : 8,
                            }}
                          />
                        )}
                      </ListItemButton>
                    </Tooltip>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>

      {/* ─── Kullanıcı Bilgisi + Çıkış ─── */}
      <Divider sx={{ borderColor: (t) => alpha(t.palette.text.secondary, 0.08) }} />
      <Box sx={{ p: collapsed ? 1 : 2 }}>
        {/* Kullanıcı bilgi kutusu */}
        {!collapsed ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              background: (t) => alpha(t.palette.primary.main, 0.06),
              border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
              mb: 1.5,
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayName}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.68rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
              >
                {displayEmail}
              </Typography>
            </Box>
          </Box>
        ) : (
          /* Collapsed modda sadece avatar göster */
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
            <Tooltip title={displayName} placement="right" arrow>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
          </Box>
        )}

        {/* Çıkış butonu */}
        {!collapsed ? (
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              py: 1,
              color: 'text.secondary',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'error.main',
                backgroundColor: (t) => alpha(t.palette.error.main, 0.08),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <LogoutOutlined sx={{ fontSize: 20, color: 'inherit' }} />
            </ListItemIcon>
            <ListItemText
              primary="Çıkış Yap"
              primaryTypographyProps={{
                fontSize: '0.83rem',
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        ) : (
          /* Collapsed modda sadece ikon buton */
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title="Çıkış Yap" placement="right" arrow>
              <IconButton
                onClick={handleLogout}
                size="small"
                sx={{
                  color: 'text.secondary',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'error.main',
                    backgroundColor: (t) => alpha(t.palette.error.main, 0.08),
                  },
                }}
              >
                <LogoutOutlined sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* ─── Collapse Toggle Butonu (sadece desktop drawer'da) ─── */}
      <Divider sx={{ borderColor: (t) => alpha(t.palette.text.secondary, 0.08) }} />
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          justifyContent: collapsed ? 'center' : 'flex-end',
          p: 1,
        }}
      >
        <Tooltip title={collapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt'} placement="right" arrow>
          <IconButton
            id="sidebar-toggle-desktop"
            onClick={onDesktopToggle}
            size="small"
            sx={{
              color: 'text.secondary',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: (t) => alpha(t.palette.primary.main, 0.1),
              },
            }}
          >
            {collapsed ? (
              <ChevronRightOutlined sx={{ fontSize: 20 }} />
            ) : (
              <ChevronLeftOutlined sx={{ fontSize: 20 }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* ─── Versiyon Bilgisi ─── */}
      {!collapsed && (
        <Box sx={{ px: 2.5, pb: 2, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', opacity: 0.6 }}>
            v1.0.0 — © 2026 Hüdayi Vakfı
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Mobil Drawer — geçici, üstte açılır */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH },
        }}
      >
        {drawerContent(false)}
      </Drawer>

      {/* Desktop Drawer — kalıcı, genişlik geçişli */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            width: currentWidth,
            boxSizing: 'border-box',
            transition: `width ${transitionDuration} ease`,
            overflowX: 'hidden',
          },
        }}
        open
      >
        {drawerContent(!desktopOpen)}
      </Drawer>
    </>
  );
};

export default Sidebar;
