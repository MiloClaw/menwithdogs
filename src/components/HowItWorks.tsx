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
    <section id="how-it-works" className="py-20 md:py-28 bg-surface">
      <div className="container max-w-2xl">
        <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground text-center mb-14 md:mb-20 tracking-tight text-balance">
          How It Works
        </h2>

        <div className="space-y-12 md:space-y-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="flex gap-5 md:gap-7 opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Number & Icon Column */}
                <div className="flex flex-col items-center shrink-0">
                  <span className="text-[11px] font-medium text-muted-foreground/40 tracking-[0.2em] uppercase mb-2.5">
                    {step.number}
                  </span>
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  {index < steps.length - 1 && <div className="w-px h-full min-h-[60px] bg-border mt-4" />}
                </div>

                {/* Content Column */}
                <div className="pt-5">
                  <h3 className="font-serif text-lg md:text-xl font-semibold text-foreground mb-2.5 leading-snug tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-[15px] text-muted-foreground leading-[1.7] max-w-prose">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
