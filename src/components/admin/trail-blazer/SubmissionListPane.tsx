import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Search, ExternalLink, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { getContextTypeLabel, SUBMISSION_STATUS_CONFIG } from '@/lib/context-type-options';
import type { TrailBlazerSubmission } from '@/hooks/useTrailBlazerSubmissions';
import { useState, useMemo } from 'react';

interface SubmissionListPaneProps {
  submissions: TrailBlazerSubmission[];
  loading: boolean;
  onSelect: (submission: TrailBlazerSubmission) => void;
  selectedId?: string;
}

export function SubmissionListPane({ submissions, loading, onSelect, selectedId }: SubmissionListPaneProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return submissions;
    const q = search.toLowerCase();
    return submissions.filter(s => 
      s.place_name.toLowerCase().includes(q) ||
      s.context_text.toLowerCase().includes(q)
    );
  }, [submissions, search]);

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by place name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No submissions found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Place</TableHead>
                <TableHead>Context Types</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(submission => {
                const statusConfig = SUBMISSION_STATUS_CONFIG[submission.status];
                const isSelected = submission.id === selectedId;
                
                return (
                  <TableRow 
                    key={submission.id}
                    className={isSelected ? 'bg-muted/50' : 'cursor-pointer hover:bg-muted/30'}
                    onClick={() => onSelect(submission)}
                  >
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium truncate flex items-center gap-1">
                            {submission.place_name}
                            {submission.has_external_link && (
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          {submission.place_address && (
                            <div className="text-xs text-muted-foreground truncate">
                              {submission.place_address}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {submission.context_types.slice(0, 2).map(type => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {getContextTypeLabel(type)}
                          </Badge>
                        ))}
                        {submission.context_types.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{submission.context_types.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig.variant}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(submission.submitted_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => onSelect(submission)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
