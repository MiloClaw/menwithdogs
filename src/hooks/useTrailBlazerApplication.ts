import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type {
  RoleType,
  ExpertiseArea,
  PortfolioLink,
  PlaceReference,
  Acknowledgements,
} from '@/lib/trail-blazer-options';

export interface TrailBlazerApplicationData {
  // Core identity
  name: string;
  email: string;
  
  // Optional region
  region?: string;
  regionGooglePlaceId?: string;
  regionState?: string;
  regionCountry?: string;
  
  // Repurposed fields for legacy DB compatibility
  contributionIntent: string;
  specificPlaces?: string;
  existingContent?: string;
  hasBusinessAffiliation: boolean;
  businessAffiliationDetails?: string;
  
  // New structured signals
  roleTypes: RoleType[];
  otherRoleDescription?: string;
  expertiseAreas: ExpertiseArea[];
  otherExpertiseDescription?: string;
  portfolioLinks: PortfolioLink[];
  placeReference?: PlaceReference;
  acknowledgements: Acknowledgements;
}

export const useTrailBlazerApplication = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const submitApplication = async (data: TrailBlazerApplicationData) => {
    setIsSubmitting(true);

    try {
      // 1. Insert the core application record
      const { data: application, error: appError } = await supabase
        .from('ambassador_applications')
        .insert({
          user_id: user?.id,
          email: data.email,
          name: data.name,
          city_name: data.region || 'Not specified',
          city_google_place_id: data.regionGooglePlaceId || null,
          city_state: data.regionState || null,
          city_country: data.regionCountry || 'US',
          tenure: 'not_applicable',
          specific_places: data.specificPlaces || null,
          motivation: data.contributionIntent,
          has_business_affiliation: data.hasBusinessAffiliation,
          business_affiliation_details: data.businessAffiliationDetails || null,
          local_knowledge: data.existingContent || 'Not provided',
          social_links: null, // Replaced by portfolio_links table
          status: 'pending',
        })
        .select('id')
        .single();

      if (appError) throw appError;

      const applicationId = application.id;

      // 2. Insert identity signals
      if (data.roleTypes.length > 0) {
        const { error: identityError } = await supabase
          .from('trail_blazer_identity_signals')
          .insert({
            application_id: applicationId,
            role_types: data.roleTypes,
            other_role_description: data.otherRoleDescription || null,
          });

        if (identityError) throw identityError;
      }

      // 3. Insert expertise signals
      if (data.expertiseAreas.length > 0) {
        const { error: expertiseError } = await supabase
          .from('trail_blazer_expertise_signals')
          .insert({
            application_id: applicationId,
            expertise_areas: data.expertiseAreas,
            other_expertise_description: data.otherExpertiseDescription || null,
          });

        if (expertiseError) throw expertiseError;
      }

      // 4. Insert portfolio links
      if (data.portfolioLinks.length > 0) {
        const linksToInsert = data.portfolioLinks
          .filter((link) => link.url.trim() !== '')
          .map((link, index) => ({
            application_id: applicationId,
            url: link.url.trim(),
            content_type: link.contentType,
            notes: link.notes || null,
            submitted_order: index,
          }));

        if (linksToInsert.length > 0) {
          const { error: linksError } = await supabase
            .from('trail_blazer_portfolio_links')
            .insert(linksToInsert);

          if (linksError) throw linksError;
        }
      }

      // 5. Insert place reference (optional)
      if (data.placeReference) {
        // Check if place exists in directory
        const { data: existingPlace } = await supabase
          .from('places')
          .select('id')
          .eq('google_place_id', data.placeReference.googlePlaceId)
          .maybeSingle();

        const { error: placeRefError } = await supabase
          .from('trail_blazer_place_references')
          .insert({
            application_id: applicationId,
            google_place_id: data.placeReference.googlePlaceId,
            place_name: data.placeReference.placeName,
            formatted_address: data.placeReference.formattedAddress || null,
            place_types: data.placeReference.placeTypes || [],
            place_status: existingPlace ? 'existing' : 'pending',
            directory_place_id: existingPlace?.id || null,
          });

        if (placeRefError) throw placeRefError;
      }

      // 6. Insert acknowledgements
      const { error: ackError } = await supabase
        .from('trail_blazer_acknowledgements')
        .insert({
          application_id: applicationId,
          ack_place_focus: data.acknowledgements.placeFocus,
          ack_link_review: data.acknowledgements.linkReview,
          ack_no_public_profile: data.acknowledgements.noPublicProfile,
          ack_no_promotion_required: data.acknowledgements.noPromotionRequired,
        });

      if (ackError) throw ackError;

      setIsSubmitted(true);
      toast({
        title: 'Application submitted',
        description: "Thanks for applying. We'll review your application and be in touch if there's a fit.",
      });

      return { success: true, applicationId };
    } catch (error: unknown) {
      console.error('Error submitting Trail Blazer application:', error);
      toast({
        title: 'Something went wrong',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
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
