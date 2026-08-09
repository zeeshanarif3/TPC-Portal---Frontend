import { Document, Page, pdfjs } from "react-pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./PDFPreviewModal.css";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

    
    
    import { useState, useEffect } from "react";
    
    import {
        X,
        ChevronLeft,
      ChevronRight,
      ZoomIn,
      ZoomOut,
      Download,
      Loader2,
    } from "lucide-react";
export default function PDFPreviewModal({
  open,
  fileUrl,
  fileName,
  onClose,
  onDownload,
}) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.15);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e) => {
      if (e.key === "Escape") onClose();

      if (e.key === "ArrowRight") {
        setPageNumber((p) => Math.min(p + 1, numPages));
      }

      if (e.key === "ArrowLeft") {
        setPageNumber((p) => Math.max(p - 1, 1));
      }

      if (e.key === "+" || e.key === "=") {
        setScale((s) => Math.min(s + 0.1, 3));
      }

      if (e.key === "-") {
        setScale((s) => Math.max(s - 0.1, 0.5));
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, numPages, onClose]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setPageNumber(1);
      setScale(1.15);
    }
  }, [fileUrl, open]);

  if (!open) return null;

  const nextPage = () =>
    setPageNumber((p) => Math.min(p + 1, numPages));

  const prevPage = () =>
    setPageNumber((p) => Math.max(p - 1, 1));

  return (
    <div className="pdf-backdrop">

      <div className="pdf-modal">

        <div className="pdf-header">

          <div className="pdf-title">
            📄 {fileName}
          </div>

          <div className="pdf-actions">

            {/* <button
              className="pdf-btn"
              onClick={onDownload}
              title="Download"
            >
              <Download size={18} />
            </button> */}

            <button
              className="pdf-btn danger"
              onClick={onClose}
              title="Close"
            >
              <X size={18} />
            </button>

          </div>

        </div>

        <div className="pdf-viewer">

          <Document
            file={fileUrl}
            loading={
              <div className="pdf-loading">
                <Loader2 className="spin" size={40} />
                <p>Loading PDF...</p>
              </div>
            }
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
              setLoading(false);
            }}
            onLoadError={(err) => {
              console.error(err);
              setLoading(false);
            }}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
            />
          </Document>

        </div>

        <div className="pdf-footer">

          <button
            className="pdf-btn"
            disabled={pageNumber === 1}
            onClick={prevPage}
          >
            <ChevronLeft size={18} />
          </button>

          <span className="page-counter">
            Page {pageNumber} / {numPages || "-"}
          </span>

          <button
            className="pdf-btn"
            disabled={pageNumber === numPages}
            onClick={nextPage}
          >
            <ChevronRight size={18} />
          </button>

          <div className="pdf-spacer" />

          <button
            className="pdf-btn"
            onClick={() =>
              setScale((s) => Math.max(s - 0.1, 0.5))
            }
          >
            <ZoomOut size={18} />
          </button>

          <span className="zoom-text">
            {Math.round(scale * 100)}%
          </span>

          <button
            className="pdf-btn"
            onClick={() =>
              setScale((s) => Math.min(s + 0.1, 3))
            }
          >
            <ZoomIn size={18} />
          </button>

        </div>

      </div>

    </div>
  );
}













// import { useEffect, useMemo, useState } from 'react';
// import { Document, Page, pdfjs } from 'react-pdf';
// import {
//   ChevronLeft,
//   ChevronRight,
//   Download,
//   Minus,
//   Plus,
//   X,
//   FileText,
// } from 'lucide-react';

// // Make sure pdfjs worker is configured once in your app.
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.mjs',
//   import.meta.url
// ).toString();

// export default function PDFPreviewModal({
//   open,
//   fileUrl,
//   fileName = 'document.pdf',
//   onClose,
//   onDownload,
// }) {
//   const [numPages, setNumPages] = useState(null);
//   const [pageNumber, setPageNumber] = useState(1);
//   const [scale, setScale] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   const canGoPrev = pageNumber > 1;
//   const canGoNext = numPages ? pageNumber < numPages : false;

//   const displayName = useMemo(() => {
//     if (!fileName) return 'PDF Preview';
//     return fileName;
//   }, [fileName]);

//   useEffect(() => {
//     if (!open) return;

//     const onKeyDown = (e) => {
//       if (e.key === 'Escape') onClose?.();
//       if (e.key === 'ArrowLeft') setPageNumber((p) => Math.max(1, p - 1));
//       if (e.key === 'ArrowRight') {
//         setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p + 1));
//       }
//       if (e.key === '+' || (e.shiftKey && e.key === '=')) {
//         setScale((s) => Math.min(2.5, +(s + 0.1).toFixed(1)));
//       }
//       if (e.key === '-') {
//         setScale((s) => Math.max(0.6, +(s - 0.1).toFixed(1)));
//       }
//     };

//     window.addEventListener('keydown', onKeyDown);
//     return () => window.removeEventListener('keydown', onKeyDown);
//   }, [open, onClose, numPages]);

//   useEffect(() => {
//     if (!open) return;
//     setPageNumber(1);
//     setScale(1);
//     setLoading(true);
//     setError('');
//     setNumPages(null);
//   }, [open, fileUrl]);

//   useEffect(() => {
//     if (!open) return;
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = prev;
//     };
//   }, [open]);

//   if (!open) return null;

//   const handleDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
//     setNumPages(nextNumPages);
//     setLoading(false);
//     setError('');
//   };

//   const handleDocumentLoadError = (err) => {
//     setLoading(false);
//     setError(err?.message || 'Failed to load PDF');
//   };

//   const handleOverlayClick = (e) => {
//     if (e.target === e.currentTarget) onClose?.();
//   };

//   const handleDownload = async () => {
//     if (onDownload) return onDownload();

//     if (!fileUrl) return;
//     const a = document.createElement('a');
//     a.href = fileUrl;
//     a.download = displayName;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//   };

//   return (
//     <div
//       className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-3 py-4 backdrop-blur-sm"
//       onClick={handleOverlayClick}
//       role="dialog"
//       aria-modal="true"
//       aria-label="PDF preview"
//     >
//       <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
//         <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
//           <div className="flex min-w-0 items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-white">
//               <FileText className="h-5 w-5" />
//             </div>
//             <div className="min-w-0">
//               <h2 className="truncate text-sm font-semibold text-white sm:text-base">
//                 {displayName}
//               </h2>
//               <p className="text-xs text-slate-400">
//                 {numPages ? `${numPages} page${numPages === 1 ? '' : 's'}` : 'Loading preview...'}
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <button
//               onClick={handleDownload}
//               className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
//             >
//               <Download className="h-4 w-4" />
//               <span className="hidden sm:inline">Download</span>
//             </button>
//             <button
//               onClick={onClose}
//               className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
//               aria-label="Close preview"
//             >
//               <X className="h-4 w-4" />
//             </button>
//           </div>
//         </div>

//         <div className="flex flex-1 overflow-hidden">
//           <div className="flex flex-1 flex-col">
//             <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2 sm:px-4">
//               <div className="flex items-center gap-2">
//                 <button
//                   className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
//                   onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
//                   disabled={!canGoPrev}
//                   aria-label="Previous page"
//                 >
//                   <ChevronLeft className="h-4 w-4" />
//                 </button>
//                 <div className="min-w-[110px] rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-sm text-slate-200">
//                   {numPages ? `${pageNumber} / ${numPages}` : '— / —'}
//                 </div>
//                 <button
//                   className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
//                   onClick={() => setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p + 1))}
//                   disabled={!canGoNext}
//                   aria-label="Next page"
//                 >
//                   <ChevronRight className="h-4 w-4" />
//                 </button>
//               </div>

//               <div className="flex items-center gap-2">
//                 <button
//                   className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
//                   onClick={() => setScale((s) => Math.max(0.6, +(s - 0.1).toFixed(1)))}
//                   aria-label="Zoom out"
//                 >
//                   <Minus className="h-4 w-4" />
//                 </button>
//                 <div className="min-w-[90px] rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-sm text-slate-200">
//                   {Math.round(scale * 100)}%
//                 </div>
//                 <button
//                   className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
//                   onClick={() => setScale((s) => Math.min(2.5, +(s + 0.1).toFixed(1)))}
//                   aria-label="Zoom in"
//                 >
//                   <Plus className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>

//             <div className="relative flex-1 overflow-auto bg-slate-900 p-3 sm:p-6">
//               <div className="mx-auto flex min-h-full w-full max-w-5xl items-start justify-center">
//                 <Document
//                   file={fileUrl}
//                   onLoadSuccess={handleDocumentLoadSuccess}
//                   onLoadError={handleDocumentLoadError}
//                   loading={
//                     <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 px-6 py-10 text-sm text-slate-300">
//                       Loading PDF preview...
//                     </div>
//                   }
//                   error={null}
//                   className="w-full"
//                 >
//                   <div className="w-full overflow-x-auto rounded-3xl bg-slate-800/40 p-3 shadow-inner sm:p-6">
//                     <div className="flex justify-center">
//                       <Page
//                         pageNumber={pageNumber}
//                         scale={scale}
//                         renderTextLayer={false}
//                         renderAnnotationLayer={false}
//                         onLoadSuccess={() => setLoading(false)}
//                         className="shadow-2xl"
//                       />
//                     </div>
//                   </div>
//                 </Document>

//                 {loading && !error && (
//                   <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
//                     <div className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-200 shadow-lg">
//                       Rendering page...
//                     </div>
//                   </div>
//                 )}

//                 {error && (
//                   <div className="absolute inset-0 flex items-center justify-center p-4">
//                     <div className="max-w-md rounded-3xl border border-rose-500/20 bg-rose-500/10 p-5 text-center text-sm text-rose-100 shadow-xl">
//                       <p className="font-medium">Could not preview this file.</p>
//                       <p className="mt-1 text-rose-100/80">{error}</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="border-t border-white/10 px-4 py-3 text-xs text-slate-400 sm:px-5">
//           Shortcuts: Esc to close, ← / → to switch pages, + / - to zoom.
//         </div>
//       </div>
//     </div>
//   );
// }
