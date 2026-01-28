import { Shield } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const PrivacyTrust = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const ghostY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section ref={sectionRef} className="py-28 md:py-40 bg-surface/30 relative overflow-hidden">
      {/* Ghost typography with parallax */}
      <motion.span
        style={{ y: ghostY }}
        className="absolute top-8 right-0 md:top-16 md:right-8 text-[6rem] md:text-[10rem] font-serif font-bold text-muted-foreground/[0.04] leading-none select-none pointer-events-none uppercase"
      >
        Private
      </motion.span>

      <div className="container relative">
        <div className="max-w-5xl mx-auto">
          {/* Mono label with icon */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-10 md:mb-14"
          >
            <span className="text-xs font-medium text-muted-foreground/50 tracking-[0.2em] uppercase">
              Your Data
            </span>
            <Shield className="w-4 h-4 text-accent" />
          </motion.div>

          {/* Two-column layout */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
            {/* Left: Bold statement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight leading-[1.15] text-balance">
                Designed to be private by default.
              </h2>
            </motion.div>

            {/* Right: Privacy explanation as prose */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="border-l-4 border-accent pl-8 md:pl-10"
            >
              <p className="text-foreground text-base md:text-lg leading-relaxed mb-5">
                The places you save and how you use the directory are never public.
                There's no public profile, no visible activity, and no expectation to share more than you choose.
              </p>

              <p className="text-foreground text-base md:text-lg leading-relaxed mb-5">
                The free directory reflects community-level patterns—surfacing places men tend to enjoy and return to—without exposing individual behavior. Your saved places remain yours.
              </p>

              <p className="text-foreground text-base md:text-lg leading-relaxed mb-5">
                For those who choose to subscribe to PRO, additional preferences can be added privately to help the directory better understand your interests, routines, and outdoor habits. This information is used only to refine your recommendations and is never shared or displayed.
              </p>

              <p className="text-foreground text-base md:text-lg leading-relaxed mb-6">
                Privacy isn't an add-on. It's built into how the directory works.
              </p>

              <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-medium">
                Private by default. Intentional by design.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyTrust;
