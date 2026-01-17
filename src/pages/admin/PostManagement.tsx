import { useState, useEffect } from 'react';
import { 
  Plus, Megaphone, Calendar, Trash2, Edit, 
  AlertCircle, Check, Clock, MapPin, ExternalLink, RotateCcw, ImageIcon, Sparkles, Loader2, Search, AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  useAdminPosts, 
  useCreatePost, 
  useUpdatePost, 
  useDeletePost,
  usePostTags,
  syncPostTags,
  Post,
  PostInsert
} from '@/hooks/usePosts';
import { useCities } from '@/hooks/useCities';
import { useMetroAreas } from '@/hooks/useMetroAreas';
import { usePlaces } from '@/hooks/usePlaces';
import { PostTagsStep } from '@/components/admin/posts/PostTagsStep';
import VenuePicker from '@/components/admin/events/VenuePicker';
import { BlogImageUpload } from '@/components/blog/BlogImageUpload';
import { MarkdownEditor } from '@/components/blog/MarkdownEditor';
import { useEnhanceBlogPost, SuggestedPlace, AreaWithPlaces } from '@/hooks/useEnhanceBlogPost';
import { MultiPlacePicker, LinkedPlaceInput } from '@/components/admin/posts/MultiPlacePicker';
import { usePostPlaces, syncPostPlaces } from '@/hooks/usePostPlaces';
import { toast } from 'sonner';

// Generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
};

type PostType = 'announcement' | 'event';
type PostStatus = 'draft' | 'published' | 'expired';

// Day of week options
const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

// Frequency options for recurring events
const FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Every week', format: (day: string) => `Every ${day}` },
  { value: 'biweekly', label: 'Every other week', format: (day: string) => `Every other ${day}` },
  { value: 'first', label: 'First of month', format: (day: string) => `First ${day} of each month` },
  { value: 'second', label: 'Second of month', format: (day: string) => `Second ${day} of each month` },
  { value: 'third', label: 'Third of month', format: (day: string) => `Third ${day} of each month` },
  { value: 'fourth', label: 'Fourth of month', format: (day: string) => `Fourth ${day} of each month` },
  { value: 'last', label: 'Last of month', format: (day: string) => `Last ${day} of each month` },
];

interface PostFormData {
  type: PostType;
  title: string;
  body: string;
  slug: string;
  excerpt: string;
  meta_description: string;
  city_id: string;
  location_type: 'city' | 'metro'; // New: track if city or metro selected
  place_id: string;
  start_date: string; // date only for one-time events (YYYY-MM-DD)
  is_recurring: boolean;
  recurrence_day: string; // day of week for recurring
  recurrence_frequency: string; // frequency pattern
  external_url: string;
  cover_image_url: string | null;
  status: PostStatus;
  interest_tags: string[];
  linked_places: LinkedPlaceInput[];
}

const INITIAL_FORM: PostFormData = {
  type: 'announcement',
  title: '',
  body: '',
  slug: '',
  excerpt: '',
  meta_description: '',
  city_id: '',
  location_type: 'city',
  place_id: '',
  start_date: '',
  is_recurring: false,
  recurrence_day: '',
  recurrence_frequency: 'weekly',
  external_url: '',
  cover_image_url: null,
  status: 'draft',
  interest_tags: [],
  linked_places: [],
};

const statusColors: Record<PostStatus, string> = {
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  draft: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  expired: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

// Generate recurrence text from day + frequency
const generateRecurrenceText = (day: string, frequency: string): string => {
  const freqOption = FREQUENCY_OPTIONS.find(f => f.value === frequency);
  if (!freqOption || !day) return '';
  return freqOption.format(day);
};

interface FormErrors {
  title?: string;
  city_id?: string;
  place_id?: string;
  start_date?: string;
  recurrence_day?: string;
  external_url?: string;
}

const PostManagement = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<PostFormData>(INITIAL_FORM);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [attemptedProceed, setAttemptedProceed] = useState(false);
  const [unmatchedSuggestions, setUnmatchedSuggestions] = useState<SuggestedPlace[]>([]);
  const [areaRelatedPlaces, setAreaRelatedPlaces] = useState<AreaWithPlaces[]>([]);
  const [placePickerSearchTerm, setPlacePickerSearchTerm] = useState<string>('');

  const { data: posts, isLoading: postsLoading } = useAdminPosts(statusFilter);
  const { data: cities, isLoading: citiesLoading } = useCities();
  const { data: metroAreas, isLoading: metroLoading } = useMetroAreas();
  const { places } = usePlaces();
  
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const launchedCities = cities?.filter(c => c.status === 'launched') || [];
  
  // Get display name for location (city or metro)
  const getLocationDisplayName = () => {
    if (formData.location_type === 'metro') {
      return metroAreas?.find(m => m.id === formData.city_id)?.name;
    }
    return launchedCities.find(c => c.id === formData.city_id)?.name;
  };
  
  const selectedCityName = getLocationDisplayName();
  const cityPlaces = places?.filter(p => 
    p.status === 'approved' && 
    selectedCityName && 
    p.city === selectedCityName
  ) || [];

  // Fetch existing tags when editing
  const { data: existingTags = [] } = usePostTags(editingPost?.id ?? null);
  
  // Fetch existing linked places when editing
  const { data: existingLinkedPlaces = [] } = usePostPlaces(editingPost?.id ?? null);

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setEditingPost(null);
    setStep(1);
    setErrors({});
    setUnmatchedSuggestions([]);
    setAreaRelatedPlaces([]);
    setAttemptedProceed(false);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (post: Post) => {
    setEditingPost(post);
    
    // Parse recurrence_text back to day + frequency if recurring
    let recurrenceDay = '';
    let recurrenceFrequency = 'weekly';
    
    if (post.is_recurring && post.recurrence_text) {
      // Try to extract day from recurrence text
      for (const day of DAYS_OF_WEEK) {
        if (post.recurrence_text.includes(day)) {
          recurrenceDay = day;
          break;
        }
      }
      // Try to determine frequency
      if (post.recurrence_text.startsWith('Every other')) {
        recurrenceFrequency = 'biweekly';
      } else if (post.recurrence_text.startsWith('First')) {
        recurrenceFrequency = 'first';
      } else if (post.recurrence_text.startsWith('Second')) {
        recurrenceFrequency = 'second';
      } else if (post.recurrence_text.startsWith('Third')) {
        recurrenceFrequency = 'third';
      } else if (post.recurrence_text.startsWith('Fourth')) {
        recurrenceFrequency = 'fourth';
      } else if (post.recurrence_text.startsWith('Last')) {
        recurrenceFrequency = 'last';
      }
    }
    
    setFormData({
      type: post.type,
      title: post.title,
      body: post.body || '',
      slug: (post as any).slug || '',
      excerpt: (post as any).excerpt || '',
      meta_description: (post as any).meta_description || '',
      city_id: post.city_id,
      location_type: 'city',
      place_id: post.place_id || '',
      start_date: post.start_date ? post.start_date.slice(0, 10) : '', // date only
      is_recurring: post.is_recurring || false,
      recurrence_day: recurrenceDay,
      recurrence_frequency: recurrenceFrequency,
      external_url: post.external_url || '',
      cover_image_url: post.cover_image_url || null,
      status: post.status,
      interest_tags: [],
      linked_places: [],
    });
    
    // For editing, start at step 2 (skip type selection) to allow full navigation
    setStep(2);
    setDialogOpen(true);
  };

  // Update form with existing tags when they load
  useEffect(() => {
    if (editingPost && existingTags.length > 0 && formData.interest_tags.length === 0) {
      setFormData(f => ({ ...f, interest_tags: existingTags }));
    }
  }, [editingPost, existingTags, formData.interest_tags.length]);

  // Update form with existing linked places when they load
  useEffect(() => {
    if (editingPost && existingLinkedPlaces.length > 0 && formData.linked_places.length === 0) {
      setFormData(f => ({ 
        ...f, 
        linked_places: existingLinkedPlaces.map(p => ({
          place_id: p.place_id,
          name: p.name,
          city: p.city,
          sort_order: p.sort_order,
          context_note: p.context_note || undefined,
        }))
      }));
    }
  }, [editingPost, existingLinkedPlaces, formData.linked_places.length]);

  const handleTagToggle = (interestId: string) => {
    setFormData(f => ({
      ...f,
      interest_tags: f.interest_tags.includes(interestId)
        ? f.interest_tags.filter(id => id !== interestId)
        : [...f.interest_tags, interestId]
    }));
  };

  const handleSubmit = async (publish: boolean) => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.city_id) {
      toast.error('City is required');
      return;
    }
    if (formData.type === 'event') {
      if (!formData.place_id) {
        toast.error('Place is required for events');
        return;
      }
      // For one-time events, require a date
      if (!formData.is_recurring && !formData.start_date) {
        toast.error('Event date is required');
        return;
      }
      // For recurring events, require day selection
      if (formData.is_recurring && !formData.recurrence_day) {
        toast.error('Please select a day of the week');
        return;
      }
    }

    // Validate external URL format if provided
    if (formData.external_url.trim() && !formData.external_url.match(/^https?:\/\//)) {
      toast.error('External URL must start with http:// or https://');
      return;
    }

    // Generate recurrence text for recurring events
    const recurrenceText = formData.is_recurring 
      ? generateRecurrenceText(formData.recurrence_day, formData.recurrence_frequency)
      : null;

    // Generate slug if not provided (for announcements)
    const slug = formData.type === 'announcement' 
      ? (formData.slug.trim() || generateSlug(formData.title))
      : null;

    const postData: PostInsert = {
      type: formData.type,
      title: formData.title.trim(),
      body: formData.body.trim() || null,
      slug: slug,
      excerpt: formData.type === 'announcement' ? (formData.excerpt.trim() || null) : null,
      meta_description: formData.type === 'announcement' ? (formData.meta_description.trim() || null) : null,
      city_id: formData.city_id,
      place_id: formData.type === 'event' ? formData.place_id : (formData.place_id || null),
      // For one-time events, store date with midnight time
      start_date: formData.type === 'event' && !formData.is_recurring && formData.start_date
        ? `${formData.start_date}T00:00:00`
        : null,
      end_date: null, // No longer using end_date
      is_recurring: formData.type === 'event' ? formData.is_recurring : false,
      recurrence_text: formData.type === 'event' ? recurrenceText : null,
      external_url: formData.external_url.trim() || null,
      cover_image_url: formData.type === 'announcement' ? formData.cover_image_url : null,
      status: publish ? 'published' : 'draft',
    };

    try {
      let postId: string;
      
      if (editingPost) {
        await updatePost.mutateAsync({ id: editingPost.id, ...postData });
        postId = editingPost.id;
        toast.success('Post updated');
      } else {
        const created = await createPost.mutateAsync(postData);
        postId = created.id;
        toast.success(publish ? 'Post published' : 'Draft saved');
      }
      
      // Sync tags and linked places for announcements
      if (formData.type === 'announcement') {
        await syncPostTags(postId, formData.interest_tags);
        await syncPostPlaces(
          postId,
          formData.linked_places.map((p, i) => ({
            place_id: p.place_id,
            sort_order: i,
            context_note: p.context_note,
          }))
        );
      }
      
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save post');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePost.mutateAsync(id);
      toast.success('Post deleted');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const isEventType = formData.type === 'event';
  // Announcements: 4 steps (Type → Content/Location → Tags → Review)
  // Events: 3 steps (Type → Event Info/Schedule → Review)
  const totalSteps = isEventType ? 3 : 4;

  // Validate current step and return errors
  const validateStep = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    if (step === 2) {
      if (!formData.title.trim()) {
        newErrors.title = isEventType ? 'Event name is required' : 'Title is required';
      }
      if (!formData.city_id) {
        newErrors.city_id = 'Please select a city';
      }
      
      if (isEventType) {
        if (!formData.place_id) {
          newErrors.place_id = 'Please select a venue';
        }
        if (formData.is_recurring) {
          if (!formData.recurrence_day) {
            newErrors.recurrence_day = 'Please select a day of the week';
          }
        } else {
          if (!formData.start_date) {
            newErrors.start_date = 'Please select an event date';
          }
        }
      }
      
      // Validate external URL format if provided
      if (formData.external_url.trim() && !formData.external_url.match(/^https?:\/\//)) {
        newErrors.external_url = 'URL must start with http:// or https://';
      }
    }
    
    return newErrors;
  };

  const canProceed = () => {
    const stepErrors = validateStep();
    return Object.keys(stepErrors).length === 0;
  };

  const handleProceed = () => {
    setAttemptedProceed(true);
    const stepErrors = validateStep();
    setErrors(stepErrors);
    
    if (Object.keys(stepErrors).length === 0) {
      setAttemptedProceed(false);
      setErrors({});
      setStep(s => s + 1);
    }
  };

  const { enhancePost, isEnhancing } = useEnhanceBlogPost();

  const handleAIEnhance = async () => {
    if (!formData.title.trim() || !formData.body.trim()) {
      toast.error('Enter a title and body content first');
      return;
    }
    
    const result = await enhancePost({
      title: formData.title,
      body: formData.body,
      city_name: selectedCityName,
      city_id: formData.city_id || undefined
    });
    
    if (result) {
      // Update SEO fields
      setFormData(f => ({
        ...f,
        slug: result.slug,
        excerpt: result.excerpt.slice(0, 200),
        meta_description: result.meta_description.slice(0, 160),
        body: result.formatted_body
      }));
      
      // Handle matched places - pre-populate MultiPlacePicker
      if (result.matched_places && result.matched_places.length > 0) {
        const matchedPlaces = result.matched_places.map((sp, index) => ({
          place_id: sp.place_id!,
          name: sp.matched_name || sp.name,
          city: selectedCityName || '',
          sort_order: index,
          context_note: sp.context || undefined,
        }));
        
        // Merge with existing linked places (avoid duplicates)
        setFormData(f => {
          const existingIds = new Set(f.linked_places.map(p => p.place_id));
          const newPlaces = matchedPlaces.filter(p => !existingIds.has(p.place_id));
          return {
            ...f,
            linked_places: [...f.linked_places, ...newPlaces]
          };
        });
      }
      
      // Store unmatched places for display as suggestions
      if (result.unmatched_places && result.unmatched_places.length > 0) {
        setUnmatchedSuggestions(result.unmatched_places);
      }
      
      // Store area-related places for display
      if (result.area_related_places && result.area_related_places.length > 0) {
        setAreaRelatedPlaces(result.area_related_places);
      }
    }
  };

  // Handler for "Search to Add" button on unmatched suggestions
  const handleSearchToAdd = (placeName: string) => {
    setPlacePickerSearchTerm(placeName);
    // Remove from unmatched suggestions once user clicks to add
    setUnmatchedSuggestions(prev => prev.filter(p => p.name !== placeName));
  };

  const renderAnnouncementStep2 = () => (
    <div className="space-y-5">
      {/* Cover Image Upload */}
      <BlogImageUpload
        value={formData.cover_image_url}
        onChange={(url) => setFormData(f => ({ ...f, cover_image_url: url }))}
      />
      
      {/* Title */}
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => {
            const newTitle = e.target.value;
            setFormData(f => ({ 
              ...f, 
              title: newTitle,
              // Auto-generate slug if slug is empty or matches old auto-generated slug
              slug: f.slug === '' || f.slug === generateSlug(f.title) ? generateSlug(newTitle) : f.slug
            }));
            if (errors.title) setErrors(e => ({ ...e, title: undefined }));
          }}
          placeholder="Welcome to Seattle!"
          className={`mt-1.5 ${attemptedProceed && errors.title ? 'border-destructive' : ''}`}
        />
        {attemptedProceed && errors.title && (
          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.title}
          </p>
        )}
      </div>
      
      {/* Body with Markdown Editor */}
      <div>
        <Label htmlFor="body">Body Content</Label>
        <MarkdownEditor
          value={formData.body}
          onChange={(value) => setFormData(f => ({ ...f, body: value }))}
          placeholder="Write your post using Markdown...

## Neighborhood Highlights

Oak Lawn is where a lot of gay life in Dallas still runs quietly in the background...

### What to expect
- Morning coffee at familiar spots
- Dog walking routines that become social rituals"
          rows={10}
          className="mt-1.5"
        />
      </div>
      
      {/* AI Enhance Button */}
      <div className="flex flex-col items-center gap-2 py-3 px-4 rounded-lg bg-muted/50 border border-dashed">
        <Button
          type="button"
          variant="outline"
          onClick={handleAIEnhance}
          disabled={isEnhancing || !formData.title.trim() || !formData.body.trim()}
          className="gap-2"
        >
          {isEnhancing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isEnhancing ? 'Analyzing content...' : 'AI Enhance All Fields'}
        </Button>
        <p className="text-xs text-muted-foreground text-center max-w-sm">
          Auto-generates SEO fields, formats Markdown, and finds places mentioned in your article
        </p>
      </div>
      
      {/* URL Slug */}
      <div>
        <Label htmlFor="slug">URL Slug</Label>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm text-muted-foreground">/blog/</span>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
            placeholder="your-post-slug"
            className="flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">Auto-generated from title. Edit for custom URL.</p>
      </div>
      
      {/* Excerpt */}
      <div>
        <Label htmlFor="excerpt">
          Excerpt
          <span className="text-muted-foreground font-normal ml-1">(shown on cards & social shares)</span>
        </Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData(f => ({ ...f, excerpt: e.target.value.slice(0, 200) }))}
          placeholder="A brief summary of your post for previews..."
          rows={2}
          className="mt-1.5"
        />
        <p className={`text-xs mt-1 ${formData.excerpt.length > 180 ? 'text-amber-600' : 'text-muted-foreground'}`}>
          {formData.excerpt.length}/200 characters
        </p>
      </div>
      
      {/* Meta Description */}
      <div>
        <Label htmlFor="meta_description">
          Meta Description
          <span className="text-muted-foreground font-normal ml-1">(SEO - optional)</span>
        </Label>
        <Textarea
          id="meta_description"
          value={formData.meta_description}
          onChange={(e) => setFormData(f => ({ ...f, meta_description: e.target.value.slice(0, 160) }))}
          placeholder="Defaults to excerpt if left empty..."
          rows={2}
          className="mt-1.5"
        />
        <p className={`text-xs mt-1 ${formData.meta_description.length > 150 ? 'text-amber-600' : 'text-muted-foreground'}`}>
          {formData.meta_description.length}/160 characters
        </p>
      </div>
      
      {/* Location - City or Metro Area */}
      <div>
        <Label>Location</Label>
        {citiesLoading || metroLoading ? (
          <Skeleton className="h-10 w-full mt-1.5" />
        ) : (
          <Select
            value={formData.city_id ? `${formData.location_type}:${formData.city_id}` : ''}
            onValueChange={(v) => {
              const [type, id] = v.split(':');
              setFormData(f => ({ 
                ...f, 
                city_id: id, 
                location_type: type as 'city' | 'metro',
                place_id: '' 
              }));
              if (errors.city_id) setErrors(e => ({ ...e, city_id: undefined }));
            }}
          >
            <SelectTrigger className={`mt-1.5 ${attemptedProceed && errors.city_id ? 'border-destructive' : ''}`}>
              <SelectValue placeholder="Choose a city or metro area" />
            </SelectTrigger>
            <SelectContent>
              {metroAreas && metroAreas.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-xs text-muted-foreground">Metro Areas</SelectLabel>
                  {metroAreas.map(metro => (
                    <SelectItem key={metro.id} value={`metro:${metro.id}`}>
                      {metro.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              <SelectGroup>
                <SelectLabel className="text-xs text-muted-foreground">Cities</SelectLabel>
                {launchedCities.map(city => (
                  <SelectItem key={city.id} value={`city:${city.id}`}>
                    {city.name}{city.state ? `, ${city.state}` : ''}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
        {attemptedProceed && errors.city_id && (
          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.city_id}
          </p>
        )}
      </div>
      
      {/* Multi-Place Picker */}
      <MultiPlacePicker
        value={formData.linked_places}
        onChange={(places) => setFormData(f => ({ ...f, linked_places: places }))}
        initialSearchTerm={placePickerSearchTerm}
        onSearchTermChange={setPlacePickerSearchTerm}
      />
      
      {/* Unmatched Place Suggestions */}
      {unmatchedSuggestions.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20 p-4 space-y-3">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {unmatchedSuggestions.length} place{unmatchedSuggestions.length > 1 ? 's' : ''} mentioned but not in directory
            </span>
          </div>
          <div className="space-y-2">
            {unmatchedSuggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="flex items-start justify-between gap-3 p-3 rounded-md bg-background border"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{suggestion.name}</p>
                  {suggestion.context && (
                    <p className="text-xs text-muted-foreground mt-0.5 italic">
                      "{suggestion.context}"
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearchToAdd(suggestion.name)}
                  className="gap-1.5 shrink-0"
                >
                  <Search className="h-3.5 w-3.5" />
                  Search to Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Venues in Mentioned Areas */}
      {areaRelatedPlaces.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20 p-4 space-y-4">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">
              Venues in mentioned neighborhoods
            </span>
          </div>
          {areaRelatedPlaces.map((area, areaIndex) => (
            <div key={areaIndex} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{area.area_name}</span>
                {area.area_context && (
                  <span className="text-xs text-muted-foreground italic">— {area.area_context}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {area.places.map((place) => {
                  const isAlreadyAdded = formData.linked_places.some(p => p.place_id === place.id);
                  return (
                    <Button
                      key={place.id}
                      type="button"
                      variant={isAlreadyAdded ? "secondary" : "outline"}
                      size="sm"
                      disabled={isAlreadyAdded}
                      onClick={() => {
                        if (!isAlreadyAdded) {
                          setFormData(f => ({
                            ...f,
                            linked_places: [...f.linked_places, {
                              place_id: place.id,
                              name: place.name,
                              city: selectedCityName || '',
                              sort_order: f.linked_places.length,
                            }]
                          }));
                        }
                      }}
                      className="gap-1.5 text-xs h-8"
                    >
                      {isAlreadyAdded ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                      {place.name}
                      {place.primary_category && (
                        <span className="text-muted-foreground">· {place.primary_category}</span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEventStep2 = () => (
    <div className="space-y-5">
      {/* Event Name */}
      <div>
        <Label htmlFor="title">Event Name</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => {
            setFormData(f => ({ ...f, title: e.target.value }));
            if (errors.title) setErrors(e => ({ ...e, title: undefined }));
          }}
          placeholder="Trivia Night"
          className={`mt-1.5 ${attemptedProceed && errors.title ? 'border-destructive' : ''}`}
        />
        {attemptedProceed && errors.title && (
          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.title}
          </p>
        )}
      </div>
      
      {/* Description */}
      <div>
        <Label htmlFor="body">Description (Optional)</Label>
        <Textarea
          id="body"
          value={formData.body}
          onChange={(e) => setFormData(f => ({ ...f, body: e.target.value }))}
          placeholder="Brief description of the event..."
          rows={2}
          className="mt-1.5"
        />
      </div>
      
      {/* City Selection */}
      <div>
        <Label>City</Label>
        {citiesLoading ? (
          <Skeleton className="h-10 w-full mt-1.5" />
        ) : (
          <Select
            value={formData.city_id}
            onValueChange={(v) => {
              setFormData(f => ({ ...f, city_id: v, place_id: '' }));
              if (errors.city_id) setErrors(e => ({ ...e, city_id: undefined }));
            }}
          >
            <SelectTrigger className={`mt-1.5 ${attemptedProceed && errors.city_id ? 'border-destructive' : ''}`}>
              <SelectValue placeholder="Choose a city" />
            </SelectTrigger>
            <SelectContent>
              {launchedCities.map(city => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}{city.state ? `, ${city.state}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {attemptedProceed && errors.city_id && (
          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.city_id}
          </p>
        )}
      </div>
      
      {/* Venue (Required) */}
      <div>
        {formData.city_id ? (
          <>
            <VenuePicker
              value={formData.place_id}
              onChange={(placeId) => {
                setFormData(f => ({ ...f, place_id: placeId }));
                if (errors.place_id) setErrors(e => ({ ...e, place_id: undefined }));
              }}
            />
            {attemptedProceed && errors.place_id && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.place_id}
              </p>
            )}
          </>
        ) : (
          attemptedProceed && errors.place_id && (
            <p className="text-sm text-destructive mt-1 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              Please select a city first to choose a venue
            </p>
          )
        )}
      </div>
      
      {/* Schedule Type Toggle */}
      <div className="pt-2 border-t">
        <Label className="mb-3 block">Event Schedule</Label>
        <RadioGroup
          value={formData.is_recurring ? 'recurring' : 'onetime'}
          onValueChange={(v) => {
            setFormData(f => ({ 
              ...f, 
              is_recurring: v === 'recurring',
              start_date: v === 'recurring' ? '' : f.start_date,
              recurrence_day: v === 'onetime' ? '' : f.recurrence_day,
            }));
            // Clear schedule-related errors when switching
            setErrors(e => ({ ...e, start_date: undefined, recurrence_day: undefined }));
          }}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="onetime" id="onetime" />
            <Label htmlFor="onetime" className="font-normal cursor-pointer">One-time event</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="recurring" id="recurring" />
            <Label htmlFor="recurring" className="font-normal cursor-pointer">Recurring event</Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Schedule Fields */}
      {formData.is_recurring ? (
        <div className="space-y-4 p-4 rounded-lg bg-muted/30 border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <RotateCcw className="h-4 w-4" />
            <span>Set the recurring schedule</span>
          </div>
          
          {/* Day of Week */}
          <div>
            <Label>Day of Week</Label>
            <Select
              value={formData.recurrence_day}
              onValueChange={(v) => {
                setFormData(f => ({ ...f, recurrence_day: v }));
                if (errors.recurrence_day) setErrors(e => ({ ...e, recurrence_day: undefined }));
              }}
            >
              <SelectTrigger className={`mt-1.5 ${attemptedProceed && errors.recurrence_day ? 'border-destructive' : ''}`}>
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map(day => (
                  <SelectItem key={day} value={day}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {attemptedProceed && errors.recurrence_day && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.recurrence_day}
              </p>
            )}
          </div>
          
          {/* Frequency */}
          <div>
            <Label>Frequency</Label>
            <Select
              value={formData.recurrence_frequency}
              onValueChange={(v) => setFormData(f => ({ ...f, recurrence_frequency: v }))}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Preview */}
          {formData.recurrence_day && (
            <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium text-primary">
                Preview: {generateRecurrenceText(formData.recurrence_day, formData.recurrence_frequency)}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 p-4 rounded-lg bg-muted/30 border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            <span>One-time event details</span>
          </div>
          
          {/* Event Date (date only) */}
          <div>
            <Label htmlFor="start_date">Event Date</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => {
                setFormData(f => ({ ...f, start_date: e.target.value }));
                if (errors.start_date) setErrors(e => ({ ...e, start_date: undefined }));
              }}
              className={`mt-1.5 ${attemptedProceed && errors.start_date ? 'border-destructive' : ''}`}
            />
            {attemptedProceed && errors.start_date && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.start_date}
              </p>
            )}
          </div>
          
          {/* External URL for more details */}
          <div>
            <Label htmlFor="external_url">More Details (URL)</Label>
            <Input
              id="external_url"
              type="url"
              value={formData.external_url}
              onChange={(e) => {
                setFormData(f => ({ ...f, external_url: e.target.value }));
                if (errors.external_url) setErrors(e => ({ ...e, external_url: undefined }));
              }}
              placeholder="https://venue.com/event-details"
              className={`mt-1.5 ${attemptedProceed && errors.external_url ? 'border-destructive' : ''}`}
            />
            {attemptedProceed && errors.external_url ? (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.external_url}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                Link to event page for times and RSVP
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderReviewStep = () => {
    const selectedCity = launchedCities.find(c => c.id === formData.city_id);
    const selectedPlace = places?.find(p => p.id === formData.place_id);
    
    return (
      <div className="space-y-4">
        {/* Cover Image Preview for Announcements */}
        {!isEventType && formData.cover_image_url && (
          <div className="rounded-lg overflow-hidden border">
            <img 
              src={formData.cover_image_url} 
              alt="Cover preview" 
              className="w-full aspect-video object-cover"
            />
          </div>
        )}
        
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${isEventType ? 'bg-accent/10' : 'bg-primary/10'}`}>
              {isEventType ? (
                formData.is_recurring ? (
                  <RotateCcw className="h-5 w-5 text-accent" />
                ) : (
                  <Calendar className="h-5 w-5 text-accent" />
                )
              ) : (
                <Megaphone className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {isEventType ? 'Event' : 'Announcement'}
                </Badge>
                {formData.is_recurring && (
                  <Badge variant="outline" className="text-xs">Recurring</Badge>
                )}
              </div>
              <h3 className="font-semibold text-lg">{formData.title || 'Untitled'}</h3>
              {formData.body && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{formData.body}</p>
              )}
              
              <div className="mt-3 space-y-1 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {selectedCity?.name}{selectedCity?.state ? `, ${selectedCity.state}` : ''}
                  {selectedPlace && ` — ${selectedPlace.name}`}
                </p>
                
                {isEventType && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    {formData.is_recurring ? <RotateCcw className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
                    {formData.is_recurring 
                      ? generateRecurrenceText(formData.recurrence_day, formData.recurrence_frequency)
                      : formData.start_date 
                        ? format(new Date(formData.start_date), 'EEEE, MMMM d, yyyy')
                        : 'No date set'
                    }
                  </p>
                )}
                
                {formData.external_url && (
                  <p className="flex items-center gap-2">
                    <ExternalLink className="h-3.5 w-3.5 text-primary" />
                    <a href={formData.external_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                      {formData.external_url}
                    </a>
                  </p>
                )}
              </div>
              
              {!isEventType && formData.interest_tags.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Tags ({formData.interest_tags.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {formData.interest_tags.slice(0, 5).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                    {formData.interest_tags.length > 5 && (
                      <Badge variant="secondary" className="text-xs">+{formData.interest_tags.length - 5} more</Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground text-center">
          Ready to publish or save as draft.
        </p>
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <Label>What type of post?</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormData(f => ({ ...INITIAL_FORM, type: 'announcement' }))}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  formData.type === 'announcement' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <Megaphone className="h-6 w-6 mb-2 text-primary" />
                <h4 className="font-medium">Announcement</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  City updates, launches, or general news
                </p>
              </button>
              <button
                onClick={() => setFormData(f => ({ ...INITIAL_FORM, type: 'event' }))}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  formData.type === 'event' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <Calendar className="h-6 w-6 mb-2 text-accent" />
                <h4 className="font-medium">Event</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Trivia nights, pop-ups, festivals at a place
                </p>
              </button>
            </div>
          </div>
        );
      
      case 2:
        return isEventType ? renderEventStep2() : renderAnnouncementStep2();
      
      case 3:
        // For announcements: tags step
        // For events: review step
        if (isEventType) {
          return renderReviewStep();
        }
        return (
          <PostTagsStep
            selectedTags={formData.interest_tags}
            onToggleTag={handleTagToggle}
          />
        );
      
      case 4:
        // Announcements review step
        return renderReviewStep();
      
      default:
        return null;
    }
  };

  const formatPostDate = (post: Post): string => {
    if (post.is_recurring && post.recurrence_text) {
      return post.recurrence_text;
    }
    if (post.start_date) {
      return format(new Date(post.start_date), 'EEE, MMM d, yyyy');
    }
    return '';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Posts</h1>
            <p className="text-muted-foreground mt-1">
              City-scoped announcements and events
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        {/* Filter Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Posts List */}
        {postsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : !posts?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No posts yet. Create one to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <Card key={post.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2 rounded-lg ${post.type === 'event' ? 'bg-accent/10' : 'bg-primary/10'}`}>
                        {post.type === 'event' ? (
                          post.is_recurring ? (
                            <RotateCcw className="h-4 w-4 text-accent" />
                          ) : (
                            <Calendar className="h-4 w-4 text-accent" />
                          )
                        ) : (
                          <Megaphone className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge className={statusColors[post.status]}>
                            {post.status}
                          </Badge>
                          {post.is_recurring && (
                            <Badge variant="outline" className="text-xs">
                              Recurring
                            </Badge>
                          )}
                          {post.cover_image_url && (
                            <Badge variant="outline" className="text-xs">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              Image
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {post.city?.name}{post.city?.state ? `, ${post.city.state}` : ''}
                          </span>
                        </div>
                        <h3 className="font-medium truncate">{post.title}</h3>
                        {post.type === 'event' && post.place && (
                          <p className="text-sm text-muted-foreground">
                            @ {post.place.name}
                          </p>
                        )}
                        {post.type === 'event' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatPostDate(post)}
                          </p>
                        )}
                        {post.external_url && (
                          <a 
                            href={post.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {new URL(post.external_url).hostname}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openEditDialog(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete post?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{post.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(post.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost 
                ? `Edit ${isEventType ? 'Event' : 'Announcement'} — Step ${step - 1} of ${totalSteps - 1}`
                : `New ${isEventType ? 'Event' : 'Announcement'} — Step ${step} of ${totalSteps}`
              }
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {renderStep()}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {step > (editingPost ? 2 : 1) && (
              <Button 
                variant="outline" 
                onClick={() => setStep(s => s - 1)}
                className="sm:mr-auto"
              >
                Back
              </Button>
            )}
            
            {step < totalSteps && !(editingPost && step === totalSteps) ? (
              <Button onClick={step === 1 ? () => setStep(s => s + 1) : handleProceed}>
                Continue
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleSubmit(false)}
                  disabled={createPost.isPending || updatePost.isPending}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button 
                  onClick={() => handleSubmit(true)}
                  disabled={createPost.isPending || updatePost.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default PostManagement;
