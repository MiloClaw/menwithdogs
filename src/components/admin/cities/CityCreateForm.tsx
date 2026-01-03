import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateCity } from '@/hooks/useCities';
import GooglePlacesAutocomplete from '@/components/ui/google-places-autocomplete';
import { PlaceDetails } from '@/hooks/useGooglePlaces';

interface CityCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CityCreateForm({ onSuccess, onCancel }: CityCreateFormProps) {
  const [cityInput, setCityInput] = useState('');
  const [selectedCity, setSelectedCity] = useState<{
    name: string;
    state: string | null;
    country: string;
    google_place_id: string;
    lat: number | null;
    lng: number | null;
  } | null>(null);
  const [targetPlaceCount, setTargetPlaceCount] = useState(30);
  const [targetAnchorCount, setTargetAnchorCount] = useState(15);

  const createCity = useCreateCity();

  const handleCitySelect = useCallback((details: PlaceDetails) => {
    setSelectedCity({
      name: details.city || details.name,
      state: details.state,
      country: details.country || 'US',
      google_place_id: details.place_id,
      lat: details.lat,
      lng: details.lng,
    });
    setCityInput(details.city || details.name);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCity) return;

    createCity.mutate({
      name: selectedCity.name,
      state: selectedCity.state,
      country: selectedCity.country,
      google_place_id: selectedCity.google_place_id,
      lat: selectedCity.lat,
      lng: selectedCity.lng,
      target_place_count: targetPlaceCount,
      target_anchor_count: targetAnchorCount,
    }, {
      onSuccess: () => {
        setCityInput('');
        setSelectedCity(null);
        setTargetPlaceCount(30);
        setTargetAnchorCount(15);
        onSuccess?.();
      },
    });
  };

  const isValid = selectedCity !== null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="city-search">City *</Label>
        <GooglePlacesAutocomplete
          value={cityInput}
          onChange={setCityInput}
          onPlaceSelect={handleCitySelect}
          placeholder="Search for a city..."
          types="(cities)"
        />
        {selectedCity && (
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
            <div className="font-medium text-foreground">{selectedCity.name}</div>
            <div>
              {selectedCity.state ? `${selectedCity.state}, ` : ''}{selectedCity.country}
            </div>
            {selectedCity.lat && selectedCity.lng && (
              <div className="text-xs mt-1">
                Coordinates: {selectedCity.lat.toFixed(4)}, {selectedCity.lng.toFixed(4)}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="target-places">Target Places</Label>
          <Input
            id="target-places"
            type="number"
            min={1}
            max={100}
            value={targetPlaceCount}
            onChange={(e) => setTargetPlaceCount(parseInt(e.target.value) || 30)}
          />
          <p className="text-xs text-muted-foreground">Total places to seed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-anchors">Target Anchors</Label>
          <Input
            id="target-anchors"
            type="number"
            min={1}
            max={50}
            value={targetAnchorCount}
            onChange={(e) => setTargetAnchorCount(parseInt(e.target.value) || 15)}
          />
          <p className="text-xs text-muted-foreground">High-quality anchor venues</p>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={!isValid || createCity.isPending}
        >
          {createCity.isPending ? 'Creating...' : 'Create City'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
