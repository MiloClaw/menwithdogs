import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Zap, DollarSign, Users, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Place } from '@/hooks/usePlaces';
import { useEvents, CreateEventInput } from '@/hooks/useEvents';
import {
  EVENT_TYPES,
  EVENT_FORMATS,
  COST_TYPES,
  getSocialEnergyLabel,
  getCommitmentLabel,
} from '@/lib/event-taxonomy';
import { getVenueTaxonomySuggestions } from '@/lib/venue-taxonomy-mapping';

interface PlaceEventFormProps {
  place: Place;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PlaceEventForm = ({ place, open, onOpenChange }: PlaceEventFormProps) => {
  const { createEvent } = useEvents();
  
  // Get taxonomy suggestions based on venue type
  const suggestions = getVenueTaxonomySuggestions(place.google_primary_type);

  // Form state with auto-suggested defaults
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    end_at: '',
    event_type: suggestions?.event_type || '',
    event_format: 'drop_in',
    social_energy_level: suggestions?.social_energy_level ?? 3,
    commitment_level: 2,
    cost_type: suggestions?.cost_type || 'unknown',
    is_recurring: false,
    category_tags: [] as string[],
    newTag: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventInput: CreateEventInput = {
      venue_place_id: place.id,
      name: formData.name,
      description: formData.description || undefined,
      start_at: new Date(formData.start_at).toISOString(),
      end_at: formData.end_at ? new Date(formData.end_at).toISOString() : undefined,
      event_type: formData.event_type || null,
      event_format: formData.event_format || null,
      social_energy_level: formData.social_energy_level,
      commitment_level: formData.commitment_level,
      cost_type: formData.cost_type,
      is_recurring: formData.is_recurring,
      category_tags: formData.category_tags,
      source: 'admin',
      // If venue is not approved, event stays pending
      status: place.status === 'approved' ? 'approved' : 'pending',
      created_by_role: 'admin',
    };

    await createEvent.mutateAsync(eventInput);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      start_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      end_at: '',
      event_type: suggestions?.event_type || '',
      event_format: 'drop_in',
      social_energy_level: suggestions?.social_energy_level ?? 3,
      commitment_level: 2,
      cost_type: suggestions?.cost_type || 'unknown',
      is_recurring: false,
      category_tags: [],
      newTag: '',
    });
  };

  const handleAddTag = () => {
    if (formData.newTag.trim() && !formData.category_tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        category_tags: [...prev.category_tags, prev.newTag.trim()],
        newTag: '',
      }));
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      category_tags: prev.category_tags.filter(t => t !== tag),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Add Event at {place.name}
          </DialogTitle>
        </DialogHeader>

        {place.status !== 'approved' && (
          <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm p-3 rounded-md">
            This venue is not yet approved. The event will be created as "pending" until the venue is approved.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Event Name */}
          <div className="space-y-2">
            <Label htmlFor="event-name">Event Name *</Label>
            <Input
              id="event-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Live Jazz Night"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the event..."
              rows={3}
            />
          </div>

          {/* Date/Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-at" className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Start *
              </Label>
              <Input
                id="start-at"
                type="datetime-local"
                value={formData.start_at}
                onChange={(e) => setFormData(prev => ({ ...prev, start_at: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-at">End</Label>
              <Input
                id="end-at"
                type="datetime-local"
                value={formData.end_at}
                onChange={(e) => setFormData(prev => ({ ...prev, end_at: e.target.value }))}
              />
            </div>
          </div>

          {/* Taxonomy Row 1: Type + Format */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select
                value={formData.event_type}
                onValueChange={(val) => setFormData(prev => ({ ...prev, event_type: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select
                value={formData.event_format}
                onValueChange={(val) => setFormData(prev => ({ ...prev, event_format: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_FORMATS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Energy + Commitment Sliders */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Social Energy
                </Label>
                <span className="text-sm text-muted-foreground">
                  {getSocialEnergyLabel(formData.social_energy_level)}
                </span>
              </div>
              <Slider
                value={[formData.social_energy_level]}
                onValueChange={([val]) => setFormData(prev => ({ ...prev, social_energy_level: val }))}
                min={1}
                max={5}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> Commitment
                </Label>
                <span className="text-sm text-muted-foreground">
                  {getCommitmentLabel(formData.commitment_level)}
                </span>
              </div>
              <Slider
                value={[formData.commitment_level]}
                onValueChange={([val]) => setFormData(prev => ({ ...prev, commitment_level: val }))}
                min={1}
                max={5}
                step={1}
              />
            </div>
          </div>

          {/* Cost + Recurring */}
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Label className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> Cost
              </Label>
              <Select
                value={formData.cost_type}
                onValueChange={(val) => setFormData(prev => ({ ...prev, cost_type: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COST_TYPES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch
                checked={formData.is_recurring}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recurring: checked }))}
              />
              <Label>Recurring</Label>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Tag className="h-3 w-3" /> Tags
            </Label>
            <div className="flex gap-2">
              <Input
                value={formData.newTag}
                onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {formData.category_tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.category_tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEvent.isPending}>
              {createEvent.isPending ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceEventForm;
