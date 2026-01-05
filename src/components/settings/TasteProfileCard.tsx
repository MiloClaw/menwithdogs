import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AffinityBar } from './AffinityBar';
import { useUserAffinity } from '@/hooks/useUserAffinity';

export function TasteProfileCard() {
  const navigate = useNavigate();
  const { affinities, isLoading, totalSignals, hasData } = useUserAffinity();

  // Only show top 4 categories
  const topAffinities = affinities.slice(0, 4);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-4 w-4" />
            Your Taste Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-4 w-4" />
            Your Taste Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground text-sm mb-4">
            Save a few places to see your preferences emerge naturally.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/places')}
            className="min-h-[44px]"
          >
            Explore Places →
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-4 w-4" />
          Your Taste Profile
        </CardTitle>
        <CardDescription>
          Based on {totalSignals} saved place{totalSignals !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {topAffinities.map(affinity => (
          <AffinityBar
            key={affinity.id}
            category={affinity.place_category}
            score={affinity.affinity_score}
            signalCount={affinity.supporting_signals_count || undefined}
          />
        ))}
      </CardContent>
    </Card>
  );
}
