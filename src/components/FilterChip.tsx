import { cn } from "@/lib/utils";

interface FilterChipProps {
  label: string;
  active?: boolean;
}

const FilterChip = ({ label, active = false }: FilterChipProps) => {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-button text-sm font-medium transition-colors whitespace-nowrap",
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
