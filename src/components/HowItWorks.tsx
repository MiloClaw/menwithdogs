import { MapPin, Bookmark, RotateCcw } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    icon: MapPin,
    title: "Browse",
    description: "Browse places that already exist in the directory.",
  },
  {
    number: "02",
    icon: Bookmark,
    title: "Save",
    description: "Save the ones you genuinely enjoy or would return to. If a great spot is missing, add it - and save it.",
  },
  {
    number: "03",
    icon: RotateCcw,
    title: "Return",
    description: "Your saves shape what you see. The more you save, the more relevant it gets.",
  },
];

const HowItWorks = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  return (
    <section ref={sectionRef} id="how-it-works" className="py-28 md:py-40 bg-background">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 md:mb-24"
          >
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight">
              How It Works
            </h2>
          </motion.div>

          {/* Desktop: Horizontal 3-column grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const ghostY = useTransform(scrollYProgress, [0, 1], [30 + index * 10, -30 - index * 10]);
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="relative p-8 lg:p-10"
                >
                  {/* Large background number with parallax */}
                  <motion.span
                    style={{ y: ghostY }}
                    className="absolute top-0 right-4 text-[8rem] lg:text-[10rem] font-serif font-bold text-muted-foreground/[0.06] leading-none select-none pointer-events-none"
                  >
                    {step.number}
                  </motion.span>

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
                </motion.div>
              );
            })}
          </div>

          {/* Mobile: Stacked cards */}
          <div className="md:hidden space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative bg-surface/50 rounded-lg p-8"
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
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
