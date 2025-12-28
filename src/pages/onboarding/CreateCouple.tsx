import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useToast } from '@/hooks/use-toast';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import { Button } from '@/components/ui/button';

const CreateCouple = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { createCouple, hasCouple, loading: coupleLoading } = useCouple();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle redirects in useEffect
  useEffect(() => {
    if (authLoading || coupleLoading) return;

    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (hasCouple) {
      navigate('/onboarding/my-profile');
      return;
    }
  }, [authLoading, coupleLoading, isAuthenticated, hasCouple, navigate]);

  // Show loading while auth or couple data is loading
  if (authLoading || coupleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const handleCreateCouple = async () => {
    setIsCreating(true);
    try {
      await createCouple();
      toast({
        title: 'Couple created',
        description: "Now let's set up your profile.",
      });
      navigate('/onboarding/my-profile');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Please try again.';
      const isSessionIssue = message.includes('Session not ready');
      
      toast({
        title: isSessionIssue ? 'Almost ready' : 'Something went wrong',
        description: isSessionIssue 
          ? 'Your account is still setting up. Please try again.' 
          : message,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={4}
      title="Start your couple profile"
      subtitle="You'll invite your partner after setting up your profile."
    >
      <div className="space-y-8">
        {/* Info card */}
        <div className="p-4 bg-surface rounded-card border border-border space-y-3">
          <h3 className="font-medium text-foreground">What happens next?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <span>Create your couple profile container</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <span>Fill in your personal details</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <span>Invite your partner to join</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
              <span>Build your shared couple profile</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <Button
          onClick={handleCreateCouple}
          disabled={isCreating}
          className="w-full h-12 text-base"
        >
          {isCreating ? 'Creating...' : 'Get started'}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Your profile will be private by default. Only your partner can see your details.
        </p>
      </div>
    </OnboardingLayout>
  );
};

export default CreateCouple;
