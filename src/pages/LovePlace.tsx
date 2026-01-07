import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, MapPin, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePlaceFavorites } from '@/hooks/usePlaceFavorites';
import { toast } from 'sonner';

interface PlacePreview {
  id: string;
  name: string;
  primary_category: string;
  city: string | null;
  state: string | null;
  stored_photo_urls: string[] | null;
}

const LovePlace = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addFavorite, isFavorited, isLoading: favoritesLoading } = usePlaceFavorites();
  
  const [place, setPlace] = useState<PlacePreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch place details
  useEffect(() => {
    if (!placeId) {
      setError('Invalid place');
      setIsLoading(false);
      return;
    }

    const fetchPlace = async () => {
      const { data, error } = await supabase
        .from('places')
        .select('id, name, primary_category, city, state, stored_photo_urls')
        .eq('id', placeId)
        .eq('status', 'approved')
        .single();

      if (error || !data) {
        setError('Place not found');
        setIsLoading(false);
        return;
      }

      setPlace(data);
      setIsLoading(false);
    };

    fetchPlace();
  }, [placeId]);

  // Handle the "Love This Place" action
  const handleLovePlace = async () => {
    if (!placeId) return;

    if (isAuthenticated) {
      // User is logged in - save immediately
      if (isFavorited(placeId)) {
        toast.info('Already saved!', { description: 'This place is in your favorites.' });
        navigate('/saved');
        return;
      }

      setIsSaving(true);
      try {
        await addFavorite(placeId);
        toast.success('Saved!', { description: `${place?.name} added to your favorites.` });
        navigate('/saved');
      } catch (err) {
        console.error('Failed to save:', err);
        toast.error('Something went wrong');
      } finally {
        setIsSaving(false);
      }
    } else {
      // Not logged in - store intent and redirect to signup
      sessionStorage.setItem('pending_favorite_place_id', placeId);
      navigate('/auth?mode=signup');
    }
  };

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error || !place) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4">
          <Link to="/" className="text-xl font-serif font-semibold text-primary">
            MainStreetIRL
          </Link>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <p className="text-lg font-medium text-foreground mb-2">Place not found</p>
          <p className="text-sm text-muted-foreground mb-6">
            This place may have been removed or the link is invalid.
          </p>
          <Button variant="outline" onClick={() => navigate('/places')}>
            Explore Places
          </Button>
        </main>
      </div>
    );
  }

  // Get photo URL
  const photoUrl = place.stored_photo_urls?.[0] || null;
  const location = [place.city, place.state].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section with Photo */}
      <div className="relative h-[50vh] min-h-[300px] bg-muted">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={place.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10" />
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Back button */}
        <Link 
          to="/places" 
          className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        
        {/* Brand */}
        <div className="absolute top-4 right-4">
          <Link to="/" className="text-lg font-serif font-semibold text-foreground bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
            MainStreetIRL
          </Link>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col px-6 py-8 -mt-20 relative">
        <div className="max-w-md mx-auto w-full space-y-6">
          {/* Place Info */}
          <div className="space-y-2 text-center">
            <p className="text-sm font-medium text-primary uppercase tracking-wide">
              {place.primary_category}
            </p>
            <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground">
              {place.name}
            </h1>
            {location && (
              <p className="text-muted-foreground flex items-center justify-center gap-1">
                <MapPin className="h-4 w-4" />
                {location}
              </p>
            )}
          </div>

          {/* CTA Button */}
          <Button
            size="lg"
            className="w-full h-14 text-lg gap-2"
            onClick={handleLovePlace}
            disabled={isSaving || favoritesLoading}
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Heart className="h-5 w-5" />
            )}
            I Love This Place
          </Button>

          {/* Subtext */}
          <p className="text-center text-sm text-muted-foreground leading-relaxed">
            {isAuthenticated 
              ? 'Save this place to your favorites and discover more hidden gems.'
              : 'Sign up to save this and discover more hidden gems in your city.'
            }
          </p>

          {/* Privacy note for non-authenticated */}
          {!isAuthenticated && (
            <div className="bg-surface rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground">
                No public profile required. Your saves stay private.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LovePlace;
