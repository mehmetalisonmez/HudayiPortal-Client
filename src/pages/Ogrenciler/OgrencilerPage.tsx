// ──────────────────────────────────────────────
// Öğrenciler Sayfası — Tam CRUD (Oluştur / Düzenle / Sil)
// API entegrasyonu, Dialog form, Snackbar bildirim
// Sadece Admin ve Personel görebilir
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Chip, Avatar, TextField,
  InputAdornment, Skeleton, Alert, alpha, IconButton, Tooltip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar,
  CircularProgress, MenuItem,
} from '@mui/material';
import {
  SearchOutlined, PersonAddOutlined, RefreshOutlined, PeopleOutlined,
  EditOutlined, DeleteOutlined, CloseOutlined, SaveOutlined,
} from '@mui/icons-material';
import { kullaniciService } from '../../api/kullaniciService';
import type { KullaniciListDto, CreateKullaniciRequest, UpdateKullaniciRequest, OdaListDto } from '../../types';

// ─── Form State ───────────────────────────────
interface FormState {
  ad: string;
  soyad: string;
  tcKimlikNo: string;
  telefon: string;
  email: string;
  odaId: number | '';
  dogumTarihi: string;
  kanGrubu: string;
  sifre: string;
}

const INITIAL_FORM: FormState = {
  ad: '', soyad: '', tcKimlikNo: '', telefon: '', email: '',
  odaId: '', dogumTarihi: '', kanGrubu: '', sifre: '',
};

// ─── Snackbar State ───────────────────────────
interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

// ─── Kan Grubu Seçenekleri ────────────────────
const KAN_GRUPLARI = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'];

// ══════════════════════════════════════════════
// Ana Bileşen
// ══════════════════════════════════════════════

const OgrencilerPage = () => {
  // ─── Veri state'leri ──────────────────────────
  const [students, setStudents] = useState<KullaniciListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // ─── Oda listesi ──────────────────────────────
  const [odalar, setOdalar] = useState<OdaListDto[]>([]);

  // ─── Dialog state'leri ────────────────────────
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KullaniciListDto | null>(null);
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  // ─── Silme dialog state'i ─────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<KullaniciListDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Snackbar state'i ─────────────────────────
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false, message: '', severity: 'success',
  });

  // ─── Veri çekme ───────────────────────────────
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await kullaniciService.getOgrenciList({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        searchTerm: searchTerm || undefined,
      });
      const data = response.data;
      setStudents(data.data);
      setTotalRecords(data.totalRecords);
    } catch {
      setError('Öğrenci listesi yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // Oda listesini çek
  useEffect(() => {
    kullaniciService.getOdaList()
      .then((res) => setOdalar(res.data))
      .catch(() => { /* Oda listesi yüklenemezse sessizce geç */ });
  }, []);

  // Arama debounce
  useEffect(() => {
    const timeout = setTimeout(() => { setPage(0); }, 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

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

  const handleOpenEdit = (item: KullaniciListDto) => {
    setEditingItem(item);
    // Mevcut oda ID'sini bul (odaNo'dan)
    const matchedOda = odalar.find((o) => o.odaNo === item.odaNo);
    setFormData({
      ad: item.ad,
      soyad: item.soyad,
      tcKimlikNo: item.tcKimlikNo || '',
      telefon: item.telefon || '',
      email: item.email || '',
      odaId: matchedOda ? matchedOda.id : '',
      dogumTarihi: '',
      kanGrubu: '',
      sifre: '',
    });
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    if (submitting) return;
    setFormDialogOpen(false);
    setEditingItem(null);
    setFormData(INITIAL_FORM);
  };

  // ─── Form field değiştirici ───────────────────
  const handleFieldChange = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  // ─── Axios hata mesajı çıkarıcı ────────────────
  const extractErrorMessage = (err: unknown, fallback: string): string => {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const axiosErr = err as { response?: { data?: { message?: string; Message?: string; errors?: string[]; Errors?: string[]; title?: string } } };
      const data = axiosErr.response?.data;
      if (data) {
        // Backend ErrorResult — PascalCase veya camelCase olabilir
        const errors = data.errors ?? data.Errors;
        const message = data.message ?? data.Message ?? data.title;
        if (errors && errors.length > 0) return errors.join(' | ');
        if (message) return message;
      }
    }
    if (err instanceof Error) return err.message;
    return fallback;
  };

  // ─── Form Gönder (Create / Update) ───────────
  const handleSubmit = async () => {
    if (!formData.ad.trim()) { showSnackbar('Ad alanı zorunludur.', 'warning'); return; }
    if (!formData.soyad.trim()) { showSnackbar('Soyad alanı zorunludur.', 'warning'); return; }

    setSubmitting(true);
    try {
      const dogumTarihi = formData.dogumTarihi
        ? new Date(formData.dogumTarihi).toISOString()
        : null;
      const odaId = formData.odaId === '' ? null : Number(formData.odaId);

      if (editingItem) {
        const updatePayload: UpdateKullaniciRequest = {
          id: editingItem.id,
          odaId,
          ad: formData.ad.trim(),
          soyad: formData.soyad.trim(),
          tcKimlikNo: formData.tcKimlikNo.trim() || null,
          telefon: formData.telefon.trim() || null,
          email: formData.email.trim() || null,
          dogumTarihi,
          kanGrubu: formData.kanGrubu.trim() || null,
        };
        console.log('[Update] Payload:', updatePayload);
        await kullaniciService.update(editingItem.id, updatePayload);
        showSnackbar('Öğrenci başarıyla güncellendi.');
      } else {
        const createPayload: CreateKullaniciRequest = {
          rolId: 1, // Öğrenci rolü
          odaId,
          ad: formData.ad.trim(),
          soyad: formData.soyad.trim(),
          tcKimlikNo: formData.tcKimlikNo.trim() || null,
          telefon: formData.telefon.trim() || null,
          email: formData.email.trim() || null,
          sifre: formData.sifre.trim() || null,
          dogumTarihi,
          kanGrubu: formData.kanGrubu.trim() || null,
        };
        console.log('[Create] Payload:', createPayload);
        await kullaniciService.create(createPayload);
        showSnackbar('Öğrenci başarıyla oluşturuldu.');
      }

      // Dialog'u kapat — submitting guard'ını atla, doğrudan state'i güncelle
      setFormDialogOpen(false);
      setEditingItem(null);
      setFormData(INITIAL_FORM);
      fetchStudents();
    } catch (err: unknown) {
      console.error('[OgrencilerPage] Submit hatası:', err);
      const fallback = editingItem
        ? 'Öğrenci güncellenirken bir hata oluştu.'
        : 'Öğrenci oluşturulurken bir hata oluştu.';
      showSnackbar(extractErrorMessage(err, fallback), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Silme Dialog ─────────────────────────────
  const handleOpenDelete = (item: KullaniciListDto) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    if (deleting) return;
    setDeleteDialogOpen(false);
    setDeletingItem(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      await kullaniciService.delete(deletingItem.id);
      showSnackbar('Öğrenci başarıyla silindi.');
      handleCloseDeleteDialog();
      fetchStudents();
    } catch {
      showSnackbar('Öğrenci silinirken bir hata oluştu.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ─── Skeleton Satırları ───────────────────────
  const renderSkeletonRows = () =>
    Array.from({ length: rowsPerPage }).map((_, i) => (
      <TableRow key={`skeleton-${i}`}>
        {Array.from({ length: 7 }).map((_, j) => (
          <TableCell key={j}>
            <Skeleton variant="text" width={j === 0 ? 160 : '80%'} />
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
              width: 44, height: 44, borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366F1, #818CF8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            }}
          >
            <PeopleOutlined sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Öğrenciler</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
              Toplam {totalRecords} kayıtlı öğrenci
            </Typography>
          </Box>
        </Box>

        <Button
          id="add-student-btn"
          variant="contained"
          startIcon={<PersonAddOutlined />}
          onClick={handleOpenCreate}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Yeni Öğrenci Ekle
        </Button>
      </Box>

      {/* ─── Hata ─── */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* ─── Tablo Kartı ─── */}
      <Card>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5, gap: 2, flexWrap: 'wrap' }}>
          <TextField
            id="student-search"
            placeholder="İsim, e-posta veya TC ile ara..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 280, maxWidth: 400 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Tooltip title="Yenile">
            <IconButton
              id="refresh-students-btn"
              onClick={fetchStudents}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main', backgroundColor: (t) => alpha(t.palette.primary.main, 0.1) },
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
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Öğrenci</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>TC Kimlik No</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Telefon</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>E-posta</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Oda</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }} align="center">İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                renderSkeletonRows()
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {searchTerm ? 'Aramanıza uygun öğrenci bulunamadı.' : 'Henüz kayıtlı öğrenci yok.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow
                    key={student.id}
                    hover
                    sx={{ transition: 'background-color 0.15s ease', '&:last-child td': { border: 0 } }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 34, height: 34,
                            background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
                            fontSize: '0.8rem', fontWeight: 600,
                          }}
                        >
                          {student.ad.charAt(0)}{student.soyad.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {student.ad} {student.soyad}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.83rem', fontFamily: 'monospace' }}>
                        {student.tcKimlikNo || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.83rem' }}>
                        {student.telefon || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.83rem' }}>
                        {student.email || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={student.odaNo || 'Atanmadı'}
                        size="small"
                        variant="outlined"
                        color={student.odaNo ? 'primary' : 'default'}
                        sx={{ fontWeight: 500, fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={student.aktifMi === false ? 'Pasif' : 'Aktif'}
                        size="small"
                        color={student.aktifMi === false ? 'default' : 'success'}
                        sx={{
                          fontWeight: 600, fontSize: '0.72rem',
                          ...(student.aktifMi !== false && {
                            background: (t) => alpha(t.palette.success.main, 0.15),
                            color: 'success.main',
                            border: (t) => `1px solid ${alpha(t.palette.success.main, 0.3)}`,
                          }),
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="Düzenle">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEdit(student)}
                            sx={{
                              color: 'text.secondary',
                              '&:hover': { color: 'info.main', backgroundColor: (t) => alpha(t.palette.info.main, 0.1) },
                            }}
                          >
                            <EditOutlined sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDelete(student)}
                            sx={{
                              color: 'text.secondary',
                              '&:hover': { color: 'error.main', backgroundColor: (t) => alpha(t.palette.error.main, 0.1) },
                            }}
                          >
                            <DeleteOutlined sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalRecords}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Sayfa başına:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} / ${count !== -1 ? count : `${to}'dan fazla`}`
          }
          sx={{
            borderTop: (t) => `1px solid ${alpha(t.palette.text.secondary, 0.08)}`,
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.82rem' },
          }}
        />
      </Card>

      {/* ═══════════════════════════════════════════
          Yeni / Düzenle Dialog
         ═══════════════════════════════════════════ */}
      <Dialog open={formDialogOpen} onClose={handleCloseFormDialog} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, pb: 1 }}>
          {editingItem ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Ekle'}
          <IconButton onClick={handleCloseFormDialog} size="small" disabled={submitting}>
            <CloseOutlined />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            {/* Ad & Soyad */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField id="ogrenci-ad" label="Ad" placeholder="Öğrenci adı" fullWidth required
                value={formData.ad} onChange={handleFieldChange('ad')} disabled={submitting} slotProps={{ htmlInput: { maxLength: 50 } }} />
              <TextField id="ogrenci-soyad" label="Soyad" placeholder="Öğrenci soyadı" fullWidth required
                value={formData.soyad} onChange={handleFieldChange('soyad')} disabled={submitting} slotProps={{ htmlInput: { maxLength: 50 } }} />
            </Box>

            {/* TC Kimlik No */}
            <TextField id="ogrenci-tc" label="TC Kimlik No" placeholder="11 haneli TC kimlik numarası" fullWidth
              value={formData.tcKimlikNo} onChange={handleFieldChange('tcKimlikNo')} disabled={submitting}
              slotProps={{ htmlInput: { maxLength: 11 } }} helperText="Opsiyonel — 11 haneli rakam" />

            {/* Telefon & E-posta */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField id="ogrenci-telefon" label="Telefon" placeholder="05XX XXX XXXX" fullWidth
                value={formData.telefon} onChange={handleFieldChange('telefon')} disabled={submitting} slotProps={{ htmlInput: { maxLength: 15 } }} />
              <TextField id="ogrenci-email" label="E-posta" placeholder="ornek@email.com" fullWidth
                value={formData.email} onChange={handleFieldChange('email')} disabled={submitting} slotProps={{ htmlInput: { maxLength: 100 } }} />
            </Box>

            {/* Oda Seçimi */}
            <TextField id="ogrenci-oda" label="Oda" select fullWidth value={formData.odaId} disabled={submitting}
              onChange={(e) => setFormData((prev) => ({ ...prev, odaId: e.target.value === '' ? '' : Number(e.target.value) }))}
              helperText="Opsiyonel — öğrencinin kalacağı oda"
            >
              <MenuItem value="">Oda Seçilmedi</MenuItem>
              {odalar.map((oda) => (
                <MenuItem key={oda.id} value={oda.id}>
                  {oda.odaNo} — Kat {oda.kat} (Kapasite: {oda.kapasite})
                </MenuItem>
              ))}
            </TextField>

            {/* Doğum Tarihi & Kan Grubu */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField id="ogrenci-dogumtarihi" label="Doğum Tarihi" type="date" fullWidth
                value={formData.dogumTarihi} onChange={handleFieldChange('dogumTarihi')} disabled={submitting}
                slotProps={{ inputLabel: { shrink: true } }} helperText="Opsiyonel" />
              <TextField id="ogrenci-kangrubu" label="Kan Grubu" select fullWidth value={formData.kanGrubu} disabled={submitting}
                onChange={handleFieldChange('kanGrubu')} helperText="Opsiyonel"
              >
                <MenuItem value="">Seçilmedi</MenuItem>
                {KAN_GRUPLARI.map((kg) => (
                  <MenuItem key={kg} value={kg}>{kg}</MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Şifre — sadece yeni kayıtta */}
            {!editingItem && (
              <TextField id="ogrenci-sifre" label="Şifre" type="password" placeholder="En az 6 karakter" fullWidth
                value={formData.sifre} onChange={handleFieldChange('sifre')} disabled={submitting}
                slotProps={{ htmlInput: { maxLength: 100 } }} helperText="Opsiyonel — boş bırakılırsa şifre atanmaz" />
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={handleCloseFormDialog} disabled={submitting} sx={{ textTransform: 'none' }}>İptal</Button>
          <Button id="ogrenci-submit-btn" variant="contained" onClick={handleSubmit} disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SaveOutlined />}
            sx={{ textTransform: 'none', fontWeight: 600, minWidth: 120 }}
          >
            {submitting ? 'Kaydediliyor...' : editingItem ? 'Güncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════════════════════════════════════
          Silme Onay Dialog
         ═══════════════════════════════════════════ */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Öğrenciyi Sil</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <strong>"{deletingItem?.ad} {deletingItem?.soyad}"</strong> isimli öğrenciyi silmek istediğinize emin misiniz?
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={handleCloseDeleteDialog} disabled={deleting} sx={{ textTransform: 'none' }}>İptal</Button>
          <Button id="ogrenci-delete-confirm-btn" variant="contained" color="error" onClick={handleConfirmDelete} disabled={deleting}
            startIcon={deleting ? <CircularProgress size={18} color="inherit" /> : <DeleteOutlined />}
            sx={{ textTransform: 'none', fontWeight: 600, minWidth: 100 }}
          >
            {deleting ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════════════════════════════════════
          Snackbar Bildirim
         ═══════════════════════════════════════════ */}
      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OgrencilerPage;
