import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Image as ImageIcon, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { DocumentViewer } from './DocumentViewer';
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
  const [documents, setDocuments] = useState<PetDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<PetDocument | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<PetDocument | null>(null);

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
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Check file size (50MB limit)
    if (file.size > 52428800) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setUploading(true);

    try {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${petId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('pet-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pet-documents')
        .getPublicUrl(fileName);

      // Save document record
      const { error: dbError } = await supabase
        .from('pet_documents')
        .insert({
          pet_id: petId,
          user_id: user.id,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
        });

      if (dbError) throw dbError;

      toast.success('Document uploaded successfully');
      fetchDocuments();
      
      // Reset input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleView = async (doc: PetDocument) => {
    if (!user) return;

    try {
      // Get signed URL for private documents
      const fileName = doc.file_url.split('/').pop() || '';
      const path = `${user.id}/${petId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('pet-documents')
        .createSignedUrl(path, 3600); // 1 hour expiry

      if (error) throw error;

      setSelectedDoc({ ...doc, file_url: data.signedUrl });
      setViewerOpen(true);
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Failed to load document');
    }
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Documents & Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="document-upload" className="cursor-pointer">
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">
                  {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX, Images (Max 50MB)
                </p>
              </div>
              <Input
                id="document-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
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
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(doc)}
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
    </>
  );
};