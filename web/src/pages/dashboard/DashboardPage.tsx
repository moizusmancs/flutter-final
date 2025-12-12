import { Container, Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analytics.api';
import StatCard from '../../components/dashboard/StatCard';
import RevenueChart from '../../components/dashboard/RevenueChart';
import OrdersChart from '../../components/dashboard/OrdersChart';
import TopProductsTable from '../../components/dashboard/TopProductsTable';
import RecentOrdersList from '../../components/dashboard/RecentOrdersList';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import DashboardIcon from '@mui/icons-material/Dashboard';

export default function DashboardPage() {
  // Fetch overall stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: () => analyticsApi.getStats(),
  });

  // Fetch revenue data
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['analytics-revenue'],
    queryFn: () => analyticsApi.getRevenue({ period: 'month' }),
  });

  // Fetch top products
  const { data: topProductsData, isLoading: topProductsLoading } = useQuery({
    queryKey: ['analytics-top-products'],
    queryFn: () => analyticsApi.getTopProducts({ limit: 10, period: '30days' }),
  });

  // Fetch recent orders
  const { data: recentOrdersData, isLoading: recentOrdersLoading } = useQuery({
    queryKey: ['analytics-recent-orders'],
    queryFn: () => analyticsApi.getRecentOrders({ limit: 10 }),
  });

  const stats = statsData?.stats;

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ py: 4 }}>
        {/* Page Title */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <DashboardIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Box sx={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>
                Dashboard
              </Box>
              <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
                Welcome back! Here's what's happening with your store today.
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Key Metrics */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
            mb: 4,
          }}
        >
          <StatCard
            title="Total Revenue"
            value={stats ? formatCurrency(stats.revenue.total) : '$0.00'}
            icon={<AttachMoneyIcon sx={{ fontSize: 32 }} />}
            growth={stats?.revenue.growth_percentage}
            color="#10b981"
          />
          <StatCard
            title="Total Orders"
            value={stats ? stats.orders.total.toLocaleString() : '0'}
            icon={<ShoppingCartIcon sx={{ fontSize: 32 }} />}
            growth={stats?.orders_trend.growth_percentage}
            color="#3b82f6"
          />
          <StatCard
            title="Total Users"
            value={stats ? stats.users.total.toLocaleString() : '0'}
            icon={<PeopleIcon sx={{ fontSize: 32 }} />}
            color="#8b5cf6"
          />
          <StatCard
            title="Active Products"
            value={stats ? stats.products.active.toLocaleString() : '0'}
            icon={<InventoryIcon sx={{ fontSize: 32 }} />}
            color="#f59e0b"
          />
        </Box>

        {/* Charts */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '2fr 1fr',
            },
            gap: 3,
            mb: 4,
          }}
        >
          <RevenueChart data={revenueData?.data || []} isLoading={revenueLoading} />
          <OrdersChart
            data={stats?.orders || { total: 0, pending: 0, paid: 0, shipped: 0, delivered: 0, cancelled: 0 }}
            isLoading={statsLoading}
          />
        </Box>

        {/* Tables */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
            },
            gap: 3,
          }}
        >
          <TopProductsTable products={topProductsData?.products || []} isLoading={topProductsLoading} />
          <RecentOrdersList orders={recentOrdersData?.orders || []} isLoading={recentOrdersLoading} />
        </Box>
      </Box>
    </Container>
  );
}
