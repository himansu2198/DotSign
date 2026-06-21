'use client';

import { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, CircularProgress } from '@mui/material';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import supabase from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    signed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      const { data, error } = await supabase.storage
        .from('documents')
        .list(userId);

      if (!error && data) {
        const signedCount = data.filter(f => f.name.startsWith('signed_')).length;
        const totalOriginal = data.filter(f => !f.name.startsWith('signed_')).length;

        setStats({
          total: totalOriginal,
          pending: totalOriginal - signedCount,
          signed: signedCount,
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err.message);
    }
    setLoading(false);
  };

  const statCards = [
    {
      label: 'Total Documents',
      value: loading ? '...' : stats.total,
      icon: <FolderOutlinedIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      bg: '#E3F2FD',
    },
    {
      label: 'Pending Signatures',
      value: loading ? '...' : stats.pending,
      icon: <PendingOutlinedIcon sx={{ fontSize: 32, color: '#ED6C02' }} />,
      bg: '#FFF3E0',
    },
    {
      label: 'Signed Documents',
      value: loading ? '...' : stats.signed,
      icon: <CheckCircleOutlinedIcon sx={{ fontSize: 32, color: '#2E7D32' }} />,
      bg: '#E8F5E9',
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight={600}>
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<UploadFileOutlinedIcon />}
          onClick={() => router.push('/dashboard/documents/upload')}
        >
          Upload Document
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }} columns={12}>
        {statCards.map((card) => (
          <Grid size={{ xs: 12, sm: 4 }} key={card.label}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 56, height: 56, borderRadius: 2,
                  backgroundColor: card.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <FolderOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={1}>
            {stats.total === 0 ? 'No documents yet' : `${stats.total} document(s) uploaded`}
          </Typography>
          <Typography variant="body2" color="text.disabled" mb={3}>
            {stats.total === 0
              ? 'Upload your first PDF to get started'
              : `${stats.signed} signed · ${stats.pending} pending`
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={stats.total === 0 ? <UploadFileOutlinedIcon /> : <FolderOutlinedIcon />}
            onClick={() => router.push(
              stats.total === 0
                ? '/dashboard/documents/upload'
                : '/dashboard/documents'
            )}
          >
            {stats.total === 0 ? 'Upload Document' : 'View Documents'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}