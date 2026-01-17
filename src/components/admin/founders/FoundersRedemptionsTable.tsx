import { useState } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { FoundersRedemption, FoundersCityOffer } from '@/hooks/useFoundersManagement';

interface FoundersRedemptionsTableProps {
  redemptions: FoundersRedemption[];
  cities: FoundersCityOffer[];
  isLoading: boolean;
}

export function FoundersRedemptionsTable({
  redemptions,
  cities,
  isLoading,
}: FoundersRedemptionsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');

  const filteredRedemptions = redemptions.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cityName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = cityFilter === 'all' || r.cityId === cityFilter;

    return matchesSearch && matchesCity;
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city.cityId} value={city.cityId}>
                {city.cityName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredRedemptions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {redemptions.length === 0 ? (
            <>
              <p>No founders redemptions yet.</p>
              <p className="text-sm mt-1">Redemptions will appear here when users claim offers.</p>
            </>
          ) : (
            <p>No redemptions match your filters.</p>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Redeemed</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRedemptions.map((redemption) => (
                <TableRow key={redemption.id}>
                  <TableCell>
                    <p className="font-medium">
                      {redemption.userEmail || 'Unknown user'}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {redemption.userId.slice(0, 8)}...
                    </p>
                  </TableCell>
                  <TableCell>
                    {redemption.cityName ? (
                      <div>
                        <p>{redemption.cityName}</p>
                        {redemption.cityState && (
                          <p className="text-sm text-muted-foreground">
                            {redemption.cityState}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {redemption.redeemedAt ? (
                      <div>
                        <p>{format(new Date(redemption.redeemedAt), 'MMM d, yyyy')}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(redemption.redeemedAt), 'h:mm a')}
                        </p>
                      </div>
                    ) : redemption.createdAt ? (
                      <div>
                        <p>{format(new Date(redemption.createdAt), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-muted-foreground">Created</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {redemption.stripeSubscriptionId ? (
                      <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                        Subscribed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredRedemptions.length} of {redemptions.length} redemptions
      </p>
    </div>
  );
}
