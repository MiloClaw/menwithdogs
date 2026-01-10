import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { LayoutGrid, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

interface CategoryHealthCardProps {
  categories: CategoryBreakdown[];
  totalPlaces: number;
  isLoading?: boolean;
}

// Warm, earthy color palette that feels intentional
const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(220 14% 60%)',
  'hsl(220 14% 70%)',
  'hsl(220 14% 80%)',
];

const CategoryHealthCard = ({ categories, totalPlaces, isLoading }: CategoryHealthCardProps) => {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Category Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Skeleton className="h-28 w-28 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topCategories = categories.slice(0, 6);
  const otherCategories = categories.slice(6);
  const otherCount = otherCategories.reduce((sum, c) => sum + c.count, 0);
  const otherPercentage = otherCategories.reduce((sum, c) => sum + c.percentage, 0);

  const chartData = [
    ...topCategories.map(c => ({
      name: c.category,
      value: c.count,
      percentage: c.percentage,
    })),
    ...(otherCount > 0 ? [{
      name: 'Other',
      value: otherCount,
      percentage: otherPercentage,
    }] : []),
  ];

  // Find categories with very few places (potential gaps)
  const sparseCategories = categories.filter(c => c.count <= 3 && c.count > 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <LayoutGrid className="h-4 w-4" />
          Category Health
          <Badge variant="secondary" className="ml-auto text-xs">
            {categories.length} types
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          {/* Donut Chart */}
          <div className="w-28 h-28 shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={48}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border rounded-md shadow-md px-2 py-1 text-xs">
                        <span className="font-medium">{data.name}</span>
                        <span className="text-muted-foreground ml-2">
                          {data.value} ({data.percentage.toFixed(0)}%)
                        </span>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold">{totalPlaces}</span>
              <span className="text-[10px] text-muted-foreground">places</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {chartData.slice(0, 5).map((item, index) => (
              <div 
                key={item.name}
                className="flex items-center gap-2 text-xs"
              >
                <div 
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="truncate flex-1 text-muted-foreground">
                  {item.name}
                </span>
                <span className="tabular-nums font-medium shrink-0">
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
            ))}
            {chartData.length > 5 && (
              <div className="text-xs text-muted-foreground pt-1">
                +{chartData.length - 5} more categories
              </div>
            )}
          </div>
        </div>

        {/* Sparse categories alert */}
        {sparseCategories.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-start gap-2 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-muted-foreground">
                  {sparseCategories.length} {sparseCategories.length === 1 ? 'category has' : 'categories have'} ≤3 places:
                </span>
                <span className="font-medium ml-1">
                  {sparseCategories.slice(0, 3).map(c => c.category).join(', ')}
                  {sparseCategories.length > 3 && ` +${sparseCategories.length - 3} more`}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryHealthCard;
