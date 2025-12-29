import { useState } from 'react';
import { useCouple } from '@/hooks/useCouple';
import { useMemberInterests } from '@/hooks/useInterests';
import { useToast } from '@/hooks/use-toast';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import MemberProfileForm, { MemberProfileFormData } from '@/components/onboarding/MemberProfileForm';

/**
 * MyProfile - Step 2 of onboarding
 * 
 * This is a "dumb" component - it only renders UI and handles profile updates.
 * Navigation is controlled by OnboardingGuard based on state changes.
 */
const MyProfile = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { memberProfile, updateMemberProfile, refetch } = useCouple();
  const { syncInterests } = useMemberInterests();
  const { toast } = useToast();

  const handleSubmit = async (data: MemberProfileFormData) => {
    setIsSubmitting(true);
    try {
      // Update member profile (without interests - now in join table)
      await updateMemberProfile({
        first_name: data.first_name,
        city: data.city,
        city_place_id: data.city_place_id,
        city_lat: data.city_lat,
        city_lng: data.city_lng,
        state: data.state,
        is_profile_complete: true,
        onboarding_step: 'profile_complete', // Explicit state transition
      });
      
      // Sync interests to member_interests join table
      await syncInterests(data.interests);
      
      toast({
        title: 'Profile saved',
        description: 'Now invite your partner to join.',
      });
      // Refetch to update context state, guard handles navigation
      await refetch();
    } catch (err) {
      toast({
        title: 'Failed to save profile',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={4}
      title="Tell us about yourself"
      subtitle="This helps us understand what you enjoy. Only your partner will see this."
    >
      <MemberProfileForm
        initialData={{
          first_name: memberProfile?.first_name,
          city: memberProfile?.city,
          city_place_id: memberProfile?.city_place_id,
          city_lat: memberProfile?.city_lat,
          city_lng: memberProfile?.city_lng,
          state: memberProfile?.state,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </OnboardingLayout>
  );
};

export default MyProfile;
