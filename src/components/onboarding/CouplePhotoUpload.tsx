import { useRef, useState } from 'react';
import { Upload, X, Loader2, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCouplePhoto } from '@/hooks/useCouplePhoto';
import { cn } from '@/lib/utils';

interface CouplePhotoUploadProps {
  className?: string;
}

const CouplePhotoUpload = ({ className }: CouplePhotoUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { photoUrl, uploadPhoto, deletePhoto, uploading, deleting } = useCouplePhoto();
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = async (file: File) => {
    await uploadPhoto(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const isLoading = uploading || deleting;

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
        disabled={isLoading}
      />

      {photoUrl ? (
        // Photo preview
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-muted">
          <img
            src={photoUrl}
            alt="Couple photo"
            className="w-full h-full object-cover"
          />
          
          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 hover:opacity-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="min-h-[44px]"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Change'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deletePhoto()}
              disabled={isLoading}
              className="min-h-[44px]"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Remove'}
            </Button>
          </div>

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      ) : (
        // Upload area
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'w-full aspect-[4/3] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors',
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50',
            isLoading && 'pointer-events-none opacity-60'
          )}
        >
          {isLoading ? (
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          ) : (
            <>
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <User2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center px-4">
                <p className="font-medium text-foreground">Add a couple photo</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag and drop or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  JPEG, PNG, or WebP · Max 5MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        This photo will be shown to other couples when you're both open to hello.
      </p>
    </div>
  );
};

export default CouplePhotoUpload;
