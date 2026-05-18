// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Duyurular SayfasÄ± â€” Okuma EkranÄ± (TÃ¼m Roller)
// Backend rol tabanlÄ± filtreleme yapar; kullanÄ±cÄ±
// yalnÄ±zca kendisine yÃ¶nelik duyurularÄ± gÃ¶rÃ¼r.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Alert,
  Chip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CampaignOutlined,
  ExpandMoreOutlined,
  RefreshOutlined,
  PeopleAltOutlined,
  CalendarTodayOutlined,
} from "@mui/icons-material";
import { duyuruService } from "../../api/duyuruService";
import type { DuyuruDto } from "../../types";

// â”€â”€â”€ YardÄ±mcÄ± fonksiyon â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const formatDate = (iso: string | null): string => {
  if (!iso) return "â€”";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// â”€â”€â”€ Snackbar tipi â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Ana BileÅŸen
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const DuyurularPage = () => {
  const [duyurular, setDuyurular] = useState<DuyuruDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | false>(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const fetchDuyurular = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await duyuruService.getAll();
      setDuyurular(response.data);
    } catch {
      setError("Duyurular yÃ¼klenirken bir hata oluÅŸtu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDuyurular();
  }, [fetchDuyurular]);

  const handleAccordionChange =
    (id: number) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? id : false);
    };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // JSX
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  return (
    <Box>
      {/* â”€â”€â”€ Sayfa BaÅŸlÄ±ÄŸÄ± â”€â”€â”€ */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #06B6D4, #22D3EE)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)",
            }}
          >
            <CampaignOutlined sx={{ color: "#fff", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Duyurular
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontSize: "0.82rem" }}
            >
              {loading ? "..." : `${duyurular.length} duyuru`}
            </Typography>
          </Box>
        </Box>

        <Tooltip title="Yenile">
          <IconButton
            onClick={fetchDuyurular}
            disabled={loading}
            sx={{ color: "text.secondary" }}
          >
            <RefreshOutlined />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* â”€â”€â”€ YÃ¼kleme â”€â”€â”€ */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* â”€â”€â”€ BoÅŸ liste â”€â”€â”€ */}
      {!loading && duyurular.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CampaignOutlined
            sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
          />
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            GÃ¶rÃ¼ntÃ¼lenecek duyuru bulunmamaktadÄ±r.
          </Typography>
        </Box>
      )}

      {/* â”€â”€â”€ Accordion Listesi â”€â”€â”€ */}
      {!loading &&
        duyurular.map((item) => (
          <Accordion
            key={item.id}
            expanded={expanded === item.id}
            onChange={handleAccordionChange(item.id)}
            sx={{
              mb: 1.5,
              borderRadius: "12px !important",
              "&:before": { display: "none" },
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              "&.Mui-expanded": {
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreOutlined />}
              sx={{
                px: 3,
                py: 0.5,
                borderRadius: "12px",
                "& .MuiAccordionSummary-content": {
                  alignItems: "center",
                  gap: 1.5,
                  flexWrap: "wrap",
                },
              }}
            >
              {/* BaÅŸlÄ±k */}
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, flexGrow: 1, fontSize: "0.95rem" }}
              >
                {item.baslik}
              </Typography>

              {/* Hedef Kitle Chip */}
              {item.hedefRolAdi ? (
                <Chip
                  icon={
                    <PeopleAltOutlined sx={{ fontSize: "14px !important" }} />
                  }
                  label={item.hedefRolAdi}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 500, fontSize: "0.7rem" }}
                />
              ) : (
                <Chip
                  label="Genel"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 500, fontSize: "0.7rem" }}
                />
              )}

              {/* Tarih */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "text.secondary",
                }}
              >
                <CalendarTodayOutlined sx={{ fontSize: 14 }} />
                <Typography variant="caption">
                  {formatDate(item.yayinTarihi ?? item.olusturulmaTarihi)}
                </Typography>
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ px: 3, pb: 2.5 }}>
              <Typography
                variant="body2"
                sx={{
                  lineHeight: 1.8,
                  color: "text.secondary",
                  whiteSpace: "pre-wrap",
                }}
              >
                {item.icerik}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}

      {/* â”€â”€â”€ Snackbar â”€â”€â”€ */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
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

export default DuyurularPage;
