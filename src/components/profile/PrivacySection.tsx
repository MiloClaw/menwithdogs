import { Shield, Eye } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PrivacySectionProps {
  allowPlaceVisibility: boolean;
  onToggle: (value: boolean) => void;
  isUpdating?: boolean;
}

/**
 * Section 7: Privacy & Control
 * Explains privacy model and includes future opt-in toggle
 */
export function PrivacySection({
  allowPlaceVisibility,
  onToggle,
  isUpdating = false,
}: PrivacySectionProps) {
  return (
    <section className="bg-muted/30 rounded-xl p-6 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-4 w-4 text-muted-foreground/70" />
          <h3 className="text-base font-medium tracking-wide text-foreground">
            Privacy & Control
          </h3>
        </div>
      </div>

      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Your preferences are used privately to improve place recommendations. 
          Nothing is public by default.
        </p>
        <ul className="space-y-1.5 list-disc list-inside text-xs">
          <li>Preferences are never shown to other users</li>
          <li>Used only to personalize what you see</li>
          <li>You can change or clear anything anytime</li>
        </ul>
      </div>

      {/* Future opt-in toggle */}
      <div className="pt-2 border-t border-border/50">
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="space-y-0.5">
            <Label htmlFor="place-visibility" className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground/70" />
              Allow place-based visibility
            </Label>
            <p className="text-xs text-muted-foreground">
              When enabled, places you save may be boosted for others with similar preferences. 
              Your identity is never revealed.
            </p>
          </div>
          <Switch
            id="place-visibility"
            checked={allowPlaceVisibility}
            onCheckedChange={onToggle}
            disabled={isUpdating}
          />
        </div>
      </div>
    </section>
  );
}
