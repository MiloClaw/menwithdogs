import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Place } from '@/hooks/usePlaces';
import ImmutableFieldBadge from './ImmutableFieldBadge';

interface PlaceDetailEditProps {
  place: Place;
  onSave: (updates: Partial<Place>) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

const PlaceDetailEdit = ({ place, onSave, onCancel, isSaving }: PlaceDetailEditProps) => {
  const [formData, setFormData] = useState({
    name: '',
    primary_category: '',
    secondary_categories: '',
    city: '',
    state: '',
    country: '',
    status: 'pending' as Place['status'],
  });

  useEffect(() => {
    setFormData({
      name: place.name || '',
      primary_category: place.primary_category || '',
      secondary_categories: place.secondary_categories?.join(', ') || '',
      city: place.city || '',
      state: place.state || '',
      country: place.country || '',
      status: place.status,
    });
  }, [place]);

  const handleSave = async () => {
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
    });
  };

  const isManualEntry = place.google_place_id.startsWith('manual_');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Edit Place</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
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
