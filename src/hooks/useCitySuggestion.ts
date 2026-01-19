import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { showAuthToast } from '@/lib/auth-toast';
import { PlaceDetails } from '@/hooks/useGooglePlaces';

export interface MetroInfo {
  inMetro: boolean;
  metroName?: string;
  primaryCity?: string;
  primaryState?: string;
  metroLat?: number;
  metroLng?: number;
}

export const useCitySuggestion = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingMetro, setIsCheckingMetro] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  /**
   * Check if a county belongs to an already-launched metro area.
   * Returns metro info if found, null otherwise.
   */
  const checkMetroMembership = async (
    county: string | null,
    state: string | null
  ): Promise<MetroInfo | null> => {
    if (!county || !state) {
      return null;
    }

    setIsCheckingMetro(true);

    try {
      const { data, error } = await supabase.functions.invoke('check-metro-membership', {
        body: { county, state },
      });

      if (error) {
        console.error('Error checking metro membership:', error);
        return null;
      }

      if (data?.inMetro) {
        return data as MetroInfo;
      }

      return null;
    } catch (err) {
      console.error('Error in checkMetroMembership:', err);
      return null;
    } finally {
      setIsCheckingMetro(false);
    }
  };

  const submitSuggestion = async (details: PlaceDetails): Promise<boolean> => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        showAuthToast({
          title: 'Sign in to suggest cities',
          description: 'Help us expand to new areas.',
          onNavigate: () => navigate('/auth'),
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
    checkMetroMembership,
    isSubmitting,
    isCheckingMetro,
  };
};
