import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { OrderStats } from '../../types/analytics.types';

interface OrdersChartProps {
  data: OrderStats;
  isLoading?: boolean;
}

const COLORS = {
  pending: '#ff9800',
  paid: '#2196f3',
  shipped: '#9c27b0',
  delivered: '#4caf50',
  cancelled: '#f44336',
};

export default function OrdersChart({ data, isLoading }: OrdersChartProps) {
  if (isLoading) {
    return (
      <Card sx={{ height: 400 }}>
        <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: 'Pending', value: data.pending, color: COLORS.pending },
    { name: 'Paid', value: data.paid, color: COLORS.paid },
    { name: 'Shipped', value: data.shipped, color: COLORS.shipped },
    { name: 'Delivered', value: data.delivered, color: COLORS.delivered },
    { name: 'Cancelled', value: data.cancelled, color: COLORS.cancelled },
  ].filter(item => item.value > 0);

  return (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Orders by Status
        </Typography>
        <Box sx={{ width: '100%', height: 320, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value, 'Orders']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
