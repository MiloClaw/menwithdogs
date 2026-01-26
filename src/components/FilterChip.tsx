import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface FilterChipProps {
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}

const FilterChip = ({ label, active = false, href, onClick }: FilterChipProps) => {
  const className = cn(
    "px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] flex items-center",
    active
      ? "bg-primary text-primary-foreground"
      : "bg-surface text-primary hover:bg-muted"
  );

  if (href) {
    return (
      <Link to={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {label}
    </button>
  );
};

export default FilterChip;