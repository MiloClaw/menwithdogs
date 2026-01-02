import { ReactNode } from 'react';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
}

const OnboardingLayout = ({ 
  children, 
  currentStep, 
  totalSteps, 
  title, 
  subtitle 
}: OnboardingLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-6 flex items-center justify-center">
        <a href="/" className="text-xl font-serif font-semibold text-primary">
          MainStreetIRL
        </a>
      </header>

      {/* Progress bar */}
      <div className="px-4 md:px-6">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col px-4 md:px-6 py-8 md:py-12">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Title section */}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-serif font-semibold text-primary">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingLayout;
