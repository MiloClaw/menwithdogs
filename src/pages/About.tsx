import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Heart, Users, Shield, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const values = [
  {
    icon: Shield,
    title: "Privacy by Default",
    description: "No public profiles. No searchable users. Your presence is yours to control—always."
  },
  {
    icon: Heart,
    title: "Real-World Connection",
    description: "Built for showing up in real life, not endless scrolling. Meet people where life actually happens."
  },
  {
    icon: MapPin,
    title: "Place-First Discovery",
    description: "The places come first. Community forms around them naturally, not the other way around."
  },
  {
    icon: Users,
    title: "Quiet Community",
    description: "No likes, followers, or popularity mechanics. Just shared spaces and genuine moments."
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
    "name": "About MainStreetIRL",
    "description": "The story behind MainStreetIRL — rebuilding gay community through real places, not dating apps.",
    "url": "https://mainstreetirl.com/about",
    "mainEntity": {
      "@type": "Organization",
      "name": "MainStreetIRL",
      "description": "A place-centric directory helping gay men and couples find community, friends, and real-world connection."
    }
  };

  return (
    <PageLayout>
      <SEOHead
        title="Why MainStreetIRL Exists – Gay Community Built Around Real Places"
        description="The story behind MainStreetIRL — rebuilding gay community through real places, not dating apps. A place-first approach to finding friends and connection."
        keywords="about MainStreetIRL, gay community platform, LGBTQ places directory, gay friendship app"
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
            The story behind MainStreetIRL
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
                Gay community has always been built in real places—bars, coffee shops, gyms, 
                neighborhood spots. But somewhere along the way, we moved everything online. 
                Apps that promised connection delivered endless scrolling, ghosting, and 
                performative profiles instead.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                We watched as community spaces closed. We felt the fatigue of apps designed 
                to keep us online, not help us show up. We noticed how hard it had become 
                to just... meet people. Not to date. Just to connect.
              </p>
              <p className="text-base md:text-lg text-foreground font-medium leading-relaxed">
                Single or partnered, introvert or social, new to a city or deeply rooted—the 
                problem was the same: where do you actually go to find your people?
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
              A quiet layer beneath your city.
            </h2>
            <div className="space-y-6 text-base md:text-lg text-primary-foreground/90 leading-relaxed">
              <p>
                MainStreetIRL is a private directory of places where gay community already 
                gathers—curated by people who understand, not algorithms chasing engagement.
              </p>
              <p>
                We help you discover coffee shops, gyms, bars, events, and neighborhood spots. 
                Places where real life actually happens. And over time, we help you find places 
                where showing up feels natural.
              </p>
              <p className="text-primary-foreground font-medium">
                No messaging pressure. No awkward intros. Just a clear signal that connection 
                is welcome—when and where you want it.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What This Is Not Section */}
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
                What This Is Not
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                Not a dating app.
                <br />
                <span className="text-muted-foreground">Not a social network.</span>
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
                There are no likes, swipes, or popularity mechanics. No public profiles or 
                searchable users. No DMs from strangers or pressure to perform.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                If you're looking to browse people or chase attention, this isn't the place. 
                We're building something different: a tool for people who want to show up 
                in real life, on their own terms.
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
              Rebuilding community, one place at a time.
            </h2>
            <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
              <p>
                We believe gay community can be rebuilt—not through another app that keeps 
                you scrolling, but through real places and real presence.
              </p>
              <p>
                We're building MainStreetIRL to strengthen local connection, reduce online 
                fatigue, and lower the friction of meeting people organically. To help 
                community grow where it actually lives: on main streets, in neighborhoods, 
                at the places that matter.
              </p>
              <p className="text-foreground font-medium text-lg md:text-xl">
                A nod. A hello. A conversation that starts where you already are.
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
              Ready to find your places?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/auth?mode=signup")}
                className="text-base px-8"
              >
                Create Free Account
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/places")}
                className="text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
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
