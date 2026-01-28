import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Mountain, Tent, Waves, Compass } from "lucide-react";

const Outdoors = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const ghostY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  const placeTypes = [
    {
      icon: Mountain,
      title: "Hiking Trails",
      description: "Where movement makes conversation easier.",
    },
    {
      icon: Tent,
      title: "Campsites",
      description: "Places that reward returning.",
    },
    {
      icon: Waves,
      title: "Swimming Holes & Beaches",
      description: "Shared local knowledge.",
    },
    {
      icon: Compass,
      title: "Outdoor Events",
      description: "Optional, low-pressure ways to be around others.",
    },
  ];

  return (
    <PageLayout>
      <SEOHead
        title="Gay Outdoor Spaces & Active Lifestyles"
        description="Discover hiking trails, campsites, beaches, and outdoor activities through a place-based directory designed for real-world connection and exploration."
        keywords="gay outdoors, hiking trails, camping, beaches, outdoor activities, active lifestyle directory"
        canonicalPath="/outdoors"
      />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
      >
        {/* Parallax ghost ampersand */}
        <motion.span
          style={{ y: ghostY }}
          className="pointer-events-none select-none absolute text-[40vw] md:text-[30vw] font-serif text-primary/5 leading-none"
          aria-hidden
        >
          &
        </motion.span>

        <div className="container relative z-10 text-center px-4 py-20 md:py-32">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block text-sm font-medium tracking-widest uppercase text-primary mb-6"
          >
            Outdoors
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground max-w-4xl mx-auto leading-tight"
          >
            Community, outside the usual places
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            For some of us, connection happens on trails, around campfires, or just by spending time outdoors.
          </motion.p>
        </div>
      </section>

      {/* Section 01 - Core Description */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block text-sm font-medium tracking-widest uppercase text-primary mb-4"
            >
              01 — The Places
            </motion.span>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="prose prose-lg text-foreground/80"
            >
              <p>
                ThickTimber highlights outdoor places that matter—hiking trails, campsites, 
                beaches, swimming holes, and group activities—based on where people actually 
                go and return to.
              </p>
              <p>
                These are the places where familiarity builds over time. Where conversations 
                happen naturally. Where showing up again is enough.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 02 - The Places That Matter */}
      <section className="py-16 md:py-24 bg-surface/50">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block text-sm font-medium tracking-widest uppercase text-primary mb-4"
            >
              02 — The Places That Matter
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl md:text-4xl text-foreground mb-12"
            >
              The Places That Matter
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {placeTypes.map((place, index) => (
                <motion.div
                  key={place.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-lg border border-border bg-card"
                >
                  <place.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-serif text-xl text-foreground mb-2">
                    {place.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {place.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block text-sm font-medium tracking-widest uppercase text-primary-foreground/70 mb-4"
            >
              Start Here
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl md:text-4xl lg:text-5xl mb-10"
            >
              Ready to explore?
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="text-base"
              >
                <Link to="/auth?mode=signup">Join Free</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/places">Explore Places</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Outdoors;
