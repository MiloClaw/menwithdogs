import { MapPin, Bookmark, Eye } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MapPin,
    title: "Explore",
    description: "Browse places in your city. Filter by what you're in the mood for.",
  },
  {
    number: "02",
    icon: Bookmark,
    title: "Save",
    description: "Bookmark spots that catch your interest.",
  },
  {
    number: "03",
    icon: Eye,
    title: "See",
    description: "Your saved places shape what appears first. The more you use it, the more relevant it feels.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-28 md:py-40 bg-background">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16 md:mb-24">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight">
              How It Works
            </h2>
          </div>

          {/* Desktop: Horizontal 3-column grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="relative p-8 lg:p-10"
                >
                  {/* Large background number */}
                  <span className="absolute top-0 right-4 text-[8rem] lg:text-[10rem] font-serif font-bold text-muted-foreground/[0.06] leading-none select-none pointer-events-none">
                    {step.number}
                  </span>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Small step indicator + icon */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-xs font-medium text-muted-foreground/50 tracking-[0.2em] uppercase">
                        Step {step.number}
                      </span>
                      <Icon className="w-4 h-4 text-accent" />
                    </div>

                    <h3 className="font-serif text-2xl lg:text-3xl font-semibold text-foreground mb-4 tracking-tight">
                      {step.title}
                    </h3>

                    <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Connecting line (except last) */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-1/2 -right-4 lg:-right-6 w-8 lg:w-12 h-px bg-border hidden lg:block" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile: Stacked cards */}
          <div className="md:hidden space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="relative bg-surface/50 rounded-lg p-8 opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Background number */}
                  <span className="absolute top-2 right-4 text-7xl font-serif font-bold text-muted-foreground/[0.08] leading-none select-none pointer-events-none">
                    {step.number}
                  </span>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-medium text-muted-foreground/50 tracking-[0.2em] uppercase">
                        Step {step.number}
                      </span>
                      <Icon className="w-4 h-4 text-accent" />
                    </div>

                    <h3 className="font-serif text-xl font-semibold text-foreground mb-3 tracking-tight">
                      {step.title}
                    </h3>

                    <p className="text-muted-foreground text-base leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
