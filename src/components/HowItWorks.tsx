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
    tagline: "Your photos stay private until you choose. They only appear when you mark yourself as Open to Saying Hello.",
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
                  {index < steps.length - 1 && (
                    <div className="w-px h-full min-h-[60px] bg-border mt-4" />
                  )}
                </div>

                {/* Content Column */}
                <div className="pt-5">
                  <h3 className="font-serif text-lg md:text-xl font-semibold text-foreground mb-2.5 leading-snug tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-[15px] text-muted-foreground leading-[1.7] max-w-prose">
                    {step.description}
                  </p>
                  
                  {step.bullets && (
                    <ul className="mt-3.5 space-y-2">
                      {step.bullets.map((bullet, bulletIndex) => (
                        <li 
                          key={bulletIndex}
                          className="text-sm md:text-[15px] text-muted-foreground leading-[1.7] flex items-start gap-2.5 pl-0.5"
                        >
                          <span className="text-primary/60 text-[10px] mt-[7px]">●</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {step.tagline && (
                    <p className="mt-4 text-[13px] md:text-sm text-muted-foreground/80 leading-relaxed">
                      {step.tagline}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Closing Line */}
        <div className="mt-16 md:mt-20 text-center border-t border-border/40 pt-12">
          <p className="text-base md:text-lg text-foreground font-medium max-w-xl mx-auto leading-snug tracking-tight text-balance">
            MainStreetIRL is about confidence, not connection algorithms.
          </p>
          <p className="text-sm md:text-[15px] text-muted-foreground mt-3 leading-relaxed">
            You decide when&thinsp;—&thinsp;and if&thinsp;—&thinsp;you want to be seen.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
