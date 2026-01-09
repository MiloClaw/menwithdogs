import { User, MapPin, Eye, Users } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: User,
    title: "Understand Your Real-World Patterns",
    description: "You tell us what you enjoy—your interests, routines, and the kinds of places you like to spend time.",
    tagline: "No bios. No performance. Just context.",
  },
  {
    number: "02",
    icon: MapPin,
    title: "Discover Community-Centered Places",
    description:
      "Our directory highlights places popular with your community, along with recommendations based on overlapping interests.",
    bullets: ["Coffee shops", "Gyms", "Bars", "Events", "Neighborhood spots"],
    tagline: "Places where real life actually happens.",
  },
  {
    number: "03",
    icon: Eye,
    title: "Opt In — Only When You're Ready",
    description:
      "Your information is private by default. If you choose to opt in, others won't see who you are—only that someone like them is open to saying hello at a specific place.",
    tagline: "No messaging pressure. No awkward intros. Just a clear signal that connection is welcome.",
  },
  {
    number: "04",
    icon: Users,
    title: "Grow Real Community, Naturally",
    description:
      "The goal isn't to \"match.\" It's to make real-world interaction feel easier, safer, and more human again.",
    tagline: "A nod. A hello. A conversation that starts where you already are.",
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

                  {step.bullets && (
                    <div className="mt-3.5 flex flex-wrap gap-2">
                      {step.bullets.map((bullet, bulletIndex) => (
                        <span
                          key={bulletIndex}
                          className="text-xs md:text-sm text-muted-foreground bg-background px-3 py-1 rounded-full"
                        >
                          {bullet}
                        </span>
                      ))}
                    </div>
                  )}

                  {step.tagline && (
                    <p className="mt-4 text-[13px] md:text-sm text-muted-foreground/80 leading-relaxed italic">
                      {step.tagline}
                    </p>
                  )}
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
