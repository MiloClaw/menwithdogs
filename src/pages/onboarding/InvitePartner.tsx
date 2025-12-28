import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const emailSchema = z.string().email('Please enter a valid email address');

/**
 * InvitePartner - Step 3 of onboarding
 * 
 * This is now a "dumb" component - it only renders UI and handles invite sending.
 * Navigation is controlled by OnboardingGuard.
 */
const InvitePartner = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  
  const { user } = useAuth();
  const { couple, pendingInvite, refetch } = useCouple();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Show pending invite status
  useEffect(() => {
    if (pendingInvite) {
      setEmail(pendingInvite.invited_email);
      setInviteSent(true);
    }
  }, [pendingInvite]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = emailSchema.safeParse(email.trim());
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    // Can't invite yourself
    if (email.trim().toLowerCase() === user?.email?.toLowerCase()) {
      setError("You can't invite yourself");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const { error: fnError } = await supabase.functions.invoke('send-invite', {
        body: {
          couple_id: couple?.id,
          invited_email: email.trim().toLowerCase(),
        },
      });

      if (fnError) throw fnError;

      setInviteSent(true);
      refetch();
      toast({
        title: 'Invite sent',
        description: `We sent an invitation to ${email}`,
      });
    } catch (err) {
      toast({
        title: 'Failed to send invite',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipForNow = () => {
    navigate('/onboarding/couple-profile');
  };

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={4}
      title={inviteSent ? 'Invite sent!' : 'Invite your partner'}
      subtitle={inviteSent 
        ? `We sent an invitation to ${pendingInvite?.invited_email || email}. They have 7 days to join.`
        : "They'll receive an email to create their account and join your couple profile."}
    >
      <div className="space-y-6">
        {!inviteSent ? (
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="partnerEmail">Partner's email</Label>
              <Input
                id="partnerEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partner@example.com"
                className="h-12"
                autoComplete="email"
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send invite'}
            </Button>
          </form>
        ) : (
          <div className="p-4 bg-surface rounded-card border border-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                <span className="text-secondary text-lg">✓</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Invitation pending</p>
                <p className="text-sm text-muted-foreground">
                  {pendingInvite?.invited_email || email}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your partner will receive an email with a link to join. The invite expires in 7 days.
            </p>
          </div>
        )}

        <div className="pt-4 space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleSkipForNow}
            className="w-full h-12 text-base"
          >
            {inviteSent ? 'Continue to couple profile' : 'Skip for now'}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            {inviteSent 
              ? "You can continue while waiting for your partner to join."
              : "You can always invite your partner later from your dashboard."}
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default InvitePartner;
