'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box, Card, CardContent, Typography, Button,
  CircularProgress, Alert, Chip, Divider, Paper
} from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DrawOutlinedIcon from '@mui/icons-material/DrawOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import SignatureCanvas from '@/components/signature/SignatureCanvas';

export default function PublicSignPage() {
  const { token } = useParams();
  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCanvas, setShowCanvas] = useState(false);
  const [signatures, setSignatures] = useState([]);
  const [currentSig, setCurrentSig] = useState(null);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signedUrl, setSignedUrl] = useState('');

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/signatures/verify/${token}`
      );
      const data = await response.json();
      if (data.success) {
        setLinkData(data);
      } else {
        setError(data.message || 'Invalid or expired link');
      }
    } catch (err) {
      setError('Failed to verify link');
    }
    setLoading(false);
  };

  const handleSaveSignature = (dataUrl) => {
    setCurrentSig(dataUrl);
    setShowCanvas(false);
    setSignatures([{ x: 50, y: 80, img: dataUrl, id: Date.now() }]);
  };

  const handleSign = async () => {
    if (signatures.length === 0) {
      alert('Please draw your signature first!');
      return;
    }
    setSigning(true);
    try {
      const response = await fetch(
        'http://localhost:8000/api/signatures/sign-with-token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            signatures: signatures.map(s => ({
              x: s.x,
              y: s.y,
              img: s.img,
            })),
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setSigned(true);
        setSignedUrl(data.signed_url);
      } else {
        setError(data.detail || 'Signing failed');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
    setSigning(false);
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#F4F6F8',
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#F4F6F8', px: 2,
      }}>
        <Card sx={{ maxWidth: 420, width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="error" mb={2}>
              Invalid Link
            </Typography>
            <Alert severity="error">{error}</Alert>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (signed) {
    return (
      <Box sx={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#F4F6F8', px: 2,
      }}>
        <Card sx={{ maxWidth: 420, width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircleOutlinedIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={600} mb={1}>
              Document Signed!
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              You have successfully signed the document.
            </Typography>
            {signedUrl && (
              <Button
                variant="contained"
                color="success"
                fullWidth
                startIcon={<DownloadOutlinedIcon />}
                href={signedUrl}
                target="_blank"
              >
                Download Signed PDF
              </Button>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F4F6F8', py: 4, px: 2 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>

        {/* Header */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h5" fontWeight={700} color="primary">
                  DotSign
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You have been requested to sign a document
                </Typography>
              </Box>
              <Chip label="Signature Required" color="warning" />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Document</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {linkData?.document_name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Requested by</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {linkData?.owner_email}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Signer</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {linkData?.signer_email}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>

          {/* PDF Preview */}
          <Box sx={{ flexGrow: 1, minWidth: 300 }}>
            <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <iframe
                src={linkData?.doc_url}
                width="100%"
                height="600px"
                style={{ border: 'none', display: 'block' }}
                title="Document to Sign"
              />
            </Paper>
          </Box>

          {/* Signature Panel */}
          <Paper elevation={1} sx={{ width: 280, borderRadius: 3, p: 3, height: 'fit-content' }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Your Signature
            </Typography>

            {showCanvas ? (
              <SignatureCanvas
                onSave={handleSaveSignature}
                onCancel={() => setShowCanvas(false)}
              />
            ) : (
              <>
                {currentSig && (
                  <Box sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2, p: 1, mb: 2,
                    textAlign: 'center',
                  }}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      Your signature
                    </Typography>
                    <img src={currentSig} alt="signature" style={{ height: 50 }} />
                  </Box>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<DrawOutlinedIcon />}
                  onClick={() => setShowCanvas(true)}
                  sx={{ mb: 2 }}
                >
                  {currentSig ? 'Redraw Signature' : 'Draw Signature'}
                </Button>

                {currentSig && (
                  <>
                    <Divider sx={{ mb: 2 }} />
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      startIcon={
                        signing
                          ? <CircularProgress size={16} color="inherit" />
                          : <CheckCircleOutlinedIcon />
                      }
                      onClick={handleSign}
                      disabled={signing}
                    >
                      {signing ? 'Signing...' : 'Sign Document'}
                    </Button>
                  </>
                )}

                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.disabled">
                  1. Click "Draw Signature"<br />
                  2. Draw your signature<br />
                  3. Click "Use Signature"<br />
                  4. Click "Sign Document"
                </Typography>
              </>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}