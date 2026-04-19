// ──────────────────────────────────────────────
// Login Sayfası — Premium MUI tasarım
// Sol panel: Animasyonlu gradient branding
// Sağ panel: Glassmorphism login formu
// ──────────────────────────────────────────────

import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  alpha,
  Fade,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  EmailOutlined,
  LockOutlined,
  SchoolOutlined,
  SecurityOutlined,
  AccessTimeOutlined,
  DashboardOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

// ─── Feature Badge bileşeni ───
interface FeatureBadgeProps {
  icon: React.ReactNode;
  label: string;
  delay: string;
}

const FeatureBadge = ({ icon, label, delay }: FeatureBadgeProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 2,
      py: 1,
      borderRadius: 2,
      background: alpha('#fff', 0.1),
      backdropFilter: 'blur(10px)',
      border: `1px solid ${alpha('#fff', 0.15)}`,
      animation: 'fadeInUp 0.6s ease-out both',
      animationDelay: delay,
    }}
  >
    <Box sx={{ display: 'flex', color: alpha('#fff', 0.9), '& .MuiSvgIcon-root': { fontSize: 18 } }}>
      {icon}
    </Box>
    <Typography
      variant="caption"
      sx={{ color: alpha('#fff', 0.85), fontWeight: 500, fontSize: '0.75rem' }}
    >
      {label}
    </Typography>
  </Box>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Zaten giriş yapmışsa dashboard'a yönlendir
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, sifre });
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 401) {
          setError('E-posta veya şifre hatalı.');
        } else {
          setError('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
      } else {
        setError('Sunucuya bağlanılamıyor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: (t) => t.palette.background.default,
      }}
    >
      {/* ═══════════════════════════════════════════
          SOL PANEL: Animasyonlu Gradient Branding
         ═══════════════════════════════════════════ */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '45%',
          background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 30%, #06B6D4 70%, #4338CA 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 8s ease infinite',
          position: 'relative',
          overflow: 'hidden',
          p: 6,
        }}
      >
        {/* Dekoratif daireler — float animasyonlu */}
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: alpha('#fff', 0.08),
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -120,
            left: -60,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: alpha('#fff', 0.05),
            animation: 'floatReverse 8s ease-in-out infinite',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '35%',
            left: '15%',
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: alpha('#fff', 0.06),
            animation: 'floatSlow 10s ease-in-out infinite',
          }}
        />
        {/* Küçük parlak noktalar */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            right: '25%',
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: alpha('#fff', 0.04),
            animation: 'float 5s ease-in-out 1s infinite',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '25%',
            right: '15%',
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: alpha('#fff', 0.03),
            animation: 'floatReverse 7s ease-in-out 0.5s infinite',
          }}
        />

        {/* İçerik */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            animation: 'fadeIn 1s ease-out',
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: '22px',
              background: alpha('#fff', 0.15),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha('#fff', 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3.5,
              animation: 'pulse 3s ease-in-out infinite',
            }}
          >
            <SchoolOutlined sx={{ fontSize: 44, color: '#fff' }} />
          </Box>

          {/* Başlık — Gradient metin */}
          <Typography
            variant="h4"
            sx={{
              color: '#fff',
              mb: 2,
              fontWeight: 800,
              fontSize: { md: '1.8rem', lg: '2.2rem' },
              animation: 'fadeInUp 0.6s ease-out 0.2s both',
            }}
          >
            Hüdayi Portalı
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: alpha('#fff', 0.8),
              maxWidth: 340,
              lineHeight: 1.8,
              fontSize: '0.95rem',
              animation: 'fadeInUp 0.6s ease-out 0.4s both',
            }}
          >
            Yurt yönetim sistemine hoş geldiniz.
            Öğrenci ve personel işlemlerinizi kolayca yönetin.
          </Typography>

          {/* Feature Badges */}
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              mt: 4,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <FeatureBadge
              icon={<SecurityOutlined />}
              label="Güvenli Giriş"
              delay="0.6s"
            />
            <FeatureBadge
              icon={<AccessTimeOutlined />}
              label="7/24 Erişim"
              delay="0.8s"
            />
            <FeatureBadge
              icon={<DashboardOutlined />}
              label="Kolay Yönetim"
              delay="1.0s"
            />
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════
          SAĞ PANEL: Login Formu (Glassmorphism)
         ═══════════════════════════════════════════ */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 6 },
          animation: 'fadeIn 0.8s ease-out',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 440,
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            background: (t) => alpha(t.palette.background.paper, 0.6),
            backdropFilter: 'blur(20px)',
            border: (t) => `1px solid ${alpha(t.palette.text.secondary, 0.1)}`,
            animation: 'fadeInUp 0.7s ease-out 0.2s both',
          }}
        >
          {/* Mobilde logo */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 3s ease-in-out infinite',
              }}
            >
              <SchoolOutlined sx={{ fontSize: 30, color: '#fff' }} />
            </Box>
          </Box>

          <Typography
            variant="h5"
            sx={{
              mb: 1,
              textAlign: { xs: 'center', md: 'left' },
              fontWeight: 700,
            }}
          >
            Giriş Yap
          </Typography>
          <Typography
            variant="body2"
            sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' } }}
          >
            Devam etmek için hesap bilgilerinizi girin
          </Typography>

          {/* Hata mesajı — animasyonlu */}
          <Fade in={!!error}>
            <Box>
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    animation: 'fadeInUp 0.3s ease-out',
                  }}
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}
            </Box>
          </Fade>

          <form onSubmit={handleSubmit}>
            <TextField
              id="login-email"
              label="E-posta Adresi"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  transition: 'box-shadow 0.3s ease',
                  '&.Mui-focused': {
                    boxShadow: (t) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.15)}`,
                  },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              id="login-password"
              label="Şifre"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              autoComplete="current-password"
              sx={{
                mb: 3.5,
                '& .MuiOutlinedInput-root': {
                  transition: 'box-shadow 0.3s ease',
                  '&.Mui-focused': {
                    boxShadow: (t) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.15)}`,
                  },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                        sx={{
                          transition: 'transform 0.2s ease',
                          '&:hover': { transform: 'scale(1.1)' },
                        }}
                      >
                        {showPassword ? (
                          <VisibilityOff sx={{ fontSize: 20 }} />
                        ) : (
                          <Visibility sx={{ fontSize: 20 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              id="login-submit"
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s ease',
                '&:active': {
                  transform: 'scale(0.98)',
                },
                // Shimmer efekti
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.1)}, transparent)`,
                  transition: 'left 0.5s ease',
                },
                '&:hover::after': {
                  left: '100%',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: '#fff' }} />
              ) : (
                'Giriş Yap'
              )}
            </Button>
          </form>

          {/* Alt bilgi */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: (t) => `1px solid ${alpha(t.palette.text.secondary, 0.08)}`,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontSize: '0.78rem', color: 'text.secondary' }}
            >
              Hüdayi Vakfı Yurt Yönetim Sistemi © 2026
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginPage;
