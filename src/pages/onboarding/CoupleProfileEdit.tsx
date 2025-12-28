import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCouple } from '@/hooks/useCouple';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InterestPicker from '@/components/onboarding/InterestPicker';
import { getInterestLabels } from '@/lib/interests';

interface CoupleProfileDraft {
  generated_display_name: string | null;
  generated_about_us: string | null;
  generated_shared_interests: string[] | null;
  is_applied: boolean;
}

/**
 * CoupleProfileEdit - Step 4 of onboarding
 * 
 * This is now a "dumb" component - it only renders UI and handles profile updates.
 * Navigation is controlled by OnboardingGuard.
 */
const CoupleProfileEdit = () => {
  const [displayName, setDisplayName] = useState('');
  const [aboutUs, setAboutUs] = useState('');
  const [sharedInterests, setSharedInterests] = useState<string[]>([]);
  const [preferredTimes, setPreferredTimes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<CoupleProfileDraft | null>(null);
  
  const { couple, updateCoupleProfile } = useCouple();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load existing couple profile data
  useEffect(() => {
    if (couple) {
      setDisplayName(couple.display_name ?? '');
      setAboutUs(couple.about_us ?? '');
      setSharedInterests(couple.shared_interests ?? []);
      setPreferredTimes(couple.preferred_meetup_times ?? '');
    }
  }, [couple]);

  // Fetch existing draft
  useEffect(() => {
    const fetchDraft = async () => {
      if (!couple?.id) return;

      const { data } = await supabase
        .from('couple_profile_drafts')
        .select('*')
        .eq('couple_id', couple.id)
        .maybeSingle();

      if (data) {
        setDraft(data as CoupleProfileDraft);
      }
    };

    fetchDraft();
  }, [couple?.id]);

  const handleGenerateDraft = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-couple-profile', {
        body: { couple_id: couple?.id },
      });

      if (error) throw error;

      setDraft(data.draft);
      toast({
        title: 'Draft generated',
        description: 'Review the suggestions and apply what you like.',
      });
    } catch (err) {
      toast({
        title: 'Failed to generate draft',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyDraft = () => {
    if (!draft) return;

    if (draft.generated_display_name) {
      setDisplayName(draft.generated_display_name);
    }
    if (draft.generated_about_us) {
      setAboutUs(draft.generated_about_us);
    }
    if (draft.generated_shared_interests?.length) {
      setSharedInterests(draft.generated_shared_interests);
    }

    toast({
      title: 'Draft applied',
      description: 'Feel free to edit before saving.',
    });
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast({
        title: 'Display name required',
        description: 'Please enter a display name for your couple.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Forward-only status transition: only advance from onboarding to pending_match
      // Never auto-downgrade status on edits
      const shouldAdvanceStatus = couple?.status === 'onboarding' && couple?.is_complete;
      
      await updateCoupleProfile({
        display_name: displayName.trim(),
        about_us: aboutUs.trim() || null,
        shared_interests: sharedInterests.length > 0 ? sharedInterests : null,
        preferred_meetup_times: preferredTimes.trim() || null,
        ...(shouldAdvanceStatus && { status: 'pending_match' as const }),
      });

      // Mark draft as applied if we had one
      if (draft && couple?.id) {
        await supabase
          .from('couple_profile_drafts')
          .update({ is_applied: true })
          .eq('couple_id', couple.id);
      }

      toast({
        title: 'Profile saved',
        description: 'Your couple profile is ready.',
      });
      
      // Navigate based on new status
      if (shouldAdvanceStatus) {
        navigate('/pending-match');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast({
        title: 'Failed to save',
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
      title="Your couple profile"
      subtitle="Build your shared profile. Discovery features coming soon."
    >
      <div className="space-y-6">
        {/* AI Draft Generator */}
        <div className="p-4 bg-surface rounded-card border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Need help getting started?</h3>
              <p className="text-sm text-muted-foreground">
                We can generate a draft based on your profiles.
              </p>
              {!couple?.is_complete && (
                <p className="text-xs text-amber-600 mt-1">
                  For best results, wait until your partner completes their profile.
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateDraft}
              disabled={isGenerating}
              className="flex-1 h-11"
            >
              {isGenerating ? 'Generating...' : draft ? 'Regenerate' : 'Generate draft'}
            </Button>
            {draft && !draft.is_applied && (
              <Button
                type="button"
                onClick={handleApplyDraft}
                className="flex-1 h-11"
              >
                Apply draft
              </Button>
            )}
          </div>
          {draft && (
            <div className="pt-2 text-xs text-muted-foreground">
              <p className="font-medium">Draft preview:</p>
              <p className="mt-1">"{draft.generated_display_name}"</p>
              {draft.generated_shared_interests && (
                <p className="mt-1">
                  Interests: {getInterestLabels(draft.generated_shared_interests).join(', ')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name *</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., Mike & David"
              className="h-12"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aboutUs">About us</Label>
            <Textarea
              id="aboutUs"
              value={aboutUs}
              onChange={(e) => setAboutUs(e.target.value)}
              placeholder="Tell other couples a bit about yourselves..."
              className="min-h-[120px] resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {aboutUs.length}/1000
            </p>
          </div>

          <div className="space-y-2">
            <Label>Shared interests</Label>
            <InterestPicker
              selected={sharedInterests}
              onChange={setSharedInterests}
              min={1}
              max={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredTimes">When are you usually free?</Label>
            <Input
              id="preferredTimes"
              type="text"
              value={preferredTimes}
              onChange={(e) => setPreferredTimes(e.target.value)}
              placeholder="e.g., Weekday evenings, Sunday afternoons"
              className="h-12"
              maxLength={200}
            />
          </div>
        </div>

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={isSubmitting || !displayName.trim()}
          className="w-full h-12 text-base"
        >
          {isSubmitting ? 'Saving...' : 'Save and finish'}
        </Button>
      </div>
    </OnboardingLayout>
  );
};

export default CoupleProfileEdit;
