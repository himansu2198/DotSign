'use client';

import { useRouter } from 'next/navigation';
import {
  Box, Button, Typography, Container,
  Grid, Card, CardContent
} from '@mui/material';
import DrawOutlinedIcon from '@mui/icons-material/DrawOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const features = [
  {
    icon: <CloudUploadOutlinedIcon sx={{ fontSize: 28, color: '#1976D2' }} />,
    title: 'Upload PDFs',
    desc: 'Upload any PDF document up to 25MB securely to the cloud.',
    bg: '#E3F2FD',
  },
  {
    icon: <DrawOutlinedIcon sx={{ fontSize: 28, color: '#7B1FA2' }} />,
    title: 'Draw & Place Signature',
    desc: 'Draw your signature on canvas and place it anywhere on the PDF.',
    bg: '#F3E5F5',
  },
  {
    icon: <ShareOutlinedIcon sx={{ fontSize: 28, color: '#0F6E56' }} />,
    title: 'Share Signing Links',
    desc: 'Generate secure tokenized links and share with anyone to sign.',
    bg: '#E8F5E9',
  },
  {
    icon: <SecurityOutlinedIcon sx={{ fontSize: 28, color: '#E65100' }} />,
    title: 'Secure & Encrypted',
    desc: 'All documents stored securely with Supabase. JWT auth protected.',
    bg: '#FFF3E0',
  },
  {
    icon: <HistoryOutlinedIcon sx={{ fontSize: 28, color: '#C62828' }} />,
    title: 'Audit Trail',
    desc: 'Every action logged with timestamp, IP address and user details.',
    bg: '#FFEBEE',
  },
  {
    icon: <CheckCircleOutlinedIcon sx={{ fontSize: 28, color: '#1565C0' }} />,
    title: 'Download Signed PDF',
    desc: 'Get the final signed PDF with signature embedded using PyMuPDF.',
    bg: '#E3F2FD',
  },
];

const steps = [
  { num: '01', title: 'Create Account', desc: 'Sign up for free in seconds' },
  { num: '02', title: 'Upload Document', desc: 'Upload your PDF document' },
  { num: '03', title: 'Sign or Share', desc: 'Sign yourself or share link' },
  { num: '04', title: 'Download', desc: 'Get your signed PDF instantly' },
];

const useCases = [
  'HR & Recruitment — Offer letters, NDAs',
  'Legal & Compliance — Contracts, approvals',
  'Freelancers — Client agreements',
  'Education — Admission forms',
  'Healthcare — Authorization forms',
  'Finance — Secure approvals',
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <Box sx={{ backgroundColor: '#FAFBFF', minHeight: '100vh' }}>

      {/* Navbar */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #E8EAF0',
        px: { xs: 3, md: 6 }, py: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
          onClick={() => router.push('/')}
        >
          <Box sx={{
            width: 38, height: 38, borderRadius: '10px',
            background: 'linear-gradient(135deg, #1976D2, #42A5F5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(25,118,210,0.3)',
          }}>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>D</Typography>
          </Box>
          <Typography variant="h6" fontWeight={700} color="primary.main" fontSize={20}>
            DotSign
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/login')}
            sx={{ fontWeight: 600, px: 3, borderRadius: 2 }}
          >
            Sign In
          </Button>
          <Button
            variant="contained"
            onClick={() => router.push('/register')}
            endIcon={<ArrowForwardIcon />}
            sx={{ fontWeight: 600, px: 3, borderRadius: 2 }}
          >
            Get Started Free
          </Button>
        </Box>
      </Box>

      {/* Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0D47A1 0%, #1976D2 55%, #1E88E5 100%)',
        pt: { xs: 10, md: 15 },
        pb: { xs: 10, md: 15 },
        px: 2,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -150, left: -100, width: 600, height: 600, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: '20%', right: '8%', width: 250, height: 250, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

            {/* Badge */}
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1.5, mb: 4,
              backgroundColor: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 999, px: 3, py: 1.2,
            }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#69F0AE', boxShadow: '0 0 8px #69F0AE' }} />
              <Typography sx={{ color: 'rgba(255,255,255,0.95)', fontSize: 13, fontWeight: 500, letterSpacing: '0.01em' }}>
                100% Free — No credit card required
              </Typography>
            </Box>

            {/* Heading */}
            <Typography
              variant="h2"
              fontWeight={800}
              sx={{
                fontSize: { xs: 36, md: 62 },
                lineHeight: 1.1,
                mb: 3,
                color: '#fff',
                letterSpacing: '-0.02em',
              }}
            >
              Sign Documents
              <br />
              <Box component="span" sx={{
                background: 'linear-gradient(90deg, #90CAF9, #E1F5FE)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Digitally & Securely
              </Box>
            </Typography>

            {/* Subtitle */}
            <Typography variant="h6" sx={{
              color: 'rgba(255,255,255,0.82)',
              mb: 5, fontWeight: 400,
              maxWidth: 560, mx: 'auto',
              fontSize: { xs: 16, md: 19 },
              lineHeight: 1.65,
            }}>
              Upload PDFs, draw your signature, share signing links,
              and download signed documents with full audit trail — all in one place.
            </Typography>

            {/* CTA Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/register')}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  backgroundColor: '#fff', color: '#1565C0',
                  fontWeight: 700, px: 4.5, py: 1.7,
                  fontSize: 16, borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  '&:hover': { backgroundColor: '#E3F2FD', transform: 'translateY(-2px)', boxShadow: '0 12px 32px rgba(0,0,0,0.25)' },
                  transition: 'all 0.2s',
                }}
              >
                Start Signing Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/login')}
                sx={{
                  borderColor: 'rgba(255,255,255,0.45)', color: '#fff',
                  fontWeight: 600, px: 4.5, py: 1.7,
                  fontSize: 16, borderRadius: 3,
                  '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.1)', transform: 'translateY(-2px)' },
                  transition: 'all 0.2s',
                }}
              >
                Sign In
              </Button>
            </Box>

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: { xs: 4, md: 8 }, justifyContent: 'center', mt: 9, flexWrap: 'wrap' }}>
              {[
                { value: '100%', label: 'Free to use' },
                { value: '25MB', label: 'Max file size' },
                { value: 'PyMuPDF', label: 'PDF engine' },
                { value: 'Supabase', label: 'Secure storage' },
              ].map((stat) => (
                <Box key={stat.label} sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight={800} sx={{ color: '#fff', fontSize: { xs: 18, md: 24 } }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* How It Works */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h4" fontWeight={700} mb={1.5}>
            How It Works
          </Typography>
          <Typography variant="body1" color="text.secondary" fontSize={16}>
            Get your documents signed in 4 simple steps
          </Typography>
        </Box>
        <Grid container spacing={4} justifyContent="center">
          {steps.map((step, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={step.num}>
              <Card sx={{
                textAlign: 'center', height: '100%',
                border: '1px solid #E8EAF0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                borderRadius: 4,
                position: 'relative',
                '&:hover': {
                  boxShadow: '0 12px 40px rgba(25,118,210,0.15)',
                  transform: 'translateY(-6px)',
                  borderColor: '#90CAF9',
                },
                transition: 'all 0.3s',
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    sx={{
                      background: 'linear-gradient(135deg, #1976D2, #42A5F5)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2, fontSize: 44,
                    }}
                  >
                    {step.num}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} mb={1}>{step.title}</Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.6}>{step.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features */}
      <Box sx={{ backgroundColor: '#F4F6F8', py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h4" fontWeight={700} mb={1.5}>
              Everything You Need
            </Typography>
            <Typography variant="body1" color="text.secondary" fontSize={16}>
              Built for legal, HR, finance, and enterprise workflows
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {features.map((f) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={f.title}>
                <Card sx={{
                  height: '100%',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #E8EAF0',
                  borderRadius: 4,
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(25,118,210,0.15)',
                    transform: 'translateY(-6px)',
                    borderColor: '#90CAF9',
                  },
                  transition: 'all 0.3s',
                }}>
                  <CardContent sx={{ p: 3.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{
                      width: 56, height: 56, borderRadius: 3,
                      backgroundColor: f.bg,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', mb: 2.5,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    }}>
                      {f.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={700} mb={1.5}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, flexGrow: 1 }}>
                      {f.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Use Cases + CTA */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" fontWeight={700} mb={2}>
              Built for Every Industry
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4} sx={{ lineHeight: 1.8, fontSize: 16 }}>
              From HR to healthcare, DotSign handles document signing workflows for every use case.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {useCases.map((uc) => (
                <Box key={uc} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    width: 26, height: 26, borderRadius: '50%',
                    backgroundColor: '#E8F5E9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(46,125,50,0.15)',
                  }}>
                    <CheckCircleOutlinedIcon sx={{ color: '#2E7D32', fontSize: 16 }} />
                  </Box>
                  <Typography variant="body1" color="text.secondary">{uc}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{
              background: 'linear-gradient(135deg, #0D47A1, #1976D2)',
              borderRadius: 5, p: 5, textAlign: 'center',
              boxShadow: '0 24px 64px rgba(25,118,210,0.35)',
            }}>
              <Typography sx={{ fontSize: 56, mb: 2 }}>🖊️</Typography>
              <Typography variant="h5" fontWeight={700} color="#fff" mb={1.5}>
                Start Signing Today
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, lineHeight: 1.7 }}>
                No credit card required. No hidden fees.<br />Just upload, sign, and download.
              </Typography>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => router.push('/register')}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  backgroundColor: '#fff', color: '#1565C0',
                  fontWeight: 700, py: 1.7, borderRadius: 3, fontSize: 16,
                  '&:hover': { backgroundColor: '#E3F2FD', transform: 'translateY(-2px)' },
                  transition: 'all 0.2s',
                }}
              >
                Create Free Account
              </Button>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 2.5 }}>
                Already have an account?{' '}
                <Box component="span" onClick={() => router.push('/login')}
                  sx={{ color: '#90CAF9', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}>
                  Sign in here
                </Box>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ background: 'linear-gradient(135deg, #0D47A1, #1565C0)', pt: 8, pb: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={5} mb={6}>

            {/* Brand */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>D</Typography>
                </Box>
                <Typography variant="h6" fontWeight={700} color="#fff" fontSize={20}>DotSign</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, mb: 3 }}>
                A DocuSign-like digital signature system built with Python + Next.js + Supabase. Upload, sign, share and track documents.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['FastAPI', 'Next.js', 'Supabase', 'PyMuPDF'].map((tech) => (
                  <Box key={tech} sx={{
                    px: 2, py: 0.7,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 500 }}>
                      {tech}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" fontWeight={700} color="#fff" mb={2.5}>
                Quick Links
              </Typography>
              {[
                { label: 'Home', path: '/' },
                { label: 'Sign In', path: '/login' },
                { label: 'Register', path: '/register' },
                { label: 'Dashboard', path: '/dashboard' },
              ].map((link) => (
                <Box
                  key={link.label}
                  onClick={() => router.push(link.path)}
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: 14, cursor: 'pointer',
                    mb: 1.5, display: 'block',
                    '&:hover': { color: '#fff' },
                    transition: 'color 0.15s',
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Grid>

            {/* Features */}
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle1" fontWeight={700} color="#fff" mb={2.5}>
                Features
              </Typography>
              {[
                'PDF Upload',
                'Draw Signature',
                'Public Signing Links',
                'Audit Trail',
                'Signed PDF Download',
              ].map((f) => (
                <Typography key={f} variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1.5 }}>
                  {f}
                </Typography>
              ))}
            </Grid>

            {/* Built For */}
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle1" fontWeight={700} color="#fff" mb={2.5}>
                Built For
              </Typography>
              {['HR & Recruitment', 'Legal & Compliance', 'Freelancers', 'Education', 'Healthcare', 'Finance'].map((u) => (
                <Typography key={u} variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1.5 }}>
                  {u}
                </Typography>
              ))}
            </Grid>

          </Grid>

          {/* Bottom bar */}
          <Box sx={{
            borderTop: '1px solid rgba(255,255,255,0.12)',
            pt: 3.5,
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
          }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)' }}>
              © 2026 DotSign. All rights reserved.
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)' }}>
              Built with ❤️ using FastAPI + Next.js + Supabase + PyMuPDF
            </Typography>
          </Box>
        </Container>
      </Box>

    </Box>
  );
}