import { Badge } from '@/components/ui/badge';

type SourceType = 'admin' | 'google_places' | 'user_submitted' | 'partner' | 'inferred' | string;

interface SourceBadgeProps {
  source: SourceType;
}

const sourceConfig: Record<string, { label: string; className: string }> = {
  admin: {
    label: 'Admin',
    className: 'bg-muted text-muted-foreground border-border',
  },
  google_places: {
    label: 'Google',
    className: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  },
  user_submitted: {
    label: 'User',
    className: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  },
  partner: {
    label: 'Partner',
    className: 'bg-green-500/10 text-green-700 border-green-500/20',
  },
  inferred: {
    label: 'AI',
    className: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  },
};

const SourceBadge = ({ source }: SourceBadgeProps) => {
  const config = sourceConfig[source] || {
    label: source,
    className: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <Badge variant="outline" className={`text-xs font-normal ${config.className}`}>
      {config.label}
    </Badge>
  );
};

export default SourceBadge;
