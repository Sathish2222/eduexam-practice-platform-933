import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { isPdf } from '../utils/helpers';

/**
 * Configure PDF.js worker.
 *
 * Important: do NOT rely on a CDN worker. In many environments (offline, CSP-restricted,
 * school networks), the CDN URL fails to load and pdf.js throws "Unable to load document".
 *
 * Using the bundled worker ensures consistent behavior in Vite builds.
 */
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

/**
 * Normalize various persisted file representations into bytes suitable for pdf.js.
 * localforage/IndexedDB should return a Blob, but backups/imports or older records may
 * store data URLs or raw buffers.
 *
 * @param {unknown} input - Blob | File | ArrayBuffer | Uint8Array | string (data URL)
 * @returns {Promise<Uint8Array>}
 */
async function toPdfBytes(input) {
  if (!input) throw new Error('No file data available');

  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);

  // File is also a Blob
  if (input instanceof Blob) {
    const ab = await input.arrayBuffer();
    return new Uint8Array(ab);
  }

  if (typeof input === 'string') {
    // Support data URL (e.g. "data:application/pdf;base64,....")
    if (input.startsWith('data:')) {
      const commaIdx = input.indexOf(',');
      if (commaIdx === -1) throw new Error('Invalid data URL');
      const b64 = input.slice(commaIdx + 1);
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return bytes;
    }
    throw new Error('Unsupported string file format');
  }

  throw new Error('Unsupported file data type');
}

/**
 * Normalize various persisted representations into an <img src> value.
 * @param {unknown} input
 * @returns {{src: string, revoke?: () => void}}
 */
function toImageSrc(input) {
  if (!input) throw new Error('No file data available');

  // localforage should return a Blob for images
  if (input instanceof Blob) {
    const url = URL.createObjectURL(input);
    return { src: url, revoke: () => URL.revokeObjectURL(url) };
  }

  if (typeof input === 'string') {
    // data URL already
    if (input.startsWith('data:')) return { src: input };
    // Otherwise treat as URL
    return { src: input };
  }

  throw new Error('Unsupported image data type');
}

/**
 * FileViewer component for rendering PDFs and images.
 * Supports page-by-page PDF navigation, zoom controls, fit-to-width mode,
 * and a full-screen (full page) viewing mode.
 * Mobile-optimized with bottom-positioned navigation controls for one-hand use.
 */
// PUBLIC_INTERFACE
/**
 * Renders a PDF or image file from a Blob with navigation, zoom, and full-screen controls.
 * Features bottom-positioned mobile controls for easy one-hand reach.
 * Full-screen mode covers the entire viewport for distraction-free viewing.
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fullscreenContainerRef = useRef(null);
  const renderTaskRef = useRef(null);
  const imageRevokeRef = useRef(null);

  // Listen for Escape key to exit full-screen mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    if (isFullScreen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when full-screen is active
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullScreen]);

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

      // Cleanup any previous object URL before loading the next file
      if (imageRevokeRef.current) {
        try {
          imageRevokeRef.current();
        } finally {
          imageRevokeRef.current = null;
        }
      }

      try {
        if (isPdf(fileType)) {
          const bytes = await toPdfBytes(fileBlob);
          const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(1);
          setImageUrl(null);
        } else {
          // Image file
          const { src, revoke } = toImageSrc(fileBlob);
          setImageUrl(src);
          imageRevokeRef.current = revoke || null;
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
      if (imageRevokeRef.current) {
        try {
          imageRevokeRef.current();
        } finally {
          imageRevokeRef.current = null;
        }
      }
    };
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
      // In full-screen mode, use the full-screen container for fit-width calculation
      const activeContainer = isFullScreen ? fullscreenContainerRef.current : containerRef.current;
      if (fitWidth && activeContainer) {
        const containerWidth = activeContainer.clientWidth - 48; // account for padding
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
  }, [pdfDoc, scale, fitWidth, isFullScreen]);

  // Re-render when page or scale changes
  useEffect(() => {
    if (pdfDoc && currentPage > 0) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale, fitWidth, isFullScreen, renderPage]);

  // Zoom controls
  const zoomIn = () => { setFitWidth(false); setScale(s => Math.min(3, s + 0.2)); };
  const zoomOut = () => { setFitWidth(false); setScale(s => Math.max(0.5, s - 0.2)); };
  const toggleFitWidth = () => setFitWidth(f => !f);

  // Page navigation
  const goToPrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  // Full-screen toggle
  const toggleFullScreen = () => setIsFullScreen(f => !f);

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

  /** Shared toolbar controls for both normal and full-screen modes */
  const renderToolbarControls = (isMobile = false) => (
    <div className={`flex items-center ${isMobile ? 'gap-2 justify-between w-full' : 'gap-1.5 shrink-0'}`}>
      {/* Page navigation for PDF */}
      {pdfDoc && (
        <>
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className={`${isMobile ? 'p-3.5 min-w-[52px] min-h-[52px]' : 'p-1.5'} rounded-${isMobile ? '2xl' : 'md'} text-sm bg-white border ${isMobile ? 'border-gray-300 shadow-sm' : 'border-gray-200'} hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-gray-200 transition-all duration-150 btn-press flex items-center justify-center`}
            title="Previous page"
            aria-label="Previous page"
          >
            <svg className={`${isMobile ? 'w-7 h-7' : 'w-4 h-4'}`} fill="none" stroke="currentColor" strokeWidth={isMobile ? 2.5 : 2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {isMobile ? (
            <div className="flex-1 flex flex-col items-center gap-1.5 px-1">
              <span className="text-sm text-secondary font-semibold tabular-nums">
                Page {currentPage} of {totalPages}
              </span>
              {totalPages > 1 && (
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all duration-300"
                    style={{ width: `${(currentPage / totalPages) * 100}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-secondary font-medium px-2 min-w-[60px] text-center tabular-nums">
              {currentPage} of {totalPages}
            </span>
          )}
          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            className={`${isMobile ? 'p-3.5 min-w-[52px] min-h-[52px]' : 'p-1.5'} rounded-${isMobile ? '2xl' : 'md'} text-sm bg-white border ${isMobile ? 'border-gray-300 shadow-sm' : 'border-gray-200'} hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-gray-200 transition-all duration-150 btn-press flex items-center justify-center`}
            title="Next page"
            aria-label="Next page"
          >
            <svg className={`${isMobile ? 'w-7 h-7' : 'w-4 h-4'}`} fill="none" stroke="currentColor" strokeWidth={isMobile ? 2.5 : 2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {!isMobile && <div className="w-px h-5 bg-gray-200 mx-1" />}
          {isMobile && pdfDoc && totalPages > 1 && <div className="w-px h-9 bg-gray-200 mx-0.5" />}
        </>
      )}

      {/* Zoom controls */}
      <button
        onClick={zoomOut}
        className={`${isMobile ? 'p-3.5 min-w-[52px] min-h-[52px] rounded-2xl border-gray-300 shadow-sm' : 'p-1.5 rounded-md border-gray-200'} bg-white border hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 btn-press flex items-center justify-center`}
        title="Zoom out"
        aria-label="Zoom out"
      >
        <svg className={`${isMobile ? 'w-6 h-6' : 'w-4 h-4'}`} fill="none" stroke="currentColor" strokeWidth={isMobile ? 2.5 : 2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
        </svg>
      </button>
      <span className={`${isMobile ? 'text-sm font-semibold w-12' : 'text-xs font-medium w-12'} text-secondary text-center tabular-nums`}>
        {fitWidth ? 'Fit' : `${Math.round(scale * 100)}%`}
      </span>
      <button
        onClick={zoomIn}
        className={`${isMobile ? 'p-3.5 min-w-[52px] min-h-[52px] rounded-2xl border-gray-300 shadow-sm' : 'p-1.5 rounded-md border-gray-200'} bg-white border hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 btn-press flex items-center justify-center`}
        title="Zoom in"
        aria-label="Zoom in"
      >
        <svg className={`${isMobile ? 'w-6 h-6' : 'w-4 h-4'}`} fill="none" stroke="currentColor" strokeWidth={isMobile ? 2.5 : 2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Fit width toggle for PDF */}
      {pdfDoc && (
        <>
          {!isMobile && <div className="w-px h-5 bg-gray-200 mx-1" />}
          <button
            onClick={toggleFitWidth}
            className={`${isMobile ? 'p-3.5 min-w-[52px] min-h-[52px] rounded-2xl shadow-sm' : 'p-1.5 rounded-md'} border transition-all duration-150 btn-press flex items-center justify-center ${
              fitWidth
                ? 'bg-primary text-white border-primary'
                : `bg-white ${isMobile ? 'border-gray-300' : 'border-gray-200'} hover:bg-gray-50 hover:border-gray-300`
            }`}
            title={fitWidth ? 'Exit fit width' : 'Fit to width'}
            aria-label="Fit to width"
          >
            <svg className={`${isMobile ? 'w-6 h-6' : 'w-4 h-4'}`} fill="none" stroke="currentColor" strokeWidth={isMobile ? 2.5 : 2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </>
      )}
    </div>
  );

  /** Shared document content area */
  const renderDocumentContent = (maxHeight = '78vh') => (
    <div
      ref={isFullScreen ? fullscreenContainerRef : containerRef}
      className="overflow-auto bg-gray-100 section-bg"
      style={{ maxHeight }}
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
  );

  /** Full-screen icon SVG (expand) */
  const FullScreenIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  );

  /** Exit full-screen icon SVG (collapse) */
  const ExitFullScreenIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4m0 5H4m0 0l5-5m11 5h-5m5 0V4m0 0l-5 5M9 15v5m0-5H4m0 0l5 5m11-5h-5m5 0v5m0 0l-5-5" />
    </svg>
  );

  // Full-screen overlay view
  if (isFullScreen) {
    return (
      <>
        {/* Placeholder in the normal flow so layout doesn't jump */}
        <div className="viewer-container flex items-center justify-center h-72 bg-gray-50">
          <div className="text-center">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-secondary text-sm">Viewing in full-screen mode</p>
            <button
              onClick={toggleFullScreen}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all btn-press"
            >
              <ExitFullScreenIcon />
              Exit Full Screen
            </button>
          </div>
        </div>

        {/* Full-screen overlay */}
        <div className="fullscreen-viewer-overlay" role="dialog" aria-label="Full screen document viewer">
          {/* Full-screen toolbar */}
          <div className="fullscreen-viewer-toolbar">
            <div className="flex items-center justify-between w-full gap-2">
              {/* Left: title */}
              <div className="flex items-center gap-2 min-w-0 mr-3">
                <span className="text-base">
                  {pdfDoc ? '📄' : '🖼️'}
                </span>
                <h3 className="text-sm font-semibold text-primary truncate">{title}</h3>
              </div>

              {/* Center: controls (hidden on mobile, shown in bottom bar) */}
              <div className="hidden sm:flex items-center">
                {renderToolbarControls(false)}
              </div>

              {/* Right: exit button — larger touch target on mobile */}
              <button
                onClick={toggleFullScreen}
                className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:px-3 sm:py-2 min-w-[44px] min-h-[44px] bg-gray-100 text-primary border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all btn-press"
                title="Exit full screen (Esc)"
                aria-label="Exit full screen"
              >
                <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4m0 5H4m0 0l5-5m11 5h-5m5 0V4m0 0l-5 5M9 15v5m0-5H4m0 0l5 5m11-5h-5m5 0v5m0 0l-5-5" />
                </svg>
                <span className="hidden sm:inline">Exit</span>
              </button>
            </div>
          </div>

          {/* Full-screen content area */}
          <div className="fullscreen-viewer-content">
            {renderDocumentContent('100%')}
          </div>

          {/* Full-screen mobile bottom controls — enlarged touch targets */}
          <div className="sm:hidden fullscreen-viewer-bottom-bar">
            <div className="flex items-center justify-between px-3 py-3 gap-2">
              {renderToolbarControls(true)}
            </div>
          </div>

          {/* Desktop bottom progress bar for PDF */}
          {pdfDoc && totalPages > 1 && (
            <div className="hidden sm:flex fullscreen-viewer-progress">
              <p className="text-[11px] text-gray-400">
                Press Esc to exit full screen
              </p>
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
        </div>
      </>
    );
  }

  // Normal (non-full-screen) view
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
          {renderToolbarControls(false)}

          {/* Full-screen toggle button */}
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button
            onClick={toggleFullScreen}
            className="p-1.5 rounded-md bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 btn-press"
            title="Full screen view"
            aria-label="Full screen view"
          >
            <FullScreenIcon />
          </button>
        </div>
      </div>

      {/* Mobile compact title bar — enlarged for better touch targets */}
      <div className="sm:hidden flex items-center gap-2.5 px-3.5 py-3 border-b border-gray-200 bg-gray-50">
        <span className="text-lg">
          {pdfDoc ? '📄' : '🖼️'}
        </span>
        <h3 className="text-sm font-semibold text-primary truncate flex-1">{title}</h3>
        {pdfDoc && totalPages > 0 && (
          <span className="text-xs text-secondary font-semibold tabular-nums shrink-0 bg-gray-200/70 px-2 py-0.5 rounded-full">
            {currentPage}/{totalPages}
          </span>
        )}
        {/* Mobile full-screen button in title bar — larger touch target */}
        <button
          onClick={toggleFullScreen}
          className="p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-white border border-gray-300 shadow-sm hover:bg-gray-50 transition-all duration-150 btn-press shrink-0 flex items-center justify-center"
          title="Full screen view"
          aria-label="Full screen view"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Content Area — extra bottom padding on mobile for bottom controls */}
      {renderDocumentContent('78vh')}

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

      {/* Mobile bottom control bar — enlarged for one-hand friendly use */}
      <div className="sm:hidden border-t border-gray-200 bg-white/97 backdrop-blur-sm shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-3 py-3 gap-2">
          {renderToolbarControls(true)}
        </div>
      </div>
    </div>
  );
}

export default FileViewer;
