import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const ValueProposition = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const ghostY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={sectionRef} className="py-28 md:py-40 bg-surface/50 relative overflow-hidden">
      <div className="container">
        <div className="max-w-5xl mx-auto relative">
          {/* Mono label - fade in */}
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-xs font-medium text-muted-foreground/50 tracking-[0.2em] uppercase mb-8 block"
          >
            What This Is
          </motion.span>

          {/* Split layout */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* Left: Display headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl md:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight leading-[1.1] text-balance"
            >
              Dog-friendly places, found by gay men who actually go there.
            </motion.h2>

            {/* Right: Supporting text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6 md:pt-2 max-w-prose"
            >
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                Men With Dogs is a curated directory of dog-friendly parks, trails, bars, beaches, and outdoor spaces — contributed by gay men, for gay men.
              </p>

              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                No profiles. No swiping. Just great places where you and your dog are genuinely welcome — and where community forms naturally around shared routines and real-world time together.
              </p>

              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                Save spots you love. Discover ones you haven't found yet. The more people contribute, the better the map gets — revealing where men with dogs actually gather.
              </p>

              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                Men With Dogs is designed as a tool, not a pastime. It works in the background, helping you understand where to go—so you can focus on actually being there.
              </p>

              <p className="text-muted-foreground/70 text-base md:text-lg font-medium">
                Connection starts with showing up.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
