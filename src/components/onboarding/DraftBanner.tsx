import { Info } from 'lucide-react';

interface DraftBannerProps {
  message?: string;
}

const DraftBanner = ({ 
  message = "This is a draft. You can edit anytime." 
}: DraftBannerProps) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50">
      <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

export default DraftBanner;
