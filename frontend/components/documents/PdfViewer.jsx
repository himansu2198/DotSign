'use client';

import { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box, Typography, CircularProgress } from '@mui/material';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({
  fileUrl,
  signatures,
  onPlaceSignature,
  onDragSignature,
  finalized,
  currentSig,
  hovering,
  setHovering,
  dragging,
  setDragging,
  onRemoveSignature,
}) {
  const [numPages, setNumPages] = useState(null);
  const containerRef = useRef(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handlePageClick = (e, pageNumber) => {
    if (!currentSig || finalized) return;
    const pageEl = e.currentTarget;
    const rect = pageEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const x_percent = (clickX / rect.width) * 100;
    const y_percent = (clickY / rect.height) * 100;
    onPlaceSignature({ x_percent, y_percent, page_number: pageNumber });
  };

  const handleMouseDown = (e, sigId) => {
    if (finalized) return;
    e.stopPropagation();
    e.preventDefault();
    setDragging(sigId);
  };

  const handleMouseMove = (e, pageNumber) => {
    if (!dragging) return;
    const pageEl = e.currentTarget;
    const rect = pageEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const x_percent = Math.min(98, Math.max(2, (clickX / rect.width) * 100));
    const y_percent = Math.min(98, Math.max(2, (clickY / rect.height) * 100));
    onDragSignature(dragging, x_percent, y_percent, pageNumber);
  };

  const handleMouseUp = () => setDragging(null);

  return (
    <Box
      ref={containerRef}
      sx={{
        border: currentSig
          ? '2px dashed #1976D2'
          : finalized
          ? '2px solid #2E7D32'
          : '1px solid #e0e0e0',
        borderRadius: 3,
        overflow: 'auto',
        maxHeight: '80vh',
        backgroundColor: '#525659',
        cursor: currentSig ? 'crosshair' : 'default',
      }}
    >
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#fff' }} />
          </Box>
        }
        error={
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="error">Failed to load PDF.</Typography>
          </Box>
        }
      >
        {Array.from({ length: numPages || 0 }, (_, i) => i + 1).map((pageNumber) => (
          <Box
            key={pageNumber}
            sx={{
              position: 'relative',
              mb: 2, mx: 'auto',
              width: 'fit-content',
            }}
            onClick={(e) => handlePageClick(e, pageNumber)}
            onMouseMove={(e) => handleMouseMove(e, pageNumber)}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <Page
              pageNumber={pageNumber}
              width={Math.min(
                (containerRef.current?.offsetWidth || 800) - 40,
                800
              )}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />

            {/* Page number label */}
            <Box sx={{
              position: 'absolute', bottom: 8, right: 8,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff', px: 1, py: 0.3,
              borderRadius: 1, fontSize: 11,
              pointerEvents: 'none',
            }}>
              Page {pageNumber} of {numPages}
            </Box>

            {/* Placement hint */}
            {currentSig && (
              <Box sx={{
                position: 'absolute', top: 0, left: 0, right: 0,
                backgroundColor: 'rgba(25,118,210,0.15)',
                p: 0.8, textAlign: 'center',
                pointerEvents: 'none', zIndex: 5,
              }}>
                <Typography variant="caption" color="primary" fontWeight={600}>
                  👆 Click to place signature on page {pageNumber}
                </Typography>
              </Box>
            )}

            {/* Signatures for this page */}
            {signatures
              .filter(sig => sig.page_number === pageNumber)
              .map((sig) => (
                <Box
                  key={sig.id}
                  onMouseDown={(e) => handleMouseDown(e, sig.id)}
                  onMouseEnter={() => !finalized && setHovering(sig.id)}
                  onMouseLeave={() => setHovering(null)}
                  sx={{
                    position: 'absolute',
                    left: `${sig.x_percent}%`,
                    top: `${sig.y_percent}%`,
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
                      height: 55,
                      display: 'block',
                      filter: 'drop-shadow(0px 1px 3px rgba(0,0,0,0.3))',
                    }}
                  />

                  {/* Lock icon after finalize */}
                  {finalized && (
                    <Box sx={{
                      position: 'absolute',
                      bottom: -6, right: -6,
                      width: 18, height: 18,
                      borderRadius: '50%',
                      backgroundColor: 'success.main',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Typography sx={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</Typography>
                    </Box>
                  )}

                  {/* Remove button on hover */}
                  {!finalized && hovering === sig.id && (
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSignature(sig.id);
                      }}
                      sx={{
                        position: 'absolute',
                        top: -8, right: -8,
                        width: 20, height: 20,
                        borderRadius: '50%',
                        backgroundColor: 'error.main',
                        color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: 13, fontWeight: 700,
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
        ))}
      </Document>
    </Box>
  );
}