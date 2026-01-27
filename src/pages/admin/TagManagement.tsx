import { useState } from 'react';
import { Plus, RefreshCw, MessageSquare, AlertTriangle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GoogleTypesCheckboxList } from '@/components/admin/tags/GoogleTypesCheckboxList';
import {
  useCanonicalTags,
  useTagSuggestions,
  useCreateCanonicalTag,
  useUpdateCanonicalTag,
  useReviewTagSuggestion,
  useComputeTagAggregates,
  CanonicalTag,
} from '@/hooks/usePlaceTags';

const CATEGORIES = ['culture', 'accessibility', 'social', 'outdoor'] as const;

const categoryColors: Record<string, string> = {
  culture: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  accessibility: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  social: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  outdoor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
};

export default function TagManagement() {
  const { data: tags, isLoading: tagsLoading } = useCanonicalTags();
  const { data: suggestions, isLoading: suggestionsLoading } = useTagSuggestions('pending');
  const createTag = useCreateCanonicalTag();
  const updateTag = useUpdateCanonicalTag();
  const reviewSuggestion = useReviewTagSuggestion();
  const computeAggregates = useComputeTagAggregates();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<CanonicalTag | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Form state for create/edit
  const [formData, setFormData] = useState({
    slug: '',
    label: '',
    category: 'social' as typeof CATEGORIES[number],
    description: '',
    is_sensitive: false,
    applicable_google_types: [] as string[],
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      slug: '',
      label: '',
      category: 'social',
      description: '',
      is_sensitive: false,
      applicable_google_types: [],
      is_active: true,
    });
  };

  const handleCreateTag = () => {
    createTag.mutate({
      slug: formData.slug.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      label: formData.label,
      category: formData.category,
      description: formData.description || null,
      is_sensitive: formData.is_sensitive,
      applicable_google_types: formData.applicable_google_types,
      is_active: formData.is_active,
    }, {
      onSuccess: () => {
        setCreateDialogOpen(false);
        resetForm();
      },
    });
  };

  const handleUpdateTag = () => {
    if (!editingTag) return;
    updateTag.mutate({
      id: editingTag.id,
      label: formData.label,
      category: formData.category,
      description: formData.description || null,
      is_sensitive: formData.is_sensitive,
      applicable_google_types: formData.applicable_google_types,
      is_active: formData.is_active,
    }, {
      onSuccess: () => {
        setEditingTag(null);
        resetForm();
      },
    });
  };

  const openEditDialog = (tag: CanonicalTag) => {
    setFormData({
      slug: tag.slug,
      label: tag.label,
      category: tag.category,
      description: tag.description || '',
      is_sensitive: tag.is_sensitive,
      applicable_google_types: tag.applicable_google_types || [],
      is_active: tag.is_active,
    });
    setEditingTag(tag);
  };

  const filteredTags = tags?.filter(t => 
    categoryFilter === 'all' || t.category === categoryFilter
  );

  const activeTags = tags?.filter(t => t.is_active).length || 0;
  const sensitiveTags = tags?.filter(t => t.is_sensitive).length || 0;
  const pendingSuggestions = suggestions?.length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Community Tags</h1>
            <p className="text-muted-foreground">Manage canonical tags and review user suggestions</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => computeAggregates.mutate()}
              disabled={computeAggregates.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${computeAggregates.isPending ? 'animate-spin' : ''}`} />
              Rebuild Aggregates
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Tag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Canonical Tag</DialogTitle>
                </DialogHeader>
                <TagForm formData={formData} setFormData={setFormData} isCreate />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateTag} disabled={createTag.isPending}>
                    {createTag.isPending ? 'Creating...' : 'Create Tag'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{tags?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Total Tags</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{activeTags}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold flex items-center gap-2">
                {sensitiveTags}
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-sm text-muted-foreground">Sensitive (k≥5)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold flex items-center gap-2">
                {pendingSuggestions}
                <MessageSquare className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-sm text-muted-foreground">Pending Suggestions</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tags">
          <TabsList>
            <TabsTrigger value="tags">Canonical Tags</TabsTrigger>
            <TabsTrigger value="suggestions">
              Suggestions
              {pendingSuggestions > 0 && (
                <Badge variant="secondary" className="ml-2">{pendingSuggestions}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tags" className="space-y-4">
            {/* Category Filter */}
            <div className="flex gap-2">
              <Button
                variant={categoryFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('all')}
              >
                All
              </Button>
              {CATEGORIES.map(cat => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Button>
              ))}
            </div>

            {/* Tags Table */}
            {tagsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Sensitive</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTags?.map(tag => (
                      <TableRow key={tag.id}>
                        <TableCell className="font-medium">{tag.label}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">{tag.slug}</TableCell>
                        <TableCell>
                          <Badge className={categoryColors[tag.category]}>
                            {tag.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {tag.is_sensitive && (
                            <Badge variant="outline" className="text-amber-600 border-amber-300">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              k≥5
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={tag.is_active ? 'default' : 'secondary'}>
                            {tag.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(tag)}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            {suggestionsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : suggestions?.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No pending suggestions
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {suggestions?.map(suggestion => (
                  <Card key={suggestion.id}>
                    <CardContent className="py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{suggestion.suggested_label}</div>
                          {suggestion.suggested_category && (
                            <Badge className={categoryColors[suggestion.suggested_category]} variant="outline">
                              {suggestion.suggested_category}
                            </Badge>
                          )}
                          {suggestion.rationale && (
                            <p className="text-sm text-muted-foreground mt-2">{suggestion.rationale}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted {new Date(suggestion.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => reviewSuggestion.mutate({ id: suggestion.id, status: 'rejected' })}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => reviewSuggestion.mutate({ id: suggestion.id, status: 'approved' })}
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={!!editingTag} onOpenChange={(open) => !open && setEditingTag(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tag: {editingTag?.label}</DialogTitle>
            </DialogHeader>
            <TagForm formData={formData} setFormData={setFormData} isCreate={false} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTag(null)}>Cancel</Button>
              <Button onClick={handleUpdateTag} disabled={updateTag.isPending}>
                {updateTag.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

// Tag form component
function TagForm({ 
  formData, 
  setFormData, 
  isCreate 
}: { 
  formData: any; 
  setFormData: (data: any) => void; 
  isCreate: boolean;
}) {
  return (
    <div className="space-y-4">
      {isCreate && (
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL-safe identifier)</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="e.g., dog_friendly"
          />
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="label">Display Label</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          placeholder="e.g., Dog Friendly"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (tooltip)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description for users"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Applicable Google Place Types</Label>
        <GoogleTypesCheckboxList
          selectedTypes={formData.applicable_google_types}
          onChange={(types) => setFormData({ ...formData, applicable_google_types: types })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="is_sensitive"
            checked={formData.is_sensitive}
            onCheckedChange={(checked) => setFormData({ ...formData, is_sensitive: checked })}
          />
          <Label htmlFor="is_sensitive" className="flex items-center gap-1">
            Sensitive tag
            <span className="text-xs text-muted-foreground">(requires k≥5 threshold)</span>
          </Label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>
    </div>
  );
}
