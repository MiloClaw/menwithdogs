interface CategoryBadgeProps {
  label: string;
}

const CategoryBadge = ({ label }: CategoryBadgeProps) => {
  return (
    <span className="inline-block px-2.5 py-1 bg-accent/10 text-accent text-xs font-medium rounded-md uppercase tracking-wide">
      {label}
    </span>
  );
};

export default CategoryBadge;
