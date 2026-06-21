'use client';

import { useRef, useEffect, useState } from 'react';
import { Box, Button, Typography, Divider } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';

export default function SignatureCanvas({ onSave, onCancel }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1565C0';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDraw = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => setDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" mb={1}>
        Draw your signature below:
      </Typography>

      <Box
        sx={{
          border: '2px dashed #1976D2',
          borderRadius: 2,
          backgroundColor: '#F8FBFF',
          mb: 2,
          overflow: 'hidden',
          cursor: 'crosshair',
        }}
      >
        <canvas
          ref={canvasRef}
          width={340}
          height={120}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          style={{ display: 'block', touchAction: 'none' }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<DeleteOutlinedIcon />}
          onClick={clearCanvas}
          fullWidth
        >
          Clear
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<CheckOutlinedIcon />}
          onClick={saveSignature}
          disabled={!hasDrawn}
          fullWidth
        >
          Use Signature
        </Button>
      </Box>

      <Button
        size="small"
        fullWidth
        onClick={onCancel}
        sx={{ mt: 1 }}
      >
        Cancel
      </Button>
    </Box>
  );
}