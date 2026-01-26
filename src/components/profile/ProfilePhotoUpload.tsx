import { useState, useRef } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ProfilePhotoUploadProps {
  value: string | null;
  displayName: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function ProfilePhotoUpload({
  value,
  displayName,
  onChange,
  disabled = false,
}: ProfilePhotoUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const initials = displayName
    ? displayName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || '?';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, or WebP image.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 2MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${user.id}/profile.${fileExt}`;

      // Delete existing photo first (if any) to avoid orphaned files
      if (value) {
        const oldPath = value.split('/user-profile-photos/')[1];
        if (oldPath) {
          await supabase.storage.from('user-profile-photos').remove([oldPath]);
        }
      }

      // Upload new photo
      const { error: uploadError } = await supabase.storage
        .from('user-profile-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-profile-photos')
        .getPublicUrl(filePath);

      // Add cache-busting query param
      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;
      onChange(urlWithCacheBust);

      toast({ title: 'Photo updated!' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!user || !value) return;

    setIsUploading(true);

    try {
      const oldPath = value.split('/user-profile-photos/')[1]?.split('?')[0];
      if (oldPath) {
        await supabase.storage.from('user-profile-photos').remove([oldPath]);
      }

      onChange(null);
      toast({ title: 'Photo removed' });
    } catch (error) {
      console.error('Remove error:', error);
      toast({
        title: 'Failed to remove photo',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <Avatar className={cn(
          "h-24 w-24 ring-2 ring-border/50 transition-all",
          isUploading && "opacity-50"
        )}>
          <AvatarImage src={value || undefined} alt="Profile photo" />
          <AvatarFallback className="text-2xl font-medium bg-muted text-muted-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!isUploading && !disabled && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-full",
              "bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity",
              "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary"
            )}
            aria-label="Change profile photo"
          >
            <Camera className="h-6 w-6 text-white" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground min-h-[44px]"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          {value ? 'Change photo' : 'Add photo'}
        </Button>

        {value && !isUploading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-destructive min-h-[44px]"
            onClick={handleRemovePhoto}
            disabled={disabled}
          >
            <X className="h-3 w-3 mr-1" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
