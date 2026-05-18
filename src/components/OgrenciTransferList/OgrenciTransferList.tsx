// ──────────────────────────────────────────────
// Öğrenci Transfer List — Toplu öğrenci atama bileşeni
// MUI Grid + List + Checkbox tabanlı iki panelli transfer list
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Button,
  TextField,
  InputAdornment,
  Skeleton,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  alpha,
} from "@mui/material";
import {
  ChevronRightOutlined,
  ChevronLeftOutlined,
  SearchOutlined,
  SaveOutlined,
} from "@mui/icons-material";
import { sohbetService } from "../../api/sohbetService";
import type { AvailableOgrenciDto } from "../../types";

interface Props {
  grupId: number;
  onSaved?: () => void;
}

const OgrenciTransferList = ({ grupId, onSaved }: Props) => {
  // ─── Data ──────────────────────────────────
  const [allStudents, setAllStudents] = useState<AvailableOgrenciDto[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Selection ─────────────────────────────
  const [checkedLeft, setCheckedLeft] = useState<Set<number>>(new Set());
  const [checkedRight, setCheckedRight] = useState<Set<number>>(new Set());

  // ─── Search ────────────────────────────────
  const [searchLeft, setSearchLeft] = useState("");
  const [searchRight, setSearchRight] = useState("");

  // ─── Save ──────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // ─── Snackbar ──────────────────────────────
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // ─── Fetch data ────────────────────────────
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sohbetService.getAvailableOgrenciler(grupId);
      setAllStudents(res.data);
      const ids = new Set(
        res.data.filter((s) => s.isAssigned).map((s) => s.kullaniciId),
      );
      setAssignedIds(ids);
      setDirty(false);
      setCheckedLeft(new Set());
      setCheckedRight(new Set());
    } catch {
      setError("Öğrenci listesi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [grupId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ─── Derived lists ─────────────────────────
  const leftStudents = useMemo(
    () => allStudents.filter((s) => !assignedIds.has(s.kullaniciId)),
    [allStudents, assignedIds],
  );
  const rightStudents = useMemo(
    () => allStudents.filter((s) => assignedIds.has(s.kullaniciId)),
    [allStudents, assignedIds],
  );

  const filterFn = (s: AvailableOgrenciDto, q: string) => {
    if (!q) return true;
    const lower = q.toLowerCase();
    return (
      s.ad.toLowerCase().includes(lower) ||
      s.soyad.toLowerCase().includes(lower) ||
      (s.odaNo ?? "").toLowerCase().includes(lower)
    );
  };

  const filteredLeft = useMemo(
    () => leftStudents.filter((s) => filterFn(s, searchLeft)),
    [leftStudents, searchLeft],
  );
  const filteredRight = useMemo(
    () => rightStudents.filter((s) => filterFn(s, searchRight)),
    [rightStudents, searchRight],
  );

  // ─── Toggle checkbox ──────────────────────
  const toggleCheck = (
    id: number,
    set: Set<number>,
    setter: React.Dispatch<React.SetStateAction<Set<number>>>,
  ) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ─── Move right → assign ──────────────────
  const moveRight = () => {
    setAssignedIds((prev) => {
      const next = new Set(prev);
      checkedLeft.forEach((id) => next.add(id));
      return next;
    });
    setCheckedLeft(new Set());
    setDirty(true);
  };

  // ─── Move left → unassign ─────────────────
  const moveLeft = () => {
    setAssignedIds((prev) => {
      const next = new Set(prev);
      checkedRight.forEach((id) => next.delete(id));
      return next;
    });
    setCheckedRight(new Set());
    setDirty(true);
  };

  // ─── Save ──────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await sohbetService.syncOgrenciler(grupId, {
        sohbetGrupId: grupId,
        kullaniciIds: Array.from(assignedIds),
      });
      setSnackbar({
        open: true,
        message: "Öğrenci listesi güncellendi.",
        severity: "success",
      });
      setDirty(false);
      onSaved?.();
    } catch {
      setSnackbar({
        open: true,
        message: "Kayıt sırasında bir hata oluştu.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading / Error ──────────────────────
  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={48}
            sx={{ mb: 1, borderRadius: 1 }}
          />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  // ─── Panel renderer ───────────────────────
  const renderPanel = (
    title: string,
    students: AvailableOgrenciDto[],
    checked: Set<number>,
    onToggle: (id: number) => void,
    search: string,
    onSearch: (v: string) => void,
    count: number,
  ) => (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 360,
        maxHeight: 480,
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          p: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}{" "}
          <Typography
            component="span"
            variant="caption"
            sx={{ color: "text.secondary" }}
          >
            ({count})
          </Typography>
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ px: 1.5, py: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Ara..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined
                  fontSize="small"
                  sx={{ color: "text.secondary" }}
                />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <List
        dense
        sx={{
          flex: 1,
          overflow: "auto",
          px: 0.5,
        }}
      >
        {students.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ textAlign: "center", py: 4, color: "text.secondary" }}
          >
            Öğrenci bulunamadı.
          </Typography>
        ) : (
          students.map((s) => (
            <ListItemButton
              key={s.kullaniciId}
              dense
              onClick={() => onToggle(s.kullaniciId)}
              sx={{ borderRadius: 1, mb: 0.25 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Checkbox
                  edge="start"
                  checked={checked.has(s.kullaniciId)}
                  disableRipple
                  size="small"
                />
              </ListItemIcon>
              <ListItemText
                primary={`${s.ad} ${s.soyad}`}
                secondary={s.odaNo ? `Oda: ${s.odaNo}` : undefined}
                primaryTypographyProps={{
                  fontSize: "0.83rem",
                  fontWeight: 500,
                }}
                secondaryTypographyProps={{ fontSize: "0.72rem" }}
              />
            </ListItemButton>
          ))
        )}
      </List>
    </Paper>
  );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "stretch",
        }}
      >
        {/* Sol panel — Atanmamış */}
        {renderPanel(
          "Atanmamış Öğrenciler",
          filteredLeft,
          checkedLeft,
          (id) => toggleCheck(id, checkedLeft, setCheckedLeft),
          searchLeft,
          setSearchLeft,
          leftStudents.length,
        )}

        {/* Orta butonlar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={moveRight}
            disabled={checkedLeft.size === 0}
            sx={{ minWidth: 40, px: 1 }}
          >
            <ChevronRightOutlined />
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={moveLeft}
            disabled={checkedRight.size === 0}
            sx={{ minWidth: 40, px: 1 }}
          >
            <ChevronLeftOutlined />
          </Button>
        </Box>

        {/* Sağ panel — Atanmış */}
        {renderPanel(
          "Gruba Atanmış Öğrenciler",
          filteredRight,
          checkedRight,
          (id) => toggleCheck(id, checkedRight, setCheckedRight),
          searchRight,
          setSearchRight,
          rightStudents.length,
        )}
      </Box>

      {/* Kaydet butonu */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="contained"
          disabled={!dirty || saving}
          onClick={handleSave}
          startIcon={
            saving ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SaveOutlined />
            )
          }
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OgrenciTransferList;
