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
import { ArrowLeft, Plus, Search, Trash2, Star, ExternalLink, Phone, Globe, Eye } from 'lucide-react';
import { usePlaces, CreatePlaceInput, getPhotos } from '@/hooks/usePlaces';
import GooglePlacesAutocomplete from '@/components/ui/google-places-autocomplete';
import { PlaceDetails } from '@/hooks/useGooglePlaces';
import { getFirstPhotoUrl } from '@/lib/google-places-photos';

const PlaceManagement = () => {
  const { places, isLoading, createPlace, updatePlace, deletePlace } = usePlaces();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state with all GBP fields
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
      google_place_id: details.place_id,
      name: details.name,
      primary_category: details.google_primary_type_display || '',
      city: details.city || '',
      state: details.state || '',
      country: details.country || '',
      lat: details.lat || undefined,
      lng: details.lng || undefined,
      formatted_address: details.formatted_address || undefined,
      rating: details.rating,
      user_ratings_total: details.user_ratings_total,
      price_level: details.price_level,
      website_url: details.website_url,
      phone_number: details.phone_number,
      google_maps_url: details.google_maps_url,
      opening_hours: details.opening_hours as unknown as CreatePlaceInput['opening_hours'],
      photos: details.photos as unknown as CreatePlaceInput['photos'],
      google_primary_type: details.google_primary_type,
      google_primary_type_display: details.google_primary_type_display,
    });
  };

  const resetForm = () => {
    setFormData({
      google_place_id: '',
      name: '',
      primary_category: '',
      city: '',
      state: '',
      country: '',
    });
  };

  const handleCreate = async () => {
    if (!formData.google_place_id || !formData.name || !formData.primary_category) return;
    
    await createPlace.mutateAsync(formData);
    setIsCreateOpen(false);
    resetForm();
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
          <div className="flex gap-2">
            <Link to="/directory" target="_blank">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview Directory
              </Button>
            </Link>
            <Dialog open={isCreateOpen} onOpenChange={(open) => {
              setIsCreateOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Place
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
                    {/* Preview Card */}
                    <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                      <div className="flex gap-3">
                        {formData.photos && Array.isArray(formData.photos) && formData.photos.length > 0 ? (
                          <img 
                            src={getFirstPhotoUrl(formData.photos as any, 200, 200) || ''}
                            alt={formData.name}
                            className="w-16 h-16 rounded-md object-cover bg-muted"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            No photo
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{formData.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {formData.formatted_address || [formData.city, formData.state].filter(Boolean).join(', ')}
                          </p>
                          {formData.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-sm font-medium">{formData.rating}</span>
                              {formData.user_ratings_total && (
                                <span className="text-sm text-muted-foreground">
                                  ({formData.user_ratings_total.toLocaleString()} reviews)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Links */}
                      <div className="flex flex-wrap gap-2 text-sm">
                        {formData.website_url && (
                          <a 
                            href={formData.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <Globe className="h-3.5 w-3.5" />
                            Website
                          </a>
                        )}
                        {formData.phone_number && (
                          <a 
                            href={`tel:${formData.phone_number}`}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {formData.phone_number}
                          </a>
                        )}
                        {formData.google_maps_url && (
                          <a 
                            href={formData.google_maps_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Google Maps
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input
                        value={formData.primary_category}
                        onChange={(e) => setFormData({ ...formData, primary_category: e.target.value })}
                        placeholder="e.g., Restaurant, Bar, Coffee Shop"
                      />
                      {formData.google_primary_type_display && formData.primary_category !== formData.google_primary_type_display && (
                        <p className="text-xs text-muted-foreground">
                          Suggested: {formData.google_primary_type_display}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          value={formData.city}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Input
                          value={formData.state}
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
                <TableHead className="w-[60px]">Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Rating</TableHead>
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
              ) : filteredPlaces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No places found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlaces.map((place) => {
                  const photos = getPhotos(place.photos);
                  const photoUrl = photos.length > 0 ? getFirstPhotoUrl(photos, 100, 100) : null;
                  
                  return (
                    <TableRow key={place.id}>
                      <TableCell>
                        {photoUrl ? (
                          <img 
                            src={photoUrl}
                            alt={place.name}
                            className="w-10 h-10 rounded-md object-cover bg-muted"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">—</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{place.name}</TableCell>
                      <TableCell>{place.primary_category}</TableCell>
                      <TableCell>
                        {[place.city, place.state].filter(Boolean).join(', ')}
                    </TableCell>
                    <TableCell>
                      {place.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm">{place.rating}</span>
                          {place.user_ratings_total && (
                            <span className="text-xs text-muted-foreground">
                              ({place.user_ratings_total})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
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
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PlaceManagement;
