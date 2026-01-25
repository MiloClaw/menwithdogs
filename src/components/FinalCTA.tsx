import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const FinalCTA = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const ghostY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={sectionRef}
      className="py-28 md:py-40 bg-primary text-primary-foreground relative overflow-hidden"
    >
      {/* Ghost arrow with parallax */}
      <motion.span
        style={{ y: ghostY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[14rem] md:text-[20rem] font-serif font-bold text-primary-foreground/[0.03] leading-none select-none pointer-events-none"
      >
        →
      </motion.span>

      <div className="container relative">
        <div className="max-w-2xl mx-auto text-center">
          {/* Mono label */}
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-xs font-medium text-primary-foreground/40 tracking-[0.2em] uppercase mb-8 block"
          >
            Ready?
          </motion.span>

          {/* Large inviting headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-10 md:mb-12 text-balance"
          >
            Ready to find your trail?
          </motion.h2>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              variant="accent"
              size="lg"
              className="w-full sm:w-auto text-base px-8"
              onClick={() => navigate('/auth?mode=signup')}
            >
              Create Free Account
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate('/places')}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Explore Outdoors
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
