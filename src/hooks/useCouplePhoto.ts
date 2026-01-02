import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCouple } from './useCouple';
import { useToast } from './use-toast';

export function useCouplePhoto() {
  const { couple, updateCoupleProfile } = useCouple();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!couple?.id) {
      toast({
        title: 'Cannot upload',
        description: 'Couple profile not found.',
        variant: 'destructive',
      });
      return null;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPEG, PNG, or WebP image.',
        variant: 'destructive',
      });
      return null;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please upload an image under 5MB.',
        variant: 'destructive',
      });
      return null;
    }

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${couple.id}/profile.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('couple-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('couple-photos')
        .getPublicUrl(fileName);

      // Update couple profile with new photo URL
      await updateCoupleProfile({ profile_photo_url: publicUrl });

      toast({
        title: 'Photo uploaded',
        description: 'Your couple photo has been saved.',
      });

      return publicUrl;
    } catch (err) {
      console.error('Photo upload error:', err);
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (): Promise<boolean> => {
    if (!couple?.id) return false;

    setDeleting(true);
    try {
      // List and delete all files in the couple's folder
      const { data: files } = await supabase.storage
        .from('couple-photos')
        .list(couple.id);

      if (files && files.length > 0) {
        const filePaths = files.map(f => `${couple.id}/${f.name}`);
        await supabase.storage.from('couple-photos').remove(filePaths);
      }

      // Clear the URL in the database
      await updateCoupleProfile({ profile_photo_url: null });

      toast({
        title: 'Photo removed',
        description: 'Your couple photo has been deleted.',
      });

      return true;
    } catch (err) {
      console.error('Photo delete error:', err);
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return {
    photoUrl: couple?.profile_photo_url ?? null,
    uploadPhoto,
    deletePhoto,
    uploading,
    deleting,
  };
}
