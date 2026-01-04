import { MapPin, BarChart3, Bookmark, UserPlus, MessageCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MapPin,
    title: "Browse the Directory",
    description: "Explore a curated list of cafés, bars, parks, and local events — all chosen for their community potential.",
  },
  {
    number: "02",
    icon: BarChart3,
    title: "See Aggregate Signals",
    description: "View anonymous, aggregated activity to understand where community is forming:",
    bullets: [
      '"Popular with locals"',
      '"Busy on weekends"',
      '"Trending this week"',
    ],
    tagline: "Helpful context — without exposing anyone.",
  },
  {
    number: "03",
    icon: Bookmark,
    title: "Save Privately",
    description: "Mark places you're interested in or planning to visit. Your saves are private — no social pressure, no visibility.",
    tagline: "Build your own list at your own pace.",
  },
  {
    number: "04",
    icon: UserPlus,
    title: "Join When You're Ready",
    description: "When you're ready to be part of the community, create an account and choose your path — as a couple or as an individual.",
    tagline: "No rush. The directory is always here.",
  },
  {
    number: "05",
    icon: MessageCircle,
    title: "Connect on Your Terms",
    description: "If you opt in, you can receive curated introductions based on shared places and interests. All interactions are:",
    bullets: [
      "Contextual (tied to a place or event)",
      "Permission-based (you choose when to be visible)",
      "Temporary (no permanent profile exposure)",
    ],
    tagline: "Social connection as an optional layer — never the default.",
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
            Places first. Community second. Social on your terms.
          </p>
          <p className="text-sm md:text-[15px] text-muted-foreground mt-3 leading-relaxed">
            MainStreetIRL is about clarity, not algorithms.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
