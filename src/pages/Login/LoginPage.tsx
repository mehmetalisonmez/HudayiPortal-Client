import { useState, useEffect, type FormEvent } from 'react';
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
  VpnKeyOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/errorHelper';

// Feature Badge Component
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
  const { login, verifyOtp, isAuthenticated } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP states
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(180); // 3 minutes = 180 seconds

  // Timer countdown hook
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpMode && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpMode, timer]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Handle Initial Login (Password verification)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login({ email, sifre });
      if (response.requiresOtp) {
        setOtpMode(true);
        setTimer(180);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Lütfen bilgilerinizi kontrol ediniz.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError('Lütfen 6 haneli doğrulama kodunu tam girin.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await verifyOtp(email, otpCode);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Doğrulama kodu geçersiz veya süresi dolmuş.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    setError(null);
    setLoading(true);
    setOtpCode('');

    try {
      await login({ email, sifre });
      setTimer(180);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Kod tekrar gönderilirken bir hata oluştu.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Format timer into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: (t) => t.palette.background.default,
      }}
    >
      {/* LEFT PANEL: Animated Gradient Branding */}
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
          color: '#fff',
        }}
      >
        {/* Glow Effects */}
        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)',
            top: -50,
            left: -50,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            bottom: -100,
            right: -100,
          }}
        />

        <Box sx={{ zIndex: 1, textAlign: 'center', maxWidth: 460 }}>
          <Box
            sx={{
              display: 'inline-flex',
              p: 2,
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              mb: 4,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
            }}
          >
            <SchoolOutlined sx={{ fontSize: 56, color: '#fff' }} />
          </Box>

          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.5px' }}>
            Hüdayi Portal
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 5, fontWeight: 400, px: 2 }}>
            Yurt Yönetim ve Haberleşme Sistemine Hoş Geldiniz
          </Typography>

          {/* Feature Badges Grid */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            <FeatureBadge
              icon={<SecurityOutlined />}
              label="Çift Aşamalı Güvenlik"
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

      {/* RIGHT PANEL: Login/OTP Form (Glassmorphism) */}
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
          {/* Mobile Logo */}
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
            {otpMode ? 'Mail Doğrulama' : 'Giriş Yap'}
          </Typography>
          <Typography
            variant="body2"
            sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' }, color: 'text.secondary' }}
          >
            {otpMode 
              ? `${email} adresine gönderilen 6 haneli doğrulama kodunu girin.` 
              : 'Devam etmek için hesap bilgilerinizi girin'}
          </Typography>

          {/* Validation Alert */}
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

          {!otpMode ? (
            /* PASSWORD FORM */
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
          ) : (
            /* OTP VERIFICATION FORM */
            <form onSubmit={handleVerifyOtpSubmit}>
              <TextField
                id="otp-code"
                label="6 Haneli Doğrulama Kodu"
                type="text"
                fullWidth
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                slotProps={{
                  htmlInput: {
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    style: { textAlign: 'center', letterSpacing: '8px', fontSize: '1.25rem', fontWeight: 700 }
                  },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                placeholder="000000"
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    transition: 'box-shadow 0.3s ease',
                    '&.Mui-focused': {
                      boxShadow: (t) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.15)}`,
                    },
                  },
                }}
              />

              {/* Expiry Countdown & Resend Code */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, px: 0.5 }}>
                <Typography variant="body2" sx={{ color: timer > 0 ? 'text.secondary' : 'error.main', fontWeight: 500 }}>
                  {timer > 0 ? `Kalan Süre: ${formatTime(timer)}` : 'Süre Doldu!'}
                </Typography>
                <Button
                  size="small"
                  onClick={handleResendOtp}
                  disabled={timer > 0 || loading}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Kodu Tekrar Gönder
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={() => {
                    setOtpMode(false);
                    setError(null);
                    setOtpCode('');
                  }}
                  disabled={loading}
                  sx={{ py: 1.2, textTransform: 'none' }}
                >
                  Geri Dön
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading || otpCode.length !== 6}
                  sx={{ py: 1.2, textTransform: 'none' }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: '#fff' }} />
                  ) : (
                    'Doğrula'
                  )}
                </Button>
              </Box>
            </form>
          )}

          {/* Footer Info */}
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