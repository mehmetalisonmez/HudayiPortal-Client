// ──────────────────────────────────────────────
// İzin Talepleri Sayfası — Tam CRUD
// API entegrasyonu, Dialog form, Snackbar bildirim
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Skeleton, Alert, alpha, IconButton, Tooltip,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Snackbar, CircularProgress, MenuItem,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import {
  EventBusyOutlined, AddCircleOutlineOutlined, RefreshOutlined,
  CheckCircleOutlined, CancelOutlined, HourglassEmptyOutlined,
  CalendarTodayOutlined, CloseOutlined, SaveOutlined, DeleteOutlined,
} from '@mui/icons-material';
import { izinService } from '../../api/izinService';
import type { IzinDto, IzinTuruDto, CreateIzinRequest } from '../../types';
import { useAuth } from '../../hooks/useAuth';

// ─── Yardımcı ──────────────────────────────────

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });

const DURUM_MAP: Record<number, { label: string; color: 'warning' | 'success' | 'error'; icon: React.ReactNode }> = {
  0: { label: 'Beklemede', color: 'warning', icon: <HourglassEmptyOutlined sx={{ fontSize: 14 }} /> },
  1: { label: 'Onaylandı', color: 'success', icon: <CheckCircleOutlined sx={{ fontSize: 14 }} /> },
  2: { label: 'Reddedildi', color: 'error', icon: <CancelOutlined sx={{ fontSize: 14 }} /> },
};

// ─── Form / Snackbar tipleri ───────────────────

interface FormState {
  izinTurId: number | '';
  baslangicTarihi: string;
  bitisTarihi: string;
  gidecegiAdres: string;
  aciklama: string;
}
const INITIAL_FORM: FormState = { izinTurId: '', baslangicTarihi: '', bitisTarihi: '', gidecegiAdres: '', aciklama: '' };

interface SnackbarState { open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning'; }

// ══════════════════════════════════════════════════
// Ana Bileşen
// ══════════════════════════════════════════════════

const IzinlerPage = () => {
  const { role, user } = useAuth();
  const isAdmin = role === 'Admin' || role === 'Personel';

  // ─── Veri state ────────────────────────────
  const [leaves, setLeaves] = useState<IzinDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDurum, setFilterDurum] = useState<number | 'all'>('all');

  // ─── İzin Türleri (dropdown) ───────────────
  const [izinTurleri, setIzinTurleri] = useState<IzinTuruDto[]>([]);

  // ─── Dialog state ──────────────────────────
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  // ─── Silme dialog ──────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<IzinDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Snackbar ──────────────────────────────
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });
  const showSnackbar = (message: string, severity: SnackbarState['severity'] = 'success') =>
    setSnackbar({ open: true, message, severity });

  // ─── Veri çekme ────────────────────────────
  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, number> = {};
      if (filterDurum !== 'all') params.onayDurumu = filterDurum;
      if (!isAdmin && user?.sub) params.kullaniciId = Number(user.sub);
      const response = await izinService.getIzinTalepleri(Object.keys(params).length ? params : undefined);
      setLeaves(response.data);
    } catch {
      setError('İzin talepleri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [filterDurum, isAdmin, user?.sub]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  // İzin türlerini bir kez çek
  useEffect(() => {
    izinService.getIzinTurleri().then((r) => setIzinTurleri(r.data)).catch(() => {});
  }, []);

  // ─── Onay / Red ────────────────────────────
  const handleApprove = async (izinId: number) => {
    try {
      await izinService.updateDurum({ izinId, yeniDurum: 1 });
      showSnackbar('İzin talebi onaylandı.');
      fetchLeaves();
    } catch {
      showSnackbar('Onay işlemi başarısız oldu.', 'error');
    }
  };

  const handleReject = async (izinId: number) => {
    try {
      await izinService.updateDurum({ izinId, yeniDurum: 2 });
      showSnackbar('İzin talebi reddedildi.');
      fetchLeaves();
    } catch {
      showSnackbar('Red işlemi başarısız oldu.', 'error');
    }
  };

  // ─── Yeni Talep Dialog ─────────────────────
  const handleOpenCreate = () => { setFormData(INITIAL_FORM); setFormDialogOpen(true); };
  const handleCloseForm = () => { if (submitting) return; setFormDialogOpen(false); setFormData(INITIAL_FORM); };

  const handleSubmit = async () => {
    if (!formData.izinTurId) { showSnackbar('İzin türü seçiniz.', 'warning'); return; }
    if (!formData.baslangicTarihi) { showSnackbar('Başlangıç tarihi zorunludur.', 'warning'); return; }
    if (!formData.bitisTarihi) { showSnackbar('Bitiş tarihi zorunludur.', 'warning'); return; }
    if (!formData.gidecegiAdres.trim()) { showSnackbar('Gideceği adres zorunludur.', 'warning'); return; }
    if (!formData.aciklama.trim()) { showSnackbar('Açıklama zorunludur.', 'warning'); return; }

    setSubmitting(true);
    try {
      const payload: CreateIzinRequest = {
        izinTurId: formData.izinTurId as number,
        baslangicTarihi: new Date(formData.baslangicTarihi).toISOString(),
        bitisTarihi: new Date(formData.bitisTarihi).toISOString(),
        gidecegiAdres: formData.gidecegiAdres.trim(),
        aciklama: formData.aciklama.trim(),
      };
      await izinService.create(payload);
      showSnackbar('İzin talebi başarıyla oluşturuldu.');
      handleCloseForm();
      fetchLeaves();
    } catch {
      showSnackbar('İzin talebi oluşturulurken bir hata oluştu.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Silme Dialog ──────────────────────────
  const handleOpenDelete = (item: IzinDto) => { setDeletingItem(item); setDeleteDialogOpen(true); };
  const handleCloseDelete = () => { if (deleting) return; setDeleteDialogOpen(false); setDeletingItem(null); };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      await izinService.delete(deletingItem.id);
      showSnackbar('İzin talebi başarıyla silindi.');
      handleCloseDelete();
      fetchLeaves();
    } catch {
      showSnackbar('İzin talebi silinirken bir hata oluştu.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ─── Silme gösterilsin mi? ─────────────────
  const canDelete = (item: IzinDto) => {
    if (isAdmin) return true;
    return item.onayDurumu === 0; // Öğrenci sadece Beklemede olanları silebilir
  };

  // ─── Skeleton ──────────────────────────────
  const renderSkeletonRows = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`skeleton-${i}`}>
        {Array.from({ length: isAdmin ? 7 : 7 }).map((_, j) => (
          <TableCell key={j}><Skeleton variant="text" width={j === 0 ? 160 : '70%'} /></TableCell>
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
          <Box sx={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
          }}>
            <EventBusyOutlined sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>İzin Talepleri</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
              {loading ? '...' : `${leaves.length} kayıt listeleniyor`}
            </Typography>
          </Box>
        </Box>

        {!isAdmin && (
          <Button id="add-leave-btn" variant="contained" startIcon={<AddCircleOutlineOutlined />}
            onClick={handleOpenCreate} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Yeni İzin Talebi
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>
      )}

      {/* ─── Tablo Kartı ─── */}
      <Card>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5, gap: 2, flexWrap: 'wrap' }}>
          <ToggleButtonGroup value={filterDurum} exclusive onChange={(_, val) => { if (val !== null) setFilterDurum(val); }} size="small"
            sx={{
              '& .MuiToggleButton-root': {
                textTransform: 'none', fontSize: '0.78rem', fontWeight: 500, px: 2,
                borderColor: (t) => alpha(t.palette.text.secondary, 0.15),
                '&.Mui-selected': { fontWeight: 600 },
              },
            }}>
            <ToggleButton value="all">Tümü</ToggleButton>
            <ToggleButton value={0}>Beklemede</ToggleButton>
            <ToggleButton value={1}>Onaylanan</ToggleButton>
            <ToggleButton value={2}>Reddedilen</ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Yenile">
            <IconButton id="refresh-leaves-btn" onClick={fetchLeaves}
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', backgroundColor: (t) => alpha(t.palette.primary.main, 0.1) } }}>
              <RefreshOutlined />
            </IconButton>
          </Tooltip>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Öğrenci</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>İzin Türü</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Başlangıç</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Bitiş</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Gideceği Adres</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }} align="center">İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? renderSkeletonRows() : leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {filterDurum !== 'all' ? 'Bu filtreye uygun izin talebi bulunamadı.' : 'Henüz izin talebi yok.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                leaves.map((item) => {
                  const durum = DURUM_MAP[item.onayDurumu] || DURUM_MAP[0];
                  const isPending = item.onayDurumu === 0;

                  return (
                    <TableRow key={item.id} hover sx={{ transition: 'background-color 0.15s ease', '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary' }}>{item.ogrenciAdSoyad}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={item.izinTuruAdi} size="small" variant="outlined" color="primary" sx={{ fontWeight: 500, fontSize: '0.75rem' }} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarTodayOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontSize: '0.83rem' }}>{formatDate(item.baslangicTarihi)}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.83rem' }}>{formatDate(item.bitisTarihi)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.83rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.gidecegiAdres}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip icon={durum.icon as React.ReactElement} label={durum.label} size="small" color={durum.color}
                          sx={{
                            fontWeight: 600, fontSize: '0.72rem',
                            background: (t) => alpha(t.palette[durum.color].main, 0.15),
                            color: `${durum.color}.main`,
                            border: (t) => `1px solid ${alpha(t.palette[durum.color].main, 0.3)}`,
                            '& .MuiChip-icon': { color: 'inherit' },
                          }} />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          {isAdmin && isPending && (
                            <>
                              <Tooltip title="Onayla">
                                <IconButton size="small" onClick={() => handleApprove(item.id)}
                                  sx={{ color: 'success.main', '&:hover': { backgroundColor: (t) => alpha(t.palette.success.main, 0.1) } }}>
                                  <CheckCircleOutlined sx={{ fontSize: 20 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reddet">
                                <IconButton size="small" onClick={() => handleReject(item.id)}
                                  sx={{ color: 'error.main', '&:hover': { backgroundColor: (t) => alpha(t.palette.error.main, 0.1) } }}>
                                  <CancelOutlined sx={{ fontSize: 20 }} />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          {canDelete(item) && (
                            <Tooltip title="Sil">
                              <IconButton size="small" onClick={() => handleOpenDelete(item)}
                                sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', backgroundColor: (t) => alpha(t.palette.error.main, 0.1) } }}>
                                <DeleteOutlined sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {isAdmin && !isPending && !canDelete(item) && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>—</Typography>
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
          Yeni İzin Talebi Dialog
         ═══════════════════════════════════════════ */}
      <Dialog open={formDialogOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, pb: 1 }}>
          Yeni İzin Talebi
          <IconButton onClick={handleCloseForm} size="small" disabled={submitting}><CloseOutlined /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField id="izin-tur" select label="İzin Türü" fullWidth required
              value={formData.izinTurId} disabled={submitting}
              onChange={(e) => setFormData((p) => ({ ...p, izinTurId: Number(e.target.value) }))}>
              {izinTurleri.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.turAdi}</MenuItem>
              ))}
            </TextField>
            <TextField id="izin-baslangic" label="Başlangıç Tarihi" type="date" fullWidth required
              value={formData.baslangicTarihi} disabled={submitting}
              onChange={(e) => setFormData((p) => ({ ...p, baslangicTarihi: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }} />
            <TextField id="izin-bitis" label="Bitiş Tarihi" type="date" fullWidth required
              value={formData.bitisTarihi} disabled={submitting}
              onChange={(e) => setFormData((p) => ({ ...p, bitisTarihi: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }} />
            <TextField id="izin-adres" label="Gideceği Adres" placeholder="İzin süresince kalacağınız adres"
              fullWidth required value={formData.gidecegiAdres} disabled={submitting}
              onChange={(e) => setFormData((p) => ({ ...p, gidecegiAdres: e.target.value }))}
              slotProps={{ htmlInput: { maxLength: 250 } }} />
            <TextField id="izin-aciklama" label="Açıklama" placeholder="İzin sebebinizi belirtiniz"
              fullWidth required multiline rows={3} value={formData.aciklama} disabled={submitting}
              onChange={(e) => setFormData((p) => ({ ...p, aciklama: e.target.value }))}
              slotProps={{ htmlInput: { maxLength: 500 } }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={handleCloseForm} disabled={submitting} sx={{ textTransform: 'none' }}>İptal</Button>
          <Button id="izin-submit-btn" variant="contained" onClick={handleSubmit} disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SaveOutlined />}
            sx={{ textTransform: 'none', fontWeight: 600, minWidth: 120 }}>
            {submitting ? 'Gönderiliyor...' : 'Gönder'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════════════════════════════════════
          Silme Onay Dialog
         ═══════════════════════════════════════════ */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDelete} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>İzin Talebini Sil</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <strong>{deletingItem?.ogrenciAdSoyad}</strong> adlı öğrencinin{' '}
            <strong>{deletingItem?.izinTuruAdi}</strong> talebini silmek istediğinize emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={handleCloseDelete} disabled={deleting} sx={{ textTransform: 'none' }}>İptal</Button>
          <Button id="izin-delete-confirm-btn" variant="contained" color="error" onClick={handleConfirmDelete} disabled={deleting}
            startIcon={deleting ? <CircularProgress size={18} color="inherit" /> : <DeleteOutlined />}
            sx={{ textTransform: 'none', fontWeight: 600, minWidth: 100 }}>
            {deleting ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════════════════════════════════════
          Snackbar Bildirim
         ═══════════════════════════════════════════ */}
      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IzinlerPage;
