import { useState, useEffect } from 'react';
import { MapPin, Check } from 'lucide-react';
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

  const renderOptions = (
    options: PromptOption[],
    selectedValue: string | null | undefined,
    onSelect: (value: string) => void
  ) => (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <Button
          key={opt.value}
          variant={selectedValue === opt.value ? 'default' : 'outline'}
          size="sm"
          className={cn(
            'min-h-[44px]',
            selectedValue === opt.value && 'ring-2 ring-primary ring-offset-2'
          )}
          onClick={() => onSelect(opt.value)}
          disabled={isUpdating}
        >
          {selectedValue === opt.value && <Check className="h-3 w-3 mr-1" />}
          {opt.label}
        </Button>
      ))}
    </div>
  );

  const renderMultiOptions = (options: PromptOption[]) => (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const isSelected = selectedIntents.includes(opt.value);
        return (
          <Button
            key={opt.value}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'min-h-[44px]',
              isSelected && 'ring-2 ring-primary ring-offset-2'
            )}
            onClick={() => handleIntentToggle(opt.value)}
            disabled={isUpdating}
          >
            {isSelected && <Check className="h-3 w-3 mr-1" />}
            {opt.label}
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

      {/* Time Preference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{TIME_PROMPT.question}</CardTitle>
          <CardDescription>{TIME_PROMPT.footer}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderOptions(
            TIME_PROMPT.options,
            preferences?.time_preference,
            (v) => handleSingleSelect('time_preference', v)
          )}
        </CardContent>
      </Card>

      {/* Distance Preference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{DISTANCE_PROMPT.question}</CardTitle>
          <CardDescription>{DISTANCE_PROMPT.footer}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderOptions(
            DISTANCE_PROMPT.options,
            preferences?.distance_preference,
            (v) => handleSingleSelect('distance_preference', v)
          )}
        </CardContent>
      </Card>

      {/* Vibe Preference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{VIBE_PROMPT.question}</CardTitle>
          <CardDescription>{VIBE_PROMPT.footer}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderOptions(
            VIBE_PROMPT.options,
            preferences?.vibe_preference,
            (v) => handleSingleSelect('vibe_preference', v)
          )}
        </CardContent>
      </Card>

      {/* Intent Preferences (multi-select) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{INTENT_PROMPT.question}</CardTitle>
          <CardDescription>{INTENT_PROMPT.footer}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderMultiOptions(INTENT_PROMPT.options)}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPreferencesTab;
