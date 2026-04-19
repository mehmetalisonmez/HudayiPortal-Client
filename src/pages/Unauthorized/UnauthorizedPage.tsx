// ──────────────────────────────────────────────
// Yetkisiz Erişim Sayfası
// ──────────────────────────────────────────────

import { Box, Typography, Button, alpha } from '@mui/material';
import { BlockOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: (t) => t.palette.background.default,
        textAlign: 'center',
        p: 3,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '20px',
          background: (t) => alpha(t.palette.error.main, 0.15),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <BlockOutlined sx={{ fontSize: 40, color: 'error.main' }} />
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Yetkisiz Erişim
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: 400 }}>
        Bu sayfaya erişim yetkiniz bulunmamaktadır. Lütfen yetkili bir hesap ile giriş yapın.
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate('/dashboard', { replace: true })}
      >
        Dashboard'a Dön
      </Button>
    </Box>
  );
};

export default UnauthorizedPage;
