// ──────────────────────────────────────────────
// Duyurular Sayfası — Tam CRUD (Oluştur / Düzenle / Sil)
// API entegrasyonu, Dialog form, Snackbar bildirim
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  CampaignOutlined,
  AddCircleOutlineOutlined,
  RefreshOutlined,
  VisibilityOutlined,
  CalendarTodayOutlined,
  AccessTimeOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  SaveOutlined,
} from '@mui/icons-material';
import { duyuruService } from '../../api/duyuruService';
import type { DuyuruDto, CreateDuyuruRequest, UpdateDuyuruRequest } from '../../types';
import { useAuth } from '../../hooks/useAuth';

// ─── Yardımcı fonksiyonlar ────────────────────────

/** Tarih formatlayıcı */
const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/** Tarih + Saat formatlayıcı */
const formatDateTime = (iso: string | null): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** ISO tarih stringini input[type="date"] formatına çevirir (YYYY-MM-DD) */
const toInputDate = (iso: string | null): string => {
  if (!iso) return '';
  return new Date(iso).toISOString().split('T')[0];
};

// ─── Form başlangıç değerleri ─────────────────────

interface FormState {
  baslik: string;
  icerik: string;
  gecerlilikTarihi: string; // YYYY-MM-DD veya ''
}

const INITIAL_FORM: FormState = {
  baslik: '',
  icerik: '',
  gecerlilikTarihi: '',
};

// ─── Snackbar tipi ────────────────────────────────

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

// ─── Detay Dialog tipi ────────────────────────────

interface DetailDialogState {
  open: boolean;
  item: DuyuruDto | null;
}

// ══════════════════════════════════════════════════
// Ana Bileşen
// ══════════════════════════════════════════════════

const DuyurularPage = () => {
  const { role } = useAuth();

  // ─── Veri state'leri ──────────────────────────
  const [announcements, setAnnouncements] = useState<DuyuruDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Dialog state'leri ────────────────────────
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DuyuruDto | null>(null); // null = yeni kayıt
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  // ─── Silme dialog state'i ─────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<DuyuruDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Detay dialog state'i ─────────────────────
  const [detailDialog, setDetailDialog] = useState<DetailDialogState>({
    open: false,
    item: null,
  });

  // ─── Snackbar state'i ─────────────────────────
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const isAdmin = role === 'Admin' || role === 'Personel';

  // ─── Veri çekme ───────────────────────────────
  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Admin tüm duyuruları, öğrenci sadece aktif olanları görür
      const response = isAdmin
        ? await duyuruService.getAll()
        : await duyuruService.getAktifDuyurular();
      setAnnouncements(response.data);
    } catch {
      setError('Duyurular yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // ─── Snackbar göster ──────────────────────────
  const showSnackbar = (message: string, severity: SnackbarState['severity'] = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // ─── Form Dialog Aç / Kapat ──────────────────
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData(INITIAL_FORM);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (item: DuyuruDto) => {
    setEditingItem(item);
    setFormData({
      baslik: item.baslik,
      icerik: item.icerik,
      gecerlilikTarihi: toInputDate(item.gecerlilikTarihi),
    });
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    if (submitting) return; // İşlem devam ederken kapatma
    setFormDialogOpen(false);
    setEditingItem(null);
    setFormData(INITIAL_FORM);
  };

  // ─── Form Gönder (Create / Update) ───────────
  const handleSubmit = async () => {
    // Validasyon
    if (!formData.baslik.trim()) {
      showSnackbar('Başlık alanı zorunludur.', 'warning');
      return;
    }
    if (!formData.icerik.trim()) {
      showSnackbar('İçerik alanı zorunludur.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const gecerlilikTarihi = formData.gecerlilikTarihi
        ? new Date(formData.gecerlilikTarihi).toISOString()
        : null;

      if (editingItem) {
        // ── Güncelleme ──
        const updatePayload: UpdateDuyuruRequest = {
          id: editingItem.id,
          baslik: formData.baslik.trim(),
          icerik: formData.icerik.trim(),
          gecerlilikTarihi,
          hedefRolId: null,
        };
        await duyuruService.update(editingItem.id, updatePayload);
        showSnackbar('Duyuru başarıyla güncellendi.');
      } else {
        // ── Yeni kayıt ──
        const createPayload: CreateDuyuruRequest = {
          baslik: formData.baslik.trim(),
          icerik: formData.icerik.trim(),
          gecerlilikTarihi,
          hedefRolId: null,
        };
        await duyuruService.create(createPayload);
        showSnackbar('Duyuru başarıyla oluşturuldu.');
      }

      handleCloseFormDialog();
      fetchAnnouncements(); // Tabloyu yenile
    } catch {
      showSnackbar(
        editingItem
          ? 'Duyuru güncellenirken bir hata oluştu.'
          : 'Duyuru oluşturulurken bir hata oluştu.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Silme Dialog Aç / Kapat ─────────────────
  const handleOpenDelete = (item: DuyuruDto) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    if (deleting) return;
    setDeleteDialogOpen(false);
    setDeletingItem(null);
  };

  // ─── Silme İşlemi ────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    setDeleting(true);
    try {
      await duyuruService.delete(deletingItem.id);
      showSnackbar('Duyuru başarıyla silindi.');
      handleCloseDeleteDialog();
      fetchAnnouncements(); // Tabloyu yenile
    } catch {
      showSnackbar('Duyuru silinirken bir hata oluştu.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ─── Detay Dialog ─────────────────────────────
  const handleOpenDetail = (item: DuyuruDto) => {
    setDetailDialog({ open: true, item });
  };

  const handleCloseDetail = () => {
    setDetailDialog({ open: false, item: null });
  };

  // ─── Skeleton Satırları ───────────────────────
  const renderSkeletonRows = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`skeleton-${i}`}>
        {Array.from({ length: 5 }).map((_, j) => (
          <TableCell key={j}>
            <Skeleton variant="text" width={j === 0 ? 220 : '70%'} />
          </TableCell>
        ))}
      </TableRow>
    ));

  // ══════════════════════════════════════════════
  // JSX
  // ══════════════════════════════════════════════

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
              background: 'linear-gradient(135deg, #06B6D4, #22D3EE)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
            }}
          >
            <CampaignOutlined sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Duyurular
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
              {loading ? '...' : `${announcements.length} ${isAdmin ? 'toplam' : 'aktif'} duyuru`}
            </Typography>
          </Box>
        </Box>

        {isAdmin && (
          <Button
            id="add-announcement-btn"
            variant="contained"
            startIcon={<AddCircleOutlineOutlined />}
            onClick={handleOpenCreate}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Yeni Duyuru
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
            {isAdmin ? 'Tüm Duyurular' : 'Yayındaki Duyurular'}
          </Typography>
          <Tooltip title="Yenile">
            <IconButton
              id="refresh-announcements-btn"
              onClick={fetchAnnouncements}
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
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Başlık</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>İçerik Önizleme</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Yayın Tarihi</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Geçerlilik</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }} align="center">
                  İşlem
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                renderSkeletonRows()
              ) : announcements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {isAdmin ? 'Henüz duyuru oluşturulmamış.' : 'Aktif duyuru bulunamadı.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                announcements.map((item) => {
                  const isExpired = item.gecerlilikTarihi
                    ? new Date(item.gecerlilikTarihi) < new Date()
                    : false;

                  return (
                    <TableRow
                      key={item.id}
                      hover
                      sx={{
                        transition: 'background-color 0.15s ease',
                        '&:last-child td': { border: 0 },
                        opacity: isExpired ? 0.6 : 1,
                      }}
                    >
                      {/* Başlık */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary' }}
                        >
                          {item.baslik}
                        </Typography>
                      </TableCell>

                      {/* İçerik Önizleme */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.83rem',
                            color: 'text.secondary',
                            maxWidth: 350,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.icerik}
                        </Typography>
                      </TableCell>

                      {/* Yayın Tarihi */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontSize: '0.83rem' }}>
                            {formatDateTime(item.olusturulmaTarihi)}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Geçerlilik */}
                      <TableCell>
                        {item.gecerlilikTarihi ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarTodayOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ fontSize: '0.83rem' }}>
                              {formatDate(item.gecerlilikTarihi)}
                            </Typography>
                            {isExpired && (
                              <Chip
                                label="Süresi Doldu"
                                size="small"
                                sx={{
                                  ml: 0.5,
                                  fontWeight: 600,
                                  fontSize: '0.65rem',
                                  height: 20,
                                  background: (t) => alpha(t.palette.error.main, 0.15),
                                  color: 'error.main',
                                }}
                              />
                            )}
                          </Box>
                        ) : (
                          <Chip
                            label="Süresiz"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ fontWeight: 500, fontSize: '0.7rem' }}
                          />
                        )}
                      </TableCell>

                      {/* İşlem */}
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          <Tooltip title="Detay">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDetail(item)}
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

                          {isAdmin && (
                            <>
                              <Tooltip title="Düzenle">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenEdit(item)}
                                  sx={{
                                    color: 'text.secondary',
                                    '&:hover': {
                                      color: 'info.main',
                                      backgroundColor: (t) => alpha(t.palette.info.main, 0.1),
                                    },
                                  }}
                                >
                                  <EditOutlined sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Sil">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDelete(item)}
                                  sx={{
                                    color: 'text.secondary',
                                    '&:hover': {
                                      color: 'error.main',
                                      backgroundColor: (t) => alpha(t.palette.error.main, 0.1),
                                    },
                                  }}
                                >
                                  <DeleteOutlined sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ═══════════════════════════════════════════
          Yeni / Düzenle Dialog
         ═══════════════════════════════════════════ */}
      <Dialog
        open={formDialogOpen}
        onClose={handleCloseFormDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontWeight: 700,
            pb: 1,
          }}
        >
          {editingItem ? 'Duyuru Düzenle' : 'Yeni Duyuru Ekle'}
          <IconButton onClick={handleCloseFormDialog} size="small" disabled={submitting}>
            <CloseOutlined />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              id="duyuru-baslik"
              label="Başlık"
              placeholder="Duyuru başlığını girin"
              fullWidth
              required
              value={formData.baslik}
              onChange={(e) => setFormData((prev) => ({ ...prev, baslik: e.target.value }))}
              disabled={submitting}
              inputProps={{ maxLength: 200 }}
            />

            <TextField
              id="duyuru-icerik"
              label="İçerik"
              placeholder="Duyuru içeriğini girin"
              fullWidth
              required
              multiline
              rows={4}
              value={formData.icerik}
              onChange={(e) => setFormData((prev) => ({ ...prev, icerik: e.target.value }))}
              disabled={submitting}
              inputProps={{ maxLength: 2000 }}
            />

            <TextField
              id="duyuru-gecerlilik"
              label="Geçerlilik Tarihi"
              type="date"
              fullWidth
              value={formData.gecerlilikTarihi}
              onChange={(e) => setFormData((prev) => ({ ...prev, gecerlilikTarihi: e.target.value }))}
              disabled={submitting}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              helperText="Boş bırakılırsa duyuru süresiz olarak yayında kalır."
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleCloseFormDialog}
            disabled={submitting}
            sx={{ textTransform: 'none' }}
          >
            İptal
          </Button>
          <Button
            id="duyuru-submit-btn"
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={
              submitting ? <CircularProgress size={18} color="inherit" /> : <SaveOutlined />
            }
            sx={{ textTransform: 'none', fontWeight: 600, minWidth: 120 }}
          >
            {submitting ? 'Kaydediliyor...' : editingItem ? 'Güncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════════════════════════════════════
          Silme Onay Dialog
         ═══════════════════════════════════════════ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Duyuruyu Sil
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <strong>"{deletingItem?.baslik}"</strong> başlıklı duyuruyu silmek istediğinize emin misiniz?
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            disabled={deleting}
            sx={{ textTransform: 'none' }}
          >
            İptal
          </Button>
          <Button
            id="duyuru-delete-confirm-btn"
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleting}
            startIcon={
              deleting ? <CircularProgress size={18} color="inherit" /> : <DeleteOutlined />
            }
            sx={{ textTransform: 'none', fontWeight: 600, minWidth: 100 }}
          >
            {deleting ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════════════════════════════════════
          Detay Dialog
         ═══════════════════════════════════════════ */}
      <Dialog
        open={detailDialog.open}
        onClose={handleCloseDetail}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontWeight: 700,
            pb: 1,
          }}
        >
          Duyuru Detayı
          <IconButton onClick={handleCloseDetail} size="small">
            <CloseOutlined />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {detailDialog.item && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Başlık
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {detailDialog.item.baslik}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  İçerik
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 0.5, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
                >
                  {detailDialog.item.icerik}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Oluşturulma Tarihi
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {formatDateTime(detailDialog.item.olusturulmaTarihi)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Geçerlilik Tarihi
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {detailDialog.item.gecerlilikTarihi
                      ? formatDate(detailDialog.item.gecerlilikTarihi)
                      : 'Süresiz'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleCloseDetail} sx={{ textTransform: 'none' }}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════════════════════════════════════
          Snackbar Bildirim
         ═══════════════════════════════════════════ */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DuyurularPage;
