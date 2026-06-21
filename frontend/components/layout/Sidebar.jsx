'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Box, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Typography, Divider
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';

const SIDEBAR_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', icon: <DashboardOutlinedIcon />, path: '/dashboard' },
  { label: 'Documents', icon: <FolderOutlinedIcon />, path: '/dashboard/documents' },
  { label: 'Upload', icon: <UploadFileOutlinedIcon />, path: '/dashboard/documents/upload' },
  { label: 'Audit Trail', icon: <HistoryOutlinedIcon />, path: '/dashboard/audit' },
  { label: 'Profile', icon: <PersonOutlineOutlinedIcon />, path: '/dashboard/profile' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        backgroundColor: '#fff',
        borderRight: '1px solid #E8EAF0',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 3, py: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: '10px',
          background: 'linear-gradient(135deg, #1976D2, #42A5F5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(25,118,210,0.3)',
        }}>
          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>D</Typography>
        </Box>
        <Typography variant="h6" fontWeight={700} color="primary.main">
          DotSign
        </Typography>
      </Box>

      <Divider sx={{ borderColor: '#F0F2F5' }} />

      {/* Nav label */}
      <Typography
        variant="caption"
        sx={{ px: 3, pt: 2.5, pb: 1, color: '#9EA3AE', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}
      >
        Main Menu
      </Typography>

      {/* Nav Items */}
      <List sx={{ px: 1.5, flexGrow: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => router.push(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? '#EBF4FF' : 'transparent',
                  color: isActive ? '#1976D2' : '#5F6368',
                  borderLeft: isActive ? '3px solid #1976D2' : '3px solid transparent',
                  '&:hover': {
                    backgroundColor: isActive ? '#EBF4FF' : '#F8F9FA',
                    color: '#1976D2',
                  },
                  transition: 'all 0.15s',
                  py: 1.2,
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 36,
                  color: isActive ? '#1976D2' : '#9EA3AE',
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 400,
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: '#F0F2F5' }} />

      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="caption" color="#C4C8D0">
          DotSign v1.0 — Built with FastAPI
        </Typography>
      </Box>
    </Box>
  );
}