import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Heart, Users, Shield, MapPin, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const values = [
  {
    icon: Shield,
    title: "Privacy by Default",
    description: "Your activity and preferences aren't public. Participation is quiet and intentional."
  },
  {
    icon: Heart,
    title: "Real-World Connection",
    description: "Built to support showing up in real life—not to replace it."
  },
  {
    icon: MapPin,
    title: "Place-First Discovery",
    description: "Community forms around shared spaces, not profiles."
  },
  {
    icon: Users,
    title: "Quiet Community",
    description: "No performance metrics. No pressure. Just shared context."
  }
];

const About = () => {
  const navigate = useNavigate();
  const problemRef = useRef<HTMLElement>(null);
  const buildingRef = useRef<HTMLElement>(null);
  const principlesRef = useRef<HTMLElement>(null);
  const privacyRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  const { scrollYProgress: problemProgress } = useScroll({
    target: problemRef,
    offset: ["start end", "end start"]
  });

  const { scrollYProgress: buildingProgress } = useScroll({
    target: buildingRef,
    offset: ["start end", "end start"]
  });

  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"]
  });

  const ghostY1 = useTransform(problemProgress, [0, 1], [60, -60]);
  const ghostY2 = useTransform(buildingProgress, [0, 1], [40, -40]);
  const ghostY3 = useTransform(ctaProgress, [0, 1], [50, -50]);

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About ThickTimber",
    "description": "The story behind ThickTimber — rebuilding gay community through outdoor spaces and real-world connection.",
    "url": "https://thicktimber.lovable.app/about",
    "mainEntity": {
      "@type": "Organization",
      "name": "ThickTimber",
      "description": "A place-centric directory helping gay men find community through hiking trails, campsites, beaches, and outdoor spaces."
    }
  };

  return (
    <PageLayout>
      <SEOHead
        title="Why ThickTimber Exists – Outdoor Community for Gay Men"
        description="The story behind ThickTimber — rebuilding gay community through trails, campsites, and outdoor spaces. A place-first approach for men who prefer nature over nightlife."
        keywords="about ThickTimber, gay outdoor community, LGBTQ hiking, gay camping, gay men outdoors"
        canonicalPath="/about"
        schema={aboutSchema}
      />
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 lg:py-36 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-serif font-bold text-primary/[0.03] select-none pointer-events-none whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          Why
        </motion.div>
        
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 mb-8"
          >
            <span className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground">
              About
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-4xl text-balance"
          >
            Why We Built This
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl"
          >
            The thinking behind ThickTimber
          </motion.p>
        </div>
      </section>

      {/* The Problem Section */}
      <section ref={problemRef} className="relative py-20 md:py-28 overflow-hidden">
        <motion.div
          style={{ y: ghostY1 }}
          className="absolute -right-20 top-1/4 text-[25vw] font-serif font-bold text-primary/[0.03] select-none pointer-events-none"
        >
          01
        </motion.div>

        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground mb-4 block">
                The Problem
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
                Community moved online.
                <br />
                <span className="text-muted-foreground">Connection got lost.</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-6"
            >
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Gay men who enjoy the outdoors—hiking, camping, beaches, swimming holes—often 
                struggle to find each other in everyday life.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                As more interaction shifted online, it became easier to stay connected digitally, 
                but harder to understand where community actually gathers in the real world. 
                Whether single or partnered, new to an area or deeply rooted, the question kept 
                coming up:
              </p>
              <p className="text-base md:text-lg text-foreground font-medium leading-relaxed">
                Where do men who love being outdoors actually go?
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We're Building Section */}
      <section ref={buildingRef} className="relative py-20 md:py-28 bg-primary text-primary-foreground overflow-hidden">
        <motion.div
          style={{ y: ghostY2 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-serif font-bold text-primary-foreground/[0.05] select-none pointer-events-none"
        >
          →
        </motion.div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="text-xs font-mono tracking-[0.2em] uppercase text-primary-foreground/70 mb-6 block">
              What We're Building
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-8 text-balance">
              A quiet layer beneath the landscape.
            </h2>
            <div className="space-y-6 text-base md:text-lg text-primary-foreground/90 leading-relaxed">
              <p>
                ThickTimber is a private directory of outdoor spaces where men who love being 
                active tend to gather—shaped by shared place knowledge and community behavior, 
                not engagement-driven algorithms.
              </p>
              <p>
                It helps surface hiking trails, campsites, beaches, swimming holes, and outdoor 
                events—places where real life happens and familiarity builds over time.
              </p>
              <p className="text-primary-foreground font-medium">
                There's no pressure to interact. No expectation to perform. Just clearer context 
                for showing up in the real world, on your own terms.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What This Isn't Built Around Section */}
      <section className="py-20 md:py-28 bg-surface/50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground mb-4 block">
                What This Isn't Built Around
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
                The focus stays on places.
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-6"
            >
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                ThickTimber isn't centered on browsing people or competing for attention. 
                It doesn't rely on popularity mechanics or constant interaction.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                The focus stays on places—and what naturally happens when people keep 
                returning to them.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Principles Section */}
      <section ref={principlesRef} className="py-20 md:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <span className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground mb-4 block">
              Our Principles
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              What we believe
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-8 bg-card border border-border rounded-lg hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <value.icon className="h-8 w-8 text-primary mb-5 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Trust Section */}
      <section ref={privacyRef} className="py-20 md:py-28 bg-surface/50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground">
                  Privacy & Trust
                </span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
                Your preferences are private.
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="border-l-2 border-primary pl-6 md:pl-8"
            >
              <ul className="space-y-4 mb-6">
                <li className="flex items-start gap-3 text-base md:text-lg text-foreground">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-2.5" />
                  No public profiles to maintain
                </li>
                <li className="flex items-start gap-3 text-base md:text-lg text-foreground">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-2.5" />
                  No selling or indexing of your data
                </li>
                <li className="flex items-start gap-3 text-base md:text-lg text-foreground">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-2.5" />
                  No tracking for ad networks
                </li>
              </ul>
              <p className="text-sm md:text-base text-muted-foreground italic">
                Privacy isn't a feature. It's the foundation.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Vision Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground mb-6 block">
              The Vision
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-8 text-balance">
              Rebuilding community, one trail at a time.
            </h2>
            <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
              <p>
                We believe gay community can be rebuilt — not through another app that keeps 
                you scrolling, but through real places and real presence. Through trails, 
                campsites, beaches, and the quiet moments shared in nature.
              </p>
              <p>
                We're building ThickTimber to strengthen connection among gay men who love 
                the outdoors, reduce online fatigue, and lower the friction of meeting people 
                organically. To help community grow where it actually lives: on the trails, 
                at the campsites, in the places that matter.
              </p>
              <p className="text-foreground font-medium text-lg md:text-xl">
                A nod on the trail. A familiar face at the campsite. A conversation that starts 
                where you already are.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="relative py-24 md:py-32 bg-primary text-primary-foreground overflow-hidden">
        <motion.div
          style={{ y: ghostY3 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-[25vw] font-serif font-bold text-primary-foreground/[0.05] select-none pointer-events-none"
        >
          ?
        </motion.div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl mx-auto text-center"
          >
            <span className="text-xs font-mono tracking-[0.2em] uppercase text-primary-foreground/70 mb-6 block">
              Ready?
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-8 text-balance">
              Ready to explore?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-10">
              Discover the outdoor places where shared interests bring people together.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="accent"
                onClick={() => navigate('/auth?mode=signup')}
                className="w-full sm:w-auto"
              >
                Join Free
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => navigate('/places')}
                className="w-full sm:w-auto text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Mountain className="w-4 h-4 mr-2" />
                Explore Places
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default About;
