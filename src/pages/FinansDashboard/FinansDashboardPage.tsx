// ──────────────────────────────────────────────
// Finans Dashboard Sayfası — Sadece Admin
// Özet kartlar + Pasta grafik + Bar grafik
// ──────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  alpha,
  useTheme,
} from "@mui/material";
import {
  TrendingUpOutlined,
  TrendingDownOutlined,
  AccountBalanceOutlined,
  BarChartOutlined,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useAuth } from "../../hooks/useAuth";
import { maliIslemService } from "../../api/maliIslemService";
import type { FinansDashboardDto } from "../../types";

// ─── Pie chart renk paleti ────────────────────
const PIE_COLORS = [
  "#6366F1",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
];

// ─── Ay label kısaltma ────────────────────────
const formatAyLabel = (ayStr: string) => {
  const [year, month] = ayStr.split("-");
  const tarih = new Date(Number(year), Number(month) - 1, 1);
  return tarih.toLocaleDateString("tr-TR", { month: "short", year: "2-digit" });
};

// ─── Para formatla ────────────────────────────
const formatTL = (val: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(val);

// ═══════════════════════════════════════════════
// Summary Card
// ═══════════════════════════════════════════════
interface SummaryCardProps {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

const SummaryCard = ({ title, value, color, icon }: SummaryCardProps) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        background: theme.palette.background.paper,
        borderRadius: 3,
        borderLeft: `4px solid ${color}`,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              background: alpha(color, 0.15),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color,
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography variant="h5" fontWeight={700} sx={{ color }}>
          {formatTL(value)}
        </Typography>
      </CardContent>
    </Card>
  );
};

// ═══════════════════════════════════════════════
// Ana Bileşen
// ═══════════════════════════════════════════════
const FinansDashboardPage = () => {
  const { role } = useAuth();
  const theme = useTheme();

  const [dashboard, setDashboard] = useState<FinansDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Rol kontrolü ─────────────────────────────
  if (role !== "Admin") {
    return <Navigate to="/yetkisiz" replace />;
  }

  // ─── Veri çek ──────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await maliIslemService.getDashboard();
      setDashboard(res.data);
    } catch {
      setError("Dashboard verileri yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ─── Net Durum rengi ──────────────────────────
  const netColor =
    dashboard && dashboard.netKasa >= 0
      ? theme.palette.success.main
      : theme.palette.error.main;

  // ─── Ay etiketlerini formatla ─────────────────
  const trendData =
    dashboard?.aylikTrend.map((item) => ({
      ...item,
      ayLabel: formatAyLabel(item.ay),
    })) ?? [];

  // ─── Loading ──────────────────────────────────
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* ══════════════════════════════════════════
          Başlık
         ══════════════════════════════════════════ */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            background: alpha(theme.palette.primary.main, 0.15),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.palette.primary.main,
          }}
        >
          <BarChartOutlined />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Finans Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Kurumsal mali özet ve analiz
          </Typography>
        </Box>
      </Box>

      {/* ── Hata ── */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {dashboard && (
        <>
          {/* ══════════════════════════════════════════
              Özet Kartlar
             ══════════════════════════════════════════ */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <SummaryCard
                title="Toplam Gelir"
                value={dashboard.toplamGelir}
                color={theme.palette.success.main}
                icon={<TrendingUpOutlined />}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <SummaryCard
                title="Toplam Gider"
                value={dashboard.toplamGider}
                color={theme.palette.error.main}
                icon={<TrendingDownOutlined />}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <SummaryCard
                title="Net Durum"
                value={dashboard.netKasa}
                color={netColor}
                icon={<AccountBalanceOutlined />}
              />
            </Grid>
          </Grid>

          {/* ══════════════════════════════════════════
              Grafikler
             ══════════════════════════════════════════ */}
          <Grid container spacing={3}>
            {/* ── Pasta Grafik: Gider Dağılımı ── */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  background: theme.palette.background.paper,
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} mb={3}>
                    Gider Kategorisi Dağılımı
                  </Typography>
                  {dashboard.kategoriDagilimi.length === 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: 280,
                      }}
                    >
                      <Typography color="text.secondary">
                        Gider verisi bulunamadı.
                      </Typography>
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={dashboard.kategoriDagilimi}
                          dataKey="tutar"
                          nameKey="kategoriAdi"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ kategoriAdi, yuzde }) =>
                            `${kategoriAdi} %${yuzde}`
                          }
                          labelLine={false}
                        >
                          {dashboard.kategoriDagilimi.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [
                            formatTL(value),
                            "Tutar",
                          ]}
                          contentStyle={{
                            background: theme.palette.background.paper,
                            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                            borderRadius: 8,
                          }}
                        />
                        <Legend
                          formatter={(value) => (
                            <span
                              style={{
                                color: theme.palette.text.secondary,
                                fontSize: 12,
                              }}
                            >
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* ── Bar Grafik: Aylık Trend ── */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  background: theme.palette.background.paper,
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} mb={3}>
                    Aylık Gelir / Gider Trendi
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={trendData}
                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={alpha(theme.palette.divider, 0.3)}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="ayLabel"
                        tick={{
                          fill: theme.palette.text.secondary,
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{
                          fill: theme.palette.text.secondary,
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}K`}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          formatTL(value),
                          name === "gelir" ? "Gelir" : "Gider",
                        ]}
                        contentStyle={{
                          background: theme.palette.background.paper,
                          border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                          borderRadius: 8,
                        }}
                      />
                      <Legend
                        formatter={(value) => (
                          <span
                            style={{
                              color: theme.palette.text.secondary,
                              fontSize: 12,
                            }}
                          >
                            {value === "gelir" ? "Gelir" : "Gider"}
                          </span>
                        )}
                      />
                      <Bar
                        dataKey="gelir"
                        fill={theme.palette.success.main}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={32}
                      />
                      <Bar
                        dataKey="gider"
                        fill={theme.palette.error.main}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default FinansDashboardPage;
