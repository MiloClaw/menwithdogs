import { MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCouple } from '@/hooks/useCouple';

interface FavoritePlace {
  id: string;
  place_id: string;
  places: {
    name: string;
    city: string | null;
    state: string | null;
  } | null;
}

/**
 * Section 6: Places & Patterns (Read-Only)
 * Shows recently saved places and patterns, reinforces system intelligence
 */
export function PatternsSection() {
  const { couple } = useCouple();
  const coupleId = couple?.id;

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorite-places-with-details', coupleId],
    queryFn: async () => {
      if (!coupleId) return [];
      
      const { data, error } = await supabase
        .from('couple_favorites')
        .select('id, place_id, places:place_id(name, city, state)')
        .eq('couple_id', coupleId)
        .limit(5);
      
      if (error) throw error;
      return data as FavoritePlace[];
    },
    enabled: !!coupleId,
  });

  // Get up to 5 favorited places
  const recentFavorites = favorites || [];

  if (isLoading) {
    return (
      <section className="bg-muted/30 rounded-xl p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-16 w-full" />
      </section>
    );
  }

  if (recentFavorites.length === 0) {
    return (
      <section className="bg-muted/30 rounded-xl p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-muted-foreground/70" />
            <h3 className="text-base font-medium tracking-wide text-foreground">
              Places & Patterns
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Save some places to start building your pattern.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-muted/30 rounded-xl p-6 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="h-4 w-4 text-muted-foreground/70" />
          <h3 className="text-base font-medium tracking-wide text-foreground">
            Places & Patterns
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          These seem to be part of your regular routine.
        </p>
      </div>

      <div className="space-y-2">
        {recentFavorites.map((fav) => (
          <div 
            key={fav.id}
            className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border/50"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fav.places?.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {fav.places?.city}{fav.places?.state ? `, ${fav.places.state}` : ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" className="min-h-[44px] gap-2">
          <Check className="h-4 w-4" />
          Looks right
        </Button>
      </div>
    </section>
  );
}
