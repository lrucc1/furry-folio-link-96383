import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanV2 } from '@/hooks/usePlanV2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Image as ImageIcon, Trash2, Eye, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { DocumentViewer } from './DocumentViewer';
import { ImageCropDialog } from './ImageCropDialog';
import { FeatureGuard } from '@/components/FeatureGuard';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PetDocument {
  id: string;
  pet_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

interface PetDocumentsProps {
  petId: string;
}

export const PetDocuments = ({ petId }: PetDocumentsProps) => {
  const { user } = useAuth();
  const { entitlement, loading: planLoading } = usePlanV2();
  const [documents, setDocuments] = useState<PetDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<PetDocument | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<PetDocument | null>(null);
  const [totalStorage, setTotalStorage] = useState(0);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [docToEdit, setDocToEdit] = useState<PetDocument | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [petId]);

  const fetchDocuments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('pet_documents')
        .select('*')
        .eq('pet_id', petId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
      
      // Calculate total storage used
      const total = (data || []).reduce((sum, doc) => sum + (doc.file_size || 0), 0);
      setTotalStorage(total);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file || !user) return;

    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    processFile(file);
    event.target.value = '';
  };

  const processFile = async (file: File) => {
    if (!user || !entitlement) return;

    // Check if user has document storage access
    const storageLimit = entitlement.docs_storage_mb * 1024 * 1024;
    if (storageLimit === 0) {
      toast.error('Document storage is not available on the Free plan. Please upgrade to Pro.');
      return;
    }

    // Check if adding this file would exceed storage limit
    if (totalStorage + file.size > storageLimit) {
      const limitMB = (storageLimit / (1024 * 1024)).toFixed(0);
      const usedMB = (totalStorage / (1024 * 1024)).toFixed(2);
      toast.error(`Storage limit exceeded. You're using ${usedMB}MB of ${limitMB}MB.`);
      return;
    }

    // Check individual file size (50MB max per file)
    if (file.size > 52428800) {
      toast.error('File size must be less than 50MB');
      return;
    }

    // If it's an image, open crop dialog
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setPendingFileName(file.name);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
      return;
    }

    // For non-image files, upload directly
    await uploadFile(file, file.name);
  };

  const handleCroppedImage = async (croppedBlob: Blob) => {
    await uploadFile(croppedBlob, pendingFileName);
  };

  const uploadFile = async (file: Blob, fileName: string) => {
    if (!user) return;

    setUploading(true);

    try {
      // Upload to storage
      const fileExt = fileName.split('.').pop();
      const storagePath = `${user.id}/${petId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('pet-documents')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pet-documents')
        .getPublicUrl(storagePath);

      // Save document record
      const { error: dbError } = await supabase
        .from('pet_documents')
        .insert({
          pet_id: petId,
          user_id: user.id,
          file_name: fileName,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
        });

      if (dbError) throw dbError;

      toast.success('Document uploaded successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleView = async (doc: PetDocument) => {
    // Bucket is public; use the public URL directly for reliable inline viewing
    setSelectedDoc(doc);
    setViewerOpen(true);
  };

  const confirmDelete = (doc: PetDocument) => {
    setDocToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!docToDelete || !user) return;

    try {
      // Extract file path from URL
      const fileName = docToDelete.file_url.split('/').pop() || '';
      const path = `${user.id}/${petId}/${fileName}`;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('pet-documents')
        .remove([path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('pet_documents')
        .delete()
        .eq('id', docToDelete.id);

      if (dbError) throw dbError;

      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    } finally {
      setDeleteDialogOpen(false);
      setDocToDelete(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-8 h-8" />;
    return <FileText className="w-8 h-8" />;
  };

  const openEditDialog = (doc: PetDocument) => {
    setDocToEdit(doc);
    // Remove extension from filename for editing
    const nameWithoutExt = doc.file_name.substring(0, doc.file_name.lastIndexOf('.')) || doc.file_name;
    setNewFileName(nameWithoutExt);
    setEditDialogOpen(true);
  };

  const handleRename = async () => {
    if (!docToEdit || !user || !newFileName.trim()) return;

    try {
      // Get the file extension from the original filename
      const extension = docToEdit.file_name.substring(docToEdit.file_name.lastIndexOf('.'));
      const finalFileName = newFileName.trim() + extension;

      // Update the filename in the database
      const { error } = await supabase
        .from('pet_documents')
        .update({ file_name: finalFileName })
        .eq('id', docToEdit.id);

      if (error) throw error;

      toast.success('Filename updated successfully');
      fetchDocuments();
      setEditDialogOpen(false);
      setDocToEdit(null);
      setNewFileName('');
    } catch (error) {
      console.error('Error renaming file:', error);
      toast.error('Failed to rename file');
    }
  };

  const storageLimit = entitlement ? entitlement.docs_storage_mb * 1024 * 1024 : 0;
  const storageUsedPercent = storageLimit > 0 ? (totalStorage / storageLimit) * 100 : 0;

  return (
    <>
      <FeatureGuard feature="documents">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Documents & Files</span>
              {storageLimit > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  {formatFileSize(totalStorage)} / {formatFileSize(storageLimit)}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="document-upload" className="cursor-pointer">
                <div 
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                    isDragging ? "border-primary bg-primary/5" : "hover:border-primary"
                  )}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-1">
                    {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, DOCX, Images (Max 50MB) • Images will be cropped
                  </p>
                  {storageUsedPercent > 80 && (
                    <p className="text-xs text-warning mt-2">
                      {storageUsedPercent >= 100 ? 'Storage limit reached' : `${storageUsedPercent.toFixed(0)}% of storage used`}
                    </p>
                  )}
                </div>
                <Input
                  id="document-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading || storageUsedPercent >= 100}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                />
              </Label>
            </div>

            {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-muted-foreground">
                      {getFileIcon(doc.file_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.file_size)} • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleView(doc)}
                      title="View document"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(doc)}
                      title="Edit filename"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(doc)}
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No documents uploaded yet</p>
            </div>
          )}
          </CardContent>
        </Card>
      </FeatureGuard>

      {selectedDoc && (
        <DocumentViewer
          url={selectedDoc.file_url}
          filename={selectedDoc.file_name}
          mimeType={selectedDoc.file_type}
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setSelectedDoc(null);
          }}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{docToDelete?.file_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDocToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImageCropDialog
        image={imageToCrop}
        open={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        onCropComplete={handleCroppedImage}
        aspectRatio={4 / 3}
      />

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Filename</DialogTitle>
            <DialogDescription>
              Rename your document to keep everything clearly labeled. The file extension will be preserved automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filename">Filename</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="filename"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="Enter new filename"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRename();
                    }
                  }}
                />
                <span className="text-muted-foreground text-sm whitespace-nowrap">
                  {docToEdit?.file_name.substring(docToEdit.file_name.lastIndexOf('.'))}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!newFileName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};