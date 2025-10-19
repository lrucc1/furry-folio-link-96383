import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Download, RotateCw, X } from 'lucide-react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
// Vite: load pdf.js worker via URL
// @ts-ignore - vite query param returns a string URL
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

interface DocumentViewerProps {
  url: string;
  filename: string;
  mimeType: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentViewer = ({ url, filename, mimeType, isOpen, onClose }: DocumentViewerProps) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const canvasesRef = useRef<HTMLCanvasElement[]>([]);

  // Configure pdf.js worker once
  useEffect(() => {
    try {
      // @ts-ignore worker URL string
      GlobalWorkerOptions.workerSrc = pdfjsWorker;
    } catch {}
  }, []);

  // Render entire PDF when url/zoom/rotation changes
  useEffect(() => {
    if (!isOpen) return;
    const isPDF = (mimeType && mimeType.toLowerCase().includes('pdf')) || filename.toLowerCase().endsWith('.pdf');
    if (!isPDF) return;

    let cancelled = false;
    (async () => {
      try {
        const task = getDocument({ url });
        const pdf = await task.promise;
        if (cancelled) return;
        setNumPages(pdf.numPages);

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: zoom / 100, rotation });
          const canvas = canvasesRef.current[i - 1];
          if (!canvas || cancelled) continue;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: ctx as any, viewport } as any).promise;
        }
      } catch (e) {
        // ignore rendering errors to avoid crashing the dialog
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, isOpen, zoom, rotation, mimeType, filename]);
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const isImage = mimeType?.startsWith('image/');
  const isPDF = (mimeType && mimeType.toLowerCase().includes('pdf')) || filename.toLowerCase().endsWith('.pdf');
  const isOfficeDoc = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint'
  ].includes(mimeType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 flex flex-col gap-0" hideClose>
        <DialogTitle className="sr-only">{filename}</DialogTitle>
        <DialogDescription className="sr-only">Document preview</DialogDescription>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-sm font-medium truncate pr-4">
            {filename}
          </h2>
          <div className="flex items-center gap-2">
            {(isImage || isPDF) && (
              <>
                <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[50px] text-center">
                  {zoom}%
                </span>
                <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleRotate}>
                  <RotateCw className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={handleDownload}>
              <Download className="w-4 h-4" />
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close">
                <X className="w-4 h-4" />
              </Button>
            </DialogClose>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-muted p-4">
          <div className="flex items-center justify-center min-h-full">
            {isImage ? (
              <img
                src={url}
                alt={filename}
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-in-out',
                }}
                className="max-w-full h-auto"
              />
            ) : isPDF ? (
              <div className="w-full h-full min-h-[600px]">
                <div className="mx-auto flex flex-col items-center gap-4">
                  {Array.from({ length: numPages }).map((_, i) => (
                    <canvas
                      key={i}
                      ref={(el) => {
                        if (el) canvasesRef.current[i] = el;
                      }}
                      className="bg-white rounded shadow max-w-full h-auto"
                    />
                  ))}
                </div>
              </div>
            ) : isOfficeDoc ? (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
                className="w-full h-full min-h-[600px] bg-white rounded"
                title={filename}
              />
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Preview not available for this file type
                </p>
                <Button onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download to view
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};