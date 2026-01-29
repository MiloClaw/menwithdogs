import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, MapPin, ArrowLeft, Loader2, Check, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePlaceFavorites } from '@/hooks/usePlaceFavorites';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import SEOHead from '@/components/SEOHead';

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
  const [relatedPlaces, setRelatedPlaces] = useState<PlacePreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch place details and related places
  useEffect(() => {
    if (!placeId) {
      setError('Invalid place');
      setIsLoading(false);
      return;
    }

    const fetchPlaceData = async () => {
      // Fetch main place
      const { data: placeData, error: placeError } = await supabase
        .from('places')
        .select('id, name, primary_category, city, state, stored_photo_urls')
        .eq('id', placeId)
        .eq('status', 'approved')
        .single();

      if (placeError || !placeData) {
        setError('Place not found');
        setIsLoading(false);
        return;
      }

      setPlace(placeData);

      // Fetch related places from same city (for teaser)
      if (placeData.city) {
        const { data: related } = await supabase
          .from('places')
          .select('id, name, primary_category, city, state, stored_photo_urls')
          .eq('status', 'approved')
          .eq('city', placeData.city)
          .neq('id', placeId)
          .limit(3);

        if (related) {
          setRelatedPlaces(related);
        }
      }

      setIsLoading(false);
    };

    fetchPlaceData();
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

  // Handle clicking on a related place teaser
  const handleRelatedPlaceClick = (relatedPlaceId: string) => {
    if (isAuthenticated) {
      navigate(`/love/${relatedPlaceId}`);
    } else {
      sessionStorage.setItem('pending_favorite_place_id', relatedPlaceId);
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

  // Build directory preview link
  const directoryLink = place.city && place.state 
    ? `/places?city=${encodeURIComponent(place.city)}&state=${encodeURIComponent(place.state)}`
    : '/places';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={place.name}
        description={`Discover ${place.name}${location ? ` in ${location}` : ''} - ${place.primary_category} on ThickTimber.`}
        canonicalPath={`/love/${place.id}`}
        ogImage={photoUrl || undefined}
      />
      {/* Hero Section with Photo */}
      <div className="relative h-[45vh] min-h-[280px] bg-muted">
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
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
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
      <main className="flex-1 flex flex-col px-6 py-8 -mt-16 relative">
        <div className="max-w-md mx-auto w-full space-y-6">
          {/* Place Info */}
          <motion.div 
            className="space-y-2 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
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
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
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
          </motion.div>

          {/* Subtext */}
          <motion.p 
            className="text-center text-sm text-muted-foreground leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {isAuthenticated 
              ? 'Save this place to your favorites and discover more hidden gems.'
              : 'Sign up to save this and discover more hidden gems in your city.'
            }
          </motion.p>

          {/* Value Props for non-authenticated users */}
          {!isAuthenticated && (
            <motion.div 
              className="bg-surface rounded-xl p-5 space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="space-y-2">
                <ValuePropItem text="Free forever" />
                <ValuePropItem text="No public profile" />
                <ValuePropItem text="30 seconds to join" />
              </div>
            </motion.div>
          )}

          {/* Related Places Teaser */}
          {relatedPlaces.length > 0 && (
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <p className="text-sm font-medium text-muted-foreground text-center">
                More spots in {place.city}
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                {relatedPlaces.map((related) => (
                  <RelatedPlaceCard
                    key={related.id}
                    place={related}
                    onClick={() => handleRelatedPlaceClick(related.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Directory Preview Link */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Link 
              to={directoryLink}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Eye className="h-4 w-4" />
              Preview the directory
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

// Value proposition item component
const ValuePropItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2 text-sm">
    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
      <Check className="h-3 w-3 text-primary" />
    </div>
    <span className="text-foreground">{text}</span>
  </div>
);

// Related place teaser card component
const RelatedPlaceCard = ({ 
  place, 
  onClick 
}: { 
  place: PlacePreview; 
  onClick: () => void;
}) => {
  const photoUrl = place.stored_photo_urls?.[0] || null;
  
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-28 text-left group"
    >
      <div className="aspect-square w-full rounded-lg bg-muted overflow-hidden mb-1.5">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20" />
        )}
      </div>
      <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
        {place.name}
      </p>
      <p className="text-xs text-muted-foreground truncate">
        {place.primary_category}
      </p>
    </button>
  );
};

export default LovePlace;
