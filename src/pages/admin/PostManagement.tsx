import { useState } from 'react';
import { 
  Plus, Megaphone, Calendar, Trash2, Edit, 
  AlertCircle, Check, Clock, MapPin, ExternalLink, RotateCcw
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
import { Switch } from '@/components/ui/switch';
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
  SelectItem,
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
import { usePlaces } from '@/hooks/usePlaces';
import { PostTagsStep } from '@/components/admin/posts/PostTagsStep';
import { toast } from 'sonner';

type PostType = 'announcement' | 'event';
type PostStatus = 'draft' | 'published' | 'expired';

interface PostFormData {
  type: PostType;
  title: string;
  body: string;
  city_id: string;
  place_id: string;
  start_date: string;
  end_date: string;
  is_recurring: boolean;
  recurrence_text: string;
  external_url: string;
  status: PostStatus;
  interest_tags: string[]; // Added for tagging
}

const INITIAL_FORM: PostFormData = {
  type: 'announcement',
  title: '',
  body: '',
  city_id: '',
  place_id: '',
  start_date: '',
  end_date: '',
  is_recurring: false,
  recurrence_text: '',
  external_url: '',
  status: 'draft',
  interest_tags: [], // Added for tagging
};

const statusColors: Record<PostStatus, string> = {
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  draft: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  expired: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const PostManagement = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<PostFormData>(INITIAL_FORM);
  const [step, setStep] = useState(1);

  const { data: posts, isLoading: postsLoading } = useAdminPosts(statusFilter);
  const { data: cities, isLoading: citiesLoading } = useCities();
  const { places } = usePlaces();
  
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const launchedCities = cities?.filter(c => c.status === 'launched') || [];
  
  const selectedCityName = launchedCities.find(c => c.id === formData.city_id)?.name;
  const cityPlaces = places?.filter(p => 
    p.status === 'approved' && 
    selectedCityName && 
    p.city === selectedCityName
  ) || [];

  // Fetch existing tags when editing
  const { data: existingTags = [] } = usePostTags(editingPost?.id ?? null);

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setEditingPost(null);
    setStep(1);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (post: Post) => {
    setEditingPost(post);
    setFormData({
      type: post.type,
      title: post.title,
      body: post.body || '',
      city_id: post.city_id,
      place_id: post.place_id || '',
      start_date: post.start_date ? post.start_date.slice(0, 16) : '',
      end_date: post.end_date ? post.end_date.slice(0, 16) : '',
      is_recurring: post.is_recurring || false,
      recurrence_text: post.recurrence_text || '',
      external_url: post.external_url || '',
      status: post.status,
      interest_tags: [], // Will be populated by usePostTags
    });
    setStep(4); // Skip to content step for editing
    setDialogOpen(true);
  };

  // Update form with existing tags when they load
  if (editingPost && existingTags.length > 0 && formData.interest_tags.length === 0) {
    setFormData(f => ({ ...f, interest_tags: existingTags }));
  }

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
      // For non-recurring events, require a date
      if (!formData.is_recurring && !formData.start_date) {
        toast.error('Event date is required for single-date events');
        return;
      }
      // For recurring events, require recurrence text
      if (formData.is_recurring && !formData.recurrence_text.trim()) {
        toast.error('Recurrence description is required for recurring events');
        return;
      }
    }

    // Validate external URL format if provided
    if (formData.external_url.trim() && !formData.external_url.match(/^https?:\/\//)) {
      toast.error('External URL must start with http:// or https://');
      return;
    }

    const postData: PostInsert = {
      type: formData.type,
      title: formData.title.trim(),
      body: formData.body.trim() || null,
      city_id: formData.city_id,
      place_id: formData.type === 'event' ? formData.place_id : null,
      start_date: formData.type === 'event' && !formData.is_recurring ? formData.start_date : null,
      end_date: formData.type === 'event' && formData.end_date ? formData.end_date : null,
      is_recurring: formData.type === 'event' ? formData.is_recurring : false,
      recurrence_text: formData.type === 'event' && formData.is_recurring ? formData.recurrence_text.trim() : null,
      external_url: formData.external_url.trim() || null,
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
      
      // Sync tags for announcements
      if (formData.type === 'announcement' && formData.interest_tags.length > 0) {
        await syncPostTags(postId, formData.interest_tags);
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
  // Announcements: 5 steps (type, city, place, content, tags)
  // Events: 5 steps (type, city, place, content, schedule)
  const totalSteps = 5;

  const canProceed = () => {
    switch (step) {
      case 1: return true;
      case 2: return !!formData.city_id;
      case 3: return !isEventType || !!formData.place_id;
      case 4: return !!formData.title.trim();
      case 5: 
        // For events, check schedule; for announcements, tags are optional
        if (isEventType) {
          if (formData.is_recurring) {
            return !!formData.recurrence_text.trim();
          }
          return !!formData.start_date;
        }
        return true; // Tags are optional for announcements
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <Label>What type of post?</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormData(f => ({ ...f, type: 'announcement' }))}
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
                onClick={() => setFormData(f => ({ ...f, type: 'event' }))}
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
        return (
          <div className="space-y-4">
            <Label>Select City</Label>
            {citiesLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={formData.city_id}
                onValueChange={(v) => setFormData(f => ({ ...f, city_id: v, place_id: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a launched city" />
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
            {launchedCities.length === 0 && !citiesLoading && (
              <p className="text-sm text-muted-foreground">
                No launched cities available. Launch a city first.
              </p>
            )}
          </div>
        );
      
      case 3:
        if (!isEventType) {
          return (
            <div className="space-y-4">
              <Label>Link to a Place? (Optional)</Label>
              <Select
                value={formData.place_id || "none"}
                onValueChange={(v) => setFormData(f => ({ ...f, place_id: v === "none" ? "" : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No place linked" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No place linked</SelectItem>
                  {cityPlaces.map(place => (
                    <SelectItem key={place.id} value={place.id}>
                      {place.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <Label>Select Venue (Required)</Label>
            <Select
              value={formData.place_id}
              onValueChange={(v) => setFormData(f => ({ ...f, place_id: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a venue" />
              </SelectTrigger>
              <SelectContent>
                {cityPlaces.map(place => (
                  <SelectItem key={place.id} value={place.id}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {place.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {cityPlaces.length === 0 && (
              <p className="text-sm text-amber-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                No approved places in this city yet
              </p>
            )}
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                placeholder={isEventType ? "Trivia Night" : "Welcome to Seattle!"}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="body">Description (Optional)</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => setFormData(f => ({ ...f, body: e.target.value }))}
                placeholder="Short, factual description..."
                rows={3}
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Keep it brief. Users will visit the venue website for details.
              </p>
            </div>
            <div>
              <Label htmlFor="external_url">Venue Website URL (Optional)</Label>
              <Input
                id="external_url"
                type="url"
                value={formData.external_url}
                onChange={(e) => setFormData(f => ({ ...f, external_url: e.target.value }))}
                placeholder="https://venue.com/event"
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                Where users can confirm details or RSVP
              </p>
            </div>
          </div>
        );
      
      case 5:
        // For announcements: show tags step
        if (!isEventType) {
          return (
            <PostTagsStep
              selectedTags={formData.interest_tags}
              onToggleTag={handleTagToggle}
            />
          );
        }
        // For events: show schedule step
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Event Schedule</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Recurring</span>
                <Switch
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => setFormData(f => ({ 
                    ...f, 
                    is_recurring: checked,
                    start_date: checked ? '' : f.start_date,
                    recurrence_text: checked ? f.recurrence_text : ''
                  }))}
                />
              </div>
            </div>

            {formData.is_recurring ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RotateCcw className="h-4 w-4" />
                  <span>Describe the recurring schedule</span>
                </div>
                <Input
                  value={formData.recurrence_text}
                  onChange={(e) => setFormData(f => ({ ...f, recurrence_text: e.target.value }))}
                  placeholder="Every Wednesday at 7pm"
                />
                <p className="text-xs text-muted-foreground">
                  Examples: "Every Friday night", "First Saturday of each month"
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="start_date">Event Date & Time</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData(f => ({ ...f, start_date: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date & Time (Optional)</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData(f => ({ ...f, end_date: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
              </div>
            )}

            {!formData.is_recurring && formData.end_date && new Date(formData.end_date) < new Date() && (
              <p className="text-sm text-amber-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                This event has already ended
              </p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  const formatPostDate = (post: Post): string => {
    if (post.is_recurring && post.recurrence_text) {
      return post.recurrence_text;
    }
    if (post.start_date) {
      const formatted = format(new Date(post.start_date), 'EEE MMM d, h:mm a');
      if (post.end_date) {
        return `${formatted} – ${format(new Date(post.end_date), 'h:mm a')}`;
      }
      return formatted;
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? 'Edit Post' : `New Post — Step ${step} of ${totalSteps}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {renderStep()}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {step > 1 && !editingPost && (
              <Button 
                variant="outline" 
                onClick={() => setStep(s => s - 1)}
                className="sm:mr-auto"
              >
                Back
              </Button>
            )}
            
            {step < totalSteps && !editingPost ? (
              <Button 
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
              >
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
