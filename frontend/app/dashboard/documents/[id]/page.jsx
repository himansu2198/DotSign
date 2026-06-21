'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Typography, Button, CircularProgress,
  Alert, Paper, Chip, Divider
} from '@mui/material';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import DrawOutlinedIcon from '@mui/icons-material/DrawOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import supabase from '@/lib/supabase';
import SignatureCanvas from '@/components/signature/SignatureCanvas';

export default function DocumentViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signatures, setSignatures] = useState([]);
  const [showCanvas, setShowCanvas] = useState(false);
  const [currentSig, setCurrentSig] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [hovering, setHovering] = useState(null);
  const [finalized, setFinalized] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [signedUrl, setSignedUrl] = useState('');
  const overlayRef = useRef(null);

  useEffect(() => { fetchDocument(); }, [id]);

  const logAction = async (documentName, action) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      await fetch('http://localhost:8000/api/audit/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ document_name: documentName, action }),
      });
    } catch (err) {
      console.error('Audit log failed:', err.message);
    }
  };

  const fetchDocument = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      const { data, error } = await supabase.storage.from('documents').list(userId);
      if (error) throw error;
      const file = data?.find((f) => f.id === id);
      if (!file) { setError('Document not found.'); setLoading(false); return; }
      setFileName(file.name);
      logAction(file.name, 'document_viewed');
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(`${userId}/${file.name}`);
      setFileUrl(urlData.publicUrl);
    } catch (err) { setError('Failed to load document.'); }
    setLoading(false);
  };

  const handleSaveSignature = (dataUrl) => {
    setCurrentSig(dataUrl);
    setShowCanvas(false);
  };

  const handleOverlayClick = async (e) => {
    if (!currentSig || dragging || finalized) return;

    const container = overlayRef.current;
    const rect = container.getBoundingClientRect();
    const totalHeight = container.scrollHeight;
    const totalWidth = container.scrollWidth;

    const clickX = e.clientX - rect.left;
    const clickY = (e.clientY - rect.top) + container.scrollTop;

    const x_percent = (clickX / totalWidth) * 100;
    const y_percent = (clickY / totalHeight) * 100;

    const newSig = {
      id: Date.now(),
      img: currentSig,
      x_percent,
      y_percent,
      displayX: x_percent,
      displayY: y_percent,
    };

    setSignatures([...signatures, newSig]);
    setCurrentSig(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('http://localhost:8000/api/signatures/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          document_name: fileName,
          x_percent,
          y_percent,
          page_number: 1,
          signature_img: currentSig,
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Signature saved to DB');
      }
    } catch (err) {
      console.error('Failed to save to DB:', err.message);
    }
  };

  const handleMouseDown = (e, sigId) => {
    if (finalized) return;
    e.stopPropagation();
    e.preventDefault();
    setDragging(sigId);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const container = overlayRef.current;
    const rect = container.getBoundingClientRect();
    const totalHeight = container.scrollHeight;
    const totalWidth = container.scrollWidth;

    const clickX = e.clientX - rect.left;
    const clickY = (e.clientY - rect.top) + container.scrollTop;

    const x_percent = Math.min(98, Math.max(2, (clickX / totalWidth) * 100));
    const y_percent = Math.min(98, Math.max(2, (clickY / totalHeight) * 100));

    setSignatures((prev) =>
      prev.map((s) => s.id === dragging
        ? { ...s, x_percent, y_percent, displayX: x_percent, displayY: y_percent }
        : s
      )
    );
  };

  const handleMouseUp = () => setDragging(null);

  const removeSignature = (sigId) => {
    if (finalized) return;
    setSignatures(signatures.filter((s) => s.id !== sigId));
  };

  const handleFinalize = async () => {
    if (signatures.length === 0) {
      alert('Please place at least one signature!');
      return;
    }
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('http://localhost:8000/api/signatures/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          document_name: fileName,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFinalized(true);
        setSignedUrl(data.signed_url);
        logAction(fileName, 'document_signed');
      } else {
        alert('Signing failed: ' + (data.detail || 'Unknown error'));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setGenerating(false);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={() => router.push('/dashboard/documents')}
          variant="outlined"
        >
          Back
        </Button>
        <Typography variant="h5" fontWeight={600} sx={{ flexGrow: 1 }}>
          {fileName || 'Document Viewer'}
        </Typography>
        {finalized && (
          <Chip icon={<CheckCircleOutlinedIcon />} label="Signed" color="success" />
        )}
        {fileUrl && (
          <Button
            variant="outlined"
            startIcon={<DownloadOutlinedIcon />}
            href={fileUrl}
            target="_blank"
          >
            Download Original
          </Button>
        )}
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      {fileUrl && !loading && (
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>

          {/* PDF Viewer */}
          <Box sx={{ flexGrow: 1, minWidth: 300 }}>
            <Box
              ref={overlayRef}
              onClick={handleOverlayClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              sx={{
                position: 'relative',
                borderRadius: 3,
                overflow: 'auto',
                height: '700px',
                border: currentSig
                  ? '2px dashed #1976D2'
                  : finalized
                  ? '2px solid #2E7D32'
                  : '1px solid #e0e0e0',
                cursor: currentSig ? 'crosshair' : 'default',
                userSelect: 'none',
              }}
            >
              {currentSig && (
                <Box sx={{
                  position: 'sticky', top: 0, left: 0, right: 0,
                  backgroundColor: 'rgba(25,118,210,0.1)',
                  p: 1, textAlign: 'center', zIndex: 5,
                }}>
                  <Typography variant="body2" color="primary" fontWeight={500}>
                    👆 Click anywhere on the PDF to place your signature
                  </Typography>
                </Box>
              )}

              {finalized && (
                <Box sx={{
                  position: 'sticky', top: 0, left: 0, right: 0,
                  backgroundColor: 'rgba(46,125,50,0.1)',
                  p: 1, textAlign: 'center', zIndex: 5,
                }}>
                  <Typography variant="body2" color="success.main" fontWeight={500}>
                    ✅ Document signed! Signature embedded at saved coordinates.
                  </Typography>
                </Box>
              )}

              {/* PDF + Signatures */}
              <Box sx={{ position: 'relative', minHeight: '700px' }}>
                <iframe
                  src={fileUrl}
                  width="100%"
                  height="2000px"
                  style={{
                    border: 'none',
                    display: 'block',
                    pointerEvents: currentSig || dragging ? 'none' : 'auto',
                  }}
                  title="PDF Viewer"
                />

                {signatures.map((sig) => (
                  <Box
                    key={sig.id}
                    onMouseDown={(e) => handleMouseDown(e, sig.id)}
                    onMouseEnter={() => !finalized && setHovering(sig.id)}
                    onMouseLeave={() => setHovering(null)}
                    sx={{
                      position: 'absolute',
                      left: `${sig.displayX}%`,
                      top: `${sig.displayY}%`,
                      transform: 'translate(-50%, -50%)',
                      cursor: finalized
                        ? 'default'
                        : dragging === sig.id
                        ? 'grabbing'
                        : 'grab',
                      zIndex: 10,
                      userSelect: 'none',
                    }}
                  >
                    <img
                      src={sig.img}
                      alt="signature"
                      draggable={false}
                      style={{
                        height: 60,
                        display: 'block',
                        filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.15))',
                      }}
                    />

                    {finalized && (
                      <Box sx={{
                        position: 'absolute',
                        bottom: -6, right: -6,
                        width: 18, height: 18,
                        borderRadius: '50%',
                        backgroundColor: 'success.main',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <LockOutlinedIcon sx={{ fontSize: 11, color: '#fff' }} />
                      </Box>
                    )}

                    {!finalized && hovering === sig.id && (
                      <Box
                        onClick={(e) => { e.stopPropagation(); removeSignature(sig.id); }}
                        sx={{
                          position: 'absolute',
                          top: -8, right: -8,
                          width: 20, height: 20,
                          borderRadius: '50%',
                          backgroundColor: 'error.main',
                          color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 700,
                          zIndex: 20,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        }}
                      >
                        ×
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Right Panel */}
          <Paper elevation={1} sx={{ width: 280, borderRadius: 3, p: 3, height: 'fit-content' }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Signature Actions
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
                    border: '1px dashed #1976D2',
                    borderRadius: 2, p: 1, mb: 2,
                    textAlign: 'center',
                    backgroundColor: '#F8FBFF',
                  }}>
                    <Typography variant="caption" color="primary" mb={0.5} display="block">
                      Click on PDF to place
                    </Typography>
                    <img src={currentSig} alt="preview" style={{ height: 40 }} />
                    <Button
                      size="small" color="error"
                      onClick={() => setCurrentSig(null)}
                      sx={{ display: 'block', mx: 'auto', mt: 0.5 }}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<DrawOutlinedIcon />}
                  onClick={() => setShowCanvas(true)}
                  sx={{ mb: 2 }}
                  disabled={finalized}
                >
                  Draw Signature
                </Button>

                {signatures.length > 0 && !finalized && (
                  <>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {signatures.length} signature(s) placed
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      color="success"
                      startIcon={
                        generating
                          ? <CircularProgress size={16} color="inherit" />
                          : <CheckCircleOutlinedIcon />
                      }
                      onClick={handleFinalize}
                      disabled={generating}
                      sx={{ mb: 1 }}
                    >
                      {generating ? 'Signing...' : 'Finalize & Sign'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      size="small"
                      startIcon={<DeleteOutlinedIcon />}
                      onClick={() => setSignatures([])}
                    >
                      Clear All
                    </Button>
                  </>
                )}

                {finalized && (
                  <>
                    <Divider sx={{ mb: 2 }} />
                    <Alert severity="success" sx={{ mb: 2, fontSize: 12 }}>
                      Document signed successfully!
                    </Alert>
                    {signedUrl && (
                      <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        startIcon={<DownloadOutlinedIcon />}
                        href={signedUrl}
                        target="_blank"
                        sx={{ mb: 2 }}
                      >
                        Download Signed PDF
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<DrawOutlinedIcon />}
                      onClick={() => {
                        setFinalized(false);
                        setSignatures([]);
                        setSignedUrl('');
                        setShowCanvas(true);
                      }}
                    >
                      Sign Again
                    </Button>
                  </>
                )}

                {!currentSig && signatures.length === 0 && !finalized && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" color="text.disabled">
                      1. Click "Draw Signature"<br />
                      2. Draw your signature<br />
                      3. Click on PDF to place it<br />
                      4. Drag to reposition<br />
                      5. Click "Finalize & Sign"
                    </Typography>
                  </>
                )}
              </>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
}