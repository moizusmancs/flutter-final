import { Card, CardContent, Typography, Box } from '@mui/material';
import type { ReactNode } from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  growth?: number;
  color?: string;
}

export default function StatCard({ title, value, icon, growth, color = '#1976d2' }: StatCardProps) {
  const hasGrowth = growth !== undefined;
  const isPositive = growth && growth > 0;

  return (
    <Card
      sx={{
        height: '100%',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        '&:hover': {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
        transition: 'box-shadow 0.2s',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
              {value}
            </Typography>
            {hasGrowth && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {isPositive ? (
                  <TrendingUpIcon fontSize="small" sx={{ color: 'success.main' }} />
                ) : (
                  <TrendingDownIcon fontSize="small" sx={{ color: 'error.main' }} />
                )}
                <Typography
                  variant="body2"
                  sx={{ color: isPositive ? 'success.main' : 'error.main' }}
                >
                  {Math.abs(growth!).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  vs last month
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}15`,
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
