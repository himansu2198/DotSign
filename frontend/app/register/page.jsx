'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, CircularProgress, Divider,
  IconButton, InputAdornment
} from '@mui/material';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import supabase from '@/lib/supabase';
import api from '@/lib/axios';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    try {
      await api.post('/api/auth/register', { name, email });
    } catch (err) {
      console.error('DB sync failed:', err.message);
    }

    router.push('/dashboard');
  };

  if (success) {
    return (
      <Box sx={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #F0F4FF 0%, #E8F0FE 100%)',
        px: 2,
      }}>
        <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 3 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={600} mb={2}>
              Check your email
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              We sent a confirmation link to <strong>{email}</strong>.
              Click it to activate your account, then sign in.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => router.push('/login')}
              sx={{ borderRadius: 2 }}
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F0F4FF 0%, #E8F0FE 100%)',
      px: 2,
    }}>
      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 3, boxShadow: '0 8px 40px rgba(25,118,210,0.12)' }}>
        <CardContent sx={{ p: 4 }}>

          {/* Back to home */}
          <Box sx={{ mb: 2 }}>
            <Button
              startIcon={<ArrowBackOutlinedIcon />}
              size="small"
              onClick={() => router.push('/')}
              sx={{ color: 'text.secondary', fontWeight: 500 }}
            >
              Back to Home
            </Button>
          </Box>

          {/* Logo + Title */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: '16px',
              background: 'linear-gradient(135deg, #1976D2, #42A5F5)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', mx: 'auto', mb: 2,
              boxShadow: '0 8px 20px rgba(25,118,210,0.3)',
            }}>
              <AssignmentIndOutlinedIcon sx={{ color: '#fff', fontSize: 26 }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              Create your account
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Start signing documents with DotSign
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleRegister}>
            <TextField
              label="Full name"
              type="text"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Email address"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                py: 1.4, borderRadius: 2, fontWeight: 600,
                background: 'linear-gradient(135deg, #1976D2, #42A5F5)',
                boxShadow: '0 4px 16px rgba(25,118,210,0.3)',
                '&:hover': { boxShadow: '0 6px 20px rgba(25,118,210,0.4)' },
              }}
            >
              {loading
                ? <CircularProgress size={22} color="inherit" />
                : 'Create Account'
              }
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">
              or
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Typography
                component="span"
                variant="body2"
                color="primary"
                sx={{ cursor: 'pointer', fontWeight: 600 }}
                onClick={() => router.push('/login')}
              >
                Sign in
              </Typography>
            </Typography>
          </Box>

        </CardContent>
      </Card>
    </Box>
  );
}