import { useState } from 'react';
import { useCouple } from '@/hooks/useCouple';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

/**
 * ConfirmIntent - Final step before couple is active
 * 
 * Both partners must see this after completing their profiles.
 * This creates mutual consent and reinforces platonic intent.
 */
const ConfirmIntent = () => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { couple, memberProfile, partnerProfile, refetch } = useCouple();
  const { toast } = useToast();

  const handleConfirm = async () => {
    if (!isConfirmed || !couple?.id) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('confirm_couple_intent', {
        p_couple_id: couple.id,
      });

      if (error) throw error;

      toast({
        title: 'Welcome to MainStreetIRL',
        description: 'Your couple profile is now ready.',
      });
      
      // Refetch state - guard will handle navigation
      await refetch();
    } catch (err) {
      toast({
        title: 'Something went wrong',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={4}
      title="One last thing"
      subtitle="Before we continue, let's make sure we're on the same page."
    >
      <div className="space-y-8">
        {/* Partner summary */}
        <div className="p-4 bg-surface rounded-card border border-border space-y-3">
          <h3 className="font-medium text-foreground">Your couple</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium">{memberProfile?.first_name || 'You'}</p>
              <p className="text-xs text-muted-foreground">{memberProfile?.city || 'Location not set'}</p>
            </div>
            <div className="text-muted-foreground">+</div>
            <div className="flex-1">
              <p className="text-sm font-medium">{partnerProfile?.first_name || 'Partner'}</p>
              <p className="text-xs text-muted-foreground">{partnerProfile?.city || 'Location not set'}</p>
            </div>
          </div>
        </div>

        {/* Confirmation checkbox */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="confirm"
              checked={isConfirmed}
              onCheckedChange={(checked) => setIsConfirmed(checked === true)}
              className="mt-1"
            />
            <Label 
              htmlFor="confirm" 
              className="text-sm leading-relaxed cursor-pointer"
            >
              We're joining MainStreetIRL as a couple interested in{' '}
              <span className="font-medium">platonic community engagement</span>.
              We understand this platform provides insights and signals — it does not facilitate contact or meetings.
            </Label>
          </div>
        </div>

        {/* Privacy reminder */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Your individual profiles remain private. Your preferences help personalize
            the places and content we recommend.
          </p>
        </div>

        {/* CTA */}
        <Button
          onClick={handleConfirm}
          disabled={!isConfirmed || isSubmitting}
          className="w-full h-12 text-base"
        >
          {isSubmitting ? 'Confirming...' : 'Confirm and continue'}
        </Button>
      </div>
    </OnboardingLayout>
  );
};

export default ConfirmIntent;
