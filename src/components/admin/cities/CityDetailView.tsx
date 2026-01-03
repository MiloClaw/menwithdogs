import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Rocket, Pause, Play, Pencil, MapPin, Building2, 
  CheckCircle2, Clock, Sparkles, AlertCircle, Plus, Wand2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CityWithProgress } from '@/hooks/useCities';
import { useLaunchCity, usePauseCity, useResumeCity } from '@/hooks/useCities';
import { CitySeedWizard } from './CitySeedWizard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CityDetailViewProps {
  city: CityWithProgress;
  onEdit: () => void;
}

export function CityDetailView({ city, onEdit }: CityDetailViewProps) {
  const [seedWizardOpen, setSeedWizardOpen] = useState(false);
  
  const launchCity = useLaunchCity();
  const pauseCity = usePauseCity();
  const resumeCity = useResumeCity();

  const handleLaunch = () => {
    launchCity.mutate(city.id);
  };

  const handlePause = () => {
    pauseCity.mutate(city.id);
  };

  const handleResume = () => {
    resumeCity.mutate(city.id);
  };

  const canSeed = city.lat != null && city.lng != null;

  const getStatusBadge = () => {
    switch (city.status) {
      case 'launched':
        return (
          <Badge className="bg-green-600 text-white">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Launched
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            <Pause className="h-3 w-3 mr-1" />
            Paused
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">{city.name}</h2>
            {city.is_ready_to_launch && city.status === 'draft' && (
              <Sparkles className="h-5 w-5 text-amber-500" />
            )}
          </div>
          <p className="text-muted-foreground">
            {city.state ? `${city.state}, ${city.country}` : city.country}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Seeding Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{city.completion_percentage}%</span>
            <span className="text-sm text-muted-foreground">
              {city.approved_place_count} / {city.target_place_count} places
            </span>
          </div>
          <Progress value={city.completion_percentage} className="h-3" />
          
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-xl font-semibold text-green-600">{city.approved_place_count}</div>
              <div className="text-xs text-muted-foreground">Approved</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-xl font-semibold text-orange-600">{city.pending_place_count}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-xl font-semibold text-primary">{city.curated_place_count}</div>
              <div className="text-xs text-muted-foreground">Curated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Targets Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Targets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium">{city.target_place_count}</div>
                <div className="text-sm text-muted-foreground">Total Places</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium">{city.target_anchor_count}</div>
                <div className="text-sm text-muted-foreground">Anchor Venues</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Launch Info */}
      {city.launched_at && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Rocket className="h-4 w-4" />
              <span>Launched {new Date(city.launched_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {city.status === 'draft' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                disabled={!city.is_ready_to_launch || launchCity.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Rocket className="h-4 w-4 mr-2" />
                {launchCity.isPending ? 'Launching...' : 'Launch City'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Launch {city.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will make {city.name} visible to users. The city has {city.approved_place_count} approved places.
                  {city.pending_place_count > 0 && (
                    <span className="block mt-2 text-orange-600">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      {city.pending_place_count} places are still pending review.
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLaunch} className="bg-green-600 hover:bg-green-700">
                  Launch
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {city.status === 'launched' && (
          <Button 
            variant="outline" 
            onClick={handlePause}
            disabled={pauseCity.isPending}
          >
            <Pause className="h-4 w-4 mr-2" />
            {pauseCity.isPending ? 'Pausing...' : 'Pause City'}
          </Button>
        )}

        {city.status === 'paused' && (
          <Button 
            onClick={handleResume}
            disabled={resumeCity.isPending}
          >
            <Play className="h-4 w-4 mr-2" />
            {resumeCity.isPending ? 'Resuming...' : 'Resume City'}
          </Button>
        )}

        <Button variant="outline" asChild>
          <Link to={`/admin/directory/places?city=${encodeURIComponent(city.name)}`}>
            <MapPin className="h-4 w-4 mr-2" />
            View Places
          </Link>
        </Button>

        <Button asChild>
          <Link 
            to={`/admin/directory/places?city=${encodeURIComponent(city.name)}&action=create${city.lat && city.lng ? `&lat=${city.lat}&lng=${city.lng}` : ''}`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Place
          </Link>
        </Button>

        {canSeed && (
          <Button
            variant="outline"
            onClick={() => setSeedWizardOpen(true)}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Seed City
          </Button>
        )}
      </div>

      {/* Seed Wizard */}
      {canSeed && (
        <CitySeedWizard
          open={seedWizardOpen}
          onOpenChange={setSeedWizardOpen}
          cityId={city.id}
          cityName={city.name}
          lat={city.lat!}
          lng={city.lng!}
        />
      )}
    </div>
  );
}
