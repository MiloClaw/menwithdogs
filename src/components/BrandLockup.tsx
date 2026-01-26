import { cn } from "@/lib/utils";

interface BrandLockupProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showSubtitle?: boolean;
  showStripe?: boolean;
  centered?: boolean;
  className?: string;
}

const stripeConfig = {
  sm: { bar: 'h-0.5', container: 'mt-2 gap-0.5 w-[60%]' },
  md: { bar: 'h-0.5', container: 'mt-3 gap-0.5 w-[60%]' },
  lg: { bar: 'h-1', container: 'mt-4 gap-1 w-[60%]' },
};

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
  showStripe = false,
  centered = false,
  className 
}: BrandLockupProps) => {
  const sizes = sizeConfig[size];
  const colors = variantConfig[variant];
  const stripe = stripeConfig[size];

  return (
    <div className={cn(
      "inline-block",
      centered && "text-center",
      className
    )}>
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
      {showStripe && (
        <div className={cn(
          "flex",
          stripe.container,
          centered && "mx-auto"
        )}>
          <div className={cn(
            "flex-1 rounded-full",
            variant === 'dark' ? 'bg-white' : 'bg-brand-navy',
            stripe.bar
          )} />
          <div className={cn("flex-1 rounded-full bg-brand-amber", stripe.bar)} />
          <div className={cn("flex-1 rounded-full bg-brand-green", stripe.bar)} />
        </div>
      )}
    </div>
  );
};

export default BrandLockup;
