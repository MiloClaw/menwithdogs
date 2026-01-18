import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Place } from '@/hooks/usePlaces';
import { useMetroAreas } from '@/hooks/useMetroAreas';
import { usePlaceGeoAreas } from '@/hooks/usePlaceGeoAreas';
import ImmutableFieldBadge from './ImmutableFieldBadge';
import { VIBE_ENERGY_LABELS, VIBE_FORMALITY_LABELS } from '@/lib/place-taxonomy';

interface PlaceDetailEditProps {
  place: Place;
  onSave: (updates: Partial<Place>) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

const PlaceDetailEdit = ({ place, onSave, onCancel, isSaving }: PlaceDetailEditProps) => {
  const { data: metroAreas, isLoading: isLoadingMetros } = useMetroAreas();
  const { metroAssignment, assignMetro, removeMetro, isAssigning, isRemoving } = usePlaceGeoAreas(place.id);
  
  const [formData, setFormData] = useState({
    name: '',
    primary_category: '',
    secondary_categories: '',
    city: '',
    state: '',
    country: '',
    status: 'pending' as Place['status'],
    // Vibe tags
    vibe_energy: null as number | null,
    vibe_formality: null as number | null,
    vibe_conversation: null as boolean | null,
    vibe_daytime: null as boolean | null,
    vibe_evening: null as boolean | null,
  });
  
  // Track metro selection separately (not part of place updates)
  const [selectedMetroId, setSelectedMetroId] = useState<string | null>(null);
  const [metroChanged, setMetroChanged] = useState(false);

  useEffect(() => {
    setFormData({
      name: place.name || '',
      primary_category: place.primary_category || '',
      secondary_categories: place.secondary_categories?.join(', ') || '',
      city: place.city || '',
      state: place.state || '',
      country: place.country || '',
      status: place.status,
      vibe_energy: place.vibe_energy,
      vibe_formality: place.vibe_formality,
      vibe_conversation: place.vibe_conversation,
      vibe_daytime: place.vibe_daytime,
      vibe_evening: place.vibe_evening,
    });
  }, [place]);

  // Initialize metro selection from current assignment
  useEffect(() => {
    if (metroAssignment) {
      setSelectedMetroId(metroAssignment.geo_area_id);
    } else {
      setSelectedMetroId(null);
    }
    setMetroChanged(false);
  }, [metroAssignment]);

  const handleMetroChange = (value: string) => {
    const newMetroId = value === 'none' ? null : value;
    setSelectedMetroId(newMetroId);
    setMetroChanged(newMetroId !== (metroAssignment?.geo_area_id ?? null));
  };

  const handleSave = async () => {
    // First save place data
    await onSave({
      name: formData.name,
      primary_category: formData.primary_category,
      secondary_categories: formData.secondary_categories
        ? formData.secondary_categories.split(',').map(s => s.trim()).filter(Boolean)
        : null,
      city: formData.city || null,
      state: formData.state || null,
      country: formData.country || null,
      status: formData.status,
      vibe_energy: formData.vibe_energy,
      vibe_formality: formData.vibe_formality,
      vibe_conversation: formData.vibe_conversation,
      vibe_daytime: formData.vibe_daytime,
      vibe_evening: formData.vibe_evening,
    });

    // Then handle metro assignment if changed
    if (metroChanged) {
      if (selectedMetroId) {
        await assignMetro.mutateAsync({ placeId: place.id, metroId: selectedMetroId });
      } else {
        await removeMetro.mutateAsync(place.id);
      }
    }
  };

  const isManualEntry = place.google_place_id.startsWith('manual_');
  const isSavingAll = isSaving || isAssigning || isRemoving;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Edit Place</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isSavingAll}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSavingAll}>
            {isSavingAll ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Google-Sourced Fields (Read-only for non-manual entries) */}
        {!isManualEntry && (
          <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Google Data (Read-Only)
              </h3>
              <ImmutableFieldBadge />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={formData.name}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Sourced from Google Places. Use "Refresh from Google" to update.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </div>
        )}

        {/* Editable Fields */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            {isManualEntry ? 'Place Details' : 'Editorial Overrides'}
          </h3>
          
          {/* Name is editable only for manual entries */}
          {isManualEntry && (
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="primary_category">Primary Category</Label>
            <Input
              id="primary_category"
              value={formData.primary_category}
              onChange={(e) => setFormData({ ...formData, primary_category: e.target.value })}
              placeholder="e.g., Restaurant, Bar, Coffee Shop"
            />
            {place.google_primary_type_display && (
              <p className="text-xs text-muted-foreground">
                Google type: {place.google_primary_type_display}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary_categories">Secondary Categories</Label>
            <Input
              id="secondary_categories"
              value={formData.secondary_categories}
              onChange={(e) => setFormData({ ...formData, secondary_categories: e.target.value })}
              placeholder="Comma-separated tags"
            />
          </div>

          {/* Location fields editable only for manual entries */}
          {isManualEntry && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Metro Area Assignment */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label>Metro Area</Label>
              {metroChanged && (
                <span className="text-xs text-amber-600">Will update on save</span>
              )}
            </div>
            <Select
              value={selectedMetroId || 'none'}
              onValueChange={handleMetroChange}
              disabled={isLoadingMetros}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select metro area..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (remove assignment)</SelectItem>
                {metroAreas?.map((metro) => (
                  <SelectItem key={metro.id} value={metro.id}>
                    {metro.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="h-3 w-3 mt-0.5 shrink-0" />
              <span>Overrides automatic metro detection. Used for grouping in admin views and user filtering.</span>
            </div>
          </div>

          {/* Editorial Vibe Tags */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-muted-foreground">Editorial Vibe Tags</h4>
            
            {/* Energy Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Energy Level</Label>
                <span className="text-sm text-muted-foreground">
                  {formData.vibe_energy 
                    ? VIBE_ENERGY_LABELS.find(v => v.value === formData.vibe_energy)?.label 
                    : 'Not set'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Slider
                  value={formData.vibe_energy ? [formData.vibe_energy] : [3]}
                  onValueChange={([val]) => setFormData({ ...formData, vibe_energy: val })}
                  min={1}
                  max={5}
                  step={1}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2"
                  onClick={() => setFormData({ ...formData, vibe_energy: null })}
                >
                  Clear
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {formData.vibe_energy 
                  ? VIBE_ENERGY_LABELS.find(v => v.value === formData.vibe_energy)?.description 
                  : 'Slide to set energy level'}
              </p>
            </div>

            {/* Formality Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Formality</Label>
                <span className="text-sm text-muted-foreground">
                  {formData.vibe_formality 
                    ? VIBE_FORMALITY_LABELS.find(v => v.value === formData.vibe_formality)?.label 
                    : 'Not set'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Slider
                  value={formData.vibe_formality ? [formData.vibe_formality] : [3]}
                  onValueChange={([val]) => setFormData({ ...formData, vibe_formality: val })}
                  min={1}
                  max={5}
                  step={1}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2"
                  onClick={() => setFormData({ ...formData, vibe_formality: null })}
                >
                  Clear
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {formData.vibe_formality 
                  ? VIBE_FORMALITY_LABELS.find(v => v.value === formData.vibe_formality)?.description 
                  : 'Slide to set formality level'}
              </p>
            </div>

            {/* Boolean vibes */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vibe_conversation">Conversation-friendly</Label>
                  <p className="text-xs text-muted-foreground">Good for talking without shouting</p>
                </div>
                <Switch
                  id="vibe_conversation"
                  checked={formData.vibe_conversation ?? false}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, vibe_conversation: checked || null })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vibe_daytime">Daytime spot</Label>
                  <p className="text-xs text-muted-foreground">Suitable for daytime visits</p>
                </div>
                <Switch
                  id="vibe_daytime"
                  checked={formData.vibe_daytime ?? false}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, vibe_daytime: checked || null })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vibe_evening">Evening spot</Label>
                  <p className="text-xs text-muted-foreground">Suitable for evening visits</p>
                </div>
                <Switch
                  id="vibe_evening"
                  checked={formData.vibe_evening ?? false}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, vibe_evening: checked || null })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: Place['status']) => 
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Immutable Fields */}
        {!isManualEntry && (
          <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Google Data (Read-Only)
              </h3>
              <ImmutableFieldBadge />
            </div>

            <div className="grid gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Google Place ID:</span>
                <span className="ml-2 font-mono text-xs">{place.google_place_id}</span>
              </div>
              {place.formatted_address && (
                <div>
                  <span className="text-muted-foreground">Address:</span>
                  <span className="ml-2">{place.formatted_address}</span>
                </div>
              )}
              {place.lat && place.lng && (
                <div>
                  <span className="text-muted-foreground">Coordinates:</span>
                  <span className="ml-2">{place.lat.toFixed(6)}, {place.lng.toFixed(6)}</span>
                </div>
              )}
              {place.rating && (
                <div>
                  <span className="text-muted-foreground">Rating:</span>
                  <span className="ml-2">{place.rating} ({place.user_ratings_total} reviews)</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceDetailEdit;
