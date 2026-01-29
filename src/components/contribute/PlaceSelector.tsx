import { useState, useCallback } from 'react';
import { MapPin, Check, AlertCircle } from 'lucide-react';
import GooglePlacesAutocomplete from '@/components/ui/google-places-autocomplete';
import { PlaceDetails } from '@/hooks/useGooglePlaces';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface PlaceSelectorProps {
  value: {
    googlePlaceId: string;
    placeName: string;
    placeAddress: string;
    placeStatus: 'existing' | 'pending';
    placeId?: string;
  };
  onChange: (value: PlaceSelectorProps['value']) => void;
}

export function PlaceSelector({ value, onChange }: PlaceSelectorProps) {
  const [inputValue, setInputValue] = useState(value.placeName);
  const [isChecking, setIsChecking] = useState(false);

  const handlePlaceSelect = useCallback(async (details: PlaceDetails) => {
    setIsChecking(true);

    try {
      // Check if place exists in directory
      const { data } = await supabase
        .from('places')
        .select('id')
        .eq('google_place_id', details.place_id)
        .eq('status', 'approved')
        .maybeSingle();

      onChange({
        googlePlaceId: details.place_id,
        placeName: details.name,
        placeAddress: details.formatted_address || '',
        placeStatus: data ? 'existing' : 'pending',
        placeId: data?.id,
      });
    } catch (err) {
      console.error('Error checking place:', err);
      onChange({
        googlePlaceId: details.place_id,
        placeName: details.name,
        placeAddress: details.formatted_address || '',
        placeStatus: 'pending',
      });
    } finally {
      setIsChecking(false);
    }
  }, [onChange]);

  const hasSelection = value.googlePlaceId && value.placeName;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium mb-1">Which place are you adding context to?</h2>
        <p className="text-sm text-muted-foreground">
          Search for the specific place you want to share knowledge about.
        </p>
      </div>

      <GooglePlacesAutocomplete
        value={inputValue}
        onChange={setInputValue}
        onPlaceSelect={handlePlaceSelect}
        placeholder="Search for a place..."
        types="establishment"
        className="w-full"
      />

      {/* Selected place card */}
      {hasSelection && !isChecking && (
        <div className="bg-muted/30 border border-border rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base">{value.placeName}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {value.placeAddress}
              </p>
              <div className="mt-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full',
                    value.placeStatus === 'existing'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  )}
                >
                  {value.placeStatus === 'existing' ? (
                    <>
                      <Check className="h-3 w-3" />
                      In Directory
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3" />
                      New — will be reviewed
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isChecking && (
        <div className="bg-muted/30 border border-border rounded-xl p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
