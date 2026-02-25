import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { isPdf } from '../utils/helpers';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * FileViewer component for rendering PDFs and images.
 * Supports page-by-page PDF navigation and zoom for images.
 */
// PUBLIC_INTERFACE
/**
 * Renders a PDF or image file from a Blob.
 * @param {{ fileBlob: Blob|null, fileType: string, title: string }} props
 * @returns {JSX.Element}
 */
function FileViewer({ fileBlob, fileType, title = 'Document' }) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.2);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  // Load file when blob changes
  useEffect(() => {
    if (!fileBlob) {
      setLoading(false);
      setError('No file available');
      return;
    }

    const loadFile = async () => {
      setLoading(true);
      setError(null);

      try {
        if (isPdf(fileType)) {
          const arrayBuffer = await fileBlob.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(1);
          setImageUrl(null);
        } else {
          // Image file
          const url = URL.createObjectURL(fileBlob);
          setImageUrl(url);
          setPdfDoc(null);
          setTotalPages(0);
        }
      } catch (err) {
        console.error('Error loading file:', err);
        setError('Failed to load file. It may be corrupted.');
      } finally {
        setLoading(false);
      }
    };

    loadFile();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileBlob, fileType]);

  // Render PDF page
  const renderPage = useCallback(async (pageNum) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      // Cancel any ongoing render
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
    } catch (err) {
      if (err.name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', err);
      }
    }
  }, [pdfDoc, scale]);

  // Re-render when page or scale changes
  useEffect(() => {
    if (pdfDoc && currentPage > 0) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale, renderPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-secondary">Loading {title}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 rounded-t-lg">
        <h3 className="text-sm font-medium text-primary truncate">{title}</h3>
        <div className="flex items-center gap-2">
          {pdfDoc && (
            <>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100 disabled:opacity-40"
              >
                ◀ Prev
              </button>
              <span className="text-xs text-secondary">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100 disabled:opacity-40"
              >
                Next ▶
              </button>
              <span className="text-xs text-gray-400 mx-1">|</span>
            </>
          )}
          <button
            onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
            className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100"
            title="Zoom out"
          >
            −
          </button>
          <span className="text-xs text-secondary w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(s => Math.min(3, s + 0.2))}
            className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100"
            title="Zoom in"
          >
            +
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-auto p-4" style={{ maxHeight: '75vh' }}>
        {pdfDoc ? (
          <div className="flex justify-center">
            <canvas ref={canvasRef} className="shadow-sm" />
          </div>
        ) : imageUrl ? (
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt={title}
              style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
              className="max-w-full transition-transform"
            />
          </div>
        ) : (
          <p className="text-center text-secondary">No file to display</p>
        )}
      </div>
    </div>
  );
}

export default FileViewer;
