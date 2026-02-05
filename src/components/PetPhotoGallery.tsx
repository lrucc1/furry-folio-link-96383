import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ImageCropDialog } from '@/components/ImageCropDialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Plus, Star, Trash2, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Photo {
  id: string;
  file_url: string;
  file_name: string;
  created_at: string;
}

interface PetPhotoGalleryProps {
  petId: string;
  currentProfilePhoto?: string | null;
  onProfilePhotoChange?: (url: string) => void;
  className?: string;
}

export function PetPhotoGallery({ 
  petId, 
  currentProfilePhoto, 
  onProfilePhotoChange,
  className 
}: PetPhotoGalleryProps) {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchPhotos is defined in component
  useEffect(() => {
    fetchPhotos();
  }, [petId]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('pet_documents')
        .select('id, file_url, file_name, created_at')
        .eq('pet_id', petId)
        .like('file_type', 'image/%')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCroppedImage = async (croppedBlob: Blob) => {
    if (!user) return;

    setUploading(true);
    try {
      const fileName = `${user.id}/${petId}-gallery-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('pet-documents')
        .upload(fileName, croppedBlob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('pet-documents')
        .getPublicUrl(fileName);

      // Save to pet_documents
      const { error: dbError } = await supabase
        .from('pet_documents')
        .insert({
          pet_id: petId,
          user_id: user.id,
          file_name: `Photo ${photos.length + 1}`,
          file_url: urlData.publicUrl,
          file_type: 'image/jpeg',
          file_size: croppedBlob.size,
        });

      if (dbError) throw dbError;

      toast.success('Photo added');
      fetchPhotos();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
      setCropDialogOpen(false);
      setImageToCrop(null);
    }
  };

  const handleSetAsProfile = async (photo: Photo) => {
    if (!onProfilePhotoChange) return;
    
    try {
      const { error } = await supabase
        .from('pets')
        .update({ photo_url: photo.file_url })
        .eq('id', petId);

      if (error) throw error;

      onProfilePhotoChange(photo.file_url);
      toast.success('Profile photo updated');
    } catch (error) {
      toast.error('Failed to set profile photo');
    }
  };

  const handleDeletePhoto = async () => {
    if (!photoToDelete || !user) return;

    try {
      // Delete from storage
      const path = photoToDelete.file_url.split('/pet-documents/')[1];
      if (path) {
        await supabase.storage.from('pet-documents').remove([path]);
      }

      // Delete from database
      const { error } = await supabase
        .from('pet_documents')
        .delete()
        .eq('id', photoToDelete.id);

      if (error) throw error;

      // If this was the profile photo, clear it
      if (currentProfilePhoto === photoToDelete.file_url) {
        await supabase
          .from('pets')
          .update({ photo_url: null })
          .eq('id', petId);
        onProfilePhotoChange?.('');
      }

      setPhotos(prev => prev.filter(p => p.id !== photoToDelete.id));
      toast.success('Photo deleted');
    } catch (error) {
      toast.error('Failed to delete photo');
    } finally {
      setDeleteDialogOpen(false);
      setPhotoToDelete(null);
    }
  };

  const openViewer = (index: number) => {
    setCurrentPhotoIndex(index);
    setViewerOpen(true);
  };

  const navigateViewer = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentPhotoIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1));
    } else {
      setCurrentPhotoIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0));
    }
  };

  if (loading) {
    return (
      <div className={cn('p-4', className)}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">Photo Gallery</span>
          <span className="text-sm text-muted-foreground">({photos.length})</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, index) => {
          const isProfile = currentProfilePhoto === photo.file_url;
          return (
            <div
              key={photo.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer"
              onClick={() => openViewer(index)}
            >
              <img
                src={photo.file_url}
                alt=""
                className="w-full h-full object-cover"
              />
              {isProfile && (
                <div className="absolute top-1 left-1 bg-primary text-primary-foreground rounded-full p-1">
                  <Star className="w-3 h-3 fill-current" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!isProfile && onProfilePhotoChange && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetAsProfile(photo);
                    }}
                  >
                    <Star className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoToDelete(photo);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}

        {/* Add Photo Button */}
        <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center bg-muted/30">
          {uploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
          ) : (
            <>
              <Plus className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mt-1">Add</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Empty state */}
      {photos.length === 0 && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          No photos yet. Add your first photo!
        </p>
      )}

      {/* Crop Dialog */}
      {imageToCrop && (
        <ImageCropDialog
          image={imageToCrop}
          open={cropDialogOpen}
          onClose={() => {
            setCropDialogOpen(false);
            setImageToCrop(null);
          }}
          onCropComplete={handleCroppedImage}
          aspectRatio={1}
        />
      )}

      {/* Full Screen Viewer */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-0">
          <div className="relative aspect-square md:aspect-video">
            {photos[currentPhotoIndex] && (
              <img
                src={photos[currentPhotoIndex].file_url}
                alt=""
                className="w-full h-full object-contain"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-white/20"
              onClick={() => setViewerOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={() => navigateViewer('prev')}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={() => navigateViewer('next')}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {photos.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    idx === currentPhotoIndex ? 'bg-white' : 'bg-white/40'
                  )}
                />
              ))}
            </div>
          </div>
          <div className="p-4 flex justify-center gap-2">
            {photos[currentPhotoIndex] && (
              <>
                {currentProfilePhoto !== photos[currentPhotoIndex]?.file_url && onProfilePhotoChange && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      handleSetAsProfile(photos[currentPhotoIndex]);
                      setViewerOpen(false);
                    }}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Set as Profile
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    setPhotoToDelete(photos[currentPhotoIndex]);
                    setDeleteDialogOpen(true);
                    setViewerOpen(false);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePhoto} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
