import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Mountain, Tent, Waves, Compass } from "lucide-react";

const Community = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const ghostY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <PageLayout>
      <SEOHead
        title="Outdoor Community Through Shared Places"
        description="Learn how shared interests and outdoor places help shape real-world community. A calm, place-first approach to discovering where people gather."
        keywords="outdoor community, gay hiking community, shared interests, real-world community, place-based discovery"
        canonicalPath="/community"
      />

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative py-20 md:py-28 lg:py-36 overflow-hidden"
      >
        <motion.div
          style={{ y: ghostY }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        >
          <span className="text-[18rem] md:text-[24rem] lg:text-[32rem] font-serif text-muted/[0.04] leading-none">
            &
          </span>
        </motion.div>

        <div className="container max-w-4xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6">
              Community
            </span>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight mb-6 text-balance">
              Community, in the real world
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
              Community isn't something you scroll through. It forms in the places you keep returning to—and the people you meet along the way.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="mb-8">
              <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-primary-foreground/70 mb-3">
                01
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight">
                How It Works
              </h2>
            </div>

            <div className="prose prose-lg prose-invert max-w-none text-primary-foreground/90">
              <p>
                Instead of centering connection around profiles or constant interaction, 
                ThickTimber focuses on places. Trails, campsites, beaches, and outdoor spaces 
                where shared interests quietly bring people together.
              </p>
              <p>
                By understanding where people actually go—and why—the directory helps make 
                community more visible without forcing interaction. You decide how and when 
                to engage, simply by showing up.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Places That Matter Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-12 text-center">
              <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                02
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight">
                The Places That Matter
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: Mountain,
                  title: "Hiking Trails",
                  description: "The trails where regulars become familiar faces. Where a nod becomes a hello, and a hello becomes a conversation."
                },
                {
                  icon: Tent,
                  title: "Campsites",
                  description: "Campgrounds where showing up consistently creates connection. Around the fire, under the stars."
                },
                {
                  icon: Waves,
                  title: "Beaches & Swimming Holes",
                  description: "The hidden gems and local favorites. Places where community forms naturally in the summer months."
                },
                {
                  icon: Compass,
                  title: "Group Events",
                  description: "Hiking groups, camping weekends, outdoor meetups. The gatherings that bring outdoor gay men together."
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 bg-card border border-border rounded-lg"
                >
                  <item.icon className="h-6 w-6 text-primary mb-4" />
                  <h3 className="font-serif text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who This Is For Section */}
      <section className="py-16 md:py-24 bg-surface/50">
        <div className="container max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="mb-8">
              <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                03
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight">
                Who This Is For
              </h2>
            </div>

            <div className="text-lg text-muted-foreground">
              <p className="mb-6">This approach works well for men who:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Feel most at ease outside or being active</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Prefer low-pressure, real-world connection</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Value privacy and autonomy</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Want community to grow naturally over time</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-primary-foreground/70 mb-4">
              Start Here
            </span>
            <h2 className="font-serif text-2xl md:text-3xl tracking-tight mb-8 text-balance">
              Ready to explore?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="text-base px-8"
              >
                <Link to="/auth?mode=signup">Join Free</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/places">Explore Places</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Community;
