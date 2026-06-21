'use client';

import {
  AppBar, Toolbar, Typography, Box,
  Avatar, IconButton, Tooltip, Chip
} from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #E8EAF0',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
            {getGreeting()}, {displayName.split(' ')[0]} 👋
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Manage and sign your documents
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Notifications">
            <IconButton size="small" sx={{ color: '#9EA3AE' }}>
              <NotificationsNoneOutlinedIcon />
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              backgroundColor: '#F8F9FA',
              border: '1px solid #E8EAF0',
              borderRadius: 3, px: 2, py: 0.8,
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#F0F2F5' },
            }}
            onClick={() => router.push('/dashboard/profile')}
          >
            <Avatar
              sx={{
                width: 32, height: 32,
                background: 'linear-gradient(135deg, #1976D2, #42A5F5)',
                fontSize: 13, fontWeight: 700,
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" fontWeight={600} color="text.primary">
            {displayName}
            </Typography>
             <Typography variant="caption" color="text.secondary">
              {email}
             </Typography>
            </Box>
          </Box>

          <Tooltip title="Logout">
            <IconButton
              onClick={handleLogout}
              size="small"
              sx={{
                color: '#9EA3AE',
                '&:hover': { color: 'error.main', backgroundColor: '#FFEBEE' },
              }}
            >
              <LogoutOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}