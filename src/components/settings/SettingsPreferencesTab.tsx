import { useState, useEffect } from 'react';
import { MapPin, Check, Clock, Ruler, Zap, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GooglePlacesAutocomplete from '@/components/ui/google-places-autocomplete';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useEnsureRelationshipUnit } from '@/hooks/useEnsureRelationshipUnit';
import { PlaceDetails } from '@/hooks/useGooglePlaces';
import { useToast } from '@/hooks/use-toast';
import {
  TIME_PROMPT,
  DISTANCE_PROMPT,
  VIBE_PROMPT,
  INTENT_PROMPT,
  PromptOption,
} from '@/lib/preference-prompts';
import { cn } from '@/lib/utils';
import { TasteProfileCard } from './TasteProfileCard';
import { PersonalizationSummary } from './PersonalizationSummary';

const SECTION_ICONS = {
  time: Clock,
  distance: Ruler,
  vibe: Zap,
  intent: Search,
};

const SettingsPreferencesTab = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { memberProfile, updateMemberProfile, refetch } = useCouple();
  const { preferences, updatePreferences, isUpdating } = useUserPreferences();
  const { ensureRelationshipUnit } = useEnsureRelationshipUnit();
  
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
              'h-auto py-3 flex-col gap-1',
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
    <div className="space-y-6">
      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-4 w-4" />
            Location
          </CardTitle>
          <CardDescription>
            Where are you exploring?
          </CardDescription>
        </CardHeader>
        <CardContent>
          {memberProfile?.city && !editingCity ? (
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {memberProfile.city}{memberProfile.state ? `, ${memberProfile.state}` : ''}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                className="min-h-[44px]"
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
        </CardContent>
      </Card>

      {/* Taste Profile - Intelligence visualization */}
      <TasteProfileCard />

      {/* Browsing Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-4 w-4" />
            {TIME_PROMPT.question}
          </CardTitle>
          <CardDescription>{TIME_PROMPT.footer}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderChipOptions(
            TIME_PROMPT.options,
            preferences?.time_preference,
            (v) => handleSingleSelect('time_preference', v)
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Ruler className="h-4 w-4" />
            {DISTANCE_PROMPT.question}
          </CardTitle>
          <CardDescription>{DISTANCE_PROMPT.footer}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderChipOptions(
            DISTANCE_PROMPT.options,
            preferences?.distance_preference,
            (v) => handleSingleSelect('distance_preference', v)
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-4 w-4" />
            {VIBE_PROMPT.question}
          </CardTitle>
          <CardDescription>{VIBE_PROMPT.footer}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderChipOptions(
            VIBE_PROMPT.options,
            preferences?.vibe_preference,
            (v) => handleSingleSelect('vibe_preference', v)
          )}
        </CardContent>
      </Card>

      {/* Intent Preferences (multi-select grid) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-4 w-4" />
            {INTENT_PROMPT.header}
          </CardTitle>
          <CardDescription>{INTENT_PROMPT.footer}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderIntentGrid(INTENT_PROMPT.options)}
        </CardContent>
      </Card>

      {/* Personalization Summary */}
      <PersonalizationSummary />
    </div>
  );
};

export default SettingsPreferencesTab;
