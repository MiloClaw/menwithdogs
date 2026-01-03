import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImmutableFieldBadge from '@/components/admin/places/ImmutableFieldBadge';
import { useUpdateCity } from '@/hooks/useCities';
import type { CityWithProgress } from '@/hooks/useCities';

interface CityDetailEditProps {
  city: CityWithProgress;
  onSave: () => void;
  onCancel: () => void;
}

export function CityDetailEdit({ city, onSave, onCancel }: CityDetailEditProps) {
  const [targetPlaceCount, setTargetPlaceCount] = useState(city.target_place_count);
  const [targetAnchorCount, setTargetAnchorCount] = useState(city.target_anchor_count);

  const updateCity = useUpdateCity();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateCity.mutate({
      id: city.id,
      updates: {
        target_place_count: targetPlaceCount,
        target_anchor_count: targetAnchorCount,
      },
    }, {
      onSuccess: onSave,
    });
  };

  const hasChanges = 
    targetPlaceCount !== city.target_place_count ||
    targetAnchorCount !== city.target_anchor_count;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Edit {city.name}</h3>
        
        {/* Immutable fields */}
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <ImmutableFieldBadge />
            <span>City identity cannot be changed</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">City Name</Label>
              <p className="font-medium">{city.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Location</Label>
              <p className="font-medium">
                {city.state ? `${city.state}, ${city.country}` : city.country}
              </p>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-target-places">Target Places</Label>
            <Input
              id="edit-target-places"
              type="number"
              min={1}
              max={100}
              value={targetPlaceCount}
              onChange={(e) => setTargetPlaceCount(parseInt(e.target.value) || 30)}
            />
            <p className="text-xs text-muted-foreground">
              Currently {city.approved_place_count} approved
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-target-anchors">Target Anchors</Label>
            <Input
              id="edit-target-anchors"
              type="number"
              min={1}
              max={50}
              value={targetAnchorCount}
              onChange={(e) => setTargetAnchorCount(parseInt(e.target.value) || 15)}
            />
            <p className="text-xs text-muted-foreground">
              High-quality anchor venues
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={!hasChanges || updateCity.isPending}
        >
          {updateCity.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
