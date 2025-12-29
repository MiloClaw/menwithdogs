import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { usePlaces } from '@/hooks/usePlaces';
import { useEvents } from '@/hooks/useEvents';

const DirectoryManagement = () => {
  const { places } = usePlaces();
  const { events } = useEvents();

  const approvedPlaces = places.filter(p => p.status === 'approved').length;
  const pendingPlaces = places.filter(p => p.status === 'pending').length;
  const approvedEvents = events.filter(e => e.status === 'approved').length;
  const pendingEvents = events.filter(e => e.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Directory Management</h1>
          <p className="text-muted-foreground">
            Manage places and events in the directory
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Places Card */}
          <Link to="/admin/directory/places">
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Places</CardTitle>
                      <CardDescription>Venues and locations</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div>
                    <p className="text-2xl font-bold">{approvedPlaces}</p>
                    <p className="text-sm text-muted-foreground">Approved</p>
                  </div>
                  {pendingPlaces > 0 && (
                    <div>
                      <p className="text-2xl font-bold text-amber-500">{pendingPlaces}</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Events Card */}
          <Link to="/admin/directory/events">
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Events</CardTitle>
                      <CardDescription>Activities and gatherings</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div>
                    <p className="text-2xl font-bold">{approvedEvents}</p>
                    <p className="text-sm text-muted-foreground">Approved</p>
                  </div>
                  {pendingEvents > 0 && (
                    <div>
                      <p className="text-2xl font-bold text-amber-500">{pendingEvents}</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DirectoryManagement;
