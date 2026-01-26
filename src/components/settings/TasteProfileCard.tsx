import { useNavigate } from 'react-router-dom';
import { User, Users, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AffinityBar } from './AffinityBar';
import { useUserAffinity } from '@/hooks/useUserAffinity';
import { useCouple } from '@/hooks/useCouple';

export function TasteProfileCard() {
  const navigate = useNavigate();
  const { affinities, isLoading, hasData } = useUserAffinity();
  const { couple } = useCouple();
  
  const isCouple = couple?.type === 'couple';
  const UnitIcon = isCouple ? Users : User;

  // Only show top 4 categories
  const topAffinities = affinities.slice(0, 4);

  if (isLoading) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">
            Places you gravitate toward
          </h3>
        </div>
        <div className="space-y-3 py-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!hasData) {
    return (
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">
          Places you gravitate toward
        </h3>
        <div className="py-4 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Save a few spots to see patterns emerge.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/places')}
            className="min-h-[44px] gap-1"
          >
            Explore Outdoors
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">
          Places you gravitate toward
        </h3>
        <Badge variant="outline" className="gap-1.5 text-xs font-normal text-muted-foreground border-muted">
          <UnitIcon className="h-3 w-3" />
          {isCouple ? 'Shared' : 'Personal'}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Based on what you've saved and viewed.
      </p>
      <div className="space-y-3 py-1">
        {topAffinities.map(affinity => (
          <AffinityBar
            key={affinity.id}
            category={affinity.place_category}
            score={affinity.affinity_score}
          />
        ))}
      </div>
    </section>
  );
}
