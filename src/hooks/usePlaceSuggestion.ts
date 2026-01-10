import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { PlaceDetails } from '@/hooks/useGooglePlaces';

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
   * Submit a place suggestion via backend function
   * This avoids RLS SELECT conflicts by handling insert server-side
   */
  const submitSuggestion = async (details: PlaceDetails): Promise<boolean> => {
    setIsSubmitting(true);

    try {
      // Get current session to ensure user is authenticated
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) {
        toast({
          title: 'Please sign in',
          description: 'You need to be signed in to suggest places.',
          variant: 'destructive',
        });
        return false;
      }

      // Call backend function to handle submission
      const { data, error } = await supabase.functions.invoke('submit-place-suggestion', {
        body: {
          place_id: details.place_id,
          name: details.name,
          city: details.city,
          state: details.state,
          country: details.country,
          lat: details.lat,
          lng: details.lng,
          rating: details.rating,
          user_ratings_total: details.user_ratings_total,
          formatted_address: details.formatted_address,
          website_url: details.website_url,
          phone_number: details.phone_number,
          google_maps_url: details.google_maps_url,
          opening_hours: details.opening_hours,
          google_primary_type: details.google_primary_type,
          google_primary_type_display: details.google_primary_type_display,
          photos: details.photos,
          price_level: details.price_level,
          google_types: details.google_types,
          business_status: details.business_status,
          utc_offset_minutes: details.utc_offset_minutes,
        },
      });

      if (error) {
        console.error('Function invocation error:', error);
        toast({
          title: 'Submission failed',
          description: 'Unable to connect to the server. Please try again.',
          variant: 'destructive',
        });
        return false;
      }

      // Handle response from backend
      if (data?.error === 'duplicate') {
        toast({
          title: 'Already suggested',
          description: data.message || 'This place is already in our directory or pending review.',
        });
        return false;
      }

      if (data?.error) {
        console.error('Backend error:', data);
        toast({
          title: 'Submission failed',
          description: data.message || 'There was an error submitting your suggestion.',
          variant: 'destructive',
        });
        return false;
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
