// ──────────────────────────────────────────────
// Etkinlikler Sayfası — Etkinlik listeleme tablosu
// Kart/tablo görünümü, tarih formatlama, zorunluluk rozeti
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  Alert,
  alpha,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  EventOutlined,
  AddCircleOutlineOutlined,
  RefreshOutlined,
  CalendarTodayOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';
import { etkinlikService } from '../../api/etkinlikService';
import type { EtkinlikDto } from '../../types';
import { useAuth } from '../../hooks/useAuth';

/** Tarih formatlayıcı */
const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const EtkinliklerPage = () => {
  const { role } = useAuth();
  const [events, setEvents] = useState<EtkinlikDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = role === 'Admin' || role === 'Personel';

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await etkinlikService.getAktifEtkinlikler();
      setEvents(response.data);
    } catch {
      setError('Etkinlikler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const renderSkeletonRows = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`skeleton-${i}`}>
        {Array.from({ length: 6 }).map((_, j) => (
          <TableCell key={j}>
            <Skeleton variant="text" width={j === 0 ? 200 : '70%'} />
          </TableCell>
        ))}
      </TableRow>
    ));

  return (
    <Box>
      {/* ─── Sayfa Başlığı ─── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10B981, #34D399)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <EventOutlined sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Etkinlikler
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
              {events.length} aktif etkinlik
            </Typography>
          </Box>
        </Box>

        {isAdmin && (
          <Button
            id="add-event-btn"
            variant="contained"
            startIcon={<AddCircleOutlineOutlined />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Yeni Etkinlik
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* ─── Tablo Kartı ─── */}
      <Card>
        {/* Araç çubuğu */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2.5,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
            Aktif Etkinlikler
          </Typography>
          <Tooltip title="Yenile">
            <IconButton
              id="refresh-events-btn"
              onClick={fetchEvents}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: (t) => alpha(t.palette.primary.main, 0.1),
                },
              }}
            >
              <RefreshOutlined />
            </IconButton>
          </Tooltip>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Etkinlik Adı</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Başlangıç</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Bitiş</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Son Kayıt</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }} align="center">
                  İşlem
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                renderSkeletonRows()
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Aktif etkinlik bulunamadı.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => {
                  const isPast = new Date(event.baslangicTarihi) < new Date();
                  return (
                    <TableRow
                      key={event.id}
                      hover
                      sx={{
                        transition: 'background-color 0.15s ease',
                        '&:last-child td': { border: 0 },
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary' }}>
                            {event.baslik}
                          </Typography>
                          {event.aciklama && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: 300,
                              }}
                            >
                              {event.aciklama}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarTodayOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontSize: '0.83rem' }}>
                            {formatDate(event.baslangicTarihi)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.83rem' }}>
                          {formatDate(event.bitisTarihi)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.83rem' }}>
                          {formatDate(event.sonKayitTarihi)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {event.zorunluMu && (
                            <Chip
                              label="Zorunlu"
                              size="small"
                              color="error"
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                background: (t) => alpha(t.palette.error.main, 0.15),
                                color: 'error.main',
                                border: (t) => `1px solid ${alpha(t.palette.error.main, 0.3)}`,
                              }}
                            />
                          )}
                          {event.ucret != null && event.ucret > 0 && (
                            <Chip
                              label={`₺${event.ucret}`}
                              size="small"
                              color="warning"
                              variant="outlined"
                              sx={{ fontWeight: 500, fontSize: '0.7rem' }}
                            />
                          )}
                          {isPast ? (
                            <Chip
                              label="Başladı"
                              size="small"
                              sx={{
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                background: (t) => alpha(t.palette.info.main, 0.15),
                                color: 'info.main',
                              }}
                            />
                          ) : (
                            <Chip
                              label="Yaklaşan"
                              size="small"
                              sx={{
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                background: (t) => alpha(t.palette.success.main, 0.15),
                                color: 'success.main',
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Detay">
                          <IconButton
                            size="small"
                            sx={{
                              color: 'text.secondary',
                              '&:hover': {
                                color: 'primary.main',
                                backgroundColor: (t) => alpha(t.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            <VisibilityOutlined sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default EtkinliklerPage;
