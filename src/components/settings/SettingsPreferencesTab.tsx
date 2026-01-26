import { useState, useEffect, useCallback } from 'react';
import { Heart, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import {
  INTENT_PROMPT,
  PromptOption,
} from '@/lib/preference-prompts';
import { cn } from '@/lib/utils';
import { TasteProfileCard } from './TasteProfileCard';
import { ProSettingsFlow, ProPreviewOverlay } from './pro';
import {
  ProfileBasicsSection,
  ActivitiesSection,
  PlaceUsageSection,
  TimingSection,
  OpennessSection,
  PatternsSection,
  PrivacySection,
} from '@/components/profile';

const SettingsPreferencesTab = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { preferences, updatePreferences, isUpdating } = useUserPreferences();
  const { hasPaidTuning } = useSubscription();
  
  // Local state for profile preferences
  const [activities, setActivities] = useState<string[]>([]);
  const [placeUsage, setPlaceUsage] = useState<string[]>([]);
  const [timingPreferences, setTimingPreferences] = useState<string[]>([]);
  const [openness, setOpenness] = useState<string[]>([]);
  const [allowPlaceVisibility, setAllowPlaceVisibility] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [selectedIntents, setSelectedIntents] = useState<string[]>([]);

  // Sync from server preferences
  useEffect(() => {
    if (preferences) {
      setActivities(preferences.activities || []);
      setPlaceUsage(preferences.place_usage || []);
      setTimingPreferences(preferences.timing_preferences || []);
      setOpenness(preferences.openness || []);
      setAllowPlaceVisibility(preferences.allow_place_visibility || false);
      setDisplayName(preferences.display_name || null);
      setSelectedIntents(preferences.intent_preferences || []);
    }
  }, [preferences]);

  // Debounced save handlers
  const handleActivitiesChange = useCallback((newActivities: string[]) => {
    setActivities(newActivities);
    updatePreferences({ activities: newActivities });
  }, [updatePreferences]);

  const handlePlaceUsageChange = useCallback((newPlaceUsage: string[]) => {
    setPlaceUsage(newPlaceUsage);
    updatePreferences({ place_usage: newPlaceUsage });
  }, [updatePreferences]);

  const handleTimingChange = useCallback((newTiming: string[]) => {
    setTimingPreferences(newTiming);
    updatePreferences({ timing_preferences: newTiming });
  }, [updatePreferences]);

  const handleOpennessChange = useCallback((newOpenness: string[]) => {
    setOpenness(newOpenness);
    updatePreferences({ openness: newOpenness });
  }, [updatePreferences]);

  const handleVisibilityToggle = useCallback((value: boolean) => {
    setAllowPlaceVisibility(value);
    updatePreferences({ allow_place_visibility: value });
  }, [updatePreferences]);

  const handleDisplayNameChange = useCallback((name: string) => {
    setDisplayName(name);
    updatePreferences({ display_name: name || null });
  }, [updatePreferences]);

  const handleIntentToggle = (value: string) => {
    const newIntents = selectedIntents.includes(value)
      ? selectedIntents.filter(v => v !== value)
      : [...selectedIntents, value];
    
    setSelectedIntents(newIntents);
    updatePreferences({ intent_preferences: newIntents });
  };

  const renderIntentGrid = (options: PromptOption[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {options.map(opt => {
        const isSelected = selectedIntents.includes(opt.value);
        return (
          <Button
            key={opt.value}
            variant={isSelected ? 'default' : 'outline'}
            className={cn(
              'h-auto py-3 flex-col gap-1 relative transition-all duration-200 hover:scale-[1.02]',
              isSelected && 'ring-2 ring-primary/15 ring-offset-2 shadow-sm'
            )}
            onClick={() => handleIntentToggle(opt.value)}
            disabled={isUpdating}
          >
            <span className="text-xl">{opt.icon}</span>
            <span className="text-xs font-medium">{opt.label}</span>
            {isSelected && (
              <Check className="h-3 w-3 absolute top-2 right-2" />
            )}
          </Button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Trust-building intro */}
      <p className="text-sm text-muted-foreground">
        These settings quietly shape what the directory surfaces for you. 
        Everything here is private and can be changed anytime.
      </p>

      {/* Section 1: Profile Basics */}
      <ProfileBasicsSection
        displayName={displayName}
        onDisplayNameChange={handleDisplayNameChange}
        isUpdating={isUpdating}
      />

      {/* Section 2: Activities You Actually Do */}
      <ActivitiesSection
        selected={activities}
        onChange={handleActivitiesChange}
        isUpdating={isUpdating}
      />

      {/* Section 3: How You Usually Use Places */}
      <PlaceUsageSection
        selected={placeUsage}
        onChange={handlePlaceUsageChange}
        isUpdating={isUpdating}
      />

      {/* Section 4: When You Usually Go */}
      <TimingSection
        selected={timingPreferences}
        onChange={handleTimingChange}
        isUpdating={isUpdating}
      />

      {/* Section 5: Openness (Private) */}
      <OpennessSection
        selected={openness}
        onChange={handleOpennessChange}
        isUpdating={isUpdating}
      />

      {/* Intent - What draws you outside (kept from original) */}
      <section className="bg-muted/30 rounded-xl p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="h-4 w-4 text-muted-foreground/70" />
            <h3 className="text-base font-medium tracking-wide text-foreground">
              What draws you outside?
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Select any that speak to you. Helps us recommend better places.
          </p>
        </div>
        {renderIntentGrid(INTENT_PROMPT.options)}
        
        {/* Taste Profile */}
        <div className="pt-2">
          <TasteProfileCard />
        </div>
      </section>

      {/* Section 6: Places & Patterns (Read-only) */}
      <PatternsSection />

      {/* PRO Section - Spaces that feel right */}
      <section className="bg-muted/30 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className={cn(
            "h-4 w-4",
            hasPaidTuning ? "text-primary" : "text-muted-foreground/70"
          )} />
          <h3 className="text-base font-medium tracking-wide text-foreground">
            Spaces that feel right
          </h3>
        </div>
        
        <p className="text-xs text-muted-foreground leading-relaxed">
          When people with similar routines, comfort levels, and interests spend time in the same places, 
          patterns emerge. Pro uses these patterns to highlight places that tend to feel right for people 
          who move through the world the way you do.
        </p>
        
        {hasPaidTuning && (
          <p className="text-xs text-muted-foreground/70 italic">
            This works at the place level — not the person level.
          </p>
        )}

        <ProPreviewOverlay>
          <ProSettingsFlow />
        </ProPreviewOverlay>
      </section>

      {/* Section 7: Privacy & Control */}
      <PrivacySection
        allowPlaceVisibility={allowPlaceVisibility}
        onToggle={handleVisibilityToggle}
        isUpdating={isUpdating}
      />
    </div>
  );
};

export default SettingsPreferencesTab;