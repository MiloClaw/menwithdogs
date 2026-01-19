import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Calendar } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { usePlaceFavorites } from '@/hooks/usePlaceFavorites';
import { useEventFavorites } from '@/hooks/useEventFavorites';
import { useCouple } from '@/hooks/useCouple';
import PageLayout from '@/components/PageLayout';
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

  // Hero parallax ref and scroll transform
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const ghostY = useTransform(scrollYProgress, [0, 1], [0, 150]);

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
            id, name, city, state, formatted_address, lat, lng, photos
          )
        `)
        .in('id', eventIds)
        .order('start_at', { ascending: true });

      if (error) throw error;
      return data as unknown as PublicEvent[];
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
          ? 'Browse the directory to find great local spots and save your favorites.'
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
      <div className="container space-y-8">
        {/* Editorial Hero Section with Ghost Typography */}
        <section 
          ref={heroRef}
          className="relative py-16 md:py-20 lg:py-24 overflow-hidden -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8"
        >
          {/* Ghost Parallax Element */}
          <motion.div
            style={{ y: ghostY }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          >
            <span className="text-[16rem] md:text-[22rem] font-serif font-bold text-foreground/[0.03] leading-none">
              ♥
            </span>
          </motion.div>
          
          <div className="relative z-10 max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4"
            >
              Your Collection
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight mb-4 text-balance"
            >
              Saved
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty"
            >
              Your favorite places and upcoming events.
            </motion.p>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
