import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface AmbassadorApplicationData {
  cityName: string;
  cityGooglePlaceId?: string;
  cityState?: string;
  cityCountry: string;
  tenure: string;
  localKnowledge: string;
  socialLinks?: string;
  email: string;
}

export const useAmbassadorApplication = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const submitApplication = async (data: AmbassadorApplicationData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('ambassador_applications')
        .insert({
          user_id: user?.id,
          email: data.email,
          city_name: data.cityName,
          city_google_place_id: data.cityGooglePlaceId,
          city_state: data.cityState,
          city_country: data.cityCountry,
          tenure: data.tenure,
          local_knowledge: data.localKnowledge,
          social_links: data.socialLinks || null,
          status: 'pending',
        });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Application submitted",
        description: "Thanks for applying. We'll be in touch if there's a fit.",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error submitting ambassador application:', error);
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitApplication,
    isSubmitting,
    isSubmitted,
    resetSubmission: () => setIsSubmitted(false),
  };
};
