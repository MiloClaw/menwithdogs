import { useState } from 'react';
import { useCouple } from '@/hooks/useCouple';
import { useToast } from '@/hooks/use-toast';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * CreateCouple - First step of setup
 * 
 * Lightweight entry: just partner's first name (optional) and a CTA.
 * Navigation is controlled by OnboardingGuard based on state changes.
 */
const CreateCouple = () => {
  const [partnerName, setPartnerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { createCouple } = useCouple();
  const { toast } = useToast();

  const handleCreateCouple = async () => {
    setIsCreating(true);
    try {
      await createCouple(partnerName.trim() || undefined);
      toast({
        title: 'Great!',
        description: "Now let's set up your profile.",
      });
      // Guard handles navigation based on updated state
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Please try again.';
      const isSessionIssue = message.includes('Session not ready');
      const isDuplicate = message.includes('already') || message.includes('duplicate');
      
      if (isDuplicate) {
        toast({
          title: 'Profile found',
          description: 'Taking you to the next step.',
        });
      } else {
        toast({
          title: isSessionIssue ? 'Almost ready' : 'Something went wrong',
          description: isSessionIssue 
            ? 'Your account is still setting up. Please try again.' 
            : message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={4}
      title="Set up your preferences"
      subtitle="This helps tailor the places and insights you see."
    >
      <div className="space-y-8">
        {/* Partner name (optional) */}
        <div className="space-y-2">
          <Label htmlFor="partnerName">Your partner's first name (optional)</Label>
          <Input
            id="partnerName"
            type="text"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            placeholder="e.g., Alex"
            className="h-12"
            maxLength={50}
          />
          <p className="text-xs text-muted-foreground">
            We'll use this to personalize the invite email.
          </p>
        </div>

        {/* Info card */}
        <div className="p-4 bg-surface rounded-card border border-border space-y-3">
          <h3 className="font-medium text-foreground">How it works</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">1.</span>
              <span>Fill out your preferences to personalize your experience</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">2.</span>
              <span>Invite your partner to share insights and saved places</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">3.</span>
              <span>Explore places, events, and community signals together</span>
            </li>
          </ul>
          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            Your preferences are private and used only for personalization.
          </p>
        </div>

        {/* CTA */}
        <Button
          onClick={handleCreateCouple}
          disabled={isCreating}
          className="w-full h-12 text-base"
        >
          {isCreating ? 'Creating...' : 'Get started'}
        </Button>
      </div>
    </OnboardingLayout>
  );
};

export default CreateCouple;
