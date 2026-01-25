import { cn } from "@/lib/utils";

interface BrandLockupProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showSubtitle?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    wordmark: 'text-lg md:text-xl',
    subtitle: 'text-[10px] tracking-[0.45em] mt-0.5',
  },
  md: {
    wordmark: 'text-xl md:text-2xl',
    subtitle: 'text-[11px] tracking-[0.5em] mt-0.5',
  },
  lg: {
    wordmark: 'text-2xl md:text-3xl',
    subtitle: 'text-xs tracking-[0.55em] mt-1',
  },
};

const variantConfig = {
  light: {
    wordmark: 'text-primary',
    subtitle: 'text-primary/70',
  },
  dark: {
    wordmark: 'text-primary-foreground',
    subtitle: 'text-primary-foreground/70',
  },
};

const BrandLockup = ({ 
  size = 'md', 
  variant = 'light',
  showSubtitle = true,
  className 
}: BrandLockupProps) => {
  const sizes = sizeConfig[size];
  const colors = variantConfig[variant];

  return (
    <div className={cn("inline-block", className)}>
      <span className={cn(
        "block font-serif font-semibold tracking-tight",
        sizes.wordmark,
        colors.wordmark
      )}>
        ThickTimber
      </span>
      {showSubtitle && (
        <span className={cn(
          "block font-sans font-medium uppercase",
          sizes.subtitle,
          colors.subtitle
        )}>
          Social Club
        </span>
      )}
    </div>
  );
};

export default BrandLockup;
