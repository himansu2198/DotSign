'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, Typography, Button,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, IconButton, Tooltip
} from '@mui/material';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import supabase from '@/lib/supabase';

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareDialog, setShareDialog] = useState(false);
  const [shareDoc, setShareDoc] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      const { data, error } = await supabase.storage
        .from('documents')
        .list(userId, { sortBy: { column: 'created_at', order: 'desc' } });
      if (error) throw error;
      const signedNames = (data || [])
        .filter(f => f.name.startsWith('signed_'))
        .map(f => f.name.replace('signed_', ''));
      const mainDocs = (data || [])
        .filter(f => !f.name.startsWith('signed_'))
        .map(f => ({
          ...f,
          status: signedNames.includes(f.name) ? 'signed' : 'pending'
        }));
      setDocuments(mainDocs);
    } catch (err) {
      console.error('Failed to fetch documents:', err.message);
    }
    setLoading(false);
  };

  const handleShare = async () => {
    setShareLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const response = await fetch('http://localhost:8000/api/signatures/create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          document_name: shareDoc,
          signer_email: signerEmail,
        }),
      });
      const data = await response.json();
      if (data.success) setShareLink(data.signing_url);
    } catch (err) {
      console.error('Share failed:', err.message);
    }
    setShareLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'N/A';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight={600}>Documents</Typography>
        <Button
          variant="contained"
          startIcon={<UploadFileOutlinedIcon />}
          onClick={() => router.push('/dashboard/documents/upload')}
        >
          Upload New
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <FolderOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" mb={1}>
              No documents yet
            </Typography>
            <Typography variant="body2" color="text.disabled" mb={3}>
              Upload your first PDF to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<UploadFileOutlinedIcon />}
              onClick={() => router.push('/dashboard/documents/upload')}
            >
              Upload Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell><Typography fontWeight={600}>File Name</Typography></TableCell>
                <TableCell><Typography fontWeight={600}>Size</Typography></TableCell>
                <TableCell><Typography fontWeight={600}>Uploaded On</Typography></TableCell>
                <TableCell><Typography fontWeight={600}>Status</Typography></TableCell>
                <TableCell align="right"><Typography fontWeight={600}>Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FolderOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Typography variant="body2" fontWeight={500}>{doc.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatSize(doc.metadata?.size)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(doc.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={doc.status === 'signed' ? 'Signed' : 'Pending'}
                      size="small"
                      sx={{
                        backgroundColor: doc.status === 'signed' ? '#E8F5E9' : '#FFF3E0',
                        color: doc.status === 'signed' ? '#2E7D32' : '#ED6C02',
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityOutlinedIcon />}
                        onClick={() => router.push(`/dashboard/documents/${doc.id}`)}
                      >
                        View
                      </Button>
                      <Tooltip title="Share signing link">
                        <Button
                          size="small"
                          variant="outlined"
                          color="secondary"
                          startIcon={<ShareOutlinedIcon />}
                          onClick={() => {
                            setShareDoc(doc.name);
                            setShareLink('');
                            setSignerEmail('');
                            setShareDialog(true);
                          }}
                        >
                          Share
                        </Button>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Share Dialog */}
      <Dialog
        open={shareDialog}
        onClose={() => setShareDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle fontWeight={600}>Share Document for Signing</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Document: <strong>{shareDoc}</strong>
          </Typography>
          <TextField
            label="Signer's Email Address"
            type="email"
            fullWidth
            value={signerEmail}
            onChange={(e) => setSignerEmail(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="signer@example.com"
          />

          {shareLink && (
            <Box sx={{
              backgroundColor: '#F8FBFF',
              border: '1px solid #B5D4F4',
              borderRadius: 2, p: 2,
            }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                Signing link — share this with the signer:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    flexGrow: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'primary.main',
                  }}
                >
                  {shareLink}
                </Typography>
                <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
                  <IconButton size="small" onClick={handleCopy} color={copied ? 'success' : 'default'}>
                    <ContentCopyOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              {copied && (
                <Typography variant="caption" color="success.main">
                  ✅ Link copied to clipboard!
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShareDialog(false)} variant="outlined">
            Close
          </Button>
          <Button
            onClick={handleShare}
            variant="contained"
            disabled={!signerEmail || shareLoading}
            startIcon={shareLoading ? <CircularProgress size={16} color="inherit" /> : <ShareOutlinedIcon />}
          >
            {shareLoading ? 'Generating...' : 'Generate Link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}