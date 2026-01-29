import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useUserLinkPermission } from '@/hooks/useUserLinkPermission';
import { useSubmitContribution, SubmissionDraft } from '@/hooks/useSubmitContribution';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/PageLayout';
import { PlaceSelector } from '@/components/contribute/PlaceSelector';
import { ContextTypeSelector } from '@/components/contribute/ContextTypeSelector';
import { ContextEditor, MIN_CHARS, MAX_CHARS } from '@/components/contribute/ContextEditor';
import { ExternalLinkEditor } from '@/components/contribute/ExternalLinkEditor';
import { ReviewSubmit } from '@/components/contribute/ReviewSubmit';
import { cn } from '@/lib/utils';

const TOTAL_STEPS = 5;

const initialDraft: SubmissionDraft = {
  googlePlaceId: '',
  placeName: '',
  placeAddress: '',
  placeStatus: 'pending',
  placeId: undefined,
  contextTypes: [],
  contextText: '',
  hasExternalLink: false,
  externalUrl: '',
  externalContentType: '',
  externalSummary: '',
};

const Contribute = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAmbassador, loading: roleLoading } = useUserRole();
  const { canAttachLinks, loading: permLoading } = useUserLinkPermission();
  const { submit, isSubmitting } = useSubmitContribution();

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<SubmissionDraft>(initialDraft);

  // Auth guard
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Role guard - show message if not ambassador
  if (!authLoading && !roleLoading && !isAmbassador) {
    return (
      <PageLayout>
        <div className="container py-8 md:py-12 max-w-2xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center py-12">
            <h1 className="text-2xl font-serif font-medium mb-4">
              Trail Blazer Access Required
            </h1>
            <p className="text-muted-foreground mb-6">
              This feature is available to approved Trail Blazers. 
              Apply to become a Trail Blazer to share your knowledge.
            </p>
            <Button onClick={() => navigate('/ambassadors')}>
              Learn About Trail Blazers
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Validation for each step
  const canProceed = () => {
    switch (step) {
      case 1:
        return draft.googlePlaceId && draft.placeName;
      case 2:
        return draft.contextTypes.length > 0;
      case 3:
        return draft.contextText.length >= MIN_CHARS && draft.contextText.length <= MAX_CHARS;
      case 4:
        if (!draft.hasExternalLink) return true;
        return draft.externalUrl && draft.externalContentType;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS && canProceed()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleEdit = (targetStep: number) => {
    setStep(targetStep);
  };

  const handleSubmit = async () => {
    const result = await submit(draft);
    if (result.success) {
      navigate('/contributions');
    }
  };

  const updateDraft = (updates: Partial<SubmissionDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  const isLoading = authLoading || roleLoading || permLoading;

  return (
    <PageLayout>
      <div className="container py-8 md:py-12 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight">
            Add Context to a Place
          </h1>
          <p className="text-muted-foreground mt-2">
            Share what you know about places you've experienced.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            Step {step} of {TOTAL_STEPS}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  i + 1 <= step ? 'bg-primary' : 'bg-muted'
                )}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="min-h-[300px]">
            {step === 1 && (
              <PlaceSelector
                value={{
                  googlePlaceId: draft.googlePlaceId,
                  placeName: draft.placeName,
                  placeAddress: draft.placeAddress,
                  placeStatus: draft.placeStatus,
                  placeId: draft.placeId,
                }}
                onChange={(val) => updateDraft(val)}
              />
            )}

            {step === 2 && (
              <ContextTypeSelector
                value={draft.contextTypes}
                onChange={(val) => updateDraft({ contextTypes: val })}
              />
            )}

            {step === 3 && (
              <ContextEditor
                value={draft.contextText}
                onChange={(val) => updateDraft({ contextText: val })}
                selectedTypes={draft.contextTypes}
              />
            )}

            {step === 4 && (
              <ExternalLinkEditor
                canAttachLinks={canAttachLinks}
                hasExternalLink={draft.hasExternalLink}
                externalUrl={draft.externalUrl || ''}
                externalContentType={draft.externalContentType || ''}
                externalSummary={draft.externalSummary || ''}
                onChange={(data) => updateDraft(data)}
              />
            )}

            {step === 5 && (
              <ReviewSubmit
                draft={draft}
                isSubmitting={isSubmitting}
                onEdit={handleEdit}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        )}

        {/* Navigation */}
        {step < 5 && !isLoading && (
          <div className="flex items-center justify-between pt-8 border-t border-border mt-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-1"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Contribute;
