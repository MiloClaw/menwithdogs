import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Loader2, Sparkles, Check } from 'lucide-react';
import VenuePicker from './VenuePicker';
import { usePlaces } from '@/hooks/usePlaces';
import { useEvents } from '@/hooks/useEvents';
import {
  EVENT_TYPES,
  EVENT_FORMATS,
  COST_TYPES,
  SOCIAL_ENERGY_LABELS,
  COMMITMENT_LABELS,
} from '@/lib/event-taxonomy';
import type { EventCandidate } from '@/hooks/useEventDiscovery';
import { toast } from 'sonner';

interface CandidateReviewModalProps {
  candidate: EventCandidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function CandidateReviewModal({
  candidate,
  open,
  onOpenChange,
  onComplete,
}: CandidateReviewModalProps) {
  const { places } = usePlaces();
  const { createEvent } = useEvents();

  // Form state
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [venueStatus, setVenueStatus] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventFormat, setEventFormat] = useState('');
  const [costType, setCostType] = useState('unknown');
  const [socialEnergy, setSocialEnergy] = useState(3);
  const [commitmentLevel, setCommitmentLevel] = useState(3);
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when candidate changes
  useEffect(() => {
    if (candidate) {
      setSelectedVenueId('');
      setVenueStatus('');
      setName(candidate.name);
      setDescription(candidate.description);
      setStartAt('');
      setEventType(candidate.suggested_taxonomy.event_type || '');
      setEventFormat(candidate.suggested_taxonomy.event_format || '');
      setCostType(candidate.suggested_taxonomy.cost_type || 'unknown');
      setSocialEnergy(candidate.suggested_taxonomy.social_energy_level || 3);
      setCommitmentLevel(3);
    }
  }, [candidate]);

  // Try to auto-match venue by name
  useEffect(() => {
    if (candidate && places && places.length > 0 && !selectedVenueId) {
      const venueName = candidate.venue_name.toLowerCase();
      const match = places.find(p => 
        p.name.toLowerCase().includes(venueName) || 
        venueName.includes(p.name.toLowerCase())
      );
      if (match) {
        setSelectedVenueId(match.id);
        setVenueStatus(match.status);
      }
    }
  }, [candidate, places, selectedVenueId]);

  const handleVenueChange = (venueId: string) => {
    setSelectedVenueId(venueId);
    const venue = places?.find(p => p.id === venueId);
    setVenueStatus(venue?.status || '');
  };

  const handleSave = async (saveAsApproved: boolean) => {
    if (!selectedVenueId || !name.trim() || !startAt) {
      toast.error('Please fill in all required fields');
      return;
    }

    // If venue is pending, event must also be pending
    const effectiveStatus = venueStatus === 'pending' ? 'pending' : (saveAsApproved ? 'approved' : 'pending');

    setIsSaving(true);
    try {
      await createEvent.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        venue_place_id: selectedVenueId,
        start_at: startAt,
        event_type: eventType || undefined,
        event_format: eventFormat || undefined,
        cost_type: costType,
        social_energy_level: socialEnergy,
        commitment_level: commitmentLevel,
        source: 'admin',
        status: effectiveStatus,
        normalized_by_ai: true,
        inference_confidence: candidate?.confidence === 'high' ? 0.9 : candidate?.confidence === 'medium' ? 0.7 : 0.5,
        created_by_role: 'admin',
      });

      toast.success(`Event saved as ${effectiveStatus}`);
      onComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save event:', error);
      toast.error('Failed to save event');
    } finally {
      setIsSaving(false);
    }
  };

  if (!candidate) return null;

  const aiSuggestedFields = candidate.suggested_taxonomy;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Event Candidate</DialogTitle>
          <DialogDescription>
            Resolve the venue and review event details before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* AI Candidate Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Discovered Candidate
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>Venue hint:</strong> {candidate.venue_name}
              {candidate.venue_address_hint && ` (${candidate.venue_address_hint})`}
            </p>
            {candidate.suggested_date && (
              <p className="text-sm text-muted-foreground">
                <strong>Date hint:</strong> {candidate.suggested_date}
              </p>
            )}
            <Badge variant="outline" className="text-xs">
              Confidence: {candidate.confidence}
            </Badge>
          </div>

          <Separator />

          {/* Venue Resolution */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Venue *</Label>
            <VenuePicker
              value={selectedVenueId}
              onChange={handleVenueChange}
            />
            {venueStatus === 'pending' && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                <AlertCircle className="h-4 w-4" />
                Venue is pending. Event will be saved as pending.
              </div>
            )}
          </div>

          <Separator />

          {/* Event Details */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Event Details</Label>

            <div className="space-y-2">
              <Label htmlFor="event-name">Event Name *</Label>
              <Input
                id="event-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Event name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-desc">Description</Label>
              <Textarea
                id="event-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-at">Start Date & Time *</Label>
              <Input
                id="start-at"
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
              {candidate.suggested_date && (
                <p className="text-xs text-muted-foreground">
                  AI hint: {candidate.suggested_date}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Taxonomy */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="text-base font-medium">Classification</Label>
              {Object.keys(aiSuggestedFields).length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI suggested
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Event Format</Label>
                <Select value={eventFormat} onValueChange={setEventFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_FORMATS.map(f => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cost Type</Label>
              <Select value={costType} onValueChange={setCostType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COST_TYPES.map(c => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Social Energy</Label>
                <span className="text-sm text-muted-foreground">
                  {SOCIAL_ENERGY_LABELS.find(s => s.value === socialEnergy)?.label}
                </span>
              </div>
              <Slider
                value={[socialEnergy]}
                onValueChange={([v]) => setSocialEnergy(v)}
                min={1}
                max={5}
                step={1}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Commitment Level</Label>
                <span className="text-sm text-muted-foreground">
                  {COMMITMENT_LABELS.find(c => c.value === commitmentLevel)?.label}
                </span>
              </div>
              <Slider
                value={[commitmentLevel]}
                onValueChange={([v]) => setCommitmentLevel(v)}
                min={1}
                max={5}
                step={1}
              />
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleSave(false)}
              disabled={!selectedVenueId || !name.trim() || !startAt || isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save as Draft'
              )}
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={!selectedVenueId || !name.trim() || !startAt || isSaving || venueStatus === 'pending'}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Approve & Save
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
