import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PlaceDetails } from '@/hooks/useGooglePlaces';

export const useCitySuggestion = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const checkExistingCity = async (googlePlaceId: string): Promise<boolean> => {
    // Check if city already exists in cities table
    const { data: existingCity } = await supabase
      .from('cities')
      .select('id')
      .eq('google_place_id', googlePlaceId)
      .maybeSingle();

    if (existingCity) return true;

    // Check if city already has a pending suggestion
    const { data: existingSuggestion } = await supabase
      .from('city_suggestions')
      .select('id')
      .eq('google_place_id', googlePlaceId)
      .maybeSingle();

    return !!existingSuggestion;
  };

  const submitSuggestion = async (details: PlaceDetails): Promise<boolean> => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to suggest a city.",
          variant: "destructive",
        });
        return false;
      }

      const exists = await checkExistingCity(details.place_id);
      if (exists) {
        toast({
          title: "City already exists",
          description: "This city is already in our directory or has been suggested.",
        });
        return false;
      }

      const { error } = await supabase
        .from('city_suggestions')
        .insert({
          google_place_id: details.place_id,
          name: details.name,
          state: details.state,
          country: details.country || 'US',
          lat: details.lat,
          lng: details.lng,
          submitted_by: user.id,
        });

      if (error) {
        console.error('Error submitting city suggestion:', error);
        toast({
          title: "Submission failed",
          description: "Unable to submit city suggestion. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "City suggested!",
        description: "We'll review your suggestion and may add this city to our directory.",
      });
      return true;
    } catch (err) {
      console.error('Error in city suggestion:', err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitSuggestion,
    checkExistingCity,
    isSubmitting,
  };
};
