import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Check, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
const freeFeatures = ["Full access to outdoor places in the directory", "Recommendations shaped by community patterns", "Save favorites and build your personal list", "Location-aware suggestions as you explore", "Your activity and preferences remain private"];
const proFeatures = ["Everything in the Free Directory", "Add outdoor interests, activity level, and preferences privately", "Refine recommendations based on routines and hobbies", "Surface places aligned with how you like to spend time", "Intelligence that improves as you use the directory"];
const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    user
  } = useAuth();
  const {
    createCheckout,
    isCreatingCheckout,
    isPro,
    isLoading
  } = useSubscription();
  const hasTriggeredCheckout = useRef(false);

  // Parallax refs
  const heroRef = useRef<HTMLElement>(null);
  const privacyRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const {
    scrollYProgress: heroScrollProgress
  } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroGhostY = useTransform(heroScrollProgress, [0, 1], ["0%", "30%"]);
  const {
    scrollYProgress: privacyScrollProgress
  } = useScroll({
    target: privacyRef,
    offset: ["start end", "end start"]
  });
  const privacyGhostY = useTransform(privacyScrollProgress, [0, 1], ["0%", "20%"]);
  const {
    scrollYProgress: ctaScrollProgress
  } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"]
  });
  const ctaGhostY = useTransform(ctaScrollProgress, [0, 1], ["0%", "25%"]);

  // Auto-trigger checkout if returning from auth with checkout=true
  useEffect(() => {
    const shouldCheckout = searchParams.get('checkout') === 'true';
    if (shouldCheckout && user && !isPro && !isLoading && !hasTriggeredCheckout.current) {
      hasTriggeredCheckout.current = true;
      setSearchParams({}, {
        replace: true
      });
      createCheckout();
    }
  }, [searchParams, user, isPro, isLoading, createCheckout, setSearchParams]);
  const handleFreeCTA = () => {
    if (user) {
      navigate("/places");
    } else {
      navigate("/auth");
    }
  };
  const handleProCTA = () => {
    if (user) {
      createCheckout();
    } else {
      navigate("/auth?redirect=pricing");
    }
  };
  return <PageLayout>
      <SEOHead
        title="Directory Access & Personalization Options"
        description="Access the full outdoor places directory for free, with optional personalization to refine recommendations privately based on interests and routines."
        keywords="directory access, personalization, outdoor recommendations, free directory, PRO features"
        canonicalPath="/pricing"
      />
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[60vh] flex items-center justify-center overflow-hidden py-20 md:py-28 lg:py-36">
        {/* Ghost Background Element */}
        <motion.div style={{
        y: heroGhostY
      }} className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="text-[20rem] md:text-[28rem] font-serif font-bold text-foreground/[0.03] leading-none">
            $
          </span>
        </motion.div>

        <div className="container relative z-10 text-center">
          <motion.span initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="inline-block text-xs tracking-[0.2em] uppercase text-muted-foreground font-mono mb-6">
            Membership
          </motion.span>

          <motion.h1 initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.7,
          delay: 0.1
        }} className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight mb-6 max-w-4xl mx-auto">
            One directory. Two ways to use it.
          </motion.h1>

          <motion.p initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.7,
          delay: 0.2
        }} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
            The same places. The same community. PRO simply helps the directory understand you more precisely.
          </motion.p>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="py-20 md:py-28 bg-surface/30">
        <div className="container">
          <motion.span initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} className="block text-xs tracking-[0.2em] uppercase text-muted-foreground font-mono text-center mb-12">
            Choose Your Path
          </motion.span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <motion.div initial={{
            opacity: 0,
            y: 40
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }} className="rounded-card p-8 md:p-10 bg-card border border-border hover:border-secondary/50 transition-colors">
              <div className="mb-8">
                <h3 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-3">
                  Free Directory
                </h3>
                <div className="text-4xl md:text-5xl font-semibold text-foreground mb-3">
                  $0
                </div>
                <p className="text-muted-foreground leading-relaxed text-pretty">
                  Community-powered discovery, designed for real-world use.
                </p>
              </div>

              <ul className="space-y-4 mb-10">
                {freeFeatures.map(feature => <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 mt-0.5 text-secondary" />
                    <span className="text-sm text-muted-foreground leading-relaxed text-pretty">
                      {feature}
                    </span>
                  </li>)}
              </ul>

              <Button variant="outline" className="w-full" onClick={handleFreeCTA}>
                {user ? "Explore Places" : "Join Free"}
              </Button>
            </motion.div>

            {/* Pro Plan */}
            <motion.div initial={{
            opacity: 0,
            y: 40
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6,
            delay: 0.1
          }} className="rounded-card p-8 md:p-10 bg-card border border-secondary/30 hover:border-secondary transition-colors">
              <div className="mb-8">
                <h3 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-3">
                  PRO Personalization
                </h3>
                <div className="text-4xl md:text-5xl font-semibold text-foreground mb-3">
                  $1.99
                  <span className="text-lg font-normal text-muted-foreground">
                    {" "}/ month
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-pretty">
                  Private tuning for more precise recommendations.
                </p>
              </div>

              <ul className="space-y-4 mb-10">
                {proFeatures.map(feature => <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 mt-0.5 text-secondary" />
                    <span className="text-sm text-muted-foreground leading-relaxed text-pretty">
                      {feature}
                    </span>
                  </li>)}
              </ul>

              <Button variant="default" className="w-full" onClick={handleProCTA} disabled={isCreatingCheckout || isPro}>
                {isPro ? "Current plan" : isCreatingCheckout ? "Loading..." : "Add Personalization"}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Privacy Callout Section */}
      <section ref={privacyRef} className="relative py-20 md:py-28 overflow-hidden">
        {/* Ghost Background */}
        <motion.div style={{
        y: privacyGhostY
      }} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none">
          <Shield className="w-64 h-64 md:w-96 md:h-96 text-foreground/[0.02]" />
        </motion.div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }} className="flex items-start gap-6">
              <div className="hidden md:flex shrink-0 w-12 h-12 rounded-full bg-secondary/10 items-center justify-center">
                <Shield className="w-6 h-6 text-secondary" />
              </div>

              <div className="border-l-2 border-secondary/30 pl-6 md:pl-8">
                <span className="block text-xs tracking-[0.2em] uppercase text-muted-foreground font-mono mb-4">
                  Privacy First
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
                  Your preferences are private. Always.
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
                  Any preferences added through PRO are never visible to others.<br />
                  They're used only to help the directory better understand what's relevant to you.
                </p>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty mt-4">
                  No public profiles.<br />
                  No exposure.<br />
                  Just clearer, more useful results.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Explainer */}
      <section className="py-20 md:py-28 bg-surface/30">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <motion.div initial={{
              opacity: 0,
              x: -30
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6
            }}>
            <span className="block text-xs tracking-[0.2em] uppercase text-muted-foreground font-mono mb-6">
              How Personalization Works
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight leading-tight text-balance">
              Free shows you where the community gathers.
            </h2>
            <div className="flex items-center gap-3 mt-6">
              <ArrowRight className="w-6 h-6 text-secondary" />
              <p className="font-serif text-2xl md:text-3xl text-secondary text-balance">
                PRO helps you see where it fits you best.
              </p>
            </div>
              </motion.div>

              <motion.div initial={{
              opacity: 0,
              x: 30
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6,
              delay: 0.1
            }} className="space-y-6">
                <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
                  The free directory highlights places based on shared patterns across the entire community—reflecting where men tend to go and return to over time.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
                  PRO allows you to add more context privately, such as interests, activity preferences, and routines. This helps the directory surface places that align more closely with how you like to spend your time.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium text-foreground text-pretty text-center">
                  Both make the directory better.<br />
                  PRO simply makes it more precise for you.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="relative py-20 md:py-28 lg:py-36 bg-primary text-primary-foreground overflow-hidden">
        {/* Ghost Background */}
        <motion.div style={{
        y: ctaGhostY
      }} className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="text-[16rem] md:text-[24rem] font-serif font-bold text-primary-foreground/[0.05] leading-none">
            ?
          </span>
        </motion.div>

        <div className="container relative z-10 text-center">
          <motion.span initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }} className="inline-block text-xs tracking-[0.2em] uppercase text-primary-foreground/70 font-mono mb-6">
            Ready?
          </motion.span>

          <motion.h2 initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6,
          delay: 0.1
        }} className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-10 text-balance">
            Ready to explore?
          </motion.h2>

          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" className="min-w-[200px]" onClick={() => navigate("/auth")}>
              Join Free
            </Button>
            <Button size="lg" variant="outline" className="min-w-[200px] border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate("/places")}>
              Explore Places
            </Button>
          </motion.div>
        </div>
      </section>
    </PageLayout>;
};
export default Pricing;