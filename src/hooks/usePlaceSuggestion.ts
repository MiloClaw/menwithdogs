import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { PlaceDetails } from '@/hooks/useGooglePlaces';
import type { Json } from '@/integrations/supabase/types';

export const usePlaceSuggestion = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Check if a place already exists in our database by google_place_id
   */
  const checkExisting = async (googlePlaceId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('places')
      .select('id')
      .eq('google_place_id', googlePlaceId)
      .maybeSingle();

    if (error) {
      console.error('Error checking existing place:', error);
      return false;
    }

    return data !== null;
  };

  /**
   * Submit a place suggestion from Google Places details
   */
  const submitSuggestion = async (details: PlaceDetails): Promise<boolean> => {
    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({
          title: 'Please sign in',
          description: 'You need to be signed in to suggest places.',
          variant: 'destructive',
        });
        return false;
      }

      // Check if place already exists
      const exists = await checkExisting(details.place_id);
      if (exists) {
        toast({
          title: 'Already in directory',
          description: 'This place is already in our directory or pending review.',
        });
        return false;
      }

      // Prepare the insert data
      const insertData = {
        google_place_id: details.place_id,
        name: details.name,
        primary_category: details.google_primary_type_display || 'Uncategorized',
        city: details.city || null,
        state: details.state || null,
        country: details.country || null,
        lat: details.lat || null,
        lng: details.lng || null,
        source: 'user_submitted' as const,
        status: 'pending' as const,
        submitted_by: user.id,
        // GBP enrichment fields
        rating: details.rating || null,
        user_ratings_total: details.user_ratings_total || null,
        formatted_address: details.formatted_address || null,
        website_url: details.website_url || null,
        phone_number: details.phone_number || null,
        google_maps_url: details.google_maps_url || null,
        opening_hours: (details.opening_hours as Json) || null,
        google_primary_type: details.google_primary_type || null,
        google_primary_type_display: details.google_primary_type_display || null,
        // Additional GBP fields (previously missing)
        photos: (details.photos as unknown as Json) || null,
        price_level: details.price_level || null,
        google_types: details.google_types || null,
        business_status: details.business_status || null,
        utc_offset_minutes: details.utc_offset_minutes || null,
        // Track data freshness
        last_fetched_at: new Date().toISOString(),
        fetch_version: 1,
      };

      const { data: insertedPlace, error } = await supabase
        .from('places')
        .insert(insertData)
        .select('id')
        .single();

      if (error) {
        console.error('Error submitting place suggestion:', error);
        toast({
          title: 'Submission failed',
          description: 'There was an error submitting your suggestion. Please try again.',
          variant: 'destructive',
        });
        return false;
      }

      // Store photos in background (fire-and-forget)
      if (insertedPlace?.id && details.photos?.length > 0) {
        supabase.functions.invoke('store-place-photos', {
          body: {
            placeId: insertedPlace.id,
            photos: details.photos.slice(0, 5),
            maxWidth: 800,
            maxHeight: 600,
          },
        }).catch(err => {
          console.warn('Photo storage failed:', err);
        });
      }

      toast({
        title: 'Thanks for your suggestion!',
        description: 'Our team will review it shortly.',
      });
      return true;
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: 'Something went wrong',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitSuggestion,
    checkExisting,
    isSubmitting,
  };
};
