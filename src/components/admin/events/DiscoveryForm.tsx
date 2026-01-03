import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Sparkles, Loader2 } from 'lucide-react';
import { EVENT_TYPES } from '@/lib/event-taxonomy';
import type { DiscoveryParams } from '@/hooks/useEventDiscovery';

interface DiscoveryFormProps {
  onSubmit: (params: DiscoveryParams) => void;
  isLoading: boolean;
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
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!city.trim()) return;

    onSubmit({
      city: city.trim(),
      state: state.trim() || undefined,
      time_window_days: parseInt(timeWindow),
      event_focus: selectedEventTypes.length > 0 ? selectedEventTypes : undefined,
      venue_types: selectedVenueTypes.length > 0 ? selectedVenueTypes : undefined,
      custom_context: customContext.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Location</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="e.g. Austin"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              placeholder="e.g. TX"
              value={state}
              onChange={(e) => setState(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
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
        disabled={!city.trim() || isLoading}
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
