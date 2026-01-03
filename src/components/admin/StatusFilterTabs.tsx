import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export type StatusFilter = 'all' | 'approved' | 'pending' | 'rejected';

interface StatusFilterTabsProps {
  activeStatus: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  counts: {
    all: number;
    approved: number;
    pending: number;
    rejected: number;
  };
}

const StatusFilterTabs = ({ activeStatus, onStatusChange, counts }: StatusFilterTabsProps) => {
  return (
    <Tabs value={activeStatus} onValueChange={(value) => onStatusChange(value as StatusFilter)}>
      <TabsList className="bg-muted/50">
        <TabsTrigger value="all" className="gap-2">
          All
          <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 min-w-[20px]">
            {counts.all}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="pending" className="gap-2">
          Pending
          {counts.pending > 0 && (
            <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30 text-xs px-1.5 py-0 h-5 min-w-[20px]">
              {counts.pending}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="approved" className="gap-2">
          Approved
          <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 min-w-[20px]">
            {counts.approved}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="rejected" className="gap-2">
          Rejected
          <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 min-w-[20px]">
            {counts.rejected}
          </Badge>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default StatusFilterTabs;
