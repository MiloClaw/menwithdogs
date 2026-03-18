import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Check } from "lucide-react";

const traits = [
  "Have a dog (or love being around them) and want places where they're genuinely welcome",
  "Spend time hiking, camping, running, or just exploring your city with your dog",
  "Enjoy discovering new spots and returning to the ones that feel right",
  "Prefer low-pressure ways to meet people — in real life, through shared routines",
  "Value a tool that supports real-world experiences without demanding constant attention"
];

const WhoThisIsNotFor = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const ghostY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      ref={sectionRef}
      className="py-28 md:py-40 bg-primary text-primary-foreground relative overflow-hidden"
    >
      {/* Ghost symbol with parallax */}
      <motion.span
        style={{ y: ghostY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[16rem] md:text-[24rem] font-serif font-bold text-primary-foreground/[0.03] leading-none select-none pointer-events-none"
      >
        ✓
      </motion.span>

      <div className="container relative">
        <div className="max-w-3xl mx-auto">
          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-center mb-8 text-balance"
          >
            Who This Works Well For
          </motion.h2>

          {/* Intro paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-primary-foreground/80 text-center mb-10 max-w-2xl mx-auto text-balance"
          >
            Men With Dogs is for gay men who have dogs — and want a better way to discover the places worth showing up to.
          </motion.p>

          {/* Checklist label */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-primary-foreground/70 font-medium text-center mb-6"
          >
            It works especially well if you:
          </motion.p>

          {/* Traits checklist */}
          <ul className="space-y-4 mb-12 max-w-2xl mx-auto">
            {traits.map((trait, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-3 text-primary-foreground/80"
              >
                <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                <span className="text-base md:text-lg">{trait}</span>
              </motion.li>
            ))}
          </ul>

          {/* Closing statements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center space-y-2 mb-10"
          >
            <p className="text-primary-foreground/90 font-medium text-lg">
              You don't have to be social. Just let your dog break the ice.
            </p>
            <p className="text-primary-foreground/90 font-medium text-lg">
              You don't have to be new somewhere. You just have to show up.
            </p>
            <p className="text-primary-foreground/90 font-medium text-lg">
              The places do the rest.
            </p>
          </motion.div>

          {/* Boundary statement */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-primary-foreground/60 text-base text-center max-w-xl mx-auto text-balance"
          >
            Men With Dogs isn't a dating app. It's not a social network.
            It's a directory of places worth going to — and the community that naturally forms there.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default WhoThisIsNotFor;
