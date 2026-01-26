import { useState } from 'react';
import { MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GooglePlacesAutocomplete from '@/components/ui/google-places-autocomplete';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useEnsureRelationshipUnit } from '@/hooks/useEnsureRelationshipUnit';
import { useToast } from '@/hooks/use-toast';
import { PlaceDetails } from '@/hooks/useGooglePlaces';

interface ProfileBasicsSectionProps {
  displayName: string | null;
  onDisplayNameChange: (name: string) => void;
  isUpdating?: boolean;
}

export function ProfileBasicsSection({
  displayName,
  onDisplayNameChange,
  isUpdating = false,
}: ProfileBasicsSectionProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { memberProfile, updateMemberProfile, refetch } = useCouple();
  const { ensureRelationshipUnit } = useEnsureRelationshipUnit();
  
  const [cityInput, setCityInput] = useState('');
  const [editingCity, setEditingCity] = useState(false);
  const [localName, setLocalName] = useState(displayName || '');

  const handleCitySelect = async (details: PlaceDetails) => {
    if (!isAuthenticated) return;

    await ensureRelationshipUnit();
    
    try {
      await updateMemberProfile({
        city: details.city || details.name,
        city_place_id: details.place_id,
        city_lat: details.lat,
        city_lng: details.lng,
        state: details.state,
      });
      await refetch();
      setEditingCity(false);
      setCityInput('');
      toast({ title: 'Location updated' });
    } catch {
      toast({ title: 'Failed to update', variant: 'destructive' });
    }
  };

  const handleNameBlur = () => {
    if (localName !== displayName) {
      onDisplayNameChange(localName);
    }
  };

  return (
    <section className="bg-muted/30 rounded-xl p-6 space-y-6">
      <div>
        <h3 className="text-base font-medium tracking-wide text-foreground">
          Profile Basics
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Helps us personalize your experience
        </p>
      </div>

      {/* Name */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground/70" />
          <span className="text-sm font-medium text-foreground">
            First name or nickname
          </span>
        </div>
        <Input
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          onBlur={handleNameBlur}
          placeholder="How should we address you?"
          className="min-h-[44px]"
          disabled={isUpdating}
        />
      </div>

      {/* City */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground/70" />
          <span className="text-sm font-medium text-foreground">
            Your city
          </span>
        </div>
        
        {memberProfile?.city && !editingCity ? (
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border/50">
            <span className="font-medium">
              {memberProfile.city}{memberProfile.state ? `, ${memberProfile.state}` : ''}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              className="min-h-[44px] text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setEditingCity(true)}
            >
              Change
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <GooglePlacesAutocomplete
              value={cityInput}
              onChange={setCityInput}
              onPlaceSelect={handleCitySelect}
              placeholder="Search your city..."
              types="(cities)"
            />
            {editingCity && memberProfile?.city && (
              <Button 
                variant="ghost" 
                size="sm"
                className="min-h-[44px]"
                onClick={() => {
                  setEditingCity(false);
                  setCityInput('');
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
