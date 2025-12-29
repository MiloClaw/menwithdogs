import { useState, useMemo } from 'react';
import { Tags, Check, X, Pencil, Users, Heart } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAdminInterests, useInterestUsageCounts, InterestWithCategory, GoogleMapping } from '@/hooks/useAdminInterests';
import { GoogleMappingEditor } from '@/components/admin/GoogleMappingEditor';
import { MappingCountBadge } from '@/components/admin/MappingPreview';

type FilterCategory = 'all' | string;
type FilterStatus = 'all' | 'active' | 'inactive';

interface EditFormState {
  label: string;
  category_id: string;
  sort_order: number;
  google_mappings: GoogleMapping[];
}

const InterestManagement = () => {
  const { interests, categories, isLoading, updateInterest, isUpdating } = useAdminInterests();
  const { data: usageCounts } = useInterestUsageCounts();
  const { toast } = useToast();

  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [editingInterest, setEditingInterest] = useState<InterestWithCategory | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({ 
    label: '', 
    category_id: '', 
    sort_order: 0,
    google_mappings: [],
  });

  // Filter interests
  const filteredInterests = useMemo(() => {
    return interests.filter(interest => {
      if (filterCategory !== 'all' && interest.category_id !== filterCategory) return false;
      if (filterStatus === 'active' && !interest.is_active) return false;
      if (filterStatus === 'inactive' && interest.is_active) return false;
      return true;
    });
  }, [interests, filterCategory, filterStatus]);

  // Group by category for display
  const groupedInterests = useMemo(() => {
    const groups = new Map<string, InterestWithCategory[]>();
    filteredInterests.forEach(interest => {
      const catId = interest.category_id;
      if (!groups.has(catId)) groups.set(catId, []);
      groups.get(catId)!.push(interest);
    });
    return groups;
  }, [filteredInterests]);

  const handleToggleActive = async (interest: InterestWithCategory) => {
    try {
      await updateInterest({ id: interest.id, is_active: !interest.is_active });
      toast({
        title: interest.is_active ? 'Interest disabled' : 'Interest enabled',
        description: `"${interest.label}" is now ${interest.is_active ? 'inactive' : 'active'}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update interest status.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (interest: InterestWithCategory) => {
    setEditingInterest(interest);
    setEditForm({
      label: interest.label,
      category_id: interest.category_id,
      sort_order: interest.sort_order ?? 0,
      google_mappings: interest.google_mappings ?? [],
    });
  };

  const handleSaveEdit = async () => {
    if (!editingInterest) return;

    // Validate mappings - remove any with empty type
    const validMappings = editForm.google_mappings.filter(m => m.type);

    try {
      await updateInterest({
        id: editingInterest.id,
        label: editForm.label,
        category_id: editForm.category_id,
        sort_order: editForm.sort_order,
        google_mappings: validMappings,
      });
      toast({
        title: 'Interest updated',
        description: `"${editForm.label}" has been updated.`,
      });
      setEditingInterest(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update interest.',
        variant: 'destructive',
      });
    }
  };

  const getMemberCount = (interestId: string) => usageCounts?.memberCounts.get(interestId) ?? 0;
  const getCoupleCount = (interestId: string) => usageCounts?.coupleCounts.get(interestId) ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Interest Management</h1>
          <p className="text-muted-foreground">
            Manage interests, toggle availability, and configure Google Places mappings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Tags className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{interests.length}</p>
                  <p className="text-sm text-muted-foreground">Total Interests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {interests.filter(i => i.is_active).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <X className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {interests.filter(i => !i.is_active).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Tags className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{categories.length}</p>
                  <p className="text-sm text-muted-foreground">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="category-filter" className="text-sm font-medium mb-2 block">
                  Category
                </Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="status-filter" className="text-sm font-medium mb-2 block">
                  Status
                </Label>
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active only</SelectItem>
                    <SelectItem value="inactive">Inactive only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interests Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading interests...
              </div>
            ) : filteredInterests.length === 0 ? (
              <div className="py-12 text-center">
                <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No interests found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Interest</TableHead>
                    <TableHead className="hidden sm:table-cell">Category</TableHead>
                    <TableHead className="hidden md:table-cell">Mappings</TableHead>
                    <TableHead className="text-center hidden lg:table-cell">Usage</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">Order</TableHead>
                    <TableHead className="text-center">Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInterests.map((interest) => (
                    <TableRow key={interest.id}>
                      <TableCell className="font-medium">
                        <div>
                          {interest.label}
                          <span className="ml-2 text-xs text-muted-foreground font-mono hidden sm:inline">
                            {interest.id}
                          </span>
                        </div>
                        {/* Mobile-only: show category below name */}
                        <div className="sm:hidden mt-1">
                          <Badge variant="outline" className="text-xs">
                            {interest.category?.label ?? interest.category_id}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">
                          {interest.category?.label ?? interest.category_id}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <MappingCountBadge count={interest.google_mappings?.length ?? 0} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1" title="Members">
                            <Users className="h-3 w-3" />
                            {getMemberCount(interest.id)}
                          </span>
                          <span className="flex items-center gap-1" title="Couples">
                            <Heart className="h-3 w-3" />
                            {getCoupleCount(interest.id)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground hidden sm:table-cell">
                        {interest.sort_order ?? 0}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={interest.is_active ?? false}
                          onCheckedChange={() => handleToggleActive(interest)}
                          disabled={isUpdating}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(interest)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingInterest} onOpenChange={(open) => !open && setEditingInterest(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Interest</DialogTitle>
            <DialogDescription>
              Update display settings and Google Places mappings
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 py-4">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-id">ID (read-only)</Label>
                  <Input
                    id="edit-id"
                    value={editingInterest?.id ?? ''}
                    disabled
                    className="font-mono text-muted-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-label">Display Name</Label>
                  <Input
                    id="edit-label"
                    value={editForm.label}
                    onChange={(e) => setEditForm(prev => ({ ...prev, label: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={editForm.category_id}
                      onValueChange={(v) => setEditForm(prev => ({ ...prev, category_id: v }))}
                    >
                      <SelectTrigger id="edit-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-order">Sort Order</Label>
                    <Input
                      id="edit-order"
                      type="number"
                      value={editForm.sort_order}
                      onChange={(e) => setEditForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t" />

              {/* Google Mappings Section */}
              <GoogleMappingEditor
                mappings={editForm.google_mappings}
                onChange={(mappings) => setEditForm(prev => ({ ...prev, google_mappings: mappings }))}
                disabled={isUpdating}
              />
            </div>
          </ScrollArea>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setEditingInterest(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isUpdating}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default InterestManagement;
