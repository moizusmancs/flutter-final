import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

const DRAWER_WIDTH = 260;

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (admin?.username) {
      return admin.username.slice(0, 2).toUpperCase();
    }
    if (admin?.email) {
      return admin.email.slice(0, 2).toUpperCase();
    }
    return 'AD';
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        ml: `${DRAWER_WIDTH}px`,
        bgcolor: 'white',
        color: 'text.primary',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        borderBottom: '1px solid #e5e7eb',
      }}
      elevation={0}
    >
      <Toolbar>
        {title && (
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
            {title}
          </Typography>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
              {admin?.username || admin?.email}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {admin?.role?.replace('_', ' ').toUpperCase() || 'Admin'}
            </Typography>
          </Box>

          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar
              sx={{
                bgcolor: '#3b82f6',
                width: 40,
                height: 40,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {getInitials()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            sx={{ mt: 1 }}
            PaperProps={{
              sx: {
                minWidth: 200,
                borderRadius: 2,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {admin?.username || 'Admin'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {admin?.email}
              </Typography>
            </Box>

            <Divider />

            <MenuItem onClick={handleLogout} sx={{ py: 1.5, gap: 1.5 }}>
              <LogoutIcon fontSize="small" />
              <Typography variant="body2">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
