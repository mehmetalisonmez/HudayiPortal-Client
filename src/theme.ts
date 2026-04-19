// ──────────────────────────────────────────────
// HudayiPortal MUI Tema Yapılandırması
// Modern, koyu tonlu, premium bir portal tasarımı
// ──────────────────────────────────────────────

import { createTheme, alpha } from '@mui/material/styles';

// Renk paleti sabitleri
const palette = {
  primary: '#6366F1',      // Indigo — ana renk
  primaryDark: '#4338CA',
  primaryLight: '#818CF8',
  secondary: '#06B6D4',    // Cyan — vurgu renk
  secondaryDark: '#0891B2',
  background: '#0F172A',   // Slate 900 — ana arka plan
  surface: '#1E293B',      // Slate 800 — kart arka plan
  surfaceLight: '#334155',  // Slate 700
  text: '#F1F5F9',         // Slate 100
  textSecondary: '#94A3B8', // Slate 400
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

const hudayiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: palette.primary,
      dark: palette.primaryDark,
      light: palette.primaryLight,
    },
    secondary: {
      main: palette.secondary,
      dark: palette.secondaryDark,
    },
    background: {
      default: palette.background,
      paper: palette.surface,
    },
    text: {
      primary: palette.text,
      secondary: palette.textSecondary,
    },
    success: { main: palette.success },
    warning: { main: palette.warning },
    error: { main: palette.error },
    info: { main: palette.info },
  },

  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    body2: {
      color: palette.textSecondary,
    },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: `${palette.surfaceLight} transparent`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          padding: '10px 24px',
          '&.MuiButton-containedPrimary': {
            background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.primaryDark} 100%)`,
            boxShadow: `0 4px 14px ${alpha(palette.primary, 0.4)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${palette.primaryLight} 0%, ${palette.primary} 100%)`,
              boxShadow: `0 6px 20px ${alpha(palette.primary, 0.5)}`,
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${alpha(palette.textSecondary, 0.1)}`,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 25px ${alpha('#000', 0.3)}`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '& fieldset': {
              borderColor: alpha(palette.textSecondary, 0.2),
            },
            '&:hover fieldset': {
              borderColor: alpha(palette.primary, 0.5),
            },
            '&.Mui-focused fieldset': {
              borderColor: palette.primary,
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: palette.surface,
          borderRight: `1px solid ${alpha(palette.textSecondary, 0.1)}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(palette.surface, 0.8),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(palette.textSecondary, 0.1)}`,
          boxShadow: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: alpha(palette.primary, 0.15),
            '&:hover': {
              backgroundColor: alpha(palette.primary, 0.25),
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default hudayiTheme;
