import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Skeleton, Container } from '@mui/material';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
        {/* Sidebar Skeleton */}
        <Box
          sx={{
            width: 260,
            bgcolor: '#1e293b',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Skeleton variant="rectangular" height={40} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
          {[...Array(7)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={44}
              sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}
            />
          ))}
        </Box>

        {/* Main Content Skeleton */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header Skeleton */}
          <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e5e7eb', p: 2 }}>
            <Skeleton variant="rectangular" height={40} width={200} />
          </Box>

          {/* Content Skeleton */}
          <Container maxWidth="xl" sx={{ mt: 4, px: { xs: 2, sm: 3, md: 4 } }}>
            <Skeleton variant="rectangular" height={60} sx={{ mb: 3, borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Container>
        </Box>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
