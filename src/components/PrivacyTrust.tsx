import { Shield } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
const PrivacyTrust = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const {
    scrollYProgress
  } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const ghostY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  return <section ref={sectionRef} className="py-28 md:py-40 bg-surface/30 relative overflow-hidden">
      {/* Ghost typography with parallax */}
      <motion.span style={{
      y: ghostY
    }} className="absolute top-8 right-0 md:top-16 md:right-8 text-[6rem] md:text-[10rem] font-serif font-bold text-muted-foreground/[0.04] leading-none select-none pointer-events-none uppercase">
        Private
      </motion.span>

      <div className="container relative">
        <div className="max-w-5xl mx-auto">
          {/* Mono label with icon */}
          <motion.div initial={{
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
        }} className="flex items-center gap-3 mb-10 md:mb-14">
            <span className="text-xs font-medium text-muted-foreground/50 tracking-[0.2em] uppercase">
              Your Data
            </span>
            <Shield className="w-4 h-4 text-accent" />
          </motion.div>

          {/* Two-column layout */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
            {/* Left: Bold statement */}
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
            delay: 0.1
          }}>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight leading-[1.15] text-balance">
                Your preferences are private.
              </h2>
            </motion.div>

            {/* Right: Privacy explanation as prose */}
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
          }} className="border-l-4 border-accent pl-8 md:pl-10">
              <p className="text-foreground text-base md:text-lg leading-relaxed mb-6 text-justify">What you save and how you browse shapes only your view — never a public profile. No one sees your list. No one knows where you’ve been. The free directory surfaces real places gay men in your city actually frequent, based on shared patterns of use — not popularity or noise. If you want a deeper level of understanding, you can subscribe to PRO. 

PRO lets you privately add context like interests, hobbies, and relationship preferences, which the system uses to surface places most relevant to men whose routines and interests overlap with yours.

            </p>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                This is how personalization should work.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>;
};
export default PrivacyTrust;