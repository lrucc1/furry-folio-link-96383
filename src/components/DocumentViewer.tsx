import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Download, RotateCw, X } from 'lucide-react';

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

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const isImage = mimeType.startsWith('image/');
  const isPDF = mimeType === 'application/pdf';
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
            {isImage && (
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
              <object
                data={url}
                type="application/pdf"
                className="w-full h-full min-h-[600px] bg-white rounded"
              >
                <embed
                  src={url}
                  type="application/pdf"
                  className="w-full h-full min-h-[600px]"
                />
              </object>
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