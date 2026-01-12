import { useState, useEffect } from 'react';
import { MapPin, Check, Clock, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GooglePlacesAutocomplete from '@/components/ui/google-places-autocomplete';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useEnsureRelationshipUnit } from '@/hooks/useEnsureRelationshipUnit';
import { useSubscription } from '@/hooks/useSubscription';
import { PlaceDetails } from '@/hooks/useGooglePlaces';
import { useToast } from '@/hooks/use-toast';
import {
  TIME_PROMPT,
  DISTANCE_PROMPT,
  INTENT_PROMPT,
  PromptOption,
} from '@/lib/preference-prompts';
import { cn } from '@/lib/utils';
import { TasteProfileCard } from './TasteProfileCard';
import { PersonalizationSummary } from './PersonalizationSummary';
import { ProSettingsFlow } from './pro';

const SettingsPreferencesTab = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { memberProfile, updateMemberProfile, refetch } = useCouple();
  const { preferences, updatePreferences, isUpdating } = useUserPreferences();
  const { ensureRelationshipUnit } = useEnsureRelationshipUnit();
  const { hasPaidTuning, createCheckout, isCreatingCheckout } = useSubscription();
  
  const [cityInput, setCityInput] = useState('');
  const [editingCity, setEditingCity] = useState(false);
  const [selectedIntents, setSelectedIntents] = useState<string[]>([]);

  // Sync intent preferences from server
  useEffect(() => {
    if (preferences?.intent_preferences) {
      setSelectedIntents(preferences.intent_preferences);
    }
  }, [preferences?.intent_preferences]);

  const handleCitySelect = async (details: PlaceDetails) => {
    if (!isAuthenticated) return;

    await ensureRelationshipUnit();
    
    try {
      await updateMemberProfile({
        city: details.city || details.name,
        city_place_id: details.place_id,
        city_lat: details.lat,
        city_lng: details.lng,
        state: details.state,
      });
      await refetch();
      setEditingCity(false);
      setCityInput('');
      toast({ title: 'Location updated' });
    } catch {
      toast({ title: 'Failed to update', variant: 'destructive' });
    }
  };

  const handleSingleSelect = (key: 'time_preference' | 'distance_preference' | 'vibe_preference', value: string) => {
    updatePreferences({ [key]: value });
  };

  const handleIntentToggle = (value: string) => {
    const newIntents = selectedIntents.includes(value)
      ? selectedIntents.filter(v => v !== value)
      : [...selectedIntents, value];
    
    setSelectedIntents(newIntents);
    updatePreferences({ intent_preferences: newIntents });
  };

  const renderChipOptions = (
    options: PromptOption[],
    selectedValue: string | null | undefined,
    onSelect: (value: string) => void
  ) => (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const isSelected = selectedValue === opt.value;
        return (
          <Button
            key={opt.value}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'min-h-[44px] gap-2 px-5 transition-all duration-200',
              isSelected && 'ring-2 ring-primary/15 ring-offset-2 shadow-sm'
            )}
            onClick={() => onSelect(opt.value)}
            disabled={isUpdating}
          >
            {opt.icon && <span className="text-base">{opt.icon}</span>}
            <span>{opt.label}</span>
            {isSelected && <Check className="h-3 w-3 ml-1" />}
          </Button>
        );
      })}
    </div>
  );

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
    <div className="space-y-10">
      {/* Trust-building intro */}
      <p className="text-sm text-muted-foreground">
        These settings quietly shape what the directory surfaces for you. You can change them anytime.
      </p>

      {/* Domain Group 1: Context — Where and when you explore */}
      <section className="bg-muted/30 rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-base font-medium tracking-wide text-foreground">
            Context
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Where and when you explore
          </p>
        </div>

        {/* Location */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground/70" />
            <span className="text-sm font-medium text-foreground">
              Your city
            </span>
          </div>
          
          {memberProfile?.city && !editingCity ? (
            <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border/50">
              <span className="font-medium">
                {memberProfile.city}{memberProfile.state ? `, ${memberProfile.state}` : ''}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                className="min-h-[44px] text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setEditingCity(true)}
              >
                Change
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <GooglePlacesAutocomplete
                value={cityInput}
                onChange={setCityInput}
                onPlaceSelect={handleCitySelect}
                placeholder="Search your city..."
                types="(cities)"
              />
              {editingCity && memberProfile?.city && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="min-h-[44px]"
                  onClick={() => {
                    setEditingCity(false);
                    setCityInput('');
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Rhythm: Time + Distance */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground/70" />
            <span className="text-sm font-medium text-foreground">
              Your rhythm
            </span>
          </div>

          {/* When you go out - hide for Pro users (covered in Pro Step 4: style.timing) */}
          {!hasPaidTuning && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                When you go out
              </span>
              {renderChipOptions(
                TIME_PROMPT.options,
                preferences?.time_preference,
                (v) => handleSingleSelect('time_preference', v)
              )}
            </div>
          )}

          {/* How far you'll travel */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">
              How far you'll travel
            </span>
            {renderChipOptions(
              DISTANCE_PROMPT.options,
              preferences?.distance_preference,
              (v) => handleSingleSelect('distance_preference', v)
            )}
          </div>
        </div>
      </section>

      {/* Domain Group 2: Place Affinity — What draws you to certain places */}
      <section className="bg-muted/30 rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-base font-medium tracking-wide text-foreground">
            Place Affinity
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            What draws you to certain places
          </p>
        </div>

        {/* Intent - What you're in the mood for */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground/70" />
            <span className="text-sm font-medium text-foreground">
              What you're in the mood for
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Select any that speak to you.
          </p>
          {renderIntentGrid(INTENT_PROMPT.options)}
        </div>

        {/* Taste Profile */}
        <div className="pt-2">
          <TasteProfileCard />
        </div>
      </section>

      {/* Domain Group 3: Pro — Spaces that feel right */}
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
        
        {hasPaidTuning ? (
          <>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When people with similar routines, comfort levels, and interests spend time in the same places, 
              patterns emerge. Pro uses these patterns to highlight places that tend to feel right for people 
              who move through the world the way you do.
            </p>
            <p className="text-xs text-muted-foreground/70 italic">
              This works at the place level — not the person level.
            </p>
            <ProSettingsFlow />
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              When people with similar routines, comfort levels, and interests spend time in the same places, 
              patterns emerge. Pro helps the directory recognize these patterns — so place suggestions feel 
              more grounded and less random.
            </p>
            <ul className="text-sm text-muted-foreground/80 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-xs opacity-60">•</span>
                More precise neighborhood suggestions
              </li>
              <li className="flex items-center gap-2">
                <span className="text-xs opacity-60">•</span>
                Better time-of-day relevance
              </li>
              <li className="flex items-center gap-2">
                <span className="text-xs opacity-60">•</span>
                Places where shared patterns already exist
              </li>
            </ul>
            <Button
              variant="outline"
              onClick={() => createCheckout()}
              disabled={isCreatingCheckout}
              className="min-h-[44px]"
            >
              {isCreatingCheckout ? 'Loading...' : 'Unlock Pro — $4.99/mo'}
            </Button>
          </div>
        )}
      </section>

      {/* Summary - What shapes your places */}
      <PersonalizationSummary />
    </div>
  );
};

export default SettingsPreferencesTab;