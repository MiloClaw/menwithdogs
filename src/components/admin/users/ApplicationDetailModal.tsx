import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Clock, Building, Mail, User, Calendar, Link2, CheckCircle, XCircle, UserX } from 'lucide-react';
import { format } from 'date-fns';
import type { AmbassadorApplication } from '@/hooks/useAmbassadorApplications';

const tenureLabels: Record<string, string> = {
  'less_than_1_year': 'Less than 1 year',
  '1_3_years': '1–3 years',
  '3_5_years': '3–5 years',
  '5_10_years': '5–10 years',
  '10_plus_years': '10+ years',
};

interface ApplicationDetailModalProps {
  application: AmbassadorApplication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
  onDecline: () => void;
  onRevoke: () => void;
}

export function ApplicationDetailModal({
  application,
  open,
  onOpenChange,
  onApprove,
  onDecline,
  onRevoke,
}: ApplicationDetailModalProps) {
  const isPending = application.status === 'pending';
  const isApproved = application.status === 'approved';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-serif text-xl">{application.name || 'Unnamed Applicant'}</span>
            {application.status === 'pending' && (
              <Badge variant="outline" className="border-amber-500/50 text-amber-600">
                <Clock className="w-3 h-3 mr-1" />Pending
              </Badge>
            )}
            {application.status === 'approved' && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />Approved
              </Badge>
            )}
            {application.status === 'declined' && (
              <Badge variant="secondary">
                <XCircle className="w-3 h-3 mr-1" />Declined
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {application.email}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Applied {format(new Date(application.created_at), 'MMM d, yyyy')}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Location & Tenure */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">City</label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{application.city_name}</span>
                {application.city_state && (
                  <span className="text-muted-foreground">, {application.city_state}</span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tenure</label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{tenureLabels[application.tenure] || application.tenure}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Specific Places - Highlighted */}
          <div className="space-y-2 bg-muted/30 rounded-lg p-4">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Local Places They'd Recommend (Trust Signal)
            </label>
            <p className="text-foreground whitespace-pre-wrap">{application.specific_places || '—'}</p>
          </div>

          {/* Motivation */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Why They Want to Help
            </label>
            <p className="text-foreground whitespace-pre-wrap">{application.motivation || '—'}</p>
          </div>

          {/* Business Affiliation */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4" />
              Business Affiliation
            </label>
            {application.has_business_affiliation ? (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-sm text-amber-800 dark:text-amber-200 mb-1 font-medium">Yes — has business ties</p>
                {application.business_affiliation_details && (
                  <p className="text-foreground whitespace-pre-wrap">{application.business_affiliation_details}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No business affiliations disclosed</p>
            )}
          </div>

          {/* Local Knowledge */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              General Local Knowledge
            </label>
            <p className="text-foreground whitespace-pre-wrap">{application.local_knowledge}</p>
          </div>

          {/* Social Links */}
          {application.social_links && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Social Links
              </label>
              <p className="text-foreground whitespace-pre-wrap">{application.social_links}</p>
            </div>
          )}

          {/* Review Info */}
          {application.reviewed_at && (
            <>
              <Separator />
              <div className="text-sm text-muted-foreground">
                Reviewed on {format(new Date(application.reviewed_at), 'MMM d, yyyy h:mm a')}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          
          {isPending && (
            <>
              <Button variant="destructive" onClick={onDecline}>
                <XCircle className="w-4 h-4 mr-2" />
                Decline
              </Button>
              <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve as Ambassador
              </Button>
            </>
          )}
          
          {isApproved && (
            <Button variant="destructive" onClick={onRevoke}>
              <UserX className="w-4 h-4 mr-2" />
              Revoke Ambassador Access
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
