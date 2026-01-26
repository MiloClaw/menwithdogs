import { cn } from "@/lib/utils";

interface BrandStripeProps {
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  width?: 'full' | 'auto' | number;
  className?: string;
}

const sizeConfig = {
  sm: { horizontal: 'h-0.5', vertical: 'w-0.5' },
  md: { horizontal: 'h-1', vertical: 'w-1' },
  lg: { horizontal: 'h-1.5', vertical: 'w-1.5' },
};

const widthConfig = {
  full: 'w-full',
  auto: 'w-24',
};

const BrandStripe = ({ 
  orientation = 'horizontal', 
  size = 'md',
  width = 'full',
  className 
}: BrandStripeProps) => {
  const isHorizontal = orientation === 'horizontal';
  const sizeClass = sizeConfig[size][orientation];
  
  const widthClass = typeof width === 'number' 
    ? undefined 
    : widthConfig[width];
  const widthStyle = typeof width === 'number' 
    ? { width: `${width}px` } 
    : undefined;
  
  return (
    <div 
      className={cn(
        "flex",
        isHorizontal ? "flex-row" : "flex-col h-full",
        isHorizontal && widthClass,
        sizeClass,
        className
      )}
      style={widthStyle}
    >
      <div className={cn(
        "flex-1 bg-brand-navy",
        isHorizontal ? "rounded-l-full" : "rounded-t-full"
      )} />
      <div className="flex-1 bg-brand-amber" />
      <div className={cn(
        "flex-1 bg-brand-green",
        isHorizontal ? "rounded-r-full" : "rounded-b-full"
      )} />
    </div>
  );
};

export default BrandStripe;
