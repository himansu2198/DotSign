'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, Typography, Button,
  LinearProgress, Alert
} from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import supabase from '@/lib/supabase';

const MAX_SIZE = 25 * 1024 * 1024; // 25MB

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (selectedFile) => {
    setError('');
    setSuccess(false);

    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      return;
    }

    if (selectedFile.size > MAX_SIZE) {
      setError('File size must be under 25 MB.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    handleFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      const fileName = `${userId}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setFile(null);
    } catch (err) {
      setError('Upload failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Upload Document
      </Typography>

      <Card sx={{ maxWidth: 600 }}>
        <CardContent sx={{ p: 4 }}>

          {success && (
            <Alert
              severity="success"
              icon={<CheckCircleOutlinedIcon />}
              sx={{ mb: 3 }}
              action={
                <Button size="small" onClick={() => router.push('/dashboard/documents')}>
                  View Documents
                </Button>
              }
            >
              Document uploaded successfully!
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          )}

          {/* Drop Zone */}
          <Box
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => document.getElementById('file-input').click()}
            sx={{
              border: '2px dashed',
              borderColor: dragOver ? 'primary.main' : 'divider',
              borderRadius: 3,
              p: 5,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: dragOver ? '#E3F2FD' : 'background.default',
              transition: 'all 0.2s',
              mb: 3,
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: '#F0F7FF',
              },
            }}
          >
            <input
              id="file-input"
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {file ? (
              <Box>
                <InsertDriveFileOutlinedIcon
                  sx={{ fontSize: 48, color: 'primary.main', mb: 1 }}
                />
                <Typography variant="body1" fontWeight={500}>
                  {file.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
            ) : (
              <Box>
                <UploadFileOutlinedIcon
                  sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }}
                />
                <Typography variant="body1" fontWeight={500} mb={0.5}>
                  Drag and drop your PDF here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to browse — max 25 MB
                </Typography>
              </Box>
            )}
          </Box>

          {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={!file || loading}
              onClick={handleUpload}
              startIcon={<UploadFileOutlinedIcon />}
            >
              {loading ? 'Uploading...' : 'Upload Document'}
            </Button>
            {file && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => { setFile(null); setError(''); }}
              >
                Clear
              </Button>
            )}
          </Box>

        </CardContent>
      </Card>
    </Box>
  );
}
