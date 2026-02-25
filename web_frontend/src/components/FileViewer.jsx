import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { isPdf } from '../utils/helpers';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * FileViewer component for rendering PDFs and images.
 * Supports page-by-page PDF navigation, zoom controls, and fit-to-width mode.
 * Mobile-optimized with bottom-positioned navigation controls for one-hand use.
 */
// PUBLIC_INTERFACE
/**
 * Renders a PDF or image file from a Blob with navigation and zoom controls.
 * Features bottom-positioned mobile controls for easy one-hand reach.
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
  const [fitWidth, setFitWidth] = useState(false);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
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
        setError('Failed to load file. It may be corrupted or in an unsupported format.');
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

      let currentScale = scale;
      if (fitWidth && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 48; // account for padding
        const viewport = page.getViewport({ scale: 1 });
        currentScale = containerWidth / viewport.width;
      }

      const viewport = page.getViewport({ scale: currentScale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Use device pixel ratio for crisp rendering
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = viewport.width * pixelRatio;
      canvas.height = viewport.height * pixelRatio;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      context.scale(pixelRatio, pixelRatio);

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
  }, [pdfDoc, scale, fitWidth]);

  // Re-render when page or scale changes
  useEffect(() => {
    if (pdfDoc && currentPage > 0) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale, fitWidth, renderPage]);

  // Zoom controls
  const zoomIn = () => { setFitWidth(false); setScale(s => Math.min(3, s + 0.2)); };
  const zoomOut = () => { setFitWidth(false); setScale(s => Math.max(0.5, s - 0.2)); };
  const toggleFitWidth = () => setFitWidth(f => !f);

  // Page navigation
  const goToPrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  // Loading state
  if (loading) {
    return (
      <div className="viewer-container flex items-center justify-center h-72">
        <div className="text-center">
          <div className="relative mx-auto mb-4 w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-secondary text-sm font-medium">Loading {title}...</p>
          <p className="text-gray-400 text-xs mt-1">Please wait while the document loads</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="viewer-container flex items-center justify-center h-72 bg-red-50/50">
        <div className="text-center px-6">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-error font-medium mb-1">Unable to load document</p>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="viewer-container bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop Toolbar — hidden on mobile, controls are in the bottom bar */}
      <div className="hidden sm:flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        {/* Left: Title */}
        <div className="flex items-center gap-2 min-w-0 mr-3">
          <span className="text-base">
            {pdfDoc ? '📄' : '🖼️'}
          </span>
          <h3 className="text-sm font-semibold text-primary truncate">{title}</h3>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Page navigation for PDF */}
          {pdfDoc && (
            <>
              <button
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-md text-sm bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-gray-200 transition-all duration-150 btn-press"
                title="Previous page"
                aria-label="Previous page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-xs text-secondary font-medium px-2 min-w-[60px] text-center tabular-nums">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-md text-sm bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-gray-200 transition-all duration-150 btn-press"
                title="Next page"
                aria-label="Next page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="w-px h-5 bg-gray-200 mx-1" />
            </>
          )}

          {/* Zoom controls */}
          <button
            onClick={zoomOut}
            className="p-1.5 rounded-md bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 btn-press"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-xs text-secondary font-medium w-12 text-center tabular-nums">
            {fitWidth ? 'Fit' : `${Math.round(scale * 100)}%`}
          </span>
          <button
            onClick={zoomIn}
            className="p-1.5 rounded-md bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 btn-press"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Fit width toggle */}
          {pdfDoc && (
            <>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <button
                onClick={toggleFitWidth}
                className={`p-1.5 rounded-md border transition-all duration-150 btn-press ${
                  fitWidth
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
                title={fitWidth ? 'Exit fit width' : 'Fit to width'}
                aria-label="Fit to width"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile compact title bar */}
      <div className="sm:hidden flex items-center gap-2 px-3 py-2.5 border-b border-gray-200 bg-gray-50">
        <span className="text-base">
          {pdfDoc ? '📄' : '🖼️'}
        </span>
        <h3 className="text-xs font-semibold text-primary truncate flex-1">{title}</h3>
        {pdfDoc && totalPages > 0 && (
          <span className="text-[11px] text-secondary font-medium tabular-nums shrink-0">
            {currentPage}/{totalPages}
          </span>
        )}
      </div>

      {/* Content Area — extra bottom padding on mobile for bottom controls */}
      <div
        ref={containerRef}
        className="overflow-auto bg-gray-100 section-bg"
        style={{ maxHeight: '78vh' }}
      >
        <div className="p-3 sm:p-6 pb-20 sm:pb-6">
          {pdfDoc ? (
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                className="shadow-md rounded-sm bg-white"
                style={{ maxWidth: '100%' }}
              />
            </div>
          ) : imageUrl ? (
            <div className="flex justify-center">
              <img
                src={imageUrl}
                alt={title}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top center',
                }}
                className="max-w-full transition-transform duration-200 shadow-md rounded-sm"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <div className="text-4xl mb-3">📄</div>
              <p className="text-sm">No file to display</p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop bottom status bar for PDF */}
      {pdfDoc && totalPages > 1 && (
        <div className="hidden sm:flex px-4 py-2 border-t border-gray-100 bg-gray-50/80 items-center justify-between">
          <p className="text-[11px] text-gray-400">
            Use controls above to navigate pages
          </p>
          {/* Page progress */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all duration-300"
                style={{ width: `${(currentPage / totalPages) * 100}%` }}
              />
            </div>
            <span className="text-[11px] text-gray-400 tabular-nums">
              {Math.round((currentPage / totalPages) * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Mobile bottom control bar — one-hand friendly, within the viewer */}
      <div className="sm:hidden border-t border-gray-200 bg-white/97 backdrop-blur-sm">
        <div className="flex items-center justify-between px-2 py-2 gap-1">
          {/* Page navigation (PDF) or zoom info */}
          {pdfDoc && totalPages > 1 ? (
            <>
              {/* Prev page — large touch target */}
              <button
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
                className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all duration-150 btn-press mobile-touch-target"
                aria-label="Previous page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page progress bar */}
              <div className="flex-1 flex flex-col items-center gap-1 px-1">
                <span className="text-[11px] text-secondary font-medium tabular-nums">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all duration-300"
                    style={{ width: `${(currentPage / totalPages) * 100}%` }}
                  />
                </div>
              </div>

              {/* Next page — large touch target */}
              <button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all duration-150 btn-press mobile-touch-target"
                aria-label="Next page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : (
            <div className="flex-1" />
          )}

          {/* Divider */}
          {pdfDoc && totalPages > 1 && (
            <div className="w-px h-7 bg-gray-200 mx-0.5" />
          )}

          {/* Zoom controls — always visible on mobile */}
          <button
            onClick={zoomOut}
            className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-150 btn-press mobile-touch-target"
            aria-label="Zoom out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-[11px] text-secondary font-medium w-9 text-center tabular-nums">
            {fitWidth ? 'Fit' : `${Math.round(scale * 100)}%`}
          </span>
          <button
            onClick={zoomIn}
            className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-150 btn-press mobile-touch-target"
            aria-label="Zoom in"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Fit width toggle for PDF */}
          {pdfDoc && (
            <button
              onClick={toggleFitWidth}
              className={`p-2.5 rounded-xl border transition-all duration-150 btn-press mobile-touch-target ${
                fitWidth
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
              aria-label="Fit to width"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileViewer;
