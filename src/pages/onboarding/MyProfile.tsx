import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useToast } from '@/hooks/use-toast';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import MemberProfileForm from '@/components/onboarding/MemberProfileForm';

const MyProfile = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { memberProfile, hasCouple, updateMemberProfile, loading: coupleLoading } = useCouple();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading || coupleLoading) return;

    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!hasCouple) {
      navigate('/onboarding/create-couple');
      return;
    }
  }, [authLoading, coupleLoading, isAuthenticated, hasCouple, navigate]);

  const handleSubmit = async (data: { first_name: string; city: string; interests: string[] }) => {
    setIsSubmitting(true);
    try {
      await updateMemberProfile({
        first_name: data.first_name,
        city: data.city,
        interests: data.interests,
        is_profile_complete: true,
        onboarding_step: 'profile_complete', // Explicit state transition
      });
      toast({
        title: 'Profile saved',
        description: 'Now invite your partner to join.',
      });
      navigate('/onboarding/invite-partner');
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

  if (authLoading || coupleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

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
          interests: memberProfile?.interests,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </OnboardingLayout>
  );
};

export default MyProfile;
