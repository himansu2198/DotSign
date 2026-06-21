'use client';

import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography,
  Avatar, Button, Divider, CircularProgress, Alert
} from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const displayName = user?.user_metadata?.name || user?.email || 'User';
  const email = user?.email || '';
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric'
      })
    : 'N/A';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Profile
      </Typography>

      <Card sx={{ maxWidth: 500 }}>
        <CardContent sx={{ p: 4 }}>

          {/* Avatar + Name */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 80, height: 80,
                backgroundColor: 'primary.main',
                fontSize: 28, fontWeight: 600,
                mx: 'auto', mb: 2,
              }}
            >
              {initials}
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              {displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              DotSign Member
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* User Info */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <EmailOutlinedIcon sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email address
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {email}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CalendarTodayOutlinedIcon sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Member since
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {createdAt}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Logout */}
          <Button
            variant="outlined"
            color="error"
            fullWidth
            size="large"
            startIcon={<LogoutOutlinedIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>

        </CardContent>
      </Card>
    </Box>
  );
}