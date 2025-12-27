interface InterestTagProps {
  label: string;
}

const InterestTag = ({ label }: InterestTagProps) => {
  return (
    <span className="inline-block px-3 py-1.5 bg-surface text-primary text-sm font-medium rounded-button border border-border">
      {label}
    </span>
  );
};

export default InterestTag;
