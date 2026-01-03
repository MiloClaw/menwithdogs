import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2, MapPin, X } from 'lucide-react';
import { EVENT_TYPES } from '@/lib/event-taxonomy';
import GooglePlacesAutocomplete from '@/components/ui/google-places-autocomplete';
import type { PlaceDetails } from '@/hooks/useGooglePlaces';
import type { DiscoveryParams } from '@/hooks/useEventDiscovery';

interface DiscoveryFormProps {
  onSubmit: (params: DiscoveryParams) => void;
  isLoading: boolean;
}

interface SelectedLocation {
  city: string;
  state: string | null;
  displayName: string;
}

const TIME_WINDOWS = [
  { value: '7', label: 'Next 7 days' },
  { value: '14', label: 'Next 14 days' },
  { value: '30', label: 'Next 30 days' },
];

const VENUE_TYPES = [
  { value: 'bar', label: 'Bars & Pubs' },
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'cafe', label: 'Cafes & Coffee Shops' },
  { value: 'brewery', label: 'Breweries & Wineries' },
  { value: 'museum', label: 'Museums & Galleries' },
  { value: 'theater', label: 'Theaters & Venues' },
  { value: 'park', label: 'Parks & Outdoor' },
  { value: 'community_center', label: 'Community Centers' },
  { value: 'gym', label: 'Fitness & Wellness' },
];

export function DiscoveryForm({ onSubmit, isLoading }: DiscoveryFormProps) {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [locationInput, setLocationInput] = useState('');
  const [timeWindow, setTimeWindow] = useState('30');
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedVenueTypes, setSelectedVenueTypes] = useState<string[]>([]);
  const [customContext, setCustomContext] = useState('');

  const toggleEventType = (value: string) => {
    setSelectedEventTypes(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const toggleVenueType = (value: string) => {
    setSelectedVenueTypes(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const handlePlaceSelect = (details: PlaceDetails) => {
    setSelectedLocation({
      city: details.city || details.name,
      state: details.state,
      displayName: details.city && details.state 
        ? `${details.city}, ${details.state}` 
        : details.formatted_address,
    });
    setLocationInput('');
  };

  const clearLocation = () => {
    setSelectedLocation(null);
    setLocationInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLocation) return;

    onSubmit({
      city: selectedLocation.city,
      state: selectedLocation.state || undefined,
      time_window_days: parseInt(timeWindow),
      event_focus: selectedEventTypes.length > 0 ? selectedEventTypes : undefined,
      venue_types: selectedVenueTypes.length > 0 ? selectedVenueTypes : undefined,
      custom_context: customContext.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Location */}
      <div className="space-y-2">
        <Label>Location *</Label>
        {selectedLocation ? (
          <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm font-medium">{selectedLocation.displayName}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearLocation}
              disabled={isLoading}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <GooglePlacesAutocomplete
            value={locationInput}
            onChange={setLocationInput}
            onPlaceSelect={handlePlaceSelect}
            placeholder="Search for a city..."
            types="(cities)"
            disabled={isLoading}
          />
        )}
      </div>

      {/* Time Window */}
      <div className="space-y-2">
        <Label>Time Window</Label>
        <Select value={timeWindow} onValueChange={setTimeWindow} disabled={isLoading}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_WINDOWS.map(tw => (
              <SelectItem key={tw.value} value={tw.value}>
                {tw.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Event Focus */}
      <div className="space-y-3">
        <Label>Event Focus (optional)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {EVENT_TYPES.map(et => (
            <div key={et.value} className="flex items-center space-x-2">
              <Checkbox
                id={`event-${et.value}`}
                checked={selectedEventTypes.includes(et.value)}
                onCheckedChange={() => toggleEventType(et.value)}
                disabled={isLoading}
              />
              <Label
                htmlFor={`event-${et.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {et.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Venue Types */}
      <div className="space-y-3">
        <Label>Venue Types (optional)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {VENUE_TYPES.map(vt => (
            <div key={vt.value} className="flex items-center space-x-2">
              <Checkbox
                id={`venue-${vt.value}`}
                checked={selectedVenueTypes.includes(vt.value)}
                onCheckedChange={() => toggleVenueType(vt.value)}
                disabled={isLoading}
              />
              <Label
                htmlFor={`venue-${vt.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {vt.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Context */}
      <div className="space-y-2">
        <Label htmlFor="context">Additional Context (optional)</Label>
        <Textarea
          id="context"
          placeholder="e.g. Prioritize events appealing to LGBTQ+ couples, focus on date-night activities..."
          value={customContext}
          onChange={(e) => setCustomContext(e.target.value)}
          rows={3}
          disabled={isLoading}
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={!selectedLocation || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Researching events...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Discover Events
          </>
        )}
      </Button>
    </form>
  );
}
