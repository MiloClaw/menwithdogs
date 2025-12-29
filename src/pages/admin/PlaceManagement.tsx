import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { ArrowLeft, Plus, Search, Trash2, Edit } from 'lucide-react';
import { usePlaces, CreatePlaceInput } from '@/hooks/usePlaces';
import GooglePlacesAutocomplete from '@/components/ui/google-places-autocomplete';
import { PlaceDetails } from '@/hooks/useGooglePlaces';

const PlaceManagement = () => {
  const { places, isLoading, createPlace, updatePlace, deletePlace } = usePlaces();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreatePlaceInput>({
    google_place_id: '',
    name: '',
    primary_category: '',
    city: '',
    state: '',
    country: '',
  });

  const handlePlaceSelect = (details: PlaceDetails) => {
    setFormData({
      ...formData,
      google_place_id: details.place_id,
      name: details.name,
      city: details.city || '',
      state: details.state || '',
      country: details.country || '',
      lat: details.lat || undefined,
      lng: details.lng || undefined,
    });
  };

  const handleCreate = async () => {
    if (!formData.google_place_id || !formData.name || !formData.primary_category) return;
    
    await createPlace.mutateAsync(formData);
    setIsCreateOpen(false);
    setFormData({
      google_place_id: '',
      name: '',
      primary_category: '',
      city: '',
      state: '',
      country: '',
    });
  };

  const handleStatusChange = async (id: string, status: 'approved' | 'pending' | 'rejected') => {
    await updatePlace.mutateAsync({ id, status });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this place?')) {
      await deletePlace.mutateAsync(id);
    }
  };

  const filteredPlaces = places.filter(place =>
    place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.city?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-2xl font-bold">Places</h1>
            <p className="text-muted-foreground">
              Manage venues and locations in the directory
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Place
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Place</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Search Google Places</Label>
                  <GooglePlacesAutocomplete
                    value={formData.name}
                    onChange={(value) => setFormData({ ...formData, name: value })}
                    onPlaceSelect={handlePlaceSelect}
                    types="establishment"
                    placeholder="Search for a venue..."
                  />
                </div>

                {formData.google_place_id && (
                  <>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input
                        value={formData.primary_category}
                        onChange={(e) => setFormData({ ...formData, primary_category: e.target.value })}
                        placeholder="e.g., Restaurant, Bar, Coffee Shop"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Input
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          disabled
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleCreate} 
                      className="w-full"
                      disabled={createPlace.isPending}
                    >
                      {createPlace.isPending ? 'Creating...' : 'Create Place'}
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search places..."
            className="pl-9"
          />
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredPlaces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No places found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlaces.map((place) => (
                  <TableRow key={place.id}>
                    <TableCell className="font-medium">{place.name}</TableCell>
                    <TableCell>{place.primary_category}</TableCell>
                    <TableCell>
                      {[place.city, place.state].filter(Boolean).join(', ')}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={place.status}
                        onValueChange={(value: 'approved' | 'pending' | 'rejected') => 
                          handleStatusChange(place.id, value)
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <Badge variant="outline" className={statusColors[place.status]}>
                            {place.status}
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
                        onClick={() => handleDelete(place.id)}
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

export default PlaceManagement;
