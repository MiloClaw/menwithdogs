import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Copy, MoreHorizontal, Pause, Play, RefreshCw, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FoundersCityOffer } from '@/hooks/useFoundersManagement';
import { PromoCodeStatusBadge } from './PromoCodeStatusBadge';

interface FoundersCitiesTableProps {
  cities: FoundersCityOffer[];
  isLoading: boolean;
  onPause: (promoCodeId: string) => void;
  onResume: (promoCodeId: string) => void;
  onSync: (promoCodeId: string, cityId: string) => void;
  isPausing: boolean;
  isResuming: boolean;
  isSyncing: boolean;
}

export function FoundersCitiesTable({
  cities,
  isLoading,
  onPause,
  onResume,
  onSync,
  isPausing,
  isResuming,
  isSyncing,
}: FoundersCitiesTableProps) {
  const { toast } = useToast();
  const [activeStatuses, setActiveStatuses] = useState<Record<string, boolean>>({});

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copied!', description: `${code} copied to clipboard` });
  };

  const getSlotPercentage = (used: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (cities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No cities with founders offers yet.</p>
        <p className="text-sm mt-1">Launch a city to create a founders promo code.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>City</TableHead>
            <TableHead>Promo Code</TableHead>
            <TableHead>Slots</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cities.map((city) => {
            const percentage = getSlotPercentage(city.slotsUsed, city.slotsTotal);
            const isActive = activeStatuses[city.promoCodeId] ?? true;
            const isSoldOut = city.slotsUsed >= city.slotsTotal;

            return (
              <TableRow key={city.cityId}>
                <TableCell>
                  <div>
                    <p className="font-medium">{city.cityName}</p>
                    {city.state && (
                      <p className="text-sm text-muted-foreground">{city.state}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                      {city.promoCode}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => copyPromoCode(city.promoCode)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1.5 min-w-[120px]">
                    <div className="flex items-center justify-between text-sm">
                      <span>{city.slotsUsed}/{city.slotsTotal}</span>
                      <span className="text-muted-foreground">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                </TableCell>
                <TableCell>
                  <PromoCodeStatusBadge
                    slotsUsed={city.slotsUsed}
                    slotsTotal={city.slotsTotal}
                    isActive={isActive}
                  />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!isSoldOut && (
                        isActive ? (
                          <DropdownMenuItem
                            onClick={() => {
                              onPause(city.promoCodeId);
                              setActiveStatuses(prev => ({ ...prev, [city.promoCodeId]: false }));
                            }}
                            disabled={isPausing}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Pause Code
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => {
                              onResume(city.promoCodeId);
                              setActiveStatuses(prev => ({ ...prev, [city.promoCodeId]: true }));
                            }}
                            disabled={isResuming}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Resume Code
                          </DropdownMenuItem>
                        )
                      )}
                      <DropdownMenuItem
                        onClick={() => onSync(city.promoCodeId, city.cityId)}
                        disabled={isSyncing}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync from Stripe
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a
                          href={`https://dashboard.stripe.com/promotion_codes/${city.promoCodeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View in Stripe
                        </a>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
