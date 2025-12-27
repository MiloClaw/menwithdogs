import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiscoveryToggleProps {
  coupleId: string;
  initialValue: boolean;
  onToggle?: (newValue: boolean) => void;
}

export function DiscoveryToggle({ coupleId, initialValue, onToggle }: DiscoveryToggleProps) {
  const [isDiscoverable, setIsDiscoverable] = useState(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('couples')
        .update({ is_discoverable: checked })
        .eq('id', coupleId);

      if (error) throw error;

      setIsDiscoverable(checked);
      onToggle?.(checked);

      toast({
        title: checked ? 'You are now discoverable' : 'Discovery turned off',
        description: checked 
          ? 'Other couples in your area can now see your profile.'
          : 'Your profile is now hidden from discovery.',
      });
    } catch (err) {
      toast({
        title: 'Failed to update',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card">
      <div className="flex-1 space-y-1">
        <Label 
          htmlFor="discovery-toggle" 
          className="text-sm font-medium cursor-pointer"
        >
          Make our couple discoverable
        </Label>
        <p className="text-xs text-muted-foreground">
          {isDiscoverable 
            ? 'Other couples nearby can see your shared profile. Your individual profiles remain private.'
            : 'Your couple profile is hidden from discovery. Toggle on to be visible to others.'}
        </p>
      </div>
      <Switch
        id="discovery-toggle"
        checked={isDiscoverable}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
        aria-describedby="discovery-description"
      />
    </div>
  );
}
