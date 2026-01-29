import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface SubmissionDraft {
  googlePlaceId: string;
  placeName: string;
  placeAddress: string;
  placeStatus: 'existing' | 'pending';
  placeId?: string;
  contextTypes: string[];
  contextText: string;
  hasExternalLink: boolean;
  externalUrl?: string;
  externalContentType?: string;
  externalSummary?: string;
}

export function useSubmitContribution() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (draft: SubmissionDraft): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('trail_blazer_submissions')
        .insert({
          user_id: user.id,
          google_place_id: draft.googlePlaceId,
          place_id: draft.placeId || null,
          place_name: draft.placeName,
          place_address: draft.placeAddress,
          place_status: draft.placeStatus,
          context_types: draft.contextTypes,
          context_text: draft.contextText,
          has_external_link: draft.hasExternalLink,
          external_url: draft.hasExternalLink ? draft.externalUrl : null,
          external_content_type: draft.hasExternalLink ? draft.externalContentType : null,
          external_summary: draft.hasExternalLink ? draft.externalSummary : null,
        });

      if (error) throw error;

      toast({
        title: 'Submitted for review',
        description: 'Your context will be reviewed before appearing.',
      });

      return { success: true };
    } catch (err: any) {
      console.error('Error submitting contribution:', err);
      toast({
        title: 'Failed to submit',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting };
}
