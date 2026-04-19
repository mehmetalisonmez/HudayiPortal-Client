// ──────────────────────────────────────────────
// Öğrenci Dashboard — Öğrenci görünümü
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Skeleton,
  Alert,
  Chip,
  alpha,
} from '@mui/material';
import {
  HotelOutlined,
  FactCheckOutlined,
  MailOutlined,
  EventOutlined,
  CalendarTodayOutlined,
  InfoOutlined,
} from '@mui/icons-material';
import StatCard from '../../components/StatCard/StatCard';
import { dashboardService } from '../../api/dashboardService';
import type { OgrenciDashboard as OgrenciDashboardType } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const OgrenciDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<OgrenciDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardService.getOgrenciDashboard();
        setData(response.data);
      } catch {
        setError('Dashboard verileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Box>
      {/* ─── Hoşgeldin Başlığı ─── */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Merhaba, {user?.name || 'Öğrenci'} 👋
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarTodayOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">{today}</Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* ─── İstatistik Kartları ─── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
          ) : (
            <StatCard
              title="Oda Numaranız"
              value={data?.odaNo || '—'}
              icon={<HotelOutlined />}
              gradient="linear-gradient(135deg, #6366F1, #818CF8)"
              subtitle="Kayıtlı oda"
            />
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
          ) : (
            <StatCard
              title="Bugünkü Yoklama"
              value={data?.bugunYoklamaAlindiMi ? 'Alındı ✓' : 'Alınmadı'}
              icon={<FactCheckOutlined />}
              gradient={
                data?.bugunYoklamaAlindiMi
                  ? 'linear-gradient(135deg, #10B981, #34D399)'
                  : 'linear-gradient(135deg, #F59E0B, #FBBF24)'
              }
              subtitle={data?.bugunYoklamaAlindiMi ? 'Bugün işaretlendi' : 'Henüz alınmadı'}
            />
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
          ) : (
            <StatCard
              title="Okunmamış Mesaj"
              value={data?.okunmamisMesajSayisi ?? 0}
              icon={<MailOutlined />}
              gradient="linear-gradient(135deg, #EF4444, #F87171)"
              subtitle="Yeni mesajınız var"
            />
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
          ) : (
            <StatCard
              title="Yaklaşan Etkinlik"
              value={data?.yaklasanEtkinlikSayisi ?? 0}
              icon={<EventOutlined />}
              gradient="linear-gradient(135deg, #06B6D4, #22D3EE)"
              subtitle="Önümüzdeki 7 gün"
            />
          )}
        </Grid>
      </Grid>

      {/* ─── Bilgi Kartları ─── */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            sx={{
              background: (t) =>
                `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.12)} 0%, ${alpha(
                  t.palette.secondary.main,
                  0.08
                )} 100%)`,
              border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <InfoOutlined sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Portalınız
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 2 }}>
                Bu portal üzerinden etkinliklere katılabilir, yemek menüsünü görüntüleyebilir,
                izin talebi oluşturabilir ve duyuruları takip edebilirsiniz. 
                Herhangi bir sorun yaşarsanız şikâyet bölümünden bize ulaşabilirsiniz.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="Etkinlikler" size="small" color="primary" variant="outlined" />
                <Chip label="Yemek Menüsü" size="small" color="secondary" variant="outlined" />
                <Chip label="İzin Talebi" size="small" color="info" variant="outlined" />
                <Chip label="Şikâyet" size="small" color="warning" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Önemli Hatırlatmalar
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10B981, #34D399)',
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2">
                    Yoklamanız her gün alınmaktadır.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2">
                    İzin taleplerini en az 1 gün önce oluşturun.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2">
                    Duyuruları düzenli olarak kontrol edin.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OgrenciDashboard;
