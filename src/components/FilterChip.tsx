import { cn } from "@/lib/utils";

interface FilterChipProps {
  label: string;
  active?: boolean;
}

const FilterChip = ({ label, active = false }: FilterChipProps) => {
  return (
    <button
      className={cn(
        "px-3 md:px-4 py-2 md:py-2.5 rounded-button text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] flex items-center",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-surface text-primary hover:bg-muted"
      )}
    >
      {label}
    </button>
  );
};

export default FilterChip;
