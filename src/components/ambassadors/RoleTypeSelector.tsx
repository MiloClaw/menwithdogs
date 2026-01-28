import { ROLE_TYPES, type RoleType } from '@/lib/trail-blazer-options';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface RoleTypeSelectorProps {
  selectedRoles: RoleType[];
  onRolesChange: (roles: RoleType[]) => void;
  otherDescription?: string;
  onOtherDescriptionChange?: (description: string) => void;
  className?: string;
}

const RoleTypeSelector = ({
  selectedRoles,
  onRolesChange,
  otherDescription = '',
  onOtherDescriptionChange,
  className,
}: RoleTypeSelectorProps) => {
  const handleToggle = (value: RoleType) => {
    if (selectedRoles.includes(value)) {
      onRolesChange(selectedRoles.filter((r) => r !== value));
    } else {
      onRolesChange([...selectedRoles, value]);
    }
  };

  const showOtherInput = selectedRoles.includes('other');

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ROLE_TYPES.map((role) => (
          <div
            key={role.value}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
              selectedRoles.includes(role.value)
                ? 'border-accent bg-accent/5'
                : 'border-border hover:border-muted-foreground/30'
            )}
            onClick={() => handleToggle(role.value)}
          >
            <Checkbox
              id={`role-${role.value}`}
              checked={selectedRoles.includes(role.value)}
              className="pointer-events-none"
            />
            <Label
              htmlFor={`role-${role.value}`}
              className="cursor-pointer font-normal text-sm flex-1"
            >
              {role.label}
            </Label>
          </div>
        ))}
      </div>

      {showOtherInput && onOtherDescriptionChange && (
        <div className="pt-2">
          <Input
            placeholder="Please describe your role..."
            value={otherDescription}
            onChange={(e) => onOtherDescriptionChange(e.target.value)}
            className="max-w-md"
          />
        </div>
      )}
    </div>
  );
};

export default RoleTypeSelector;
