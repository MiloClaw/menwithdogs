import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { Place } from '@/hooks/usePlaces';
import SourceBadge from './SourceBadge';

interface PlaceEditModalProps {
  place: Place | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<Place>) => Promise<void>;
}

const PlaceEditModal = ({ place, open, onOpenChange, onSave }: PlaceEditModalProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    primary_category: '',
    secondary_categories: '',
    city: '',
    state: '',
    country: '',
    formatted_address: '',
    website_url: '',
    phone_number: '',
    status: 'pending' as 'approved' | 'pending' | 'rejected',
  });

  useEffect(() => {
    if (place) {
      setFormData({
        name: place.name || '',
        primary_category: place.primary_category || '',
        secondary_categories: place.secondary_categories?.join(', ') || '',
        city: place.city || '',
        state: place.state || '',
        country: place.country || '',
        formatted_address: place.formatted_address || '',
        website_url: place.website_url || '',
        phone_number: place.phone_number || '',
        status: place.status,
      });
    }
  }, [place]);

  const handleSave = async () => {
    if (!place) return;
    
    setIsSaving(true);
    try {
      await onSave(place.id, {
        name: formData.name,
        primary_category: formData.primary_category,
        secondary_categories: formData.secondary_categories
          ? formData.secondary_categories.split(',').map(s => s.trim()).filter(Boolean)
          : null,
        city: formData.city || null,
        state: formData.state || null,
        country: formData.country || null,
        formatted_address: formData.formatted_address || null,
        website_url: formData.website_url || null,
        phone_number: formData.phone_number || null,
        status: formData.status,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (!place) return null;

  const isManualEntry = place.google_place_id.startsWith('manual_');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Place</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Read-only metadata */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <SourceBadge source={place.source} />
                <Badge variant="outline" className="text-xs">
                  {isManualEntry ? 'Manual Entry' : 'Google Places'}
                </Badge>
              </div>
              {place.rating && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{place.rating}</span>
                  {place.user_ratings_total && (
                    <span className="text-muted-foreground">
                      ({place.user_ratings_total.toLocaleString()} reviews)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

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

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="formatted_address">Full Address</Label>
            <Textarea
              id="formatted_address"
              value={formData.formatted_address}
              onChange={(e) => setFormData({ ...formData, formatted_address: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website_url">Website</Label>
              <Input
                id="website_url"
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'approved' | 'pending' | 'rejected') => 
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

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceEditModal;
