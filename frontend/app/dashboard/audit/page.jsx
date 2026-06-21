'use client';

import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, CircularProgress
} from '@mui/material';
import supabase from '@/lib/supabase';

const actionColors = {
  document_viewed:  { bg: '#E3F2FD', color: '#1565C0', label: 'Viewed' },
  document_signed:  { bg: '#E8F5E9', color: '#2E7D32', label: 'Signed' },
  document_uploaded: { bg: '#FFF3E0', color: '#E65100', label: 'Uploaded' },
};

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('http://localhost:8000/api/audit/all/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) setLogs(data.logs);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err.message);
    }
    setLoading(false);
  };

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
};

  const getActionChip = (action) => {
    const config = actionColors[action] || { bg: '#F1EFE8', color: '#444', label: action };
    return (
      <Chip
        label={config.label}
        size="small"
        sx={{ backgroundColor: config.bg, color: config.color, fontWeight: 500 }}
      />
    );
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Audit Trail
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" mb={1}>
              No audit logs yet
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Actions like viewing and signing documents will appear here.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell><Typography fontWeight={600}>Action</Typography></TableCell>
                <TableCell><Typography fontWeight={600}>Document</Typography></TableCell>
                <TableCell><Typography fontWeight={600}>User</Typography></TableCell>
                <TableCell><Typography fontWeight={600}>IP Address</Typography></TableCell>
                <TableCell><Typography fontWeight={600}>Timestamp</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>{getActionChip(log.action)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {log.document_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {log.user_email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {log.ip_address || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(log.created_at)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
