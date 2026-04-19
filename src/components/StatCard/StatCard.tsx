// ──────────────────────────────────────────────
// StatCard — Dashboard istatistik kartı
// Count-up animasyonu, gradient ikon, entrance efekti
// ──────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, Box, Typography, alpha } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;       // CSS gradient string
  subtitle?: string;
  /** Entrance animasyonu gecikme süresi (örn: "0.1s") */
  delay?: string;
  /** Trend göstergesi: "up" | "down" | null */
  trend?: 'up' | 'down' | null;
  sx?: SxProps<Theme>;
}

/** Sayıyı 0'dan hedef değere animate eden hook */
const useCountUp = (end: number, duration = 1200): number => {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (end === 0) {
      setCurrent(0);
      return;
    }

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCurrent(Math.round(eased * end));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration]);

  return current;
};

const StatCard = ({ title, value, icon, gradient, subtitle, delay = '0s', trend, sx }: StatCardProps) => {
  // Sadece sayısal değerler için count-up uygula
  const isNumeric = typeof value === 'number';
  const animatedValue = useCountUp(isNumeric ? value : 0);

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeInUp 0.5s ease-out both',
        animationDelay: delay,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 30px ${alpha('#000', 0.35)}`,
        },
        ...sx,
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontSize: '0.8rem', mb: 0.5 }}
            >
              {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.8rem', sm: '2.2rem' },
                }}
              >
                {isNumeric ? animatedValue : value}
              </Typography>
              {/* Trend göstergesi */}
              {trend && (
                <Typography
                  variant="caption"
                  sx={{
                    color: trend === 'up' ? 'success.main' : 'error.main',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                >
                  {trend === 'up' ? '↑' : '↓'}
                </Typography>
              )}
            </Box>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {/* İkon kutusu */}
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              background: gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 4px 14px ${alpha('#000', 0.2)}`,
              transition: 'transform 0.3s ease',
              '.MuiCard-root:hover &': {
                transform: 'scale(1.08) rotate(3deg)',
              },
              '& .MuiSvgIcon-root': {
                fontSize: 26,
                color: '#fff',
              },
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>

      {/* Dekoratif arka plan gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: gradient,
          opacity: 0.06,
          transition: 'opacity 0.3s ease',
          '.MuiCard-root:hover &': {
            opacity: 0.12,
          },
        }}
      />
      {/* İkinci dekoratif daire */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -20,
          left: -20,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: gradient,
          opacity: 0.04,
        }}
      />
    </Card>
  );
};

export default StatCard;
