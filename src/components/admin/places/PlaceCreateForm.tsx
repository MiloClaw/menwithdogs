import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, AlertCircle } from 'lucide-react';
import { PlaceDetails } from '@/hooks/useGooglePlaces';
import { CreatePlaceInput, Place } from '@/hooks/usePlaces';
import GooglePlaceSearch from './GooglePlaceSearch';

interface PlaceCreateFormProps {
  onCancel: () => void;
  onCreate: (input: CreatePlaceInput) => Promise<void>;
  existingPlaces: Place[];
  isCreating?: boolean;
}

const PlaceCreateForm = ({ 
  onCancel, 
  onCreate, 
  existingPlaces,
  isCreating 
}: PlaceCreateFormProps) => {
  const [activeTab, setActiveTab] = useState<'google' | 'manual'>('google');
  
  // Google flow state
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [googleCategory, setGoogleCategory] = useState('');
  const [googleStatus, setGoogleStatus] = useState<Place['status']>('approved');
  
  // Manual flow state
  const [manualData, setManualData] = useState({
    name: '',
    primary_category: '',
    city: '',
    state: '',
    country: 'US',
    status: 'pending' as Place['status'],
  });

  // Check for duplicates
  const checkDuplicate = (googlePlaceId: string): Place | undefined => {
    return existingPlaces.find(p => p.google_place_id === googlePlaceId);
  };

  const handlePlaceSelected = (details: PlaceDetails) => {
    setSelectedPlace(details);
    setGoogleCategory(details.google_primary_type_display || details.google_primary_type || '');
  };

  const handleCreateFromGoogle = async () => {
    if (!selectedPlace) return;

    await onCreate({
      google_place_id: selectedPlace.place_id,
      name: selectedPlace.name,
      primary_category: googleCategory,
      city: selectedPlace.city || undefined,
      state: selectedPlace.state || undefined,
      country: selectedPlace.country || undefined,
      lat: selectedPlace.lat || undefined,
      lng: selectedPlace.lng || undefined,
      source: 'google_places',
      status: googleStatus,
      rating: selectedPlace.rating,
      user_ratings_total: selectedPlace.user_ratings_total,
      price_level: selectedPlace.price_level,
      website_url: selectedPlace.website_url,
      phone_number: selectedPlace.phone_number,
      google_maps_url: selectedPlace.google_maps_url,
      formatted_address: selectedPlace.formatted_address,
      opening_hours: selectedPlace.opening_hours 
        ? { weekday_text: selectedPlace.opening_hours.weekday_text }
        : null,
      photos: selectedPlace.photos as unknown as import('@/integrations/supabase/types').Json,
      google_primary_type: selectedPlace.google_primary_type,
      google_primary_type_display: selectedPlace.google_primary_type_display,
    });
  };

  const handleCreateManual = async () => {
    if (!manualData.name || !manualData.primary_category) return;

    await onCreate({
      google_place_id: `manual_${Date.now()}`,
      name: manualData.name,
      primary_category: manualData.primary_category,
      city: manualData.city || undefined,
      state: manualData.state || undefined,
      country: manualData.country || undefined,
      source: 'admin',
      status: manualData.status,
    });
  };

  const existingDupe = selectedPlace ? checkDuplicate(selectedPlace.place_id) : null;
  const canCreateFromGoogle = selectedPlace && googleCategory && !existingDupe;
  const canCreateManual = manualData.name && manualData.primary_category;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Add New Place</h2>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'google' | 'manual')}>
          <TabsList className="mb-4">
            <TabsTrigger value="google">Search Google</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          {/* Google Search Tab */}
          <TabsContent value="google" className="space-y-4">
            <GooglePlaceSearch 
              onPlaceSelected={handlePlaceSelected}
              disabled={isCreating}
            />

            {selectedPlace && (
              <Card>
                <CardContent className="pt-4 space-y-4">
                  {/* Duplicate warning */}
                  {existingDupe && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">
                        This place already exists in the directory ({existingDupe.status})
                      </span>
                    </div>
                  )}

                  {/* Place Preview */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">{selectedPlace.name}</h3>
                    {selectedPlace.formatted_address && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{selectedPlace.formatted_address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      {selectedPlace.rating && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span>{selectedPlace.rating}</span>
                          {selectedPlace.user_ratings_total && (
                            <span className="text-muted-foreground">
                              ({selectedPlace.user_ratings_total})
                            </span>
                          )}
                        </div>
                      )}
                      {selectedPlace.google_primary_type_display && (
                        <Badge variant="outline">
                          {selectedPlace.google_primary_type_display}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Category Override */}
                  <div className="space-y-2">
                    <Label htmlFor="google-category">Primary Category</Label>
                    <Input
                      id="google-category"
                      value={googleCategory}
                      onChange={(e) => setGoogleCategory(e.target.value)}
                      placeholder="e.g., Restaurant, Bar, Coffee Shop"
                    />
                    <p className="text-xs text-muted-foreground">
                      Override the category for your taxonomy (Google: {selectedPlace.google_primary_type_display})
                    </p>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="google-status">Initial Status</Label>
                    <Select
                      value={googleStatus}
                      onValueChange={(value: Place['status']) => setGoogleStatus(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleCreateFromGoogle}
                    disabled={!canCreateFromGoogle || isCreating}
                    className="w-full"
                  >
                    {isCreating ? 'Adding...' : 'Add Place'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Manual Entry Tab */}
          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-name">Place Name *</Label>
                  <Input
                    id="manual-name"
                    value={manualData.name}
                    onChange={(e) => setManualData({ ...manualData, name: e.target.value })}
                    placeholder="Enter place name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-category">Primary Category *</Label>
                  <Input
                    id="manual-category"
                    value={manualData.primary_category}
                    onChange={(e) => setManualData({ ...manualData, primary_category: e.target.value })}
                    placeholder="e.g., Restaurant, Bar"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manual-city">City</Label>
                    <Input
                      id="manual-city"
                      value={manualData.city}
                      onChange={(e) => setManualData({ ...manualData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-state">State</Label>
                    <Input
                      id="manual-state"
                      value={manualData.state}
                      onChange={(e) => setManualData({ ...manualData, state: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-country">Country</Label>
                    <Input
                      id="manual-country"
                      value={manualData.country}
                      onChange={(e) => setManualData({ ...manualData, country: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-status">Initial Status</Label>
                  <Select
                    value={manualData.status}
                    onValueChange={(value: Place['status']) => 
                      setManualData({ ...manualData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleCreateManual}
                  disabled={!canCreateManual || isCreating}
                  className="w-full"
                >
                  {isCreating ? 'Adding...' : 'Add Manual Place'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlaceCreateForm;
