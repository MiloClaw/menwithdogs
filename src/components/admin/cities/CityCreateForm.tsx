import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCity } from '@/hooks/useCities';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

interface CityCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CityCreateForm({ onSuccess, onCancel }: CityCreateFormProps) {
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('US');
  const [targetPlaceCount, setTargetPlaceCount] = useState(30);
  const [targetAnchorCount, setTargetAnchorCount] = useState(15);

  const createCity = useCreateCity();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createCity.mutate({
      name: name.trim(),
      state: state || null,
      country,
      target_place_count: targetPlaceCount,
      target_anchor_count: targetAnchorCount,
    }, {
      onSuccess: () => {
        setName('');
        setState('');
        setTargetPlaceCount(30);
        setTargetAnchorCount(15);
        onSuccess?.();
      },
    });
  };

  const isValid = name.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="city-name">City Name *</Label>
        <Input
          id="city-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Austin"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city-state">State</Label>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger id="city-state">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {US_STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city-country">Country</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger id="city-country">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="CA">Canada</SelectItem>
              <SelectItem value="UK">United Kingdom</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
