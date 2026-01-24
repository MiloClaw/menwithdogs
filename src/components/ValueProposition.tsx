import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
const ValueProposition = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const {
    scrollYProgress
  } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const ghostY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  return <section ref={sectionRef} className="py-28 md:py-40 bg-surface/50 relative overflow-hidden">
      <div className="container">
      <div className="max-w-5xl mx-auto relative">
          {/* Mono label - fade in */}
          <motion.span initial={{
          opacity: 0,
          y: 12
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: "-100px"
        }} transition={{
          duration: 0.5
        }} className="text-xs font-medium text-muted-foreground/50 tracking-[0.2em] uppercase mb-8 block">
            What This Is
          </motion.span>

          {/* Split layout */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* Left: Display headline */}
            <motion.h2 initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true,
            margin: "-100px"
          }} transition={{
            duration: 0.6,
            delay: 0.1
          }} className="font-serif text-3xl md:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight leading-[1.1] text-balance">An alternative to the dating apps, built around real-world connections.</motion.h2>

            {/* Right: Supporting text */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true,
            margin: "-100px"
          }} transition={{
            duration: 0.6,
            delay: 0.2
          }} className="space-y-6 md:pt-2 max-w-prose">
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed my-[3px] text-justify">A personalized directory of outdoor spaces built around where gay men spend time in real life. No profiles. No feeds. No swiping.  It's for men who want more real-world connections without the endless feeds, swiping and ghosting of dating apps. No one is browsing you. You are not being ranked or compared.  You simply add your favorite places. Share hidden gems that are not yet in the directory. Share this with other gay men who are looking for real-world connections and then let our AI-powered directory help you find your community.
            
            
            </p>

              <p className="text-muted-foreground/70 text-base md:text-lg">When you are done with the apps and ready for real places again.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>;
};
export default ValueProposition;