import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Search, Trash2, Calendar, MapPin, Zap, DollarSign, Eye, Sparkles, AlertCircle } from 'lucide-react';
import { useEvents, CreateEventInput } from '@/hooks/useEvents';
import { usePlaces } from '@/hooks/usePlaces';
import VenuePicker from '@/components/admin/events/VenuePicker';
import {
  EVENT_TYPES,
  EVENT_FORMATS,
  COST_TYPES,
  SOCIAL_ENERGY_LABELS,
  COMMITMENT_LABELS,
  getEventTypeLabel,
  getSocialEnergyLabel,
  getCostTypeLabel,
} from '@/lib/event-taxonomy';
import { getVenueTaxonomySuggestions, isFieldAtDefault } from '@/lib/venue-taxonomy-mapping';
import StatusFilterTabs, { StatusFilter } from '@/components/admin/StatusFilterTabs';
import SourceBadge from '@/components/admin/SourceBadge';

// Default form values for detecting if fields should receive suggestions
const DEFAULT_FORM_VALUES = {
  social_energy_level: 3,
  cost_type: 'unknown',
};

const EventManagement = () => {
  const { events, isLoading, createEvent, updateEvent, deleteEvent } = useEvents();
  const { places } = usePlaces();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [taxonomySuggested, setTaxonomySuggested] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateEventInput>({
    venue_place_id: '',
    name: '',
    description: '',
    start_at: '',
    end_at: '',
    category_tags: [],
    event_type: null,
    event_format: null,
    social_energy_level: DEFAULT_FORM_VALUES.social_energy_level,
    commitment_level: 2,
    cost_type: DEFAULT_FORM_VALUES.cost_type,
    is_recurring: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [selectedVenueStatus, setSelectedVenueStatus] = useState<string | null>(null);

  const statusCounts = useMemo(() => ({
    all: events.length,
    approved: events.filter(e => e.status === 'approved').length,
    pending: events.filter(e => e.status === 'pending').length,
    rejected: events.filter(e => e.status === 'rejected').length,
  }), [events]);

  const resetForm = () => {
    setFormData({
      venue_place_id: '',
      name: '',
      description: '',
      start_at: '',
      end_at: '',
      category_tags: [],
      event_type: null,
      event_format: null,
      social_energy_level: DEFAULT_FORM_VALUES.social_energy_level,
      commitment_level: 2,
      cost_type: DEFAULT_FORM_VALUES.cost_type,
      is_recurring: false,
    });
    setTagInput('');
    setSelectedVenueStatus(null);
    setTaxonomySuggested(false);
  };

  // Handle venue type change for taxonomy suggestions
  const handleVenueTypeChange = useCallback((googlePrimaryType: string | null) => {
    const suggestions = getVenueTaxonomySuggestions(googlePrimaryType);
    
    if (!suggestions) {
      setTaxonomySuggested(false);
      return;
    }

    // Only apply suggestions to fields that are still at defaults
    const updates: Partial<CreateEventInput> = {};
    let hasUpdates = false;

    if (suggestions.event_type && isFieldAtDefault('event_type', formData.event_type, DEFAULT_FORM_VALUES)) {
      updates.event_type = suggestions.event_type;
      hasUpdates = true;
    }

    if (suggestions.social_energy_level && isFieldAtDefault('social_energy_level', formData.social_energy_level, DEFAULT_FORM_VALUES)) {
      updates.social_energy_level = suggestions.social_energy_level;
      hasUpdates = true;
    }

    if (suggestions.cost_type && isFieldAtDefault('cost_type', formData.cost_type, DEFAULT_FORM_VALUES)) {
      updates.cost_type = suggestions.cost_type;
      hasUpdates = true;
    }

    if (hasUpdates) {
      setFormData(prev => ({ ...prev, ...updates }));
      setTaxonomySuggested(true);
    }
  }, [formData.event_type, formData.social_energy_level, formData.cost_type]);

  // Handle venue selection from VenuePicker
  const handleVenueChange = useCallback((placeId: string, place?: { status: 'approved' | 'pending' | 'rejected'; google_primary_type: string | null }) => {
    setFormData(prev => ({ ...prev, venue_place_id: placeId }));
    setSelectedVenueStatus(place?.status || null);
    
    if (place?.google_primary_type) {
      handleVenueTypeChange(place.google_primary_type);
    }
  }, [handleVenueTypeChange]);

  const handleCreate = async () => {
    if (!formData.venue_place_id || !formData.name || !formData.start_at) return;
    
    // If venue is pending, event should also be pending (Option A enforcement)
    const status = selectedVenueStatus === 'pending' ? 'pending' : 'approved';
    
    await createEvent.mutateAsync({
      ...formData,
      status,
    });
    setIsCreateOpen(false);
    resetForm();
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.category_tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        category_tags: [...(formData.category_tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      category_tags: formData.category_tags?.filter(t => t !== tag) || [],
    });
  };

  const handleStatusChange = async (id: string, status: 'approved' | 'pending' | 'rejected') => {
    // Check if venue is approved before allowing event approval
    const event = events.find(e => e.id === id);
    if (status === 'approved' && event?.venue) {
      const venue = places.find(p => p.id === event.venue?.id);
      if (venue?.status !== 'approved') {
        alert('Cannot approve event: The venue must be approved first.');
        return;
      }
    }
    await updateEvent.mutateAsync({ id, status });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteEvent.mutateAsync(id);
    }
  };

  const filteredEvents = events
    .filter(event => statusFilter === 'all' || event.status === statusFilter)
    .filter(event =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const statusColors = {
    approved: 'bg-green-500/10 text-green-700 border-green-500/20',
    pending: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    rejected: 'bg-red-500/10 text-red-700 border-red-500/20',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/admin/directory">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Events</h1>
            <p className="text-muted-foreground">
              Manage activities and gatherings in the directory
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/directory/events/discover">
              <Button variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                Discover Events
              </Button>
            </Link>
            <Link to="/places?tab=events" target="_blank">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview Events
              </Button>
            </Link>
            <Dialog open={isCreateOpen} onOpenChange={(open) => {
              setIsCreateOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Event Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Date Night Trivia"
                  />
                </div>

                {/* Venue Picker with inline creation */}
                <VenuePicker
                  value={formData.venue_place_id}
                  onChange={handleVenueChange}
                  onVenueTypeChange={handleVenueTypeChange}
                />

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the event..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={formData.start_at}
                      onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={formData.end_at}
                      onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                    />
                  </div>
                </div>

                {/* Taxonomy Section */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Event Classification</h4>
                    {taxonomySuggested && (
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <Sparkles className="h-3 w-3" />
                        <span>Suggested from venue type</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>What kind of event?</Label>
                      <Select
                        value={formData.event_type || ''}
                        onValueChange={(value) => {
                          setFormData({ ...formData, event_type: value || null });
                          setTaxonomySuggested(false);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>How does it work?</Label>
                      <Select
                        value={formData.event_format || ''}
                        onValueChange={(value) => setFormData({ ...formData, event_format: value || null })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_FORMATS.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4 mt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          How social does it feel?
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {SOCIAL_ENERGY_LABELS.find(s => s.value === formData.social_energy_level)?.label || 'Balanced'}
                        </span>
                      </div>
                      <Slider
                        value={[formData.social_energy_level || 3]}
                        onValueChange={([value]) => {
                          setFormData({ ...formData, social_energy_level: value });
                          setTaxonomySuggested(false);
                        }}
                        min={1}
                        max={5}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Quiet</span>
                        <span>High energy</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Is this casual or planned?</Label>
                        <span className="text-sm text-muted-foreground">
                          {COMMITMENT_LABELS.find(c => c.value === formData.commitment_level)?.label || 'Light'}
                        </span>
                      </div>
                      <Slider
                        value={[formData.commitment_level || 2]}
                        onValueChange={([value]) => setFormData({ ...formData, commitment_level: value })}
                        min={1}
                        max={5}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Drop-in</span>
                        <span>High commitment</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Cost
                      </Label>
                      <Select
                        value={formData.cost_type || 'unknown'}
                        onValueChange={(value) => {
                          setFormData({ ...formData, cost_type: value });
                          setTaxonomySuggested(false);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select cost type" />
                        </SelectTrigger>
                        <SelectContent>
                          {COST_TYPES.map((cost) => (
                            <SelectItem key={cost.value} value={cost.value}>
                              {cost.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Recurring?</Label>
                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                          id="is_recurring"
                          checked={formData.is_recurring || false}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: !!checked })}
                        />
                        <label htmlFor="is_recurring" className="text-sm text-muted-foreground">
                          This event repeats regularly
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags Section */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      Add
                    </Button>
                  </div>
                  {formData.category_tags && formData.category_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.category_tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status enforcement warning */}
                {selectedVenueStatus === 'pending' && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-700">
                      This event will be created as <strong>pending</strong> because the venue is pending approval.
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleCreate} 
                  className="w-full"
                  disabled={createEvent.isPending || !formData.venue_place_id || !formData.name || !formData.start_at}
                >
                  {createEvent.isPending ? 'Creating...' : 'Create Event'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Status Filters */}
        <StatusFilterTabs
          activeStatus={statusFilter}
          onStatusChange={setStatusFilter}
          counts={statusCounts}
        />

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search events..."
            className="pl-9"
          />
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Type / Energy</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No events found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{event.name}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {event.cost_type && event.cost_type !== 'unknown' && (
                            <Badge variant="outline" className="text-xs">
                              {getCostTypeLabel(event.cost_type)}
                            </Badge>
                          )}
                          {event.is_recurring && (
                            <Badge variant="outline" className="text-xs">
                              Recurring
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {event.event_type && (
                          <Badge variant="secondary" className="text-xs">
                            {getEventTypeLabel(event.event_type)}
                          </Badge>
                        )}
                        {event.social_energy_level && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Zap className="h-3 w-3" />
                            {getSocialEnergyLabel(event.social_energy_level)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <SourceBadge source={event.source} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {event.venue?.name || 'Unknown venue'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(event.start_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={event.status}
                        onValueChange={(value: 'approved' | 'pending' | 'rejected') => 
                          handleStatusChange(event.id, value)
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <Badge variant="outline" className={statusColors[event.status]}>
                            {event.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EventManagement;
