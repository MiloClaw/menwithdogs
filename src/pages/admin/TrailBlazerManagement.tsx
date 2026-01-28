import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Compass, FileText, Shield, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { SubmissionListPane } from '@/components/admin/trail-blazer/SubmissionListPane';
import { SubmissionDetailPane } from '@/components/admin/trail-blazer/SubmissionDetailPane';
import { PermissionsPane } from '@/components/admin/trail-blazer/PermissionsPane';
import { useTrailBlazerSubmissions, type TrailBlazerSubmission } from '@/hooks/useTrailBlazerSubmissions';
import { useTrailBlazerPermissions } from '@/hooks/useTrailBlazerPermissions';
import type { SubmissionStatus } from '@/lib/context-type-options';

const TrailBlazerManagement = () => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'permissions'>('submissions');
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<TrailBlazerSubmission | null>(null);

  const { 
    submissions, 
    loading: submissionsLoading, 
    stats, 
    approveSubmission,
    requestRevision,
    declineSubmission,
  } = useTrailBlazerSubmissions(statusFilter);

  const {
    ambassadors,
    loading: permissionsLoading,
    toggleExternalLinks,
    updateNotes,
  } = useTrailBlazerPermissions();

  const handleApprove = async (stripLink: boolean) => {
    if (!selectedSubmission) return;
    await approveSubmission(selectedSubmission.id, stripLink);
    setSelectedSubmission(null);
  };

  const handleRequestRevision = async (feedback: string) => {
    if (!selectedSubmission) return;
    await requestRevision(selectedSubmission.id, feedback);
    setSelectedSubmission(null);
  };

  const handleDecline = async (notes?: string) => {
    if (!selectedSubmission) return;
    await declineSubmission(selectedSubmission.id, notes);
    setSelectedSubmission(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Compass className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Trail Blazers</h1>
            <p className="text-muted-foreground">Review content submissions and manage permissions</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:border-primary/50" onClick={() => setStatusFilter('pending')}>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50" onClick={() => setStatusFilter('approved')}>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.approved}</div>
                <div className="text-xs text-muted-foreground">Approved</div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50" onClick={() => setStatusFilter('needs_revision')}>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.needs_revision}</div>
                <div className="text-xs text-muted-foreground">Needs Revision</div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50" onClick={() => setStatusFilter('declined')}>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.declined}</div>
                <div className="text-xs text-muted-foreground">Declined</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'submissions' | 'permissions')}>
          <TabsList>
            <TabsTrigger value="submissions" className="gap-2">
              <FileText className="h-4 w-4" />
              Content Submissions
              {stats.pending > 0 && (
                <Badge variant="secondary" className="ml-1">{stats.pending}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2">
              <Shield className="h-4 w-4" />
              Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submissions" className="mt-4">
            {/* Status Filter */}
            <div className="flex gap-2 mb-4">
              <Badge 
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setStatusFilter('all')}
              >
                All ({stats.total})
              </Badge>
              <Badge 
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setStatusFilter('pending')}
              >
                Pending ({stats.pending})
              </Badge>
              <Badge 
                variant={statusFilter === 'approved' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setStatusFilter('approved')}
              >
                Approved ({stats.approved})
              </Badge>
              <Badge 
                variant={statusFilter === 'needs_revision' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setStatusFilter('needs_revision')}
              >
                Needs Revision ({stats.needs_revision})
              </Badge>
              <Badge 
                variant={statusFilter === 'declined' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setStatusFilter('declined')}
              >
                Declined ({stats.declined})
              </Badge>
            </div>

            {/* Master-Detail Layout */}
            <div className="border rounded-lg bg-card overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x min-h-[600px]">
                {/* List */}
                <SubmissionListPane
                  submissions={submissions}
                  loading={submissionsLoading}
                  onSelect={setSelectedSubmission}
                  selectedId={selectedSubmission?.id}
                />

                {/* Detail */}
                {selectedSubmission ? (
                  <SubmissionDetailPane
                    submission={selectedSubmission}
                    onApprove={handleApprove}
                    onRequestRevision={handleRequestRevision}
                    onDecline={handleDecline}
                    onClose={() => setSelectedSubmission(null)}
                  />
                ) : (
                  <div className="flex items-center justify-center p-8 text-muted-foreground">
                    Select a submission to review
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="mt-4">
            <div className="border rounded-lg bg-card overflow-hidden min-h-[600px]">
              <PermissionsPane
                ambassadors={ambassadors}
                loading={permissionsLoading}
                onToggleExternalLinks={toggleExternalLinks}
                onUpdateNotes={updateNotes}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default TrailBlazerManagement;
