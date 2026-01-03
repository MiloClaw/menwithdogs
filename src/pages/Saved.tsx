import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, MapPin, Calendar, Bookmark } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePlaceFavorites } from '@/hooks/usePlaceFavorites';
import { useEventFavorites } from '@/hooks/useEventFavorites';
import { useCouple } from '@/hooks/useCouple';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DirectoryPlaceCard, { DirectoryPlace } from '@/components/directory/DirectoryPlaceCard';
import DirectoryEventCard from '@/components/directory/DirectoryEventCard';
import PlaceDetailModal from '@/components/directory/PlaceDetailModal';
import EventDetailModal from '@/components/directory/EventDetailModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { PublicEvent } from '@/hooks/useEventsPublic';

const Saved = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { couple, loading: coupleLoading } = useCouple();
  const { favorites: placeFavorites, isLoading: placeFavLoading } = usePlaceFavorites();
  const { favorites: eventFavorites, isLoading: eventFavLoading } = useEventFavorites();

  const [selectedPlace, setSelectedPlace] = useState<DirectoryPlace | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null);
  const [activeTab, setActiveTab] = useState('places');

  // Fetch saved places
  const { data: savedPlaces = [], isLoading: placesLoading } = useQuery({
    queryKey: ['saved-places', placeFavorites.map(f => f.place_id)],
    queryFn: async () => {
      if (placeFavorites.length === 0) return [];
      
      const placeIds = placeFavorites.map(f => f.place_id);
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .in('id', placeIds);

      if (error) throw error;
      return data as DirectoryPlace[];
    },
    enabled: !placeFavLoading && placeFavorites.length > 0,
  });

  // Fetch saved events with venue details
  const { data: savedEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['saved-events', eventFavorites.map(f => f.event_id)],
    queryFn: async () => {
      if (eventFavorites.length === 0) return [];
      
      const eventIds = eventFavorites.map(f => f.event_id);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          venue:places!events_venue_place_id_fkey(
            id, name, city, state, formatted_address, lat, lng
          )
        `)
        .in('id', eventIds)
        .order('start_at', { ascending: true });

      if (error) throw error;
      return data as PublicEvent[];
    },
    enabled: !eventFavLoading && eventFavorites.length > 0,
  });

  // Redirect to auth if not authenticated
  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const isLoading = authLoading || coupleLoading || placeFavLoading || eventFavLoading;

  const EmptyState = ({ type }: { type: 'places' | 'events' }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {type === 'places' ? (
          <MapPin className="h-8 w-8 text-muted-foreground" />
        ) : (
          <Calendar className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <h3 className="font-semibold text-lg mb-2">
        No saved {type} yet
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {type === 'places' 
          ? 'Browse the directory to find great date spots and save your favorites.'
          : 'Check out upcoming events in your area and save the ones you like.'
        }
      </p>
      <Button asChild>
        <Link to="/places">
          Browse {type === 'places' ? 'Places' : 'Events'}
        </Link>
      </Button>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-64 w-full rounded-lg" />
      ))}
    </div>
  );

  return (
    <PageLayout>
      <div className="container py-8 md:py-12">
        <PageHeader
          title="Saved"
          subtitle="Your favorite places and upcoming events"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="places" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Places ({savedPlaces.length})
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events ({savedEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="places" className="mt-6">
            {isLoading || placesLoading ? (
              <LoadingSkeleton />
            ) : savedPlaces.length === 0 ? (
              <EmptyState type="places" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedPlaces.map(place => (
                  <DirectoryPlaceCard
                    key={place.id}
                    place={place}
                    onClick={() => setSelectedPlace(place)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            {isLoading || eventsLoading ? (
              <LoadingSkeleton />
            ) : savedEvents.length === 0 ? (
              <EmptyState type="events" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedEvents.map(event => (
                  <DirectoryEventCard
                    key={event.id}
                    event={event}
                    onClick={() => setSelectedEvent(event)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Modals */}
      <PlaceDetailModal
        place={selectedPlace}
        open={!!selectedPlace}
        onOpenChange={(open) => !open && setSelectedPlace(null)}
      />
      <EventDetailModal
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      />
    </PageLayout>
  );
};

export default Saved;
