import { MapPin, Users, CalendarCheck, Eye, Coffee } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MapPin,
    title: "Explore Real Places & Events",
    description: "Browse a curated directory of cafés, bars, parks, and local events where gay couples actually go.",
  },
  {
    number: "02",
    icon: Users,
    title: "See When Community Is Forming",
    description: "See anonymous, aggregated activity:",
    bullets: [
      "How many couples are interested",
      "How many plan to attend",
      "When a place or event tends to be active",
    ],
    tagline: "Just helpful context so you're not walking in blind.",
  },
  {
    number: "03",
    icon: CalendarCheck,
    title: "Plan on Your Own Terms",
    description: "Mark places or events as:",
    bullets: [
      "Interested",
      "Planning to attend",
    ],
    tagline: "This helps improve the directory for everyone — and helps you choose where to spend your time — without making you visible to anyone.",
  },
  {
    number: "04",
    icon: Eye,
    title: "Be Visible Only If You Choose",
    description: "If you're feeling social, you can optionally mark yourself as open to saying hello at a specific place or event.",
    bullets: [
      "Visibility is temporary",
      "Visibility is contextual",
      "Nothing is shared unless a couple chooses",
    ],
    tagline: "Photos are only revealed when a couple marks themselves as Open To Saying Hello at a Place or Event.",
  },
  {
    number: "05",
    icon: Coffee,
    title: "Keep It Real & Offline",
    description: "MainStreetIRL doesn't organize meetups or push conversations. It simply helps couples understand where community already exists — so any interaction happens naturally, in the real world.",
    tagline: "No pressure. No awkwardness. Just clarity.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-surface">
      <div className="container max-w-3xl">
        <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground text-center mb-12 md:mb-16">
          How It Works
        </h2>
        
        <div className="space-y-10 md:space-y-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="flex gap-4 md:gap-6 opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Number & Icon Column */}
                <div className="flex flex-col items-center shrink-0">
                  <span className="text-xs font-medium text-muted-foreground/50 tracking-wider mb-2">
                    {step.number}
                  </span>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-px h-full min-h-[40px] bg-border/50 mt-3" />
                  )}
                </div>

                {/* Content Column */}
                <div className="pt-6 pb-2">
                  <h3 className="font-serif text-lg md:text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                  
                  {step.bullets && (
                    <ul className="mt-3 space-y-1.5">
                      {step.bullets.map((bullet, bulletIndex) => (
                        <li 
                          key={bulletIndex}
                          className="text-sm md:text-base text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-primary mt-1.5">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {step.tagline && (
                    <p className="mt-3 text-sm text-foreground/80 italic">
                      {step.tagline}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Closing Line */}
        <div className="mt-14 md:mt-16 text-center border-t border-border/30 pt-10">
          <p className="text-base md:text-lg text-foreground font-medium max-w-xl mx-auto">
            MainStreetIRL is about confidence, not connection algorithms.
          </p>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            You decide when — and if — you want to be seen.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
