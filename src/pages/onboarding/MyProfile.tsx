import { useState } from 'react';
import { useCoupleContext } from '@/contexts/CoupleContext';
import { useMemberInterests } from '@/hooks/useInterests';
import { useToast } from '@/hooks/use-toast';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import MemberProfileForm, { MemberProfileFormData } from '@/components/onboarding/MemberProfileForm';

/**
 * MyProfile - Single onboarding step
 * 
 * Auto-creates couple on first save, then updates member profile.
 * Navigation is controlled by OnboardingGuard based on state changes.
 */
const MyProfile = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { 
    couple, 
    memberProfile, 
    createCouple, 
    updateMemberProfile, 
    updateCoupleProfile,
    refetch 
  } = useCoupleContext();
  const { syncInterests } = useMemberInterests();
  const { toast } = useToast();

  const handleSubmit = async (data: MemberProfileFormData) => {
    setIsSubmitting(true);
    try {
      // Auto-create couple if doesn't exist
      if (!couple) {
        await createCouple();
      }

      // Update member profile
      await updateMemberProfile({
        first_name: data.first_name,
        city: data.city,
        city_place_id: data.city_place_id,
        city_lat: data.city_lat,
        city_lng: data.city_lng,
        state: data.state,
        is_profile_complete: true,
        onboarding_step: 'profile_complete',
      });
      
      // Set couple to active status immediately
      await updateCoupleProfile({
        status: 'active',
        is_complete: true,
      });
      
      // Sync interests to member_interests join table
      await syncInterests(data.interests);
      
      toast({
        title: 'Welcome to MainStreetIRL!',
        description: 'Your profile is ready.',
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
      currentStep={1}
      totalSteps={1}
      title="Tell us about yourself"
      subtitle="We'll use this to find places you'll love."
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
