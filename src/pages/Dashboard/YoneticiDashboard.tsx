// ──────────────────────────────────────────────
// Yönetici Dashboard — Admin & Personel görünümü
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
  PeopleOutlined,
  ReportProblemOutlined,
  CampaignOutlined,
  EventOutlined,
  TrendingUpOutlined,
  CalendarTodayOutlined,
} from '@mui/icons-material';
import StatCard from '../../components/StatCard/StatCard';
import { dashboardService } from '../../api/dashboardService';
import type { YoneticiDashboard as YoneticiDashboardType } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const YoneticiDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<YoneticiDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardService.getYoneticiDashboard();
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Hoş geldin, {user?.name || 'Yönetici'} 👋
          </Typography>
        </Box>
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
              title="Toplam Öğrenci"
              value={data?.toplamOgrenciSayisi ?? 0}
              icon={<PeopleOutlined />}
              gradient="linear-gradient(135deg, #6366F1, #818CF8)"
              subtitle="Aktif kayıtlı öğrenci"
            />
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
          ) : (
            <StatCard
              title="Bekleyen Şikâyet"
              value={data?.bekleyenSikayetSayisi ?? 0}
              icon={<ReportProblemOutlined />}
              gradient="linear-gradient(135deg, #F59E0B, #FBBF24)"
              subtitle="Cevaplanmayı bekliyor"
            />
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {loading ? (
            <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
          ) : (
            <StatCard
              title="Aktif Duyuru"
              value={data?.aktifDuyuruSayisi ?? 0}
              icon={<CampaignOutlined />}
              gradient="linear-gradient(135deg, #06B6D4, #22D3EE)"
              subtitle="Yayında olan duyurular"
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
              gradient="linear-gradient(135deg, #10B981, #34D399)"
              subtitle="Önümüzdeki 7 gün"
            />
          )}
        </Grid>
      </Grid>

      {/* ─── Hızlı Bilgiler Paneli ─── */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendingUpOutlined sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Genel Bakış
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                Yurt yönetim paneline hoş geldiniz. Bu panelden öğrenci yoklamalarını takip edebilir,
                izin taleplerini yönetebilir, duyuru yayınlayabilir ve şikâyetleri cevaplayabilirsiniz.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="Yoklama" size="small" color="primary" variant="outlined" />
                <Chip label="İzin Yönetimi" size="small" color="secondary" variant="outlined" />
                <Chip label="Duyurular" size="small" color="info" variant="outlined" />
                <Chip label="Mali İşlemler" size="small" color="warning" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: '100%',
              background: (t) =>
                `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.15)} 0%, ${alpha(
                  t.palette.secondary.main,
                  0.1
                )} 100%)`,
              border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Hızlı İşlemler
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                Sol menüden istediğiniz modüle erişebilirsiniz. Yoklama almak, yeni duyuru
                yayınlamak veya izin taleplerini onaylamak için ilgili sayfaları kullanın.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default YoneticiDashboard;
