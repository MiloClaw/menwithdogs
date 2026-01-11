import { useState, useEffect } from 'react';
import { MapPin, Check, Clock, Heart, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
import PaidTuningInputs from './PaidTuningInputs';

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
              'min-h-[44px] gap-2',
              isSelected && 'ring-2 ring-primary/20 ring-offset-2'
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
              'h-auto py-3 flex-col gap-1 relative',
              isSelected && 'ring-2 ring-primary/20 ring-offset-2'
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
      {/* Section 1: Location - Geographic anchor */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">
            Where you're exploring
          </h3>
        </div>
        
        {memberProfile?.city && !editingCity ? (
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <span className="font-medium">
              {memberProfile.city}{memberProfile.state ? `, ${memberProfile.state}` : ''}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              className="min-h-[44px] text-muted-foreground"
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
      </section>

      <Separator />

      {/* Section 2: Your Rhythm - Time + Distance combined */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">
            Your rhythm
          </h3>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          When you tend to go out — and how far feels reasonable.
        </p>

        {/* When you go out */}
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
      </section>

      <Separator />

      {/* Section 3: What you're in the mood for - Intent */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">
            What you're in the mood for
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Select any that speak to you.
        </p>
        {renderIntentGrid(INTENT_PROMPT.options)}
      </section>

      <Separator />

      {/* Section 4: Places you gravitate toward - Taste Profile (moved down) */}
      <TasteProfileCard />

      <Separator />

      {/* Section 5: Spaces that feel right - Pro Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          {hasPaidTuning ? (
            <Sparkles className="h-4 w-4 text-primary" />
          ) : (
            <Lock className="h-4 w-4 text-muted-foreground" />
          )}
          <h3 className="text-sm font-medium text-foreground">
            Spaces that feel right
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          {hasPaidTuning 
            ? 'Gently nudges the kinds of places we surface.'
            : 'Pro members can add context so places align with how you live — not just what you click.'}
        </p>
        
        {hasPaidTuning ? (
          <PaidTuningInputs />
        ) : (
          <div className="pt-2">
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

      <Separator />

      {/* Section 6: Summary - What shapes your places */}
      <PersonalizationSummary />
    </div>
  );
};

export default SettingsPreferencesTab;
