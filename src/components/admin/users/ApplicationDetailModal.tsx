import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Building, Mail, User, Calendar, Link2, CheckCircle, XCircle, UserX, ExternalLink, FileText, Camera, Video, BookOpen, Pen, Mountain, Tent, Waves, Bike, Car, Trees, Check } from 'lucide-react';
import { format } from 'date-fns';
import type { AmbassadorApplication } from '@/hooks/useAmbassadorApplications';
import { ROLE_TYPES, EXPERTISE_AREAS, CONTENT_TYPES } from '@/lib/trail-blazer-options';

const tenureLabels: Record<string, string> = {
  'less_than_1_year': 'Less than 1 year',
  '1_3_years': '1–3 years',
  '3_5_years': '3–5 years',
  '5_10_years': '5–10 years',
  '10_plus_years': '10+ years',
  'not_applicable': 'Not specified',
};

// Map content types to icons
const contentTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  article_essay: FileText,
  guide_resource: BookOpen,
  photography: Camera,
  video_multimedia: Video,
  field_notes: Pen,
  other: FileText,
};

// Map expertise areas to icons
const expertiseIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  hiking_trails: Mountain,
  camping_backcountry: Tent,
  beaches_water: Waves,
  trail_running: Mountain,
  cycling: Bike,
  overland_remote: Car,
  urban_outdoor: Trees,
  other: MapPin,
};

function getRoleLabel(value: string): string {
  return ROLE_TYPES.find(r => r.value === value)?.label || value;
}

function getExpertiseLabel(value: string): string {
  return EXPERTISE_AREAS.find(e => e.value === value)?.label || value;
}

function getContentTypeLabel(value: string): string {
  return CONTENT_TYPES.find(c => c.value === value)?.label || value;
}

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

  const hasStructuredData = !!(
    application.identity_signals ||
    application.expertise_signals ||
    (application.portfolio_links && application.portfolio_links.length > 0) ||
    (application.place_references && application.place_references.length > 0) ||
    application.acknowledgements
  );

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

          {/* Trail Blazer Structured Fields (when present) */}
          {hasStructuredData && (
            <>
              <Separator />

              {/* Identity & Role */}
              {application.identity_signals && application.identity_signals.role_types?.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Identity & Role
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {application.identity_signals.role_types.map(role => (
                      <Badge key={role} variant="secondary">
                        {getRoleLabel(role)}
                      </Badge>
                    ))}
                  </div>
                  {application.identity_signals.other_role_description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Other: "{application.identity_signals.other_role_description}"
                    </p>
                  )}
                </div>
              )}

              {/* Expertise Areas */}
              {application.expertise_signals && application.expertise_signals.expertise_areas?.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Expertise Areas
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {application.expertise_signals.expertise_areas.map(area => {
                      const IconComponent = expertiseIcons[area] || MapPin;
                      return (
                        <Badge key={area} variant="outline" className="gap-1">
                          <IconComponent className="h-3 w-3" />
                          {getExpertiseLabel(area)}
                        </Badge>
                      );
                    })}
                  </div>
                  {application.expertise_signals.other_expertise_description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Other: "{application.expertise_signals.other_expertise_description}"
                    </p>
                  )}
                </div>
              )}

              {/* Portfolio Links */}
              {application.portfolio_links && application.portfolio_links.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Portfolio Links (Trust Signal)
                  </label>
                  <Card className="bg-muted/30">
                    <CardContent className="p-3 space-y-3">
                      {application.portfolio_links.map((link, index) => {
                        const IconComponent = contentTypeIcons[link.content_type] || FileText;
                        return (
                          <div key={link.id} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground w-4">{index + 1}.</span>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1 text-sm truncate max-w-[300px]"
                              >
                                {link.url}
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              </a>
                              <Badge variant="outline" className="gap-1 text-xs">
                                <IconComponent className="h-3 w-3" />
                                {getContentTypeLabel(link.content_type)}
                              </Badge>
                            </div>
                            {link.notes && (
                              <p className="text-xs text-muted-foreground ml-6">"{link.notes}"</p>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Place References */}
              {application.place_references && application.place_references.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Place References
                  </label>
                  <div className="space-y-2">
                    {application.place_references.map(place => (
                      <Card key={place.id} className="bg-muted/20">
                        <CardContent className="p-3 flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-primary mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">{place.place_name}</div>
                            {place.formatted_address && (
                              <div className="text-xs text-muted-foreground">{place.formatted_address}</div>
                            )}
                            <Badge variant="outline" className="mt-1 text-xs">
                              {place.place_status === 'in_directory' ? 'In directory' : 'Pending'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Acknowledgements */}
              {application.acknowledgements && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acknowledgements
                  </label>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {application.acknowledgements.place_focus && (
                      <span className="flex items-center gap-1 text-green-600">
                        <Check className="h-4 w-4" />
                        Place-first focus
                      </span>
                    )}
                    {application.acknowledgements.link_review && (
                      <span className="flex items-center gap-1 text-green-600">
                        <Check className="h-4 w-4" />
                        Link review
                      </span>
                    )}
                    {application.acknowledgements.no_public_profile && (
                      <span className="flex items-center gap-1 text-green-600">
                        <Check className="h-4 w-4" />
                        No public profile
                      </span>
                    )}
                    {application.acknowledgements.no_promotion_required && (
                      <span className="flex items-center gap-1 text-green-600">
                        <Check className="h-4 w-4" />
                        No promotion required
                      </span>
                    )}
                  </div>
                </div>
              )}

              <Separator />
            </>
          )}

          {/* Specific Places - Highlighted (Legacy field) */}
          {application.specific_places && (
            <div className="space-y-2 bg-muted/30 rounded-lg p-4">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Local Places They'd Recommend (Trust Signal)
              </label>
              <p className="text-foreground whitespace-pre-wrap">{application.specific_places}</p>
            </div>
          )}

          {/* Motivation */}
          {application.motivation && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Why They Want to Help
              </label>
              <p className="text-foreground whitespace-pre-wrap">{application.motivation}</p>
            </div>
          )}

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

          {/* Social Links (Legacy) */}
          {application.social_links && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Social Links (Legacy)
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
                Approve as Trail Blazer
              </Button>
            </>
          )}
          
          {isApproved && (
            <Button variant="destructive" onClick={onRevoke}>
              <UserX className="w-4 h-4 mr-2" />
              Revoke Trail Blazer Access
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
